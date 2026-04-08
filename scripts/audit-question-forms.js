const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  // Count total questions
  const { count: totalCount } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true });
  console.log("Total questions in DB:", totalCount);

  // Count total quizzes by skill
  const { data: skillCounts } = await supabase
    .from("quizzes")
    .select("skill")
    .eq("status", "published");
  
  const sc = {};
  skillCounts?.forEach(q => { sc[q.skill] = (sc[q.skill] || 0) + 1; });
  console.log("Quizzes by skill:", sc);

  // Get a few sample Listening questions to see actual structure
  const { data: samples } = await supabase
    .from("questions")
    .select("id, type, question_form, title, instructions, passages!inner(quiz_id, quizzes!inner(skill, title))")
    .not("question_form", "is", null)
    .limit(20);

  console.log("\nSample questions with non-null question_form:");
  for (const s of samples || []) {
    console.log(`  [${s.passages?.quizzes?.skill}] type=${s.type} | form=${s.question_form} | title=${s.title} | quiz=${s.passages?.quizzes?.title}`);
  }

  // Find questions that were migrated from WP with legacy "[value,label]" format
  const { data: legacyFmt } = await supabase
    .from("questions")
    .select("id, question_form")
    .like("question_form", "[%")
    .limit(20);

  console.log("\nLegacy format questions (starts with '['):");
  for (const l of legacyFmt || []) {
    console.log(`  id=${l.id} form=${l.question_form}`);
  }

  // Check how many questions have the "uncategorized" value by skill
  // This is the real problem: most are uncategorized
  const { count: readUncategorized } = await supabase
    .from("questions")
    .select("*, passages!inner(quizzes!inner(skill))", { count: "exact", head: true })
    .eq("question_form", "uncategorized")
    .eq("passages.quizzes.skill", "reading");

  const { count: listenUncategorized } = await supabase
    .from("questions")
    .select("*, passages!inner(quizzes!inner(skill))", { count: "exact", head: true })
    .eq("question_form", "uncategorized")
    .eq("passages.quizzes.skill", "listening");

  const { count: readNull } = await supabase
    .from("questions")
    .select("*, passages!inner(quizzes!inner(skill))", { count: "exact", head: true })
    .is("question_form", null)
    .eq("passages.quizzes.skill", "reading");

  const { count: listenNull } = await supabase
    .from("questions")
    .select("*, passages!inner(quizzes!inner(skill))", { count: "exact", head: true })
    .is("question_form", null)
    .eq("passages.quizzes.skill", "listening");

  console.log("\n=== Uncategorized/NULL breakdown ===");
  console.log(`Reading: ${readUncategorized} uncategorized, ${readNull} NULL`);
  console.log(`Listening: ${listenUncategorized} uncategorized, ${listenNull} NULL`);
})();
