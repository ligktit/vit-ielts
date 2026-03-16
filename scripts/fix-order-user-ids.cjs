/**
 * Fix Order User IDs — Maps WP user IDs to Supabase UUIDs for existing orders
 *
 * Problem: 13 orders were migrated from orders.json with user_id = NULL
 *          because the WP base64 userId (e.g. "dXNlcjo4NDQ=" = "user:844")
 *          couldn't be mapped to Supabase UUIDs.
 *
 * This script:
 * 1. Reads orders.json to decode WP userIds
 * 2. Tries to find matching Supabase users via multiple strategies
 * 3. Updates the orders in Supabase with the correct user_id
 *
 * Usage: node scripts/fix-order-user-ids.cjs [--dry-run]
 */
const { config } = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const DRY_RUN = process.argv.includes("--dry-run");

/**
 * Decode WP base64 userId → numeric ID
 * "dXNlcjo4NDQ=" → "user:844" → 844
 */
function decodeWpUserId(base64Id) {
    try {
        const decoded = Buffer.from(base64Id, "base64").toString("utf-8");
        const match = decoded.match(/^user:(\d+)$/);
        return match ? parseInt(match[1], 10) : null;
    } catch {
        return null;
    }
}

async function main() {
    console.log("╔══════════════════════════════════════════════════╗");
    console.log("║     Fix Order User IDs (WP → Supabase)         ║");
    console.log("╚══════════════════════════════════════════════════╝");
    if (DRY_RUN) console.log("  🔍 DRY RUN MODE — no changes will be made\n");

    // 1. Read orders.json to get WP userIds
    const ordersJson = JSON.parse(fs.readFileSync("data/orders.json", "utf-8"));
    
    // Build unique WP user ID set
    const wpUserIds = new Map(); // wpNumericId → [orderIds...]
    for (const o of ordersJson) {
        const wpId = decodeWpUserId(o.userId);
        if (wpId !== null) {
            if (!wpUserIds.has(wpId)) wpUserIds.set(wpId, []);
            wpUserIds.get(wpId).push(o.orderId);
        }
    }

    console.log(`\n📋 Unique WP user IDs in orders: ${wpUserIds.size}`);
    for (const [wpId, orderIds] of wpUserIds) {
        console.log(`  WP user #${wpId} → ${orderIds.length} order(s)`);
    }

    // 2. Strategy to find Supabase users for each WP user ID
    const mapping = new Map(); // wpNumericId → supabaseUUID

    for (const [wpId] of wpUserIds) {
        let found = null;

        // Strategy A: Migration placeholder email
        const { data: placeholderUser } = await supabase
            .from("users")
            .select("id, email, name")
            .eq("email", `wp_user_${wpId}@migration.pending`)
            .maybeSingle();

        if (placeholderUser) {
            found = placeholderUser;
            console.log(`\n  ✅ WP #${wpId} → Strategy A (placeholder): ${found.email}`);
        }

        // Strategy B: If WP user migration was run, it would have used 
        // the WP REST API which returns numeric IDs "user:XXX"
        // Check if there's a known admin/test user for WP #844
        if (!found) {
            // WP user 844 is likely the admin/owner
            // Try matching by searching all users ordered by creation
            // (the first user created is often the admin)
            const { data: allUsers } = await supabase
                .from("users")
                .select("id, email, name, roles, created_at")
                .order("created_at", { ascending: true })
                .limit(20);

            if (allUsers) {
                console.log(`\n  🔍 WP #${wpId} — Could not auto-match. Candidates (oldest users):`);
                allUsers.forEach((u, i) => {
                    const roles = Array.isArray(u.roles) ? u.roles.join(",") : String(u.roles ?? "subscriber");
                    console.log(`     ${i + 1}. ${u.email} | ${u.name ?? "NULL"} | roles=${roles} | ${u.created_at}`);
                });
                
                // Auto-detect: If this is the owner's admin account
                // Look for users with administrator role
                const adminUser = allUsers.find(u => {
                    const roles = Array.isArray(u.roles) ? u.roles : [];
                    return roles.includes("administrator") || 
                           (typeof u.roles === "string" && u.roles.includes("administrator"));
                });

                if (adminUser) {
                    found = adminUser;
                    console.log(`  ✅ WP #${wpId} → Strategy B (admin role): ${found.email}`);
                }
            }
        }

        if (found) {
            mapping.set(wpId, found.id);
        } else {
            console.log(`  ❌ WP #${wpId} → No matching Supabase user found`);
        }
    }

    // 3. Apply the mapping to update orders in Supabase
    console.log(`\n${"=".repeat(50)}`);
    console.log(`📊 Mapping Summary: ${mapping.size}/${wpUserIds.size} WP users mapped`);

    if (mapping.size === 0) {
        console.log("\n⚠️  No user mappings found. You can manually set the mapping by editing this script.");
        console.log("   Add entries to the 'mapping' Map before the update section.");
        console.log("\n   Example: mapping.set(844, 'your-supabase-user-uuid-here');");
        return;
    }

    // Fetch orders with NULL user_id from Supabase
    const { data: nullOrders } = await supabase
        .from("orders")
        .select("id, order_id, user_id")
        .is("user_id", null);

    if (!nullOrders || nullOrders.length === 0) {
        console.log("\n✅ No orders with NULL user_id found. Nothing to fix!");
        return;
    }

    console.log(`\n🔧 Found ${nullOrders.length} orders with NULL user_id`);

    // Build orderId → wpUserId lookup from orders.json
    const orderToWpUser = new Map();
    for (const o of ordersJson) {
        const wpId = decodeWpUserId(o.userId);
        if (wpId !== null) orderToWpUser.set(o.orderId, wpId);
    }

    let updated = 0;
    let skipped = 0;

    for (const order of nullOrders) {
        const wpId = orderToWpUser.get(order.order_id);
        if (!wpId) {
            console.log(`  ⏭️  ${order.order_id} — not found in orders.json, skipping`);
            skipped++;
            continue;
        }

        const supabaseUserId = mapping.get(wpId);
        if (!supabaseUserId) {
            console.log(`  ⏭️  ${order.order_id} — WP #${wpId} not mapped, skipping`);
            skipped++;
            continue;
        }

        if (DRY_RUN) {
            console.log(`  📝 [DRY RUN] ${order.order_id} → user_id = ${supabaseUserId}`);
            updated++;
            continue;
        }

        const { error } = await supabase
            .from("orders")
            .update({ user_id: supabaseUserId })
            .eq("id", order.id);

        if (error) {
            console.error(`  ❌ ${order.order_id}: ${error.message}`);
        } else {
            console.log(`  ✅ ${order.order_id} → user_id = ${supabaseUserId}`);
            updated++;
        }
    }

    console.log(`\n${"=".repeat(50)}`);
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    if (DRY_RUN) console.log("\n🔍 This was a DRY RUN. Rerun without --dry-run to apply changes.");
}

main().catch(err => {
    console.error("❌ Script failed:", err);
    process.exit(1);
});
