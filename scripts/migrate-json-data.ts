/**
 * JSON Data Migration Script
 *
 * Migrates 6 JSON data files from the filesystem to Supabase tables:
 * - data/orders.json → orders table
 * - data/coupons.json → coupons table
 * - data/affiliates.json → affiliates table
 * - data/affiliate-links.json → affiliate_links table
 * - data/affiliate-visits.json → affiliate_visits table
 * - data/affiliate-commissions.json → commissions table
 *
 * Usage: npx ts-node scripts/migrate-json-data.ts
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const DATA_DIR = path.join(process.cwd(), "data");

function readJsonFile<T>(filename: string): T[] {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${filePath}`);
        return [];
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T[];
}

// ---------------------------------------------------------------------------
// 1. Orders
// ---------------------------------------------------------------------------

/**
 * Decode WP base64 userId (e.g. "dXNlcjo4NDQ=" → "user:844" → 844)
 */
function decodeWpUserId(base64Id: string): number | null {
    try {
        const decoded = Buffer.from(base64Id, "base64").toString("utf-8");
        // Format: "user:844"
        const match = decoded.match(/^user:(\d+)$/);
        return match ? parseInt(match[1], 10) : null;
    } catch {
        return null;
    }
}

/**
 * Build a mapping of WP user IDs → Supabase UUIDs.
 *
 * Strategy (in order):
 * 1. Check for migration placeholder emails: wp_user_{wpId}@migration.pending
 * 2. Check for users whose email matches the WP "edit context" data
 *    (if available from the WP REST API migration)
 *
 * Since the WP migration script uses placeholder emails like
 * "wp_user_{wpId}@migration.pending", we use that pattern.
 * If create-auth-users.ts ran afterwards, those users got real auth IDs
 * but the email stayed the same (unless manually updated).
 */
async function buildWpUserIdMap(): Promise<Map<number, string>> {
    const mapping = new Map<number, string>();

    // Fetch all users — they may have any email format
    // First try placeholder pattern
    const { data: placeholderUsers } = await supabase
        .from("users")
        .select("id, email")
        .like("email", "wp_user_%@migration.pending");

    if (placeholderUsers && placeholderUsers.length > 0) {
        for (const u of placeholderUsers) {
            const match = u.email.match(/^wp_user_(\d+)@migration\.pending$/);
            if (match) {
                mapping.set(parseInt(match[1], 10), u.id);
            }
        }
    }

    console.log(`  📋 WP User ID mapping: ${mapping.size} entries from placeholder emails`);
    return mapping;
}

async function migrateOrders() {
    interface OrderJson {
        id: string;
        orderId: string;
        userId: string;
        packageType?: string;
        duration: number;
        skillType?: string;
        amount: number;
        originalAmount?: number;
        discountAmount?: number;
        couponCode?: string;
        status: string;
        paymentMethod?: string;
        transferContent?: string;
        affiliateRef?: string;
        createdAt: string;
    }

    const orders = readJsonFile<OrderJson>("orders.json");
    if (orders.length === 0) {
        console.log("ℹ️  orders.json is empty — skipping.");
        return 0;
    }

    // Build WP userId → Supabase UUID mapping
    const wpUserMap = await buildWpUserIdMap();

    // Collect unique WP user IDs for logging
    const unmappedWpIds = new Set<number>();

    const rows = orders.map((o) => {
        // Decode WP base64 userId → numeric ID → Supabase UUID
        const wpNumericId = decodeWpUserId(o.userId);
        let supabaseUserId: string | null = null;

        if (wpNumericId !== null) {
            supabaseUserId = wpUserMap.get(wpNumericId) ?? null;
            if (!supabaseUserId) {
                unmappedWpIds.add(wpNumericId);
            }
        }

        return {
            order_id: o.orderId,
            user_id: supabaseUserId,
            package_type: o.packageType || null,
            duration: o.duration,
            skill_type: o.skillType || null,
            amount: o.amount,
            original_amount: o.originalAmount || o.amount,
            discount_amount: o.discountAmount || 0,
            coupon_code: o.couponCode || null,
            status: o.status,
            payment_method: o.paymentMethod || null,
            transfer_content: o.transferContent || null,
            affiliate_ref: o.affiliateRef || null,
            created_at: o.createdAt,
        };
    });

    if (unmappedWpIds.size > 0) {
        console.warn(`  ⚠️  ${unmappedWpIds.size} WP user(s) could not be mapped: [${[...unmappedWpIds].join(", ")}]`);
        console.warn(`     These orders will have user_id = NULL. Run fix-order-user-ids script to correct.`);
    }

    const { error } = await supabase
        .from("orders")
        .upsert(rows, { onConflict: "order_id", ignoreDuplicates: false });

    if (error) throw new Error(`Orders migration failed: ${error.message}`);
    console.log(`✅ Orders: ${rows.length} records migrated`);
    return rows.length;
}

