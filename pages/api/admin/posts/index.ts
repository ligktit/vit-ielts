import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "~supabase/admin";
import { requireAdmin } from "~lib/admin-auth";
import { logActivity, getClientIP } from "~services/activity-log";

// Editor pastes images as base64 data URLs which inflate the JSON body
// well past Next.js' 1MB default. Bump the limit so the save can complete.
export const config = {
    api: {
        bodyParser: { sizeLimit: "20mb" },
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await requireAdmin(req, res);
    if (!user) return;

    if (req.method === "GET") {
        try {
            const { search, status, page = "1", pageSize = "20" } = req.query;
            const pageNum = parseInt(page as string, 10) || 1;
            const size = parseInt(pageSize as string, 10) || 20;
            const from = (pageNum - 1) * size;
            const to = from + size - 1;

            // Slim listing select — see sample-essays for rationale. Admin's
            // post list table doesn't display `content`, so excluding the
            // HTML body cuts the response size dramatically.
            let query = supabaseAdmin
                .from("posts")
                .select(
                    "id, title, slug, excerpt, featured_image, status, pro_user_only, views, votes, categories, published_at, created_at",
                    { count: "exact" },
                );
            if (search && typeof search === "string") query = query.ilike("title", `%${search}%`);
            if (status && typeof status === "string") query = query.eq("status", status);
            query = query.order("created_at", { ascending: false }).range(from, to);

            const { data, error, count } = await query;
            if (error) throw error;
            return res.status(200).json({ success: true, data: data ?? [], count: count ?? 0, page: pageNum, pageSize: size, totalPages: Math.ceil((count ?? 0) / size) });
        } catch (error) {
            return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal error" });
        }
    }

    if (req.method === "POST") {
        try {
            const { title, slug, content, excerpt, featured_image, status, pro_user_only, categories, skill, tags, is_featured, seo, views, votes } = req.body;
            if (!title || !slug) return res.status(400).json({ success: false, error: "title and slug required" });

            const { data, error } = await supabaseAdmin.from("posts").insert({
                title, slug, content, excerpt, featured_image, status: status || "draft",
                pro_user_only: pro_user_only || false, categories: categories || [], seo: seo || {},
                skill: skill || null, tags: Array.isArray(tags) ? tags : [], is_featured: is_featured || false,
                views: typeof views === "number" ? views : 0, votes: Array.isArray(votes) ? votes : [], published_at: status === "published" ? new Date().toISOString() : null,
            }).select().single();
            if (error) throw error;

            // Fire-and-forget: don't make the user wait for activity logging
            // before getting their save confirmation.
            void logActivity(supabaseAdmin, {
                userId: user.id,
                userEmail: user.email ?? undefined,
                action: "create",
                entityType: "post",
                entityId: data?.id,
                entityTitle: title,
                ipAddress: getClientIP(req),
            }).catch(() => undefined);

            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal error" });
        }
    }
    return res.status(405).json({ success: false, error: "Method not allowed" });
}
