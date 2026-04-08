import type { NextApiRequest, NextApiResponse } from "next";
import { readConfig } from "~services/cms-config";
import { supabaseAdmin } from "~supabase/admin";
import type { SubscriptionBannerConfig } from "@/shared/types/admin-config";

/**
 * API route để đọc subscription banner config
 * Chỉ dùng trong getServerSideProps
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubscriptionBannerConfig | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const config = await readConfig<SubscriptionBannerConfig>(supabaseAdmin, "subscription/banner");
    if (!config || !config.title) {
      throw new Error("Invalid config structure");
    }
    return res.status(200).json(config);
  } catch {
    // Trả về config mặc định nếu file không tồn tại
    const defaultConfig: SubscriptionBannerConfig = {
      title: "Subscription",
    };
    return res.status(200).json(defaultConfig);
  }
}
