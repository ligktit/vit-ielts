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
import { dbg } from "../../../lib/debug";

const log = dbg.webhook;

// ============================================================
// Types
// ============================================================

interface SepayWebhookPayload {
  gateway?: string; // "ACB"
  transactionDate?: string; // "2026-01-23 16:58:05"
  accountNumber?: string; // "2447967"
  subAccount?: string | null;
  code?: string | null;
  content?: string; // Ná»™i dung chuyá»ƒn khoáº£n â€” chá»©a mÃ£ Ä‘Æ¡n hÃ ng
  transferType?: string; // "in"
  description?: string;
  transferAmount?: number; // Sá»‘ tiá»n (VND)
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
  // Chá»‰ cháº¥p nháº­n POST request
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Optional: Verify webhook signature tá»« Sepay (náº¿u cÃ³)
  const webhookSecret = process.env.SEPAY_WEBHOOK_SECRET;
  if (webhookSecret) {
    // TODO: Implement signature verification náº¿u Sepay cung cáº¥p
    // const signature = req.headers["x-sepay-signature"];
    // if (!verifySignature(payload, signature, webhookSecret)) {
    //   return res.status(401).json({ error: "Invalid signature" });
    // }
  }

  try {
    // Parse webhook payload tá»« Sepay
    const payload: SepayWebhookPayload = req.body;
    log(
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

    // â”€â”€ Parse orderId tá»« content â”€â”€
    // Format tá»« Sepay: "IELTS PREDICTION 17691622312585779 FT26023000837022 ..."
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
      log.warn(
        `[Sepay Webhook] Could not parse orderId from content, using full content: ${orderId}`,
      );
    }

    log(`[Sepay Webhook] Parsed payment notification:`, {
      amount,
      orderId,
      originalContent: content,
      accountNumber: payload.accountNumber,
      gateway: payload.gateway,
      transactionDate: payload.transactionDate || new Date().toISOString(),
    });

    // â”€â”€ TÃ¬m order â”€â”€
    let order = await getOrderByTransferContent(supabaseAdmin, orderId);

    // Thá»­ tÃ¬m thÃªm vá»›i chá»‰ pháº§n sá»‘ náº¿u khÃ´ng tÃ¬m tháº¥y
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
      log.error(`[Sepay Webhook] Order not found:`, {
        searchedOrderId: orderId,
      });
      return res.status(404).json({
        error: "Order not found",
        orderId,
        searchedContent: content,
      });
    }

    log(`[Sepay Webhook] Found order:`, {
      orderId: order.order_id,
      transferContent: order.transfer_content,
      amount: order.amount,
      status: order.status,
      userId: order.user_id,
    });

    // â”€â”€ Kiá»ƒm tra order Ä‘Ã£ xá»­ lÃ½ chÆ°a â”€â”€
    if (order.status === "completed") {
      log(
        `[Sepay Webhook] Order already completed: ${order.order_id}`,
      );
      return res.status(200).json({
        success: true,
        message: "Order already processed",
        orderId: order.order_id,
      });
    }

    // â”€â”€ Äá»‘i chiáº¿u sá»‘ tiá»n (cho phÃ©p sai sá»‘ 1000 VND) â”€â”€
    if (Math.abs(order.amount - amount) > 1000) {
      log.error(`[Sepay Webhook] Amount mismatch:`, {
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

    // â”€â”€ Láº¥y thÃ´ng tin user tá»« Supabase â”€â”€
    let userEmail: string | null = null;
    let userName: string | null = null;

    if (order.user_id && !order.user_id.startsWith("temp_")) {
      try {
        const userProfile = await getUserProfile(supabaseAdmin, order.user_id);
        if (userProfile) {
          userEmail = userProfile.email || null;
          userName = userProfile.name || null;
          log(
            `[Sepay Webhook] Fetched user info: ${userName} (${userEmail})`,
          );
        }
      } catch (userError) {
        log.error(
          "[Sepay Webhook] Error fetching user profile:",
          userError,
        );
      }
    }

    // â”€â”€ KÃ­ch hoáº¡t Pro account â”€â”€
    if (order.user_id && !order.user_id.startsWith("temp_")) {
      try {
        log(
          `[Sepay Webhook] Starting ProAccount update for user: ${order.user_id}`,
        );
        await activateProAccount(
          supabaseAdmin,
          order.user_id,
          order.duration,
        );
        log(
          `[Sepay Webhook] âœ“ ProAccount updated successfully for user: ${order.user_id}`,
        );
      } catch (updateError) {
        log.error(`[Sepay Webhook] âœ— Error updating ProAccount:`, updateError);
        // Váº«n tiáº¿p tá»¥c xá»­ lÃ½, khÃ´ng fail toÃ n bá»™ request
      }
    } else {
      log(
        `[Sepay Webhook] Skipping ProAccount update: invalid userId (${order.user_id})`,
      );
    }

    // â”€â”€ Gá»­i email cho khÃ¡ch hÃ ng â”€â”€
    if (userEmail && userName) {
      try {
        log(
          `[Sepay Webhook] Sending customer email to: ${userEmail}`,
        );
        await sendOrderConfirmEmail(
          userEmail,
          userName,
          order.order_id,
          order.amount,
          order.duration,
        );
        log(`[Sepay Webhook] âœ“ Customer email sent successfully`);
      } catch (emailError) {
        log.error(
          `[Sepay Webhook] âœ— Error sending customer email:`,
          emailError,
        );
      }
    } else {
      log.warn(
        `[Sepay Webhook] Skipping customer email: missing userEmail or userName`,
      );
    }

    // â”€â”€ Gá»­i email cho admin â”€â”€
    try {
      const adminEmail =
        process.env.ADMIN_EMAIL || "admin@ieltspredictiontest.com";
      log(`[Sepay Webhook] Sending admin email to: ${adminEmail}`);
      await sendAdminNotificationEmail(
        order.order_id,
        userName || "KhÃ¡ch hÃ ng",
        userEmail || "N/A",
        order.amount,
        order.duration,
      );
      log(`[Sepay Webhook] âœ“ Admin email sent successfully`);
    } catch (emailError) {
      log.error(
        `[Sepay Webhook] âœ— Error sending admin email:`,
        emailError,
      );
    }

    // â”€â”€ Cáº­p nháº­t order status â†’ completed â”€â”€
    try {
      await updateOrderStatus(supabaseAdmin, order.order_id, "completed");
      log(
        `[Sepay Webhook] âœ“ Updated order status: ${order.order_id} â†’ completed`,
      );
    } catch (saveError) {
      log.error(
        `[Sepay Webhook] Error updating order status:`,
        saveError,
      );
      // Váº«n tráº£ vá» success vÃ¬ cÃ¡c bÆ°á»›c khÃ¡c Ä‘Ã£ hoÃ n thÃ nh
    }

    log(`[Sepay Webhook] âœ“ Successfully processed order:`, {
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
    log.error("[Sepay Webhook] Error processing webhook:", error);
    log.error(
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
