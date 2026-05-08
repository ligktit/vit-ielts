import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "~supabase/admin";
import { requireFullAdmin } from "~lib/admin-auth";
import {
  approvePayoutRequest,
  rejectPayoutRequest,
  completePayoutManually,
} from "~services/payout";
import { sendPayoutStatusEmail } from "~services/email";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const user = await requireFullAdmin(req, res);
  if (!user) return;

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ success: false, error: "Payout ID is required" });
  }

  const { action, reason, transactionCode } = req.body;

  try {
    switch (action) {
      case "approve": {
        const payout = await approvePayoutRequest(supabaseAdmin, id);
        return res.status(200).json({ success: true, payout });
      }

        case "reject": {
        if (!reason) {
          return res.status(400).json({ success: false, error: "Lý do từ chối là bắt buộc" });
        }
        await rejectPayoutRequest(supabaseAdmin, id, reason);

        // Notify affiliate
        try {
          const { data: pData } = await supabaseAdmin
            .from("payouts")
            .select("amount, affiliate_id, affiliates(user_id)")
            .eq("id", id)
            .single();
          
          if (pData && (pData as any).affiliates?.user_id) {
            const userId = (pData as any).affiliates.user_id;
            const { data: userData } = await supabaseAdmin
              .from("users")
              .select("name, email")
              .eq("id", userId)
              .single();
            
            if (userData) {
              sendPayoutStatusEmail(userData.email, userData.name || "User", pData.amount, "rejected", reason);
            }
          }
        } catch (err) {
          console.error("[Admin] Failed to send payout reject email:", err);
        }

        return res.status(200).json({ success: true, message: "Đã từ chối yêu cầu rút tiền" });
      }

      case "complete": {
        const payout = await completePayoutManually(supabaseAdmin, id, transactionCode);

        // Notify affiliate
        try {
          const { data: pData } = await supabaseAdmin
            .from("payouts")
            .select("amount, affiliate_id, affiliates(user_id)")
            .eq("id", id)
            .single();
          
          if (pData && (pData as any).affiliates?.user_id) {
            const userId = (pData as any).affiliates.user_id;
            const { data: userData } = await supabaseAdmin
              .from("users")
              .select("name, email")
              .eq("id", userId)
              .single();
            
            if (userData) {
              sendPayoutStatusEmail(userData.email, userData.name || "User", pData.amount, "completed");
            }
          }
        } catch (err) {
          console.error("[Admin] Failed to send payout complete email:", err);
        }

        return res.status(200).json({ success: true, payout });
      }

      default:
        return res.status(400).json({
          success: false,
          error: "Invalid action. Use: approve, reject, or complete",
        });
    }
  } catch (error) {
    console.error(`[API /api/admin/affiliate/payouts/${id} PUT]`, error);
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal error",
    });
  }
}
