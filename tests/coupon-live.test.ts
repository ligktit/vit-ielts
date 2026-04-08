
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabaseAdmin } from "./fixtures/supabase-live";
import { createTestUser, deleteTestUser, createTestCoupon } from "./fixtures/test-data-helpers";
import { createOrder } from "../services/order";
import { validateCoupon } from "../services/coupon";

describe("Coupon System — Live Integration", () => {
    let testUser: any;

    beforeAll(async () => {
        testUser = await createTestUser();
    });

    afterAll(async () => {
        if (testUser) {
            await supabaseAdmin.from("orders").delete().eq("user_id", testUser.id);
            await deleteTestUser(testUser.id);
        }
    });

    it("Task 8.1: Percent Coupon Logic", async () => {
        // 1. Create a 10% coupon
        const coupon = await createTestCoupon({
            type: "percent",
            value: 10,
            max_uses: 5
        });

        // 2. Validate
        const validation = await validateCoupon(supabaseAdmin, coupon.code);
        expect(validation.valid).toBe(true);
        expect(validation.coupon?.type).toBe("percent");

        // 3. Create Order with this coupon
        const originalAmount = 300000;
        const discountAmount = originalAmount * 0.1;
        const finalAmount = originalAmount - discountAmount;

        const order = await createOrder(supabaseAdmin, {
            userId: testUser.id,
            packageType: "combo",
            duration: 1,
            amount: finalAmount,
            originalAmount: originalAmount,
            discountAmount: discountAmount,
            couponId: coupon.id,
            couponCode: coupon.code
        });

        expect(order.amount).toBe(270000);
        expect(order.discount_amount).toBe(30000);

        // 4. Verify atomic increment
        const { data: updatedCoupon } = await supabaseAdmin
            .from("coupons")
            .select("current_uses")
            .eq("id", coupon.id)
            .single();
        
        expect(updatedCoupon?.current_uses).toBe(1);

        // Cleanup coupon
        await supabaseAdmin.from("coupons").delete().eq("id", coupon.id);
    });

    it("Task 8.1: Fixed Amount Coupon Logic", async () => {
        // 1. Create a 50k fixed coupon
        const coupon = await createTestCoupon({
            type: "fixed",
            value: 50000,
            max_uses: 5
        });

        // 2. Create Order
        const originalAmount = 299000;
        const finalAmount = originalAmount - 50000;

        const order = await createOrder(supabaseAdmin, {
            userId: testUser.id,
            packageType: "combo",
            duration: 1,
            amount: finalAmount,
            originalAmount: originalAmount,
            discountAmount: 50000,
            couponId: coupon.id,
            couponCode: coupon.code
        });

        expect(order.amount).toBe(249000);

        // Cleanup
        await supabaseAdmin.from("coupons").delete().eq("id", coupon.id);
    });

    it("Task 8.1: Max Uses Enforcement (Live RPC)", async () => {
        // 1. Create coupon with max_uses = 1
        const coupon = await createTestCoupon({
            max_uses: 1,
            current_uses: 0
        });

        // 2. Use it once via an order
        await createOrder(supabaseAdmin, {
            userId: testUser.id,
            packageType: "combo",
            duration: 1,
            amount: 100000,
            couponId: coupon.id,
            couponCode: coupon.code
        });

        // 3. Try to use it again — should FAIL in createOrder because of the RPC check
        await expect(createOrder(supabaseAdmin, {
            userId: testUser.id,
            packageType: "combo",
            duration: 1,
            amount: 100000,
            couponId: coupon.id,
            couponCode: coupon.code
        })).rejects.toThrow("Mã giảm giá không hợp lệ hoặc đã hết lượt sử dụng");

        // Cleanup
        await supabaseAdmin.from("coupons").delete().eq("id", coupon.id);
    });
});
