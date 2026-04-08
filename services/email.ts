/**
 * Email Service — Contact, order confirmation, admin notification emails
 *
 * Reads email template config from CMS (cms_configs table, section: "email-template").
 * Falls back to hardcoded defaults when CMS config is not found.
 *
 * ⚠️ Server-only — KHÔNG import ở client-side
 *
 * @origin functions.php L868–937 (SendContactEmail)
 * @origin sepay.ts L150–258 (sendCustomerEmail)
 * @origin sepay.ts L263–370 (sendAdminEmail)
 */

import { sendEmail } from "~server/email-helper";
import { encode } from "html-entities";
import { supabaseAdmin } from "~supabase/admin";
import { readConfig } from "./cms-config";

// ============================================================
// Types
// ============================================================

export type EmailTemplateConfig = {
    brand: {
        name: string;
        logoUrl: string;
        website: string;
        phone: string;
        email: string;
        address?: string;
    };
    orderConfirmation: {
        subject: string;
        headerTitle: string;
        greeting: string;
        bodyHtml: string;
        orderTableTitle: string;
        closingHtml: string;
        ctaButton?: { text: string; link: string };
        footerText: string;
    };
    adminNotification: {
        subject: string;
        headerTitle: string;
        bodyHtml: string;
    };
    style: {
        headerBgColor: string;
        headerBgGradient: string;
        bodyBgColor: string;
        contentBgColor: string;
        primaryColor: string;
        textColor: string;
        footerBgColor: string;
        footerTextColor: string;
    };
};

// ============================================================
// Template Variables
// ============================================================

/**
 * List of all supported template variables with descriptions.
 * Used by CMS UI for reference and by replaceVariables() for substitution.
 */
export const TEMPLATE_VARIABLES: Record<string, string> = {
    "{{customerName}}": "Tên học viên",
    "{{orderId}}": "Mã đơn hàng",
    "{{amount}}": "Số tiền (formatted VND)",
    "{{duration}}": "Thời hạn Pro (tháng)",
    "{{purchaseDate}}": "Ngày mua hàng",
    "{{currentYear}}": "Năm hiện tại",
    "{{brandName}}": "Tên thương hiệu",
    "{{brandPhone}}": "Số điện thoại",
    "{{brandEmail}}": "Email liên hệ",
    "{{brandWebsite}}": "Website",
    "{{customerEmail}}": "Email khách hàng",
};

// ============================================================
// Default Config
// ============================================================

const DEFAULT_CONFIG: EmailTemplateConfig = {
    brand: {
        name: "IELTS Prediction Test",
        logoUrl: "",
        website: "https://ieltspredictiontest.com",
        phone: "0927090848",
        email: "ieltsprediction9@gmail.com",
        address: "",
    },
    orderConfirmation: {
        subject: "Thanh toán thành công - Đơn hàng {{orderId}}",
        headerTitle: "Những điều tốt đẹp đang đến với bạn!",
        greeting: "Xin chào {{customerName}},",
        bodyHtml:
            "Chúng tôi đã xử lý thành công đơn hàng của bạn và đơn hàng đang được giao cho bạn.\n\nĐây là lời nhắc về những gì bạn đã đặt hàng:",
        orderTableTitle: "Tóm tắt đơn hàng",
        closingHtml:
            'Tài khoản <strong>Pro</strong> của bạn đã được kích hoạt thành công. Bạn có thể đăng nhập và bắt đầu làm bài dự đoán ngay.',
        ctaButton: {
            text: "Bắt đầu học ngay",
            link: "https://ieltspredictiontest.com",
        },
        footerText:
            "Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại bên dưới.",
    },
    adminNotification: {
        subject: "[Admin] Thanh toán thành công - Đơn hàng {{orderId}}",
        headerTitle: "Thông báo đơn hàng mới",
        bodyHtml: "Xác nhận thanh toán thành công!",
    },
    style: {
        headerBgColor: "#D94A56",
        headerBgGradient: "linear-gradient(135deg, #D94A56 0%, #c62828 100%)",
        bodyBgColor: "#f4f6f8",
        contentBgColor: "#ffffff",
        primaryColor: "#D94A56",
        textColor: "#333333",
        footerBgColor: "#2D3142",
        footerTextColor: "#ffffff",
    },
};

