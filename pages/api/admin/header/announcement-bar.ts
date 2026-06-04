import type { NextApiRequest, NextApiResponse } from "next";
import { readConfig, writeConfigValidated } from "~services/cms-config";
import { supabaseAdmin } from "~supabase/admin";
import type { AnnouncementBarConfig } from "../../../../src/widgets/layouts/base/ui/header/types";
import { requireAdmin } from "~lib/admin-auth";

export type { AnnouncementBarConfig };

const SECTION = "header/announcement-bar";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET is public: the public header fetches this to render the bar.
  if (req.method === "GET") {
    try {
      const config = await readConfig<AnnouncementBarConfig>(supabaseAdmin, SECTION);
      return res.status(200).json(config);
    } catch (error) {
      return res.status(500).json({
        message: "Không đọc được config",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (req.method === "POST") {
    try {
      const user = await requireAdmin(req, res);
      if (!user) return;

      const body = req.body as AnnouncementBarConfig;
      await writeConfigValidated<AnnouncementBarConfig>(supabaseAdmin, SECTION, body);
      return res.status(200).json({ message: "Lưu config thành công" });
    } catch (error) {
      return res.status(500).json({
        message: "Không ghi được config",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
