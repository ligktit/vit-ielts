/**
 * Run migration 002: Create trigger to auto-create public.users profile
 * when a new auth.users record is created (Google OAuth, email sign-up, etc.)
 *
 * Usage: npx ts-node --compiler-options "{\"module\":\"commonjs\"}" scripts/run-migration-002.ts
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function main() {
  const sqlPath = path.join(
    __dirname,
    "..",
    "supabase",
    "migrations",
    "002_handle_new_user_trigger.sql"
  );
  const sql = fs.readFileSync(sqlPath, "utf-8");

  console.log("🚀 Running migration 002: handle_new_user trigger...\n");
  console.log(sql);
  console.log("\n---");

  const { data, error } = await supabase.rpc("exec_sql", { sql_text: sql });

  if (error) {
    // If 'exec_sql' RPC doesn't exist, try the REST SQL endpoint
    console.log("⚠️  exec_sql RPC not available, trying direct SQL...");

    // Use the management API or direct SQL approach
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql_text: sql }),
    });

    if (!response.ok) {
      console.error("\n❌ Migration failed. Please run this SQL manually in the Supabase SQL Editor:");
      console.error("   Dashboard → SQL Editor → New query → Paste the SQL above → Run");
      console.error("\n   Error:", error.message);
      process.exit(1);
    }

    console.log("✅ Migration 002 completed successfully!");
  } else {
    console.log("✅ Migration 002 completed successfully!");
  }
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
