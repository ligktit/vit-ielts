import type { NextApiRequest, NextApiResponse } from "next";
import { readConfig, writeConfigValidated } from "~services/cms-config";
import { supabaseAdmin } from "~supabase/admin";
import { requireAdmin } from "~lib/admin-auth";
import { EMAIL_DEFAULT_CONFIG, getEmailConfig } from "~services/email";
import { logActivity, getClientIP } from "~services/activity-log";
import { ZodError } from "zod";

const SECTION_NAME = "email-template";

/**
 * Email Template Config API
 *
 * GET  /api/admin/email-template → Read config (returns default if not found)
 * POST /api/admin/email-template → Write config (admin only, validated)
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method === "GET") {
        try {
            const config = await getEmailConfig();
            return res.status(200).json(config);
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: "Failed to read email template config",
                details: error instanceof Error ? error.message : String(error),
            });
        }
    }

    if (req.method === "POST") {
        try {
            const user = await requireAdmin(req, res);
            if (!user) return;

            const body = req.body;
            if (!body || typeof body !== "object") {
                return res
                    .status(400)
                    .json({ success: false, error: "Invalid request body" });
            }

            await writeConfigValidated(supabaseAdmin, SECTION_NAME, body);

            await logActivity(supabaseAdmin, {
                userId: user.id,
                userEmail: user.email ?? undefined,
                action: "update",
                entityType: "cms_config",
                entityId: SECTION_NAME,
                entityTitle: "CMS: Email Template",
                ipAddress: getClientIP(req),
            });

            return res.status(200).json({
                success: true,
                message: "Email template config saved successfully",
            });
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    error: "Validation failed",
                    details: error.issues,
                });
            }
            return res.status(500).json({
                success: false,
                error: "Failed to save email template config",
                details: error instanceof Error ? error.message : String(error),
            });
        }
    }

    return res.status(405).json({ success: false, error: "Method not allowed" });
}
