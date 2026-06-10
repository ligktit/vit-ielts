// Filter a full `supabase db dump --data-only` file down to content-only data
// for local development: keeps quiz/test content + CMS tables, drops all user
// accounts, auth state, and test history.
//
// Usage: node scripts/filter-local-data.mjs <input.sql> <output.sql>

import { createReadStream, createWriteStream } from "node:fs";
import { createInterface } from "node:readline";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("Usage: node scripts/filter-local-data.mjs <input.sql> <output.sql>");
  process.exit(1);
}

const KEEP = new Set([
  "public.cms_configs",
  "public.coupons",
  "public.media_library",
  "public.menus",
  "public.mock_test_collections",
  "public.mock_tests",
  "public.quizzes",
  "public.passages",
  "public.posts",
  "public.questions",
  "public.redirects",
  "public.sample_essays",
  "public.site_settings",
  "storage.buckets",
]);

const SECTION_RE = /^-- Data for Name: (.+); Type: TABLE DATA; Schema: (\w+);/;
const SEQ_RE = /^-- Name: .+; Type: SEQUENCE SET;/;

const out = createWriteStream(output);
const rl = createInterface({ input: createReadStream(input), crlfDelay: Infinity });

let keeping = true; // preamble
let inSection = false;
const counts = { kept: [], dropped: [] };

for await (const line of rl) {
  const m = line.match(SECTION_RE);
  if (m) {
    const name = `${m[2]}.${m[1]}`;
    keeping = KEEP.has(name);
    inSection = true;
    (keeping ? counts.kept : counts.dropped).push(name);
    if (keeping) out.write("--\n");
  } else if (SEQ_RE.test(line)) {
    keeping = false;
    inSection = true;
  } else if (!inSection || keeping) {
    // preamble or kept section
  }
  if (keeping) out.write(line + "\n");
}
out.end();
out.on("finish", () => {
  console.log("Kept sections:\n  " + counts.kept.join("\n  "));
  console.log("Dropped sections: " + counts.dropped.length);
});
