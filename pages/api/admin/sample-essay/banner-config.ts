import type { NextApiRequest, NextApiResponse } from "next";
import { readConfig } from "~services/cms-config";
import { supabaseAdmin } from "~supabase/admin";
import type { SampleEssayBannerConfig } from "./banner";

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
        title: {
          line1: "DOL IELTS Writing",
          line2Highlighted: "Task 1 Academic",
          line2After: "Sample",
        },
        description: {
          line1:
            "Tổng hợp bài mẫu IELTS Exam Writing Task 1 và hướng dẫn cách làm bài,",
          line2: "từ vựng chi tiết theo chủ đề.",
        },
        backgroundColor: "linear-gradient(180deg, #FFF3F3 0%, #FFF8F0 100%)",
        button: {
          text: "Tìm hiểu khóa học",
          link: "#",
        },
      },
      speaking: {
        title: {
          line1: "DOL IELTS Speaking",
          line2Highlighted: "Task 1 Academic",
          line2After: "Sample",
        },
        description: {
          line1:
            "Tổng hợp bài mẫu IELTS Exam Speaking Task 1 và hướng dẫn cách làm bài,",
          line2: "từ vựng chi tiết theo chủ đề.",
        },
        backgroundColor: "linear-gradient(180deg, #FFF3F3 0%, #FFF8F0 100%)",
        button: {
          text: "Tìm hiểu khóa học",
          link: "#",
        },
      },
    };
    return res.status(200).json(defaultConfig);
  }
}
