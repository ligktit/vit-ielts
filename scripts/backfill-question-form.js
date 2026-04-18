/**
 * Backfill question_form on both questions and quizzes tables.
 *
 * Maps old slugs → new canonical slugs matching the filter UI.
 *
 * New canonical slugs (LISTENING):
 *   gap_filling, map, diagram_label, matching_features,
 *   matching_information, multiple_choice_many, multiple_choice_single, other
 *
 * New canonical slugs (READING):
 *   gap_filling, matching_endings, matching_features, matching_headings,
 *   matching_information, multiple_choice_many, multiple_choice_single,
 *   summary_completion, true_false_not_given, yes_no_not_given, other
 *
 * Strategy:
 *   1. If question already has a specific question_form from admin templates,
 *      map it directly to the new slug.
 *   2. Otherwise, infer from (type, matching layout, skill).
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
// Direct mapping: old admin template question_form → new canonical slug
// These are values that were set via the QuestionTemplatePicker in admin UI.
// ============================================================================

const DIRECT_MAP = {
  // Admin template values (from constants.ts QUESTION_TEMPLATES)
  "summary_completion":              "summary_completion",
  "sentence_completion":             "gap_filling",
  "short_answer":                    "gap_filling",
  "table_completion":                "gap_filling",
  "multiple_choice":                 "multiple_choice_single",
  "true_false_not_given":            "true_false_not_given",
  "yes_no_not_given":                "yes_no_not_given",
  "list_selection":                  "multiple_choice_many",
  "matching_headings":               "matching_headings",
  "matching_name":                   "matching_features",
  "matching_paragraph_information":  "matching_information",
  "matching_sentence_endings":       "matching_endings",
  "choose_a_title":                  "other",
  "diagram_completion":              "gap_filling",
  "flow_chart_completion":           "gap_filling",

  // Old backfill script values (from previous run)
  "fill-in-the-blank":              "gap_filling",
  "heading-match":                  "matching_headings",
  "summary-completion":             "summary_completion",
  "multiple-choice":                "multiple_choice_single",
  "multiple-select":                "multiple_choice_many",
  "classification":                 "other",
  "dropdown":                       "gap_filling",
  "matching":                       "matching_features",

  // Already-new values (idempotent)
  "gap_filling":                    "gap_filling",
  "matching_features":              "matching_features",
  "matching_information":           "matching_information",
  "matching_endings":               "matching_endings",
  "multiple_choice_single":         "multiple_choice_single",
  "multiple_choice_many":           "multiple_choice_many",
  "map":                            "map",
  "diagram_label":                  "diagram_label",
  "other":                          "other",
};

// ============================================================================
// Fallback: infer from (type, matching layout) when question_form is missing
// ============================================================================

function resolveFromType(type, matchingQuestion) {
  if (type === "matching" && matchingQuestion) {
    const layout = (matchingQuestion.layoutType || matchingQuestion.layout_type || "standard").toLowerCase();
    if (layout === "heading") return "matching_headings";
    if (layout === "summary") return "summary_completion";
    return "matching_features"; // standard
  }

  switch (type) {
    case "fillup":    return "gap_filling";
    case "radio":     return "multiple_choice_single";
    case "checkbox":  return "multiple_choice_many";
    case "select":    return "gap_filling";
    case "matrix":    return "other";
    case "matching":  return "matching_features";
    default:          return "other";
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
  const quizForms = {}; // quiz_id → { skill, forms: Set }

  for (const q of questions) {
    const skill = q.passages?.quizzes?.skill || "reading";
    const quizId = q.passages?.quizzes?.id;
    const currentForm = (q.question_form || "").trim();

    // Try direct mapping first, then fallback to type-based inference
    let newForm;
    if (currentForm && DIRECT_MAP[currentForm]) {
      newForm = DIRECT_MAP[currentForm];
    } else {
      newForm = resolveFromType(q.type, q.matching_question);
    }

    // Track per-quiz
    if (quizId) {
      if (!quizForms[quizId]) quizForms[quizId] = { skill, forms: new Set() };
      quizForms[quizId].forms.add(newForm);
    }

    // Only update if different from current
    if (currentForm !== newForm) {
      updates.push({ id: q.id, newForm, oldForm: currentForm || "NULL", type: q.type });
    }
  }

  // 3. Report — Question-level
  console.log(`\nQuestions to update: ${updates.length} / ${questions.length}`);

  const transitions = {};
  for (const u of updates) {
    const key = `${u.oldForm} → ${u.newForm}`;
    transitions[key] = (transitions[key] || 0) + 1;
  }
  console.log("\nTransitions:");
  for (const [key, count] of Object.entries(transitions).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${key}: ${count}`);
  }

  // 4. Report — Quiz-level
  const quizUpdates = [];
  for (const [quizId, info] of Object.entries(quizForms)) {
    const formStr = [...info.forms].sort().join(",");
    quizUpdates.push({ id: quizId, question_form: formStr, skill: info.skill });
  }
  console.log(`\nQuizzes to update: ${quizUpdates.length}`);

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

  // 5. Write to DB if not dry run
  if (!DRY_RUN) {
    console.log("\n--- Writing to database ---");

    // Update questions
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
