/**
 * Fix orders user_id mapping
 * 
 * 1. Decode WP userId from orders.json (base64 "dXNlcjo4NDQ=" = "user:844")
 * 2. Find corresponding Supabase user
 * 3. Update all orders with the correct user_id
 */
const { config } = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function fixOrderUserIds() {
    const lines = [];
    const log = (s) => { lines.push(s); console.log(s); };

    // 1. Read orders.json to get unique WP userIds
    const ordersJson = JSON.parse(fs.readFileSync("data/orders.json", "utf-8"));
    const wpUserIds = [...new Set(ordersJson.map(o => o.userId))];
    
    log("=== WordPress User IDs in orders.json ===");
    for (const wpId of wpUserIds) {
        const decoded = Buffer.from(wpId, "base64").toString("utf-8");
        log(`  ${wpId} => ${decoded}`);
    }

    // All orders have userId "dXNlcjo4NDQ=" = "user:844"
    // WP user 844 - need to find which Supabase user this maps to
    
    // 2. Look for wp_user_844 migration placeholder  
    log("\n=== Looking for WP user 844 in Supabase ===");
    
    // Try finding by migration placeholder email
    const { data: placeholderUser } = await supabase
        .from("users")
        .select("id, email, name")
        .eq("email", "wp_user_844@migration.pending")
        .maybeSingle();
    
    if (placeholderUser) {
        log(`  Found placeholder: ${placeholderUser.id} | ${placeholderUser.email} | ${placeholderUser.name}`);
    } else {
        log("  No placeholder user found for wp_user_844");
    }
    
    // 3. Search for users that might be WP#844 by checking all migration users
    log("\n=== Migration placeholder users (wp_user_*) ===");
    const { data: migUsers, count } = await supabase
        .from("users")
        .select("id, email, name", { count: "exact" })
        .like("email", "wp_user_%@migration.pending")
        .limit(10);
    
    log(`  Found ${count ?? 0} migration placeholder users`);
    if (migUsers) {
        migUsers.forEach(u => {
            log(`  - ${u.id} | ${u.email} | name=${u.name ?? 'NULL'}`);
        });
    }

    // 4. Also check if real users exist (non-placeholder)
    log("\n=== Real users (non-placeholder, first 10) ===");
    const { data: realUsers } = await supabase
        .from("users")
        .select("id, email, name")
        .not("email", "like", "%@migration.pending")
        .limit(10);
    
    if (realUsers) {
        realUsers.forEach(u => {
            log(`  - ${u.id} | ${u.email} | name=${u.name ?? 'NULL'}`);
        });
    }

    fs.writeFileSync("scripts/fix-orders-output.txt", lines.join("\n"), "utf-8");
    log("\nOutput written to scripts/fix-orders-output.txt");
}

fixOrderUserIds().catch(err => {
    console.error("Failed:", err);
    process.exit(1);
});
