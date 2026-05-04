import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "~supabase/admin";
import { requireAdmin } from "~lib/admin-auth";

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
            const { search, status, skill, page = "1", pageSize = "20" } = req.query;
            const pageNum = parseInt(page as string, 10) || 1;
            const size = parseInt(pageSize as string, 10) || 20;
            const from = (pageNum - 1) * size;
            const to = from + size - 1;

            // Slim listing select — admin table only renders title/skill/part/
            // status/pro/views/created_at, so skipping the heavy `content`
            // (HTML, often with base64 images) cuts the response from MB to
            // KB and makes the list page snappy again.
            let query = supabaseAdmin
                .from("sample_essays")
                .select(
                    "id, title, slug, skill, part, question_type, quarter, year, source, topic, task, featured_image, status, pro_user_only, views, votes, published_at, created_at",
                    { count: "exact" },
                );
            if (search && typeof search === "string") query = query.ilike("title", `%${search}%`);
            if (status && typeof status === "string") query = query.eq("status", status);
            if (skill && typeof skill === "string") query = query.eq("skill", skill);
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
            const body = req.body;
            if (!body.title || !body.slug) return res.status(400).json({ success: false, error: "title and slug required" });

            const { data, error } = await supabaseAdmin.from("sample_essays").insert({
                title: body.title, slug: body.slug, content: body.content, excerpt: body.excerpt,
                skill: body.skill, part: body.part, question_type: body.question_type,
                quarter: body.quarter, year: body.year, source: body.source,
                topic: body.topic, task: body.task, passage: body.passage,
                featured_image: body.featured_image, status: body.status || "draft",
                pro_user_only: body.pro_user_only || false, views: typeof body.views === "number" ? body.views : 0, votes: Array.isArray(body.votes) ? body.votes : [], seo: body.seo || {},
                published_at: body.status === "published" ? new Date().toISOString() : null,
            }).select().single();
            if (error) throw error;
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal error" });
        }
    }
    return res.status(405).json({ success: false, error: "Method not allowed" });
}
