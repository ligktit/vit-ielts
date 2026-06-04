import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "~supabase/admin";
import { createApiSupabase } from "~supabase/server";
import { getClientIP } from "~services/activity-log";

/**
 * Receives client-side errors caught by the app-level ErrorBoundary
 * (and explicit submit/save failures) and:
 *   1. Logs them to the server console (visible in Vercel runtime logs).
 *   2. Persists them to the `activity_logs` table so they survive past
 *      Vercel's short log-retention window — runtime logs are gone within
 *      minutes, which left us blind to a student crash reported 4 days later.
 *
 * Best-effort throughout: a logging failure must never block the user-facing
 * fallback UI, so we always return 200 and swallow errors.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ ok: false });
    }

    const { message, stack, componentStack, url, userAgent, testId, quizId } = (req.body ?? {}) as {
        message?: string;
        stack?: string;
        componentStack?: string;
        url?: string;
        userAgent?: string;
        testId?: string;
        quizId?: string;
    };

    const timestamp = new Date().toISOString();

    console.error(
        "[client-error]",
        JSON.stringify(
            { message, url, userAgent, testId, quizId, stack, componentStack, timestamp },
            null,
            2,
        ),
    );

    // Resolve the signed-in user (student) from the request cookies so the
    // log row is attributable. Never throw — fall back to an anonymous row.
    let userId: string | null = null;
    let userEmail: string | null = null;
    try {
        const supabase = createApiSupabase(req, res);
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
            userId = data.user.id;
            userEmail = data.user.email ?? null;
        }
    } catch {
        // ignore — anonymous error is still worth recording
    }

    try {
        await supabaseAdmin.from("activity_logs").insert({
            user_id: userId,
            user_email: userEmail,
            // Reuse the audit-trail table with a distinct action/entity so these
            // rows are easy to filter (action='client_error') without a migration.
            action: "client_error",
            entity_type: "client_error",
            entity_id: testId ?? quizId ?? null,
            // entity_title is the searchable summary; keep it short.
            entity_title: (message ?? "Unknown client error").slice(0, 250),
            metadata: {
                message: message ?? null,
                stack: stack ?? null,
                componentStack: componentStack ?? null,
                url: url ?? null,
                userAgent: userAgent ?? null,
                testId: testId ?? null,
                quizId: quizId ?? null,
            },
            ip_address: getClientIP(req),
        });
    } catch (err) {
        // Swallow — the table write must never break error reporting.
        console.error("[client-error] failed to persist to activity_logs", err);
    }

    return res.status(200).json({ ok: true });
}
