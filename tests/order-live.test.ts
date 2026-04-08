
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabaseAdmin } from "./fixtures/supabase-live";
import { createTestUser, deleteTestUser } from "./fixtures/test-data-helpers";
import { createOrder, getOrderById, completeOrder } from "../services/order";
import { activateProAccount, getUserProfile } from "../services/user";
import { registerAffiliate, resolveAffiliateRef, createCommissionWithWaiting } from "../services/affiliate";

describe("Order & Payment Service — Live Integration", () => {
    let buyer: any;
    let affiliateUser: any;
    let affiliate: any;

    beforeAll(async () => {
        // 1. Create a buyer and an affiliate user
        buyer = await createTestUser();
        affiliateUser = await createTestUser();
        
        // 2. Setup Affiliate
        const reg = await registerAffiliate(supabaseAdmin, affiliateUser.id, "ref-" + affiliateUser.id.substring(0, 8));
        affiliate = reg.affiliate;
        await supabaseAdmin.from("affiliates").update({ status: "active" }).eq("id", affiliate.id);
    });

    afterAll(async () => {
        // Cleanup
        if (buyer) {
            await supabaseAdmin.from("orders").delete().eq("user_id", buyer.id);
            await deleteTestUser(buyer.id);
        }
        if (affiliate) {
            await supabaseAdmin.from("commissions").delete().eq("affiliate_id", affiliate.id);
            await supabaseAdmin.from("affiliates").delete().eq("id", affiliate.id);
            await deleteTestUser(affiliateUser.id);
        }
    });

    it("Task 7.1: Live Order Flow (Pending -> Completed -> Pro Activation -> Commission)", async () => {
        // 1. Create Order
        const order = await createOrder(supabaseAdmin, {
            userId: buyer.id,
            packageType: "combo",
            duration: 30, // 30 days
            amount: 299000,
            affiliateRef: affiliate.custom_link
        });
        expect(order).toBeDefined();
        expect(order.status).toBe("pending");
        expect(order.amount).toBe(299000);

        // 2. Simulate Webhook: Complete Order
        const { updated, order: completedOrder } = await completeOrder(supabaseAdmin, order.order_id);
        expect(updated).toBe(true);
        expect(completedOrder?.status).toBe("completed");

        // 3. Simulate Webhook: Activate Pro Account
        await activateProAccount(supabaseAdmin, buyer.id, 1, null);
        
        // 4. Verify Pro Activation
        const profile = await getUserProfile(supabaseAdmin, buyer.id);
        expect(profile).toBeDefined();
        expect(profile?.is_pro).toBe(true);
        expect(new Date(profile?.pro_expiration_date as string) > new Date()).toBe(true);

        // 5. Simulate Webhook: Create Commission
        const resolved = await resolveAffiliateRef(supabaseAdmin, order.affiliate_ref);
        expect(resolved).not.toBeNull();
        
        const commResult = await createCommissionWithWaiting(supabaseAdmin, {
            affiliateId: resolved!.affiliateId,
            orderId: order.order_id,
            amount: order.amount,
            buyerEmail: buyer.email
        });
        expect(commResult.isNew).toBe(true);
        expect(commResult.commission.commission_amount).toBe(59800); // 20% of 299k
        expect(commResult.commission.status).toBe("pending");
    });

    it("Should handle multiple activation (extending duration)", async () => {
        // Current expiration
        const p1 = await getUserProfile(supabaseAdmin, buyer.id);
        const exp1 = new Date(p1?.pro_expiration_date as string);

        // Activate another 1 month
        await activateProAccount(supabaseAdmin, buyer.id, 1, null);

        const p2 = await getUserProfile(supabaseAdmin, buyer.id);
        const exp2 = new Date(p2?.pro_expiration_date as string);

        // Should be roughly 30 days more (between 28 and 31 depending on month)
        const diffDays = Math.round((exp2.getTime() - exp1.getTime()) / (1000 * 60 * 60 * 24));
        expect(diffDays).toBeGreaterThanOrEqual(28);
        expect(diffDays).toBeLessThanOrEqual(31);
    });
});
