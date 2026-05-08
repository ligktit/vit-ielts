import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "~supabase/admin";
import { requireAdmin } from "~lib/admin-auth";
import { parseRoles, isFullAdmin } from "~lib/parseRoles";

/**
 * Returns the current admin's roles + capability flags.
 * Used by `useAdminPermissions` on /admin pages where masterData
 * isn't loaded (withAdmin returns empty props).
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, error: "Method not allowed" });
    }

    const user = await requireAdmin(req, res);
    if (!user) return;

    const { data: profile } = await supabaseAdmin
        .from("users")
        .select("roles")
        .eq("id", user.id)
        .maybeSingle();

    const roles = parseRoles(profile?.roles);
    const fullAdmin = isFullAdmin(roles);

    return res.status(200).json({
        success: true,
        roles,
        isFullAdmin: fullAdmin,
        canDelete: fullAdmin,
        canViewRevenue: fullAdmin,
        canConfigurePayments: fullAdmin,
    });
}
