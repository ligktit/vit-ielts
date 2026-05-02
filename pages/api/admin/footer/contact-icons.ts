import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "~supabase/admin";
import { requireAdmin } from "~lib/admin-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAdmin(req, res);
  if (!user) return;

  // Fetch current general_settings
  const { data, error: fetchError } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", "general_settings")
    .maybeSingle();

  if (fetchError) {
    return res.status(500).json({ error: fetchError.message });
  }

  let currentSettings = data?.value || {};
  if (typeof currentSettings === "string") {
    try {
      currentSettings = JSON.parse(currentSettings);
    } catch {
      currentSettings = {};
    }
  }

  if (req.method === "GET") {
    return res.status(200).json({
      facebook: currentSettings.facebook || "",
      zalo: currentSettings.zalo || "",
    });
  }

  if (req.method === "POST") {
    const { facebook, zalo } = req.body;
    const newSettings = { ...currentSettings, facebook, zalo };

    const { error: upsertError } = await supabaseAdmin
      .from("site_settings")
      .upsert(
        { key: "general_settings", value: newSettings },
        { onConflict: "key" }
      );

    if (upsertError) {
      return res.status(500).json({ error: upsertError.message });
    }

    return res.status(200).json({ success: true, data: { facebook, zalo } });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
