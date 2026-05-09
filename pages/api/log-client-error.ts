import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Receives client-side errors caught by the app-level ErrorBoundary
 * and logs them to the server console (visible in Vercel runtime logs).
 *
 * Lightweight on purpose — no DB write, no auth — so a logging failure
 * never blocks the user-facing fallback UI.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ ok: false });
    }

    const { message, stack, componentStack, url, userAgent } = (req.body ?? {}) as {
        message?: string;
        stack?: string;
        componentStack?: string;
        url?: string;
        userAgent?: string;
    };

    console.error(
        "[client-error]",
        JSON.stringify(
            {
                message,
                url,
                userAgent,
                stack,
                componentStack,
                timestamp: new Date().toISOString(),
            },
            null,
            2,
        ),
    );

    return res.status(200).json({ ok: true });
}