// ============================================================
// Helpers
// ============================================================

/**
 * Replace {{variable}} placeholders with actual values
 */
function replaceVariables(
    template: string,
    vars: Record<string, string>,
): string {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
        result = result.replace(new RegExp(key.replace(/[{}]/g, "\\$&"), "g"), value);
    }
    return result;
}

/**
 * Fetch email template config from CMS.
 * Falls back to default config if not found.
 */
async function getEmailConfig(): Promise<EmailTemplateConfig> {
    try {
        const config = await readConfig<EmailTemplateConfig>(
            supabaseAdmin,
            "email-template",
        );
        if (config) return config;
    } catch {
        // Silently fall back to defaults
    }
    return DEFAULT_CONFIG;
}

/**
 * Build order details table row
 */
function buildOrderRow(label: string, value: string): string {
    return `<tr>
    <td style="padding:10px 0; border-bottom:1px solid #f0f0f0; color:#666666; font-size:14px;">${label}</td>
    <td style="padding:10px 0; border-bottom:1px solid #f0f0f0; text-align:right; font-size:14px; font-weight:600; color:#333333;">${value}</td>
  </tr>`;
}

/**
 * Build order details table (shared between customer + admin emails).
 */
function buildOrderTable(
    rows: Array<[string, string]>,
    totalRow?: [string, string],
): string {
    const trs = rows.map(([label, value]) => buildOrderRow(label, value)).join("");
    const totalTr = totalRow
        ? `<tr>
    <td style="padding:14px 0; font-size:15px; font-weight:700; color:#333333;">${totalRow[0]}</td>
    <td style="padding:14px 0; text-align:right; font-size:18px; font-weight:700; color:#D94A56;">${totalRow[1]}</td>
  </tr>`
        : "";
    return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0; font-size:14px; font-family:Arial, Helvetica, sans-serif;">${trs}${totalTr}</table>`;
}

/**
 * Build a complete HTML email with the new design matching demo.
 * Clean, minimal, text-based layout with brand name at top.
 */
