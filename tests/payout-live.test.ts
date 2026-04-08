
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabaseAdmin } from "./fixtures/supabase-live";
import { createTestUser, deleteTestUser } from "./fixtures/test-data-helpers";
import { registerAffiliate, adjustAffiliateBalance } from "../services/affiliate";
import {
    saveBankInfo,
    createPayoutRequest,
    approvePayoutRequest,
    completePayoutFromWebhook,
    rejectPayoutRequest,
    getPayoutById,
} from "../services/payout";

describe("Payout Service — Live Integration", () => {
    let testUser: any;
    let affiliate: any;

    beforeAll(async () => {
        // 1. Create affiliate
        testUser = await createTestUser();
        const reg = await registerAffiliate(supabaseAdmin, testUser.id, "payout-ref-" + testUser.id.substring(0, 8));
        affiliate = reg.affiliate;
        await supabaseAdmin.from("affiliates").update({ status: "active" }).eq("id", affiliate.id);
    });

    afterAll(async () => {
        // Cleanup
        if (affiliate) {
            await supabaseAdmin.from("payouts").delete().eq("affiliate_id", affiliate.id);
            await supabaseAdmin.from("affiliate_bank_info").delete().eq("affiliate_id", affiliate.id);
            await supabaseAdmin.from("affiliates").delete().eq("id", affiliate.id);
        }
        await deleteTestUser(testUser.id);
    });

    it("Task 1.1: Payout Request -> Approve -> Complete (SePay Simulation)", async () => {
        const amount = 500000;

        // 1. Add balance
        await adjustAffiliateBalance(supabaseAdmin, affiliate.id, amount);

        // 2. Save Bank Info
        await saveBankInfo(supabaseAdmin, affiliate.id, {
            account_holder: "TEST HOLDER",
            account_number: "123456789",
            bank_name: "ACB"
        });

        // 3. Create Payout Request
        const payout = await createPayoutRequest(supabaseAdmin, affiliate.id, amount);
        expect(payout.status).toBe("pending");
        expect(payout.amount).toBe(amount);

        // Check balance (should be 0 now as it's held)
        const { data: affData } = await supabaseAdmin.from("affiliates").select("balance").eq("id", affiliate.id).single();
        expect(affData?.balance).toBe(0);

        // 4. Approve Payout
        const approved = await approvePayoutRequest(supabaseAdmin, payout.id);
        expect(approved.status).toBe("approved");

        // 5. Complete from Webhook
        const sepayId = Math.floor(Math.random() * 1000000);
        const { updated, payout: completed } = await completePayoutFromWebhook(supabaseAdmin, payout.id, {
            sepayId,
            amount: amount,
            referenceCode: "REF123",
            transactionDate: new Date().toISOString()
        });

        expect(updated).toBe(true);
        expect(completed?.status).toBe("completed");
        expect(completed?.sepay_transaction_id).toBe(sepayId);
    });

    it("Task 1.1: Reject Payout (Balance Refund)", async () => {
        const amount = 300000;

        // 1. Add balance
        await adjustAffiliateBalance(supabaseAdmin, affiliate.id, amount);

        // 2. Create Payout
        const payout = await createPayoutRequest(supabaseAdmin, affiliate.id, amount);
        
        // 3. Reject Payout
        await rejectPayoutRequest(supabaseAdmin, payout.id, "Test rejection");

        // 4. Verify status and balance refund
        const updatedPayout = await getPayoutById(supabaseAdmin, payout.id);
        expect(updatedPayout?.status).toBe("rejected");
        expect(updatedPayout?.reject_reason).toBe("Test rejection");

        const { data: affData } = await supabaseAdmin.from("affiliates").select("balance").eq("id", affiliate.id).single();
        expect(affData?.balance).toBe(amount); // Refunded
    });

    it("Should fail payout if insufficient balance", async () => {
        const getBalance = async (id: string) => {
          const { data } = await supabaseAdmin.from("affiliates").select("balance").eq("id", id).single();
          return (data as any)?.balance || 0;
        };

        const currentBal = await getBalance(affiliate.id);
        if (currentBal > 0) {
            await adjustAffiliateBalance(supabaseAdmin, affiliate.id, -currentBal);
        }

        await expect(createPayoutRequest(supabaseAdmin, affiliate.id, 10000000))
            .rejects.toThrow("Số dư không đủ để rút tiền");
    });
});
