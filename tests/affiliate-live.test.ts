
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabaseAdmin, supabaseAnon } from "./fixtures/supabase-live";
import { createTestUser, deleteTestUser } from "./fixtures/test-data-helpers";
import {
    registerAffiliate,
    createAffiliateLink,
    resolveAffiliateRef,
    trackVisitWithAntiSpam,
    createCommissionWithWaiting,
    getAffiliateStats,
} from "../services/affiliate";

describe("Affiliate Service — Live Integration", () => {
    let testUser: any;
    let affiliate: any;
    let affiliateLink: any;

    beforeAll(async () => {
        // 1. Create a fresh test user
        testUser = await createTestUser();
    });

    afterAll(async () => {
        // Cleanup: remove affiliate data, visits, links, commissions for this user
        if (affiliate) {
          await supabaseAdmin.from("commissions").delete().eq("affiliate_id", affiliate.id);
          await supabaseAdmin.from("affiliate_visits").delete().eq("affiliate_id", affiliate.id);
          await supabaseAdmin.from("affiliate_links").delete().eq("affiliate_id", affiliate.id);
          await supabaseAdmin.from("affiliates").delete().eq("id", affiliate.id);
        }
        await deleteTestUser(testUser.id);
    });

    it("Task 6.1: Full Affiliate Lifecycle (Register -> Link -> Resolve -> Track -> Commission)", async () => {
        // 1. Register as affiliate
        const regResult = await registerAffiliate(supabaseAdmin, testUser.id, "test-ref-" + testUser.id.substring(0, 8));
        affiliate = regResult.affiliate;
        expect(regResult.isNew).toBe(true);
        expect(affiliate.status).toBe("pending");

        // 2. Activate affiliate (admin action)
        const { error: activateError } = await supabaseAdmin
            .from("affiliates")
            .update({ status: "active" })
            .eq("id", affiliate.id);
        expect(activateError).toBeNull();

        // 3. Create affiliate link
        const linkResult = await createAffiliateLink(supabaseAdmin, affiliate.id, "promo-123");
        affiliateLink = linkResult.link;
        expect(linkResult.isNew).toBe(true);
        expect(affiliateLink.custom_link).toBe("promo-123");

        // 4. Resolve affiliate ref
        const resolved = await resolveAffiliateRef(supabaseAdmin, "promo-123");
        expect(resolved).not.toBeNull();
        expect(resolved?.affiliateId).toBe(affiliate.id);
        expect(resolved?.linkId).toBe(affiliateLink.id);

        // 5. Track visit (Anti-spam)
        const visitResult = await trackVisitWithAntiSpam(
            supabaseAdmin,
            affiliate.id,
            affiliateLink.id,
            "1.2.3.4",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        );
        expect(visitResult.tracked).toBe(true);
        expect(visitResult.visit.is_unique).toBe(true);

        // 6. Create commission (with waiting period)
        const commissionResult = await createCommissionWithWaiting(supabaseAdmin, {
            affiliateId: affiliate.id,
            orderId: "fake-order-" + Math.random().toString(36).substring(7),
            amount: 500000,
            buyerEmail: "different-buyer@example.com", // Ensure no self-referral
        });
        expect(commissionResult.isNew).toBe(true);
        expect(commissionResult.commission.commission_amount).toBe(100000); // 20% of 500k
        expect(commissionResult.commission.status).toBe("pending");
        expect(commissionResult.fraudFlag).toBeNull();

        // 7. Check Stats
        const stats = await getAffiliateStats(supabaseAdmin, affiliate.id);
        expect(stats.totalVisits).toBe(1);
        expect(stats.totalCommissions).toBe(100000);
    });

    it("Task 6.2: Anti-Fraud — IP Rate Limiting", async () => {
        const testIp = "9.9.9.9";
        
        // First visit from this IP
        const v1 = await trackVisitWithAntiSpam(
            supabaseAdmin,
            affiliate.id,
            affiliateLink.id,
            testIp,
            "Browser User Agent"
        );
        expect(v1.tracked).toBe(true);

        // Second visit from SAME IP (within 24h)
        const v2 = await trackVisitWithAntiSpam(
            supabaseAdmin,
            affiliate.id,
            affiliateLink.id,
            testIp,
            "Browser User Agent"
        );
        expect(v2.tracked).toBe(false);
        expect(v2.reason).toBe("rate_limited");
        expect(v2.visit.is_unique).toBe(false);
    });

    it("Task 6.2: Anti-Fraud — Self-Referral Detection", async () => {
        // Try creating commission for the SAME email as the affiliate user
        const fraudResult = await createCommissionWithWaiting(supabaseAdmin, {
            affiliateId: affiliate.id,
            orderId: "fake-order-fraud-" + Math.random().toString(36).substring(7),
            amount: 500000,
            buyerEmail: testUser.email, // SAME EMAIL
        });

        expect(fraudResult.fraudFlag).toBe("self_referral");
        expect(fraudResult.commission.status).toBe("review");
    });
});