function buildEmailHtml(
    config: EmailTemplateConfig,
    headerTitle: string,
    bodyHtml: string,
    vars: Record<string, string>,
    options?: {
        orderTable?: string;
        orderTableTitle?: string;
        ctaButton?: { text: string; link: string };
        billingInfo?: { name: string; phone?: string; email?: string };
    },
): string {
    const { brand, style } = config;

    const logoHtml = brand.logoUrl
        ? `<img src="${encode(brand.logoUrl)}" alt="${encode(brand.name)}" style="max-height:40px; max-width:180px;" />`
        : "";

    const ctaHtml =
        options?.ctaButton
            ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td align="center">
        <a href="${encode(options.ctaButton.link)}" style="display:inline-block; padding:14px 36px; background-color:${style.primaryColor}; color:#ffffff; text-decoration:none; border-radius:6px; font-size:15px; font-weight:700; font-family:Arial, Helvetica, sans-serif;">
          ${encode(options.ctaButton.text)}
        </a>
      </td>
    </tr>
  </table>`
            : "";

    const orderTableHtml = options?.orderTable
        ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="padding:16px 0; border-bottom:2px solid #333333;">
        <strong style="font-size:15px; color:#333333;">${encode(options.orderTableTitle || "Tóm tắt đơn hàng")}</strong>
      </td>
    </tr>
  </table>
  ${options.orderTable}`
        : "";

    const billingHtml = options?.billingInfo
        ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0; border-top:2px solid #eeeeee; padding-top:16px;">
    <tr>
      <td>
        <strong style="font-size:15px; color:#333333;">Thông tin thanh toán</strong>
      </td>
    </tr>
    <tr>
      <td style="padding:12px 0 4px; font-size:14px; color:#333333;">${encode(options.billingInfo.name)}</td>
    </tr>
    ${options.billingInfo.phone ? `<tr><td style="padding:2px 0; font-size:14px;"><a href="tel:${encode(options.billingInfo.phone)}" style="color:${style.primaryColor}; text-decoration:none;">${encode(options.billingInfo.phone)}</a></td></tr>` : ""}
    ${options.billingInfo.email ? `<tr><td style="padding:2px 0; font-size:14px;"><a href="mailto:${encode(options.billingInfo.email)}" style="color:${style.primaryColor}; text-decoration:none;">${encode(options.billingInfo.email)}</a></td></tr>` : ""}
  </table>`
        : "";

    const footerContactHtml = `<table width="100%" cellpadding="0" cellspacing="0">
    ${brand.phone ? `<tr><td style="padding:4px 0; font-size:13px; color:${style.footerTextColor};">📞 ${encode(brand.phone)}</td></tr>` : ""}
    ${brand.email ? `<tr><td style="padding:4px 0; font-size:13px;"><a href="mailto:${encode(brand.email)}" style="color:${style.footerTextColor}; text-decoration:underline;">${encode(brand.email)}</a></td></tr>` : ""}
    ${brand.website ? `<tr><td style="padding:4px 0; font-size:13px;"><a href="${encode(brand.website)}" style="color:${style.footerTextColor}; text-decoration:underline;">${encode(brand.website)}</a></td></tr>` : ""}
  </table>`;

    const processedTitle = replaceVariables(headerTitle, vars);
    const processedBody = replaceVariables(bodyHtml, vars);

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${encode(processedTitle)}</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    td { font-family: Arial, Helvetica, sans-serif; }
  </style>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:${style.bodyBgColor}; font-family:Arial, Helvetica, sans-serif; -webkit-font-smoothing:antialiased;">
  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${style.bodyBgColor};">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <!-- Email Container -->
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px; width:100%; background-color:${style.contentBgColor}; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Brand Header -->
          <tr>
            <td style="padding:24px 32px; border-bottom:1px solid #f0f0f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    ${logoHtml}
                    <span style="font-size:20px; font-weight:700; color:${style.primaryColor}; font-family:Arial, Helvetica, sans-serif; ${brand.logoUrl ? "display:none;" : ""}">${encode(brand.name)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:32px 32px 24px; color:${style.textColor}; font-size:15px; line-height:1.7;">
              <!-- Title -->
              <h1 style="margin:0 0 16px; font-size:22px; font-weight:700; color:#1a1a1a; line-height:1.4;">${encode(processedTitle)}</h1>

              <!-- Body Content -->
              ${processedBody.split("\n").map((line: string) => `<p style="margin:0 0 12px; font-size:15px; line-height:1.7; color:${style.textColor};">${line}</p>`).join("\n              ")}

              <!-- Order Summary -->
              ${orderTableHtml}

              <!-- Billing Info -->
              ${billingHtml}

              <!-- CTA Button -->
              ${ctaHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${style.footerBgColor}; padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:12px;">
                    <span style="font-size:14px; font-weight:700; color:${style.footerTextColor};">${encode(brand.name)}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    ${footerContactHtml}
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:16px; border-top:1px solid rgba(255,255,255,0.2); margin-top:12px;">
                    <p style="margin:0; font-size:12px; color:rgba(255,255,255,0.6);">
                      © ${new Date().getFullYear()} ${encode(brand.name)}. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================================
// Contact Email
// ============================================================

/**
 * Gửi email liên hệ từ form contact
 *
 * @origin functions.php L868–937
 */
export async function sendContactEmail(
    name: string,
    email: string,
    subject: string,
    message: string,
): Promise<boolean> {
    const config = await getEmailConfig();
    const adminEmail =
        process.env.ADMIN_EMAIL || config.brand.email || "admin@ieltspredictiontest.com";

    const vars: Record<string, string> = {
        "{{brandName}}": config.brand.name,
        "{{brandPhone}}": config.brand.phone,
        "{{brandEmail}}": config.brand.email,
        "{{brandWebsite}}": config.brand.website,
        "{{currentYear}}": String(new Date().getFullYear()),
    };

    const bodyHtml = `${encode(name)} đã gửi liên hệ:\n\n<strong>Email:</strong> ${encode(email)}\n<strong>Tiêu đề:</strong> ${encode(subject)}\n<strong>Nội dung:</strong>\n${encode(message).replace(/\n/g, "<br/>")}`;

    const html = buildEmailHtml(config, "Liên hệ mới", bodyHtml, vars);
    return sendEmail(adminEmail, `[Contact] ${subject}`, html);
}

// ============================================================
// Order Confirmation Email (for customer)
// ============================================================

/**
 * Gửi email xác nhận thanh toán cho khách hàng
 *
 * @origin sepay.ts L150–258 (sendCustomerEmail)
 */
export async function sendOrderConfirmEmail(
    customerEmail: string,
    customerName: string,
    orderId: string,
    amount: number,
    duration: number,
): Promise<boolean> {
    const config = await getEmailConfig();
    const { orderConfirmation } = config;

    const formattedAmount = `${amount.toLocaleString("vi-VN")} đ`;
    const purchaseDate = new Date().toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const vars: Record<string, string> = {
        "{{customerName}}": encode(customerName),
        "{{orderId}}": encode(orderId),
        "{{amount}}": formattedAmount,
        "{{duration}}": `${duration} tháng`,
        "{{purchaseDate}}": purchaseDate,
        "{{currentYear}}": String(new Date().getFullYear()),
        "{{brandName}}": config.brand.name,
        "{{brandPhone}}": config.brand.phone,
        "{{brandEmail}}": config.brand.email,
        "{{brandWebsite}}": config.brand.website,
        "{{customerEmail}}": encode(customerEmail),
    };

    const subject = replaceVariables(orderConfirmation.subject, vars);
    const greeting = replaceVariables(orderConfirmation.greeting, vars);
    const body = replaceVariables(orderConfirmation.bodyHtml, vars);
    const closing = replaceVariables(orderConfirmation.closingHtml, vars);

    const orderTable = buildOrderTable(
        [
            ["Đơn hàng", `#${encode(orderId)}`],
            ["Ngày mua", purchaseDate],
            ["Gói Pro", `${duration} tháng`],
        ],
        ["Tổng cộng", formattedAmount],
    );

    const fullBody = `${greeting}\n\n${body}\n\n${closing}`;

    const html = buildEmailHtml(
        config,
        replaceVariables(orderConfirmation.headerTitle, vars),
        fullBody,
        vars,
        {
            orderTable,
            orderTableTitle: replaceVariables(orderConfirmation.orderTableTitle, vars),
            ctaButton: orderConfirmation.ctaButton
                ? {
                      text: replaceVariables(orderConfirmation.ctaButton.text, vars),
                      link: replaceVariables(orderConfirmation.ctaButton.link, vars),
                  }
                : undefined,
            billingInfo: {
                name: customerName,
                phone: undefined,
                email: customerEmail,
            },
        },
    );

    return sendEmail(customerEmail, subject, html);
}