// ---------------------------------------------------------------------------
// 2. Coupons
// ---------------------------------------------------------------------------
async function migrateCoupons() {
    interface CouponJson {
        id: string;
        code: string;
        type: string;
        value: number;
        maxUses?: number;
        currentUses?: number;
        isActive?: boolean;
        expiresAt?: string;
        createdAt?: string;
    }

    const coupons = readJsonFile<CouponJson>("coupons.json");
    if (coupons.length === 0) {
        console.log("ℹ️  coupons.json is empty — skipping.");
        return 0;
    }

    const rows = coupons.map((c) => ({
        code: c.code,
        type: c.type,
        value: c.value,
        max_uses: c.maxUses ?? null,
        current_uses: c.currentUses ?? 0,
        is_active: c.isActive ?? true,
        expires_at: c.expiresAt ?? null,
        created_at: c.createdAt ?? new Date().toISOString(),
    }));

    const { error } = await supabase
        .from("coupons")
        .upsert(rows, { onConflict: "code", ignoreDuplicates: true });

    if (error) throw new Error(`Coupons migration failed: ${error.message}`);
    console.log(`✅ Coupons: ${rows.length} records migrated`);
    return rows.length;
}

// ---------------------------------------------------------------------------
// 3. Affiliates
// ---------------------------------------------------------------------------
async function migrateAffiliates() {
    interface AffiliateJson {
        id: string;
        userId: string;
        email: string;
        name: string;
        status: string;
        customLink?: string;
        emailNotifications?: boolean;
        createdAt: string;
        approvedAt?: string;
    }

    const affiliates = readJsonFile<AffiliateJson>("affiliates.json");
    if (affiliates.length === 0) {
        console.log("ℹ️  affiliates.json is empty — skipping.");
        return { count: 0, idMap: new Map<string, string>() };
    }

    // Insert affiliates — user_id left null (requires user mapping)
    const idMap = new Map<string, string>(); // old id → new uuid

    for (const a of affiliates) {
        const { data, error } = await supabase
            .from("affiliates")
            .upsert(
                {
                    custom_link: a.customLink || null,
                    status: a.status === "approved" ? "active" : a.status,
                    commission_rate: 0.2, // default from commissions data
                    created_at: a.createdAt,
                },
                { onConflict: "custom_link", ignoreDuplicates: false },
            )
            .select("id")
            .single();

        if (error) {
            console.error(`⚠️  Affiliate ${a.id} failed: ${error.message}`);
            continue;
        }
        idMap.set(a.id, data.id);
    }

    console.log(`✅ Affiliates: ${idMap.size} records migrated`);
    return { count: idMap.size, idMap };
}

// ---------------------------------------------------------------------------
// 4. Affiliate Links
// ---------------------------------------------------------------------------
async function migrateAffiliateLinks(affiliateIdMap: Map<string, string>) {
    interface LinkJson {
        id: string;
        affiliateId: string;
        link: string;
        customLink?: string;
        createdAt: string;
    }

    const links = readJsonFile<LinkJson>("affiliate-links.json");
    if (links.length === 0) {
        console.log("ℹ️  affiliate-links.json is empty — skipping.");
        return { count: 0, idMap: new Map<string, string>() };
    }

    const idMap = new Map<string, string>();

    for (const l of links) {
        const newAffiliateId = affiliateIdMap.get(l.affiliateId);
        if (!newAffiliateId) {
            console.warn(`⚠️  Link ${l.id}: affiliate ${l.affiliateId} not found in mapping — skipping.`);
            continue;
        }

        const { data, error } = await supabase
            .from("affiliate_links")
            .insert({
                affiliate_id: newAffiliateId,
                custom_link: l.customLink || l.id, // use old ID as fallback unique key
                created_at: l.createdAt,
            })
            .select("id")
            .single();

        if (error) {
            console.error(`⚠️  Link ${l.id} failed: ${error.message}`);
            continue;
        }
        idMap.set(l.id, data.id);
    }

    console.log(`✅ Affiliate Links: ${idMap.size} records migrated`);
    return { count: idMap.size, idMap };
}

