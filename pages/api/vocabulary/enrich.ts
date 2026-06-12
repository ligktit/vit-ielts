/**
 * POST /api/vocabulary/enrich
 *
 * Looks a word up in the free Dictionary API (dictionaryapi.dev, no key) on the
 * server and returns meaning / example / IPA / audio so the "Add to Vocabulary"
 * modal can pre-fill the form. Best-effort: any miss or failure returns
 * `{ success: true, enrichment: null }` so the client falls back to manual entry.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { createApiSupabase } from "~supabase/server";
import type { WordEnrichment } from "@/shared/ui/vocab-capture/enrich";

const EnrichSchema = z.object({
  word: z.string().min(1).max(80).trim(),
});

type ResponseData = {
  success: boolean;
  enrichment?: WordEnrichment | null;
  error?: string;
};

// Minimal shape of the dictionaryapi.dev entry we consume.
type DictPhonetic = { text?: string; audio?: string };
type DictDefinition = { definition?: string; example?: string };
type DictMeaning = { definitions?: DictDefinition[] };
type DictEntry = {
  phonetic?: string;
  phonetics?: DictPhonetic[];
  meanings?: DictMeaning[];
};

function mapEntry(entries: DictEntry[]): WordEnrichment | null {
  const entry = entries[0];
  if (!entry) return null;

  // Meaning + example: first definition that has text; prefer one with an example.
  let meaning = "";
  let example: string | null = null;
  for (const m of entry.meanings ?? []) {
    for (const d of m.definitions ?? []) {
      if (!meaning && d.definition) meaning = d.definition;
      if (!example && d.example) example = d.example;
      if (meaning && example) break;
    }
    if (meaning && example) break;
  }
  if (!meaning) return null;

  // IPA: top-level phonetic, else first phonetics[].text.
  const ipa =
    entry.phonetic?.trim() ||
    entry.phonetics?.find((p) => p.text?.trim())?.text?.trim() ||
    null;

  // Audio: first phonetics[].audio that is a non-empty URL.
  const audioUrl =
    entry.phonetics?.find((p) => p.audio && p.audio.trim())?.audio?.trim() ||
    null;

  return { meaning, example, ipa, audioUrl };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const parsed = EnrichSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    });
  }

  // Require auth — this is a logged-in convenience endpoint.
  const supabase = createApiSupabase(req, res);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const { word } = parsed.data;

  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
      word.toLowerCase()
    )}`;
    const dictRes = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!dictRes.ok) {
      // 404 = word not found; treat as a clean "no enrichment".
      return res.status(200).json({ success: true, enrichment: null });
    }

    const data = (await dictRes.json()) as DictEntry[];
    const enrichment = Array.isArray(data) ? mapEntry(data) : null;
    return res.status(200).json({ success: true, enrichment });
  } catch (err) {
    console.error("[vocabulary/enrich] lookup failed:", err);
    // Degrade gracefully to manual entry.
    return res.status(200).json({ success: true, enrichment: null });
  }
}
