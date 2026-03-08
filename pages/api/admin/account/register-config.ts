import type { NextApiRequest, NextApiResponse } from "next";
import { readConfig } from "~services/cms-config";
import { supabaseAdmin } from "~supabase/admin";
import type { RegisterPageConfig } from "@/shared/types/admin-config";

/**
 * API route để đọc register page config
 * Chỉ dùng trong getServerSideProps
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterPageConfig | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const config = await readConfig<RegisterPageConfig>(supabaseAdmin, "account/register");
    
    // Validate config có đầy đủ properties
    if (!config) {
      throw new Error("Config is null or undefined");
    }
    
    // Đảm bảo có backgroundColor, nếu không thì dùng default
    const validConfig: RegisterPageConfig = {
      backgroundColor: config.backgroundColor || "linear-gradient(rgb(255, 255, 255) 0%, rgb(239, 241, 255) 100%)",
    };
    
    return res.status(200).json(validConfig);
  } catch (error: any) {
    // Log error để debug
    console.error("Error reading register config:", error?.message || error);
    
    // Trả về config mặc định nếu có lỗi
    const defaultConfig: RegisterPageConfig = {
      backgroundColor: "linear-gradient(rgb(255, 255, 255) 0%, rgb(239, 241, 255) 100%)",
    };
    return res.status(200).json(defaultConfig);
  }
}

