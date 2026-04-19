import { supabaseAdmin } from "./supabase-live";

/**
 * Generates a random ID for testing purposes.
 */
function getRandomId() {
  return Math.random().toString(36).substring(2, 10);
}


/**
 * Creates a test user using Supabase Auth Admin.
 * This bypasses email confirmation and directly creates an active user.
 */
export async function createTestUser(email?: string, password = "TestPassword123!") {
  const testEmail = email || `test-${getRandomId()}@example.com`;
  
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password,
    email_confirm: true,
  });
  
  if (error) throw error;
  
  // Ensure profile is created in public.users
  // (Assuming there's no trigger or it's idempotent)
  const { error: profileError } = await supabaseAdmin.from("users").upsert({
    id: data.user.id,
    email: testEmail,
    name: "Test User",
    roles: ["subscriber"],
  });
  
  if (profileError && profileError.code !== '23505') {
    throw profileError;
  }
  
  return {
    ...data.user,
    password, // Return password so tests can perform real sign-in
  };
}

/**
 * Deletes a test user and all related data.
 * Note: If your DB schema doesn't have ON DELETE CASCADE for all tables,
 * you should add manual cleanup here.
 */
export async function deleteTestUser(userId: string) {
  // Manual cleanup for tables without cascade delete
  await supabaseAdmin.from("orders").delete().eq("user_id", userId);
  await supabaseAdmin.from("commissions").delete().eq("order_id", userId); // if applicable
  
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error && error.status !== 404) {
    console.error(`Failed to delete test user ${userId}:`, error);
  }
}

/**
 * Creates a test coupon for testing order logic.
 */
export async function createTestCoupon(overrides: any = {}) {
  const code = overrides.code || `TEST-${getRandomId()}`.toUpperCase();
  const { data, error } = await supabaseAdmin.from("coupons").insert({
    code,
    type: "percent",
    value: 10,
    is_active: true,
    max_uses: 100,
    current_uses: 0,
    ...overrides
  }).select().single();
  
  if (error) throw error;
  return data;
}

/**
 * Finds an existing published quiz for E2E testing.
 */
export async function findTestQuiz(skill: "reading" | "listening" = "reading") {
  const { data, error } = await supabaseAdmin
    .from("quizzes")
    .select("id, slug, title, pro_user_only")
    .eq("skill", skill)
    .eq("status", "published")
    .limit(1)
    .maybeSingle();
    
  if (error) throw error;
  if (!data) {
    throw new Error(`No published ${skill} quiz found in the database. Please seed one first.`);
  }
  return data;
}

/**
 * Utility to wait for a certain amount of time.
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
