import type { NextApiRequest, NextApiResponse } from "next";
import { readConfig } from "~services/cms-config";
import { supabaseAdmin } from "~supabase/admin";
import type { PracticeLibraryBannerConfig } from "@/shared/types/admin-config";

/**
 * API route để đọc practice library banner config
 * Chỉ dùng trong getServerSideProps
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PracticeLibraryBannerConfig | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const config = await readConfig<PracticeLibraryBannerConfig>(supabaseAdmin, "ielts-practice-library/banner");
    // Validate config có đầy đủ properties
    if (!config || !config.listening || !config.reading) {
      throw new Error("Invalid config structure");
    }
    return res.status(200).json(config);
  } catch {
    // Trả về config mặc định nếu file không tồn tại
    const defaultConfig: PracticeLibraryBannerConfig = {
      listening: {
        title: "IELTS Listening Practice Tests",
      },
      reading: {
        title: "IELTS Reading Practice Tests",
      },
    };
    return res.status(200).json(defaultConfig);
  }
}
