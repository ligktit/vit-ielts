import type { NextApiRequest, NextApiResponse } from "next";
import { readConfig } from "~services/cms-config";
import { supabaseAdmin } from "~supabase/admin";
import type { SampleEssayBannerConfig } from "@/shared/types/admin-config";

/**
 * API route để đọc sample essay banner config
 * Chỉ dùng trong getServerSideProps
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SampleEssayBannerConfig | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const config = await readConfig<SampleEssayBannerConfig>(supabaseAdmin, "sample-essay/banner");
    // Validate config có đầy đủ properties
    if (!config || !config.writing || !config.speaking) {
      throw new Error("Invalid config structure");
    }
    return res.status(200).json(config);
  } catch {
    // Trả về config mặc định nếu file không tồn tại
    const defaultConfig: SampleEssayBannerConfig = {
      writing: {
        title: "DOL IELTS Writing Task 1 Academic Sample",
        description: {
          line1: "Tổng hợp bài mẫu IELTS Exam Writing Task 1 và hướng dẫn cách làm bài,",
          line2: "từ vựng chi tiết theo chủ đề.",
        },
        backgroundColor: "linear-gradient(180deg, #FFF3F3 0%, #FFF8F0 100%)",
      },
      speaking: {
        title: "DOL IELTS Speaking Sample",
        description: {
          line1: "Tổng hợp bài mẫu IELTS Exam Speaking Task 1 và hướng dẫn cách làm bài,",
          line2: "từ vựng chi tiết theo chủ đề.",
        },
        backgroundColor: "linear-gradient(180deg, #FFF3F3 0%, #FFF8F0 100%)",
      },
    };
    return res.status(200).json(defaultConfig);
  }
}