// ============================================================
// Admin Notification Email
// ============================================================

/**
 * Gửi email thông báo đơn hàng mới cho admin
 *
 * @origin sepay.ts L263–370 (sendAdminEmail)
 */
export async function sendAdminNotificationEmail(
    orderId: string,
    customerName: string,
    customerEmail: string,
    amount: number,
    duration: number,
): Promise<boolean> {
    const config = await getEmailConfig();
    const { adminNotification } = config;

    const adminEmailAddr =
        process.env.ADMIN_EMAIL || config.brand.email || "admin@ieltspredictiontest.com";

    const formattedAmount = `${amount.toLocaleString("vi-VN")} đ`;
    const purchaseDate = new Date().toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const vars: Record<string, string> = {
        "{{customerName}}": encode(customerName),
        "{{orderId}}": encode(orderId),
        "{{amount}}": formattedAmount,
        "{{duration}}": `${duration} tháng`,
        "{{purchaseDate}}": purchaseDate,
        "{{currentYear}}": String(new Date().getFullYear()),
        "{{brandName}}": config.brand.name,
        "{{brandPhone}}": config.brand.phone,
        "{{brandEmail}}": config.brand.email,
        "{{brandWebsite}}": config.brand.website,
        "{{customerEmail}}": encode(customerEmail),
    };

    const subject = replaceVariables(adminNotification.subject, vars);
    const body = replaceVariables(adminNotification.bodyHtml, vars);

    const orderTable = buildOrderTable(
        [
            ["Mã đơn hàng", encode(orderId)],
            ["Khách hàng", encode(customerName)],
            ["Email", encode(customerEmail)],
            ["Gói Pro", `${duration} tháng`],
        ],
        ["Tổng cộng", formattedAmount],
    );

    const html = buildEmailHtml(
        config,
        replaceVariables(adminNotification.headerTitle, vars),
        body,
        vars,
        {
            orderTable,
            orderTableTitle: "Chi tiết đơn hàng",
        },
    );

    return sendEmail(adminEmailAddr, subject, html);
}

