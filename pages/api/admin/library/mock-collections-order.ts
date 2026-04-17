import type { NextApiRequest, NextApiResponse } from "next";
import { readConfig, writeConfig } from "~services/cms-config";
import { supabaseAdmin } from "~supabase/admin";
import { requireAdmin } from "~lib/admin-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const sectionName = "library/mock-collections-order";

  if (req.method === "GET") {
    try {
      const config = await readConfig<{ collection_ids: string[] }>(supabaseAdmin, sectionName);
      return res.status(200).json(config ?? { collection_ids: [] });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Cannot read config" });
    }
  }

  if (req.method === "POST") {
    try {
      const user = await requireAdmin(req, res);
      if (!user) return;

      const body = req.body;
      await writeConfig<{ collection_ids: string[] }>(supabaseAdmin, sectionName, body);
      return res.status(200).json({ success: true, message: "Saved successfully" });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Cannot write config" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
