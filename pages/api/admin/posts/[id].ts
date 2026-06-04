import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "~supabase/admin";
import { requireAdmin, requireFullAdmin } from "~lib/admin-auth";
import { logActivity, getClientIP } from "~services/activity-log";

// Editor pastes images as base64 data URLs which inflate the JSON body
// well past Next.js' 1MB default. Bump the limit so the update can complete.
export const config = {
    api: {
        bodyParser: { sizeLimit: "20mb" },
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await requireAdmin(req, res);
    if (!user) return;

    const { id } = req.query;
    if (!id || typeof id !== "string") return res.status(400).json({ success: false, error: "Missing ID" });

    if (req.method === "GET") {
        try {
            const { data, error } = await supabaseAdmin.from("posts").select("*").eq("id", id).single();
            if (error) throw error;
            return res.status(200).json({ success: true, data });
        } catch (error) {
            const pgErr = error as any;
            if (pgErr?.code === "PGRST116") {
                return res.status(404).json({ success: false, error: "Post not found" });
            }
            return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal error" });
        }
    }

    if (req.method === "PUT") {
        try {
            const { title, slug, content, excerpt, featured_image, status, pro_user_only, categories, skill, tags, is_featured, seo, views, votes } = req.body;
            const updateData: Record<string, unknown> = {};
            if (title !== undefined) updateData.title = title;
            if (slug !== undefined) updateData.slug = slug;
            if (content !== undefined) updateData.content = content;
            if (excerpt !== undefined) updateData.excerpt = excerpt;
            if (featured_image !== undefined) updateData.featured_image = featured_image;
            if (views !== undefined) updateData.views = views;
            if (votes !== undefined) updateData.votes = votes;
            if (status !== undefined) {
                updateData.status = status;
                if (status === "published") updateData.published_at = new Date().toISOString();
            }
            if (pro_user_only !== undefined) updateData.pro_user_only = pro_user_only;
            if (categories !== undefined) updateData.categories = categories;
            if (skill !== undefined) updateData.skill = skill || null;
            if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
            if (is_featured !== undefined) updateData.is_featured = is_featured;
            if (seo !== undefined) updateData.seo = seo;

            const { data, error } = await supabaseAdmin.from("posts").update(updateData).eq("id", id).select().single();
            if (error) throw error;

            // Fire-and-forget: don't make the user wait for activity logging.
            void logActivity(supabaseAdmin, {
                userId: user.id,
                userEmail: user.email ?? undefined,
                action: status === "published" ? "publish" : "update",
                entityType: "post",
                entityId: id,
                entityTitle: title || data?.title,
                ipAddress: getClientIP(req),
            }).catch(() => undefined);

            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal error" });
        }
    }

    if (req.method === "PATCH") {
        // Lightweight toggles — pro_user_only and/or status — without full body
        try {
            const { pro_user_only, status } = req.body;
            const updateData: Record<string, unknown> = {};
            if (typeof pro_user_only === "boolean") updateData.pro_user_only = pro_user_only;
            if (status === "published" || status === "draft") {
                updateData.status = status;
                if (status === "published") updateData.published_at = new Date().toISOString();
            }
            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ success: false, error: "Nothing to update (pro_user_only or status required)" });
            }
            const { data, error } = await supabaseAdmin
                .from("posts")
                .update(updateData)
                .eq("id", id)
                .select("id, pro_user_only, status")
                .single();
            if (error) throw error;

            await logActivity(supabaseAdmin, {
                userId: user.id,
                userEmail: user.email ?? undefined,
                action: status ? (status === "published" ? "publish" : "unpublish") : "update",
                entityType: "post",
                entityId: id,
                entityTitle: status ? `[status → ${status}]` : `[PRO toggle → ${pro_user_only}]`,
                ipAddress: getClientIP(req),
            });

            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal error" });
        }
    }

    if (req.method === "DELETE") {
        if (!await requireFullAdmin(req, res)) return;
        try {
            const { error } = await supabaseAdmin.from("posts").delete().eq("id", id);
            if (error) throw error;

            await logActivity(supabaseAdmin, {
                userId: user.id,
                userEmail: user.email ?? undefined,
                action: "delete",
                entityType: "post",
                entityId: id,
                ipAddress: getClientIP(req),
            });

            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal error" });
        }
    }
    return res.status(405).json({ success: false, error: "Method not allowed" });
}
