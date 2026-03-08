import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "~supabase/admin";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        try {
            const { search, isPro, page = "1", pageSize = "20", sort, order } = req.query;
            const pageNum = parseInt(page as string, 10) || 1;
            const size = parseInt(pageSize as string, 10) || 20;
            const from = (pageNum - 1) * size;
            const to = from + size - 1;

            let query = supabaseAdmin
                .from("users")
                .select("id, email, name, avatar_url, is_pro, pro_expiration_date, roles, created_at", { count: "exact" });

            // Search by name or email
            if (search && typeof search === "string") {
                query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
            }

            // Filter by Pro status
            if (isPro === "true") {
                query = query.eq("is_pro", true);
            } else if (isPro === "false") {
                query = query.eq("is_pro", false);
            }

            // Sort
            const sortField = (sort as string) || "created_at";
            const sortOrder = (order as string) === "asc" ? true : false;
            query = query.order(sortField, { ascending: sortOrder });

            // Pagination
            query = query.range(from, to);

            const { data, error, count } = await query;

            if (error) throw error;

            return res.status(200).json({
                success: true,
                data: data ?? [],
                count: count ?? 0,
                page: pageNum,
                pageSize: size,
                totalPages: Math.ceil((count ?? 0) / size),
            });
        } catch (error) {
            console.error("[API /api/admin/users]", error);
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : "Internal error",
            });
        }
    }

    return res.status(405).json({ success: false, error: "Method not allowed" });
}
