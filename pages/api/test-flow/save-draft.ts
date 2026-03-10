import type { NextApiRequest, NextApiResponse } from "next";
import { createServerClient } from "@supabase/ssr";
import { saveTestResult } from "~services/test-flow";

type ResponseData = {
  success: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return Object.entries(req.cookies).map(([name, value]) => ({
              name,
              value: value || "",
            }));
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              res.setHeader(
                "Set-Cookie",
                `${name}=${value}; Path=/; ${options?.maxAge ? `Max-Age=${options.maxAge}` : ""}`
              );
            });
          },
        },
      }
    );

    const { testId, answers, timeLeft } = req.body;

    if (!testId || !answers) {
      return res.status(400).json({
        success: false,
        error: "testId and answers are required",
      });
    }

    const parsedAnswers = typeof answers === "string" ? JSON.parse(answers) : answers;

    await saveTestResult(
      supabase,
      testId,
      parsedAnswers,
      timeLeft || "00:00"
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("[API /api/test-flow/save-draft]", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const statusCode = errorMessage.includes("đăng nhập") ? 401
      : errorMessage.includes("PRO") ? 403
      : 500;
    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  }
}
