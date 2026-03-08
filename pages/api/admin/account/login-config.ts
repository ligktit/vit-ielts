import type { NextApiRequest, NextApiResponse } from "next";
import { readConfig } from "~services/cms-config";
import { supabaseAdmin } from "~supabase/admin";
import type { LoginPageConfig } from "@/shared/types/admin-config";

/**
 * API route để đọc login page config
 * Chỉ dùng trong getServerSideProps
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginPageConfig | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const config = await readConfig<LoginPageConfig>(supabaseAdmin, "account/login");
    // Validate config có đầy đủ properties
    if (!config || !config.backgroundColor) {
      throw new Error("Invalid config structure");
    }
    return res.status(200).json(config);
  } catch (error) {
    // Trả về config mặc định nếu file không tồn tại
    const defaultConfig: LoginPageConfig = {
      backgroundColor: "linear-gradient(rgb(255, 255, 255) 0%, rgb(239, 241, 255) 100%)",
    };
    return res.status(200).json(defaultConfig);
  }
}

