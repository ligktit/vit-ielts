/**
 * Backfill question_form on both questions and quizzes tables.
 *
 * Root cause analysis:
 *   - WordPress ACF stored question_form as '["uncategorized","Uncategorized"]' for 97% of questions
 *   - The real structural info is in question.type (radio|fillup|matching|matrix|checkbox|select)
 *     + matching_question.layout_type (standard|summary|heading)
 *   - The migration script faithfully copied the useless "uncategorized" tags
 *
 * This script:
 *   1. Reads every question with its type + matching layout
 *   2. Maps (type, layout) → canonical question_form slug (aligned with customer filter labels)
 *   3. Updates each question's question_form
 *   4. Aggregates per quiz → updates quizzes.question_form (comma-separated unique forms)
 *
 * Mapping table (type → IELTS question form):
 *
 *   LISTENING:
 *     fillup                          → fill-in-the-blank   (Gap Filling)
 *     matching (standard)             → matching             (Matching Features / Information)
 *     matching (summary)              → matching             (Matching Features / Information)
 *     matching (heading)              → matching             (Matching Features / Information)
 *     matrix                          → classification       (treated as "Other" in filter)
 *     radio                           → multiple-choice      (Multiple Choice - One Answer)
 *     checkbox                        → multiple-select      (Multiple Choice - Many Answers)
 *     select                          → dropdown             (Gap Filling variant)
 *
 *   READING:
 *     fillup                          → fill-in-the-blank   (Gap Filling / Summary Completion)
 *     matching (standard)             → matching             (Matching Features / Information / Endings)
 *     matching (summary)              → summary-completion   (Summary Completion)
 *     matching (heading)              → heading-match        (Matching Headings)
 *     matrix                          → classification       (treated as "Other" in filter)
 *     radio                           → multiple-choice      (Multiple Choice - One Answer)
 *     checkbox                        → multiple-select      (Multiple Choice - Many Answers)
 *     select                          → dropdown             (fill variant)
 *
 * Usage:
 *   node scripts/backfill-question-form.js          (dry run)
 *   node scripts/backfill-question-form.js --commit (actually write to DB)
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const DRY_RUN = !process.argv.includes("--commit");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================================================
// Mapping: (question.type, matching layout, skill) → canonical question_form
// ============================================================================

function resolveQuestionForm(type, matchingQuestion, skill) {
  // For matching type, check layout sub-type
  if (type === "matching" && matchingQuestion) {
    const layout = matchingQuestion.layout_type || "standard";
    if (layout === "heading") return "heading-match";
    if (layout === "summary") return "summary-completion";
    return "matching"; // standard
  }

  switch (type) {
    case "fillup":
      return "fill-in-the-blank";
    case "radio":
      return "multiple-choice";
    case "checkbox":
      return "multiple-select";
    case "select":
      return "dropdown";
    case "matrix":
      return "classification";
    case "matching":
      return "matching";
    default:
      return "uncategorized";
  }
}

// ============================================================================
// Main
// ============================================================================

(async () => {
  console.log(DRY_RUN ? "🔍 DRY RUN MODE (use --commit to write)" : "🚀 COMMIT MODE");

  // 1. Fetch all questions with type, current question_form, matching_question, and quiz skill
  const { data: questions, error } = await supabase
    .from("questions")
    .select("id, type, question_form, matching_question, passages!inner(quiz_id, quizzes!inner(id, skill))")
    .limit(10000);

  if (error) {
    console.error("Failed to fetch questions:", error);
    return;
  }

  console.log(`Total questions: ${questions.length}`);

  // 2. Compute new question_form for each question
  const updates = [];
  const quizForms = {}; // quiz_id → Set of forms

  for (const q of questions) {
    const skill = q.passages?.quizzes?.skill || "reading";
    const quizId = q.passages?.quizzes?.id;
    const newForm = resolveQuestionForm(q.type, q.matching_question, skill);

    // Track per-quiz
    if (quizId) {
      if (!quizForms[quizId]) quizForms[quizId] = { skill, forms: new Set() };
      quizForms[quizId].forms.add(newForm);
    }

    // Only update if different from current
    const currentForm = q.question_form || "";
    if (currentForm !== newForm) {
      updates.push({ id: q.id, newForm, oldForm: currentForm, type: q.type });
    }
  }

  // 3. Report
  console.log(`\nQuestions to update: ${updates.length} / ${questions.length}`);

  // Summary by old → new
  const transitions = {};
  for (const u of updates) {
    const key = `${u.oldForm || "NULL"} → ${u.newForm}`;
    transitions[key] = (transitions[key] || 0) + 1;
  }
  console.log("\nTransitions:");
  for (const [key, count] of Object.entries(transitions).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${key}: ${count}`);
  }

  // Quiz-level summary
  const quizUpdates = [];
  for (const [quizId, info] of Object.entries(quizForms)) {
    const formStr = [...info.forms].sort().join(",");
    quizUpdates.push({ id: quizId, question_form: formStr, skill: info.skill });
  }
  console.log(`\nQuizzes to update: ${quizUpdates.length}`);

  // Show a few samples of quiz forms
  const bySkill = { reading: {}, listening: {} };
  for (const qu of quizUpdates) {
    bySkill[qu.skill][qu.question_form] = (bySkill[qu.skill][qu.question_form] || 0) + 1;
  }
  console.log("\nReading quiz form combos:");
  for (const [combo, count] of Object.entries(bySkill.reading).sort((a, b) => b[1] - a[1])) {
    console.log(`  [${count}x] ${combo}`);
  }
  console.log("\nListening quiz form combos:");
  for (const [combo, count] of Object.entries(bySkill.listening).sort((a, b) => b[1] - a[1])) {
    console.log(`  [${count}x] ${combo}`);
  }

  // 4. Write to DB if not dry run
  if (!DRY_RUN) {
    console.log("\n--- Writing to database ---");

    // Update questions in batches
    let qUpdated = 0;
    for (const u of updates) {
      const { error } = await supabase
        .from("questions")
        .update({ question_form: u.newForm })
        .eq("id", u.id);
      if (error) {
        console.error(`  ✗ Question ${u.id}: ${error.message}`);
      } else {
        qUpdated++;
      }
    }
    console.log(`  ✅ Questions updated: ${qUpdated}`);

    // Update quizzes
    let quizUpdated = 0;
    for (const qu of quizUpdates) {
      const { error } = await supabase
        .from("quizzes")
        .update({ question_form: qu.question_form })
        .eq("id", qu.id);
      if (error) {
        console.error(`  ✗ Quiz ${qu.id}: ${error.message}`);
      } else {
        quizUpdated++;
      }
    }
    console.log(`  ✅ Quizzes updated: ${quizUpdated}`);
  }

  console.log("\n✅ Done.");
})();
