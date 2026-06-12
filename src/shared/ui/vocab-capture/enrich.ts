/**
 * Client helper for POST /api/vocabulary/enrich — server-side dictionary lookup.
 * Always resolves (never throws); returns null when the word can't be enriched
 * so callers degrade to manual entry.
 */

/** Auto-looked-up word data returned by the enrich endpoint. */
export type WordEnrichment = {
  meaning: string;
  example: string | null;
  ipa: string | null;
  audioUrl: string | null;
};

export async function fetchEnrichment(
  word: string
): Promise<WordEnrichment | null> {
  try {
    const res = await fetch("/api/vocabulary/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      success: boolean;
      enrichment?: WordEnrichment | null;
    };
    return json.enrichment ?? null;
  } catch {
    return null;
  }
}
