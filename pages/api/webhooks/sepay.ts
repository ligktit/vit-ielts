import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "~supabase/admin";
import {
  getOrderByTransferContent,
  updateOrderStatus,
} from "../../../services/order";
import { activateProAccount, getUserProfile } from "../../../services/user";
import {
  sendOrderConfirmEmail,
  sendAdminNotificationEmail,
} from "../../../services/email";

// ============================================================
// Types
// ============================================================

interface SepayWebhookPayload {
  gateway?: string; // "ACB"
  transactionDate?: string; // "2026-01-23 16:58:05"
  accountNumber?: string; // "2447967"
  subAccount?: string | null;
  code?: string | null;
  content?: string; // Nội dung chuyển khoản — chứa mã đơn hàng
  transferType?: string; // "in"
  description?: string;
  transferAmount?: number; // Số tiền (VND)
  referenceCode?: string;
  accumulated?: number;
  id?: number;
}

// ============================================================
// Handler
// ============================================================

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Chỉ chấp nhận POST request
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Optional: Verify webhook signature từ Sepay (nếu có)
  const webhookSecret = process.env.SEPAY_WEBHOOK_SECRET;
  if (webhookSecret) {
    // TODO: Implement signature verification nếu Sepay cung cấp
    // const signature = req.headers["x-sepay-signature"];
    // if (!verifySignature(payload, signature, webhookSecret)) {
    //   return res.status(401).json({ error: "Invalid signature" });
    // }
  }

  try {
    // Parse webhook payload từ Sepay
    const payload: SepayWebhookPayload = req.body;
    console.log(
      `[Sepay Webhook] Raw payload received:`,
      JSON.stringify(payload, null, 2),
    );

    const amount = Number(payload.transferAmount);
    const content = payload.content || "";

    // Validate payload
    if (!amount || !content) {
      return res.status(400).json({
        error: "Missing required fields: transferAmount or content",
        received: payload,
      });
    }

    // ── Parse orderId từ content ──
    // Format từ Sepay: "IELTS PREDICTION 17691622312585779 FT26023000837022 ..."
    // OrderId format: "IELTS PREDICTION {timestamp}{random}"
    let orderId = "";

    const orderIdPattern = /IELTS\s+PREDICTION\s+(\d+)/i;
    const match = content.match(orderIdPattern);

    if (match) {
      const fullPattern = /IELTS\s+PREDICTION\s*\d+/i;
      const fullMatch = content.match(fullPattern);
      if (fullMatch) {
        orderId = fullMatch[0].replace(/\s+/g, " ").trim();
      } else {
        orderId = `IELTS PREDICTION ${match[1]}`;
      }
    } else {
      orderId = content.trim();
      console.warn(
        `[Sepay Webhook] Could not parse orderId from content, using full content: ${orderId}`,
      );
    }

    console.log(`[Sepay Webhook] Parsed payment notification:`, {
      amount,
      orderId,
      originalContent: content,
      accountNumber: payload.accountNumber,
      gateway: payload.gateway,
      transactionDate: payload.transactionDate || new Date().toISOString(),
    });

    // ── Tìm order ──
    let order = await getOrderByTransferContent(supabaseAdmin, orderId);

    // Thử tìm thêm với chỉ phần số nếu không tìm thấy
    if (!order) {
      const orderIdNumbers = orderId
        .replace("IELTS PREDICTION", "")
        .trim();
      if (orderIdNumbers) {
        order = await getOrderByTransferContent(
          supabaseAdmin,
          orderIdNumbers,
        );
      }
    }

    if (!order) {
      console.error(`[Sepay Webhook] Order not found:`, {
        searchedOrderId: orderId,
      });
      return res.status(404).json({
        error: "Order not found",
        orderId,
        searchedContent: content,
      });
    }

    console.log(`[Sepay Webhook] Found order:`, {
      orderId: order.order_id,
      transferContent: order.transfer_content,
      amount: order.amount,
      status: order.status,
      userId: order.user_id,
    });

    // ── Kiểm tra order đã xử lý chưa ──
    if (order.status === "completed") {
      console.log(
        `[Sepay Webhook] Order already completed: ${order.order_id}`,
      );
      return res.status(200).json({
        success: true,
        message: "Order already processed",
        orderId: order.order_id,
      });
    }

    // ── Đối chiếu số tiền (cho phép sai số 1000 VND) ──
    if (Math.abs(order.amount - amount) > 1000) {
      console.error(`[Sepay Webhook] Amount mismatch:`, {
        expected: order.amount,
        received: amount,
        orderId: order.order_id,
      });
      return res.status(400).json({
        error: "Amount mismatch",
        expected: order.amount,
        received: amount,
      });
    }

    // ── Lấy thông tin user từ Supabase ──
    let userEmail: string | null = null;
    let userName: string | null = null;

    if (order.user_id && !order.user_id.startsWith("temp_")) {
      try {
        const userProfile = await getUserProfile(supabaseAdmin, order.user_id);
        if (userProfile) {
          userEmail = userProfile.email || null;
          userName = userProfile.name || null;
          console.log(
            `[Sepay Webhook] Fetched user info: ${userName} (${userEmail})`,
          );
        }
      } catch (userError) {
        console.error(
          "[Sepay Webhook] Error fetching user profile:",
          userError,
        );
      }
    }

    // ── Kích hoạt Pro account ──
    if (order.user_id && !order.user_id.startsWith("temp_")) {
      try {
        console.log(
          `[Sepay Webhook] Starting ProAccount update for user: ${order.user_id}`,
        );
        await activateProAccount(
          supabaseAdmin,
          order.user_id,
          order.duration,
        );
        console.log(
          `[Sepay Webhook] ✓ ProAccount updated successfully for user: ${order.user_id}`,
        );
      } catch (updateError) {
        console.error(`[Sepay Webhook] ✗ Error updating ProAccount:`, updateError);
        // Vẫn tiếp tục xử lý, không fail toàn bộ request
      }
    } else {
      console.log(
        `[Sepay Webhook] Skipping ProAccount update: invalid userId (${order.user_id})`,
      );
    }

    // ── Gửi email cho khách hàng ──
    if (userEmail && userName) {
      try {
        console.log(
          `[Sepay Webhook] Sending customer email to: ${userEmail}`,
        );
        await sendOrderConfirmEmail(
          userEmail,
          userName,
          order.order_id,
          order.amount,
          order.duration,
        );
        console.log(`[Sepay Webhook] ✓ Customer email sent successfully`);
      } catch (emailError) {
        console.error(
          `[Sepay Webhook] ✗ Error sending customer email:`,
          emailError,
        );
      }
    } else {
      console.warn(
        `[Sepay Webhook] Skipping customer email: missing userEmail or userName`,
      );
    }

    // ── Gửi email cho admin ──
    try {
      const adminEmail =
        process.env.ADMIN_EMAIL || "admin@ieltspredictiontest.com";
      console.log(`[Sepay Webhook] Sending admin email to: ${adminEmail}`);
      await sendAdminNotificationEmail(
        order.order_id,
        userName || "Khách hàng",
        userEmail || "N/A",
        order.amount,
        order.duration,
      );
      console.log(`[Sepay Webhook] ✓ Admin email sent successfully`);
    } catch (emailError) {
      console.error(
        `[Sepay Webhook] ✗ Error sending admin email:`,
        emailError,
      );
    }

    // ── Cập nhật order status → completed ──
    try {
      await updateOrderStatus(supabaseAdmin, order.order_id, "completed");
      console.log(
        `[Sepay Webhook] ✓ Updated order status: ${order.order_id} → completed`,
      );
    } catch (saveError) {
      console.error(
        `[Sepay Webhook] Error updating order status:`,
        saveError,
      );
      // Vẫn trả về success vì các bước khác đã hoàn thành
    }

    console.log(`[Sepay Webhook] ✓ Successfully processed order:`, {
      orderId: order.order_id,
      amount,
      userId: order.user_id,
      status: "completed",
    });

    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      orderId: order.order_id,
      status: "completed",
      amount,
    });
  } catch (error) {
    console.error("[Sepay Webhook] Error processing webhook:", error);
    console.error(
      "[Sepay Webhook] Request body:",
      JSON.stringify(req.body, null, 2),
    );

    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : String(error),
      ...(process.env.NODE_ENV === "development" &&
        error instanceof Error && { stack: error.stack }),
    });
  }
}
