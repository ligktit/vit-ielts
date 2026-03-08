import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "~supabase/admin";
import { validateCoupon } from "../../../services/coupon";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        valid: false,
        message: "Vui lòng nhập mã giảm giá",
      });
    }

    const result = await validateCoupon(supabaseAdmin, code);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      valid: false,
      message: "Có lỗi xảy ra khi kiểm tra mã giảm giá",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
