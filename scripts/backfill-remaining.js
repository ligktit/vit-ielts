/**
 * Backfill remaining questions that still have legacy format.
 * Fetches questions with legacy JSON array format and updates them.
 */
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function resolveQuestionForm(type, matchingQuestion) {
  if (type === "matching" && matchingQuestion) {
    const layout = matchingQuestion.layout_type || "standard";
    if (layout === "heading") return "heading-match";
    if (layout === "summary") return "summary-completion";
    return "matching";
  }
  switch (type) {
    case "fillup": return "fill-in-the-blank";
    case "radio": return "multiple-choice";
    case "checkbox": return "multiple-select";
    case "select": return "dropdown";
    case "matrix": return "classification";
    case "matching": return "matching";
    default: return "uncategorized";
  }
}

(async () => {
  // Find questions that still have the legacy JSON array format
  const { data: legacy, error } = await supabase
    .from("questions")
    .select("id, type, question_form, matching_question, passages!inner(quiz_id, quizzes!inner(id))")
    .like("question_form", '[%')
    .limit(5000);

  if (error) { console.error(error); return; }
  console.log(`Found ${legacy.length} legacy-format questions to fix`);

  let updated = 0;
  const quizIds = new Set();
  for (const q of legacy) {
    const newForm = resolveQuestionForm(q.type, q.matching_question);
    const { error: ue } = await supabase
      .from("questions")
      .update({ question_form: newForm })
      .eq("id", q.id);
    if (ue) console.error(`  ✗ ${q.id}: ${ue.message}`);
    else { updated++; quizIds.add(q.passages?.quizzes?.id); }
  }
  console.log(`✅ Questions fixed: ${updated}`);

  // Re-aggregate quiz-level question_form for affected quizzes
  let quizUpdated = 0;
  for (const quizId of quizIds) {
    if (!quizId) continue;
    const { data: qs } = await supabase
      .from("questions")
      .select("question_form, passages!inner(quiz_id)")
      .eq("passages.quiz_id", quizId);

    const forms = new Set();
    for (const q of qs || []) {
      if (q.question_form && q.question_form !== "uncategorized") forms.add(q.question_form);
    }
    const formStr = [...forms].sort().join(",") || null;
    const { error: que } = await supabase
      .from("quizzes")
      .update({ question_form: formStr })
      .eq("id", quizId);
    if (que) console.error(`  ✗ Quiz ${quizId}: ${que.message}`);
    else quizUpdated++;
  }
  console.log(`✅ Quizzes re-aggregated: ${quizUpdated}`);

  // Final check
  const { count: remaining } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .like("question_form", '[%');
  console.log(`Remaining legacy-format questions: ${remaining}`);
})();
