import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "~supabase/admin";
import { requireAdmin } from "../../../../lib/admin-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await requireAdmin(req, res);
    if (!user) return;

    if (req.method === "GET") {
        try {
            const { search, page = "1", pageSize = "20" } = req.query;
            const pageNum = parseInt(page as string, 10) || 1;
            const size = parseInt(pageSize as string, 10) || 20;
            const from = (pageNum - 1) * size;
            const to = from + size - 1;

            let query = supabaseAdmin
                .from("test_results")
                .select("id, user_id, quiz_id, score, status, test_time, submitted_at, created_at, users(email, name), quizzes(title, skill, type)", { count: "exact" });

            if (search && typeof search === "string") {
                // Search by user email or quiz title - need to filter after fetching
            }

            query = query.order("created_at", { ascending: false }).range(from, to);
            const { data, error, count } = await query;
            if (error) throw error;

            return res.status(200).json({ success: true, data: data ?? [], count: count ?? 0, page: pageNum, pageSize: size, totalPages: Math.ceil((count ?? 0) / size) });
        } catch (error) {
            return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal error" });
        }
    }

    if (req.method === "DELETE") {
        try {
            const { id } = req.query;
            if (!id || typeof id !== "string") return res.status(400).json({ success: false, error: "Missing id" });
            const { error } = await supabaseAdmin.from("test_results").delete().eq("id", id);
            if (error) throw error;
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal error" });
        }
    }

    return res.status(405).json({ success: false, error: "Method not allowed" });
}
