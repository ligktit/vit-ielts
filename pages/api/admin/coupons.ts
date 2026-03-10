import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "~supabase/admin";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../../../services/coupon";
import { requireAdmin } from "../../../lib/admin-auth";

// Re-export Coupon type for backward compatibility with other imports
export type { Coupon } from "../../../services/coupon";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await requireAdmin(req, res);
  if (!user) return;

  if (req.method === "GET") {
    try {
      const coupons = await getCoupons(supabaseAdmin);

      // Map to legacy shape for frontend compatibility
      const mapped = coupons.map((c) => ({
        id: c.id,
        code: c.code,
        discountAmount: c.value,
        maxUses: c.max_uses ?? 0,
        currentUses: c.current_uses,
        isActive: c.is_active,
        createdAt: c.created_at,
        updatedAt: c.created_at, // DB doesn't have updated_at, use created_at
      }));

      return res.status(200).json(mapped);
    } catch (error) {
      return res.status(500).json({
        message: "Không đọc được danh sách mã giảm giá",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (req.method === "POST") {
    try {
      const { code, discountAmount, maxUses } = req.body;

      if (!code || !discountAmount || !maxUses) {
        return res.status(400).json({
          message: "Thiếu thông tin: code, discountAmount, maxUses là bắt buộc",
        });
      }

      const coupon = await createCoupon(supabaseAdmin, {
        code,
        value: Number(discountAmount),
        maxUses: Number(maxUses),
        type: "fixed",
      });

      // Map to legacy shape
      const mapped = {
        id: coupon.id,
        code: coupon.code,
        discountAmount: coupon.value,
        maxUses: coupon.max_uses ?? 0,
        currentUses: coupon.current_uses,
        isActive: coupon.is_active,
        createdAt: coupon.created_at,
        updatedAt: coupon.created_at,
      };

      return res.status(200).json({ message: "Tạo mã giảm giá thành công", coupon: mapped });
    } catch (error) {
      // Handle unique constraint violation (duplicate code)
      const errMsg = error instanceof Error ? error.message : String(error);
      if (errMsg.includes("duplicate") || errMsg.includes("unique")) {
        return res.status(400).json({ message: "Mã giảm giá đã tồn tại" });
      }
      return res.status(500).json({
        message: "Không thể tạo mã giảm giá",
        error: errMsg,
      });
    }
  }

  if (req.method === "PUT") {
    try {
      const { id, code, discountAmount, maxUses, isActive } = req.body;

      if (!id) {
        return res.status(400).json({ message: "Thiếu id" });
      }

      const coupon = await updateCoupon(supabaseAdmin, id, {
        ...(code !== undefined && { code }),
        ...(discountAmount !== undefined && { value: Number(discountAmount) }),
        ...(maxUses !== undefined && { maxUses: Number(maxUses) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      });

      // Map to legacy shape
      const mapped = {
        id: coupon.id,
        code: coupon.code,
        discountAmount: coupon.value,
        maxUses: coupon.max_uses ?? 0,
        currentUses: coupon.current_uses,
        isActive: coupon.is_active,
        createdAt: coupon.created_at,
        updatedAt: new Date().toISOString(),
      };

      return res.status(200).json({ message: "Cập nhật thành công", coupon: mapped });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      if (errMsg.includes("duplicate") || errMsg.includes("unique")) {
        return res.status(400).json({ message: "Mã giảm giá đã tồn tại" });
      }
      return res.status(500).json({
        message: "Không thể cập nhật mã giảm giá",
        error: errMsg,
      });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "Thiếu id" });
      }

      await deleteCoupon(supabaseAdmin, id);

      return res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
      return res.status(500).json({
        message: "Không thể xóa mã giảm giá",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