// ---------------------------------------------------------------------------
// 5. Affiliate Visits
// ---------------------------------------------------------------------------
async function migrateAffiliateVisits(
    affiliateIdMap: Map<string, string>,
    linkIdMap: Map<string, string>,
) {
    interface VisitJson {
        id: string;
        affiliateId: string;
        linkId: string;
        ip?: string;
        userAgent?: string;
        referer?: string;
        visitedAt: string;
        converted?: boolean;
        orderId?: string;
    }

    const visits = readJsonFile<VisitJson>("affiliate-visits.json");
    if (visits.length === 0) {
        console.log("ℹ️  affiliate-visits.json is empty — skipping.");
        return 0;
    }

    const rows = visits
        .map((v) => {
            const newAffiliateId = affiliateIdMap.get(v.affiliateId);
            const newLinkId = linkIdMap.get(v.linkId);
            if (!newAffiliateId) {
                console.warn(`⚠️  Visit ${v.id}: affiliate not mapped — skipping.`);
                return null;
            }
            return {
                affiliate_id: newAffiliateId,
                link_id: newLinkId || null,
                ip: v.ip || null,
                user_agent: v.userAgent || null,
                converted: v.converted || false,
                order_id: v.orderId || null,
                created_at: v.visitedAt,
            };
        })
        .filter(Boolean);

    if (rows.length === 0) return 0;

    const { error } = await supabase.from("affiliate_visits").insert(rows);

    if (error) throw new Error(`Affiliate visits migration failed: ${error.message}`);
    console.log(`✅ Affiliate Visits: ${rows.length} records migrated`);
    return rows.length;
}

// ---------------------------------------------------------------------------
// 6. Commissions
// ---------------------------------------------------------------------------
async function migrateCommissions(affiliateIdMap: Map<string, string>) {
    interface CommissionJson {
        id: string;
        affiliateId: string;
        orderId: string;
        amount: number;
        commissionRate: number;
        commissionAmount: number;
        status: string;
        createdAt: string;
        paidAt?: string;
    }

    const commissions = readJsonFile<CommissionJson>("affiliate-commissions.json");
    if (commissions.length === 0) {
        console.log("ℹ️  affiliate-commissions.json is empty — skipping.");
        return 0;
    }

    const rows = commissions
        .map((c) => {
            const newAffiliateId = affiliateIdMap.get(c.affiliateId);
            if (!newAffiliateId) {
                console.warn(`⚠️  Commission ${c.id}: affiliate not mapped — skipping.`);
                return null;
            }
            return {
                affiliate_id: newAffiliateId,
                order_id: c.orderId,
                amount: c.amount,
                commission_rate: c.commissionRate,
                commission_amount: c.commissionAmount,
                status: c.status,
                created_at: c.createdAt,
            };
        })
        .filter(Boolean);

    if (rows.length === 0) return 0;

    const { error } = await supabase.from("commissions").insert(rows);

    if (error) throw new Error(`Commissions migration failed: ${error.message}`);
    console.log(`✅ Commissions: ${rows.length} records migrated`);
    return rows.length;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export async function migrateJsonData() {
    console.log("\n🚀 Starting JSON Data Migration...\n");
    console.log("=".repeat(50));

    const results: Record<string, number> = {};

    try {
        results.orders = await migrateOrders();
        results.coupons = await migrateCoupons();

        const { count: affiliateCount, idMap: affiliateIdMap } = await migrateAffiliates();
        results.affiliates = affiliateCount;

        const { count: linkCount, idMap: linkIdMap } = await migrateAffiliateLinks(affiliateIdMap);
        results.affiliateLinks = linkCount;

        results.affiliateVisits = await migrateAffiliateVisits(affiliateIdMap, linkIdMap);
        results.commissions = await migrateCommissions(affiliateIdMap);

        console.log("\n" + "=".repeat(50));
        console.log("📊 Migration Summary:");
        for (const [table, count] of Object.entries(results)) {
            console.log(`   ${table}: ${count} records`);
        }
        console.log("✅ JSON Data Migration Complete!\n");
    } catch (err) {
        console.error("\n❌ Migration failed:", err);
        throw err;
    }
}

// Run directly
if (require.main === module) {
    migrateJsonData().catch(() => process.exit(1));
}