// ============================================================
// Expired Order Alert Email (for admin)
// ============================================================

/**
 * Gửi email cảnh báo admin khi có thanh toán cho đơn đã expired.
 * Admin cần vào trang quản lý để kiểm tra và xác nhận thủ công.
 *
 * @param orderId - Order ID
 * @param amount - Transfer amount
 * @param orderAmount - Original order amount
 * @param transactionDate - Transaction date from SePay
 */
export async function sendExpiredOrderPaymentAlert(
    orderId: string,
    amount: number,
    orderAmount: number,
    transactionDate: string,
): Promise<boolean> {
    const config = await getEmailConfig();
    const adminEmailAddr =
        process.env.ADMIN_EMAIL || config.brand.email || "admin@ieltspredictiontest.com";

    const formattedTransferAmount = `${amount.toLocaleString("vi-VN")} đ`;
    const formattedOrderAmount = `${orderAmount.toLocaleString("vi-VN")} đ`;
    const adminUrl = `${config.brand.website}/admin/settings`;

    const vars: Record<string, string> = {
        "{{orderId}}": encode(orderId),
        "{{currentYear}}": String(new Date().getFullYear()),
        "{{brandName}}": config.brand.name,
        "{{brandPhone}}": config.brand.phone,
        "{{brandEmail}}": config.brand.email,
        "{{brandWebsite}}": config.brand.website,
    };

    const bodyHtml =
        `<strong>⚠️ Cảnh báo:</strong> Hệ thống nhận được chuyển khoản cho một đơn hàng đã <strong>hết hạn</strong>.\n\n` +
        `Đơn hàng đã bị expire do quá thời gian thanh toán (60 phút), nhưng khách hàng vẫn thực hiện chuyển khoản.\n\n` +
        `Vui lòng vào trang quản lý để kiểm tra và xử lý thủ công.`;

    const orderTable = buildOrderTable(
        [
            ["Mã đơn hàng", encode(orderId)],
            ["Số tiền chuyển khoản", formattedTransferAmount],
            ["Số tiền đơn hàng", formattedOrderAmount],
            ["Ngày giao dịch", transactionDate],
            ["Trạng thái đơn", "❌ Đã hết hạn (expired)"],
        ],
    );

    const html = buildEmailHtml(
        config,
        "⚠️ Thanh toán cho đơn hàng đã hết hạn",
        bodyHtml,
        vars,
        {
            orderTable,
            orderTableTitle: "Chi tiết giao dịch",
            ctaButton: {
                text: "Vào trang quản lý",
                link: adminUrl,
            },
        },
    );

    return sendEmail(
        adminEmailAddr,
        `[CẢNH BÁO] Thanh toán cho đơn đã expired — ${orderId}`,
        html,
    );
}

// ============================================================
// Exports for CMS Preview
// ============================================================

export { DEFAULT_CONFIG as EMAIL_DEFAULT_CONFIG, getEmailConfig, replaceVariables, buildEmailHtml, buildOrderTable };
