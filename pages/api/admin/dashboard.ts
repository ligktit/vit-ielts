import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "~supabase/admin";
import { requireAdmin } from "~lib/admin-auth";
import { isFullAdmin } from "~lib/parseRoles";

type DailyPoint = { date: string; value: number };
type SkillPoint = { skill: string; value: number };

type ResponseData = {
    success: boolean;
    data?: {
        totalUsers: number;
        proUsers: number;
        todayUsers: number;
        totalTestsTaken: number;
        monthlyRevenue: number;
        recentOrders: unknown[];
        topQuizzes: unknown[];
        chartNewUsers: DailyPoint[];
        chartRevenue: DailyPoint[];
        chartSkills: SkillPoint[];
    };
    error?: string;
};

// Helper: generate array of last N dates as YYYY-MM-DD
function getLast30Days(): string[] {
    const dates: string[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, error: "Method not allowed" });
    }

    try {
        // Admin auth check
        const user = await requireAdmin(req, res);
        if (!user) return;
        const { data: profile } = await supabaseAdmin
            .from("users")
            .select("roles")
            .eq("id", user.id)
            .maybeSingle();
        const fullAdmin = isFullAdmin(profile?.roles);
        // Today start (UTC)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayISO = todayStart.toISOString();

        // Current month start
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthISO = monthStart.toISOString();

        // 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        const thirtyDaysISO = thirtyDaysAgo.toISOString();

        // Concurrent queries for dashboard stats
        const [
            totalUsersRes,
            proUsersRes,
            todayUsersRes,
            totalTestsRes,
            revenueRes,
            recentOrdersRes,
            topQuizzesRes,
            // Chart data queries
            newUsersChartRes,
            revenueChartRes,
            skillChartRes,
        ] = await Promise.all([
            // Total users
            supabaseAdmin
                .from("users")
                .select("id", { count: "exact", head: true }),

            // Pro users
            supabaseAdmin
                .from("users")
                .select("id", { count: "exact", head: true })
                .eq("is_pro", true),

            // Today new users
            supabaseAdmin
                .from("users")
                .select("id", { count: "exact", head: true })
                .gte("created_at", todayISO),

            // Total tests taken (sum of tests_taken across all quizzes)
            supabaseAdmin
                .from("quizzes")
                .select("tests_taken"),

            // Monthly revenue (completed orders this month)
            supabaseAdmin
                .from("orders")
                .select("amount")
                .eq("status", "completed")
                .gte("created_at", monthISO),

            // Recent orders (last 5)
            supabaseAdmin
                .from("orders")
                .select("order_id, user_id, package_type, amount, status, created_at")
                .order("created_at", { ascending: false })
                .limit(5),

            // Top 10 quizzes by tests_taken
            supabaseAdmin
                .from("quizzes")
                .select("id, title, slug, skill, type, tests_taken, status")
                .order("tests_taken", { ascending: false })
                .limit(10),

            // ═══ CHART: New users per day (last 30 days) ═══
            // PostgREST defaults to 1000 rows. With a recent traffic spike
            // (~360 signups in one day) the 30-day window easily blows past
            // that and the oldest 1000 rows win — newest days get dropped
            // and the chart falsely shows 0 for the last few days. Set an
            // explicit range so we get every row in the window.
            supabaseAdmin
                .from("users")
                .select("created_at")
                .gte("created_at", thirtyDaysISO)
                .order("created_at", { ascending: false })
                .range(0, 49999),

            // ═══ CHART: Revenue per day (last 30 days, completed orders) ═══
            supabaseAdmin
                .from("orders")
                .select("amount, created_at")
                .eq("status", "completed")
                .gte("created_at", thirtyDaysISO)
                .order("created_at", { ascending: false })
                .range(0, 49999),

            // ═══ CHART: Tests by skill ═══
            supabaseAdmin
                .from("quizzes")
                .select("skill, tests_taken")
                .gt("tests_taken", 0)
                .range(0, 49999),
        ]);

        // Calculate total tests taken
        const totalTestsTaken = totalTestsRes.data
            ? totalTestsRes.data.reduce((sum: number, q: { tests_taken: number }) => sum + (q.tests_taken || 0), 0)
            : 0;

        // Calculate monthly revenue
        const monthlyRevenue = revenueRes.data
            ? revenueRes.data.reduce((sum: number, o: { amount: number }) => sum + (o.amount || 0), 0)
            : 0;

        // Enrich recent orders with user emails
        const recentOrders = recentOrdersRes.data ?? [];
        const enrichedOrders = await Promise.all(
            recentOrders.map(async (order: Record<string, unknown>) => {
                if (order.user_id) {
                    const { data: userData } = await supabaseAdmin
                        .from("users")
                        .select("email, name")
                        .eq("id", order.user_id as string)
                        .maybeSingle();
                    return { ...order, user_email: userData?.email ?? null, user_name: userData?.name ?? null };
                }
                return { ...order, user_email: null, user_name: null };
            })
        );

        // ═══ Process chart data ═══

        // 1. New users per day
        const last30 = getLast30Days();
        const usersByDay: Record<string, number> = {};
        last30.forEach(d => { usersByDay[d] = 0; });
        (newUsersChartRes.data ?? []).forEach((u: { created_at: string }) => {
            const day = u.created_at.slice(0, 10);
            if (usersByDay[day] !== undefined) usersByDay[day]++;
        });
        const chartNewUsers: DailyPoint[] = last30.map(d => ({
            date: d,
            value: usersByDay[d] || 0,
        }));

        // 2. Revenue per day
        const revenueByDay: Record<string, number> = {};
        last30.forEach(d => { revenueByDay[d] = 0; });
        (revenueChartRes.data ?? []).forEach((o: { amount: number; created_at: string }) => {
            const day = o.created_at.slice(0, 10);
            if (revenueByDay[day] !== undefined) revenueByDay[day] += (o.amount || 0);
        });
        const chartRevenue: DailyPoint[] = last30.map(d => ({
            date: d,
            value: revenueByDay[d] || 0,
        }));

        // 3. Tests by skill
        const skillMap: Record<string, number> = {};
        (skillChartRes.data ?? []).forEach((q: { skill: string; tests_taken: number }) => {
            skillMap[q.skill] = (skillMap[q.skill] || 0) + (q.tests_taken || 0);
        });
        const chartSkills: SkillPoint[] = Object.entries(skillMap).map(([skill, value]) => ({
            skill,
            value,
        }));

        return res.status(200).json({
            success: true,
            data: {
                totalUsers: totalUsersRes.count ?? 0,
                proUsers: proUsersRes.count ?? 0,
                todayUsers: todayUsersRes.count ?? 0,
                totalTestsTaken,
                monthlyRevenue: fullAdmin ? monthlyRevenue : 0,
                recentOrders: fullAdmin ? enrichedOrders : [],
                topQuizzes: topQuizzesRes.data ?? [],
                chartNewUsers,
                chartRevenue: fullAdmin ? chartRevenue : [],
                chartSkills,
            },
        });
    } catch (error) {
        console.error("[API /api/admin/dashboard]", error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Internal error",
        });
    }
}

