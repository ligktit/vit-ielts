/**
 * Question Form filter options per skill.
 *
 * These slugs MUST match the canonical values stored in
 * `quizzes.question_form` (comma-separated) and `questions.question_form`.
 *
 * Canonical slugs are populated by scripts/backfill-question-form.js
 * which maps question.type + matching layout → canonical slug:
 *
 *   fillup              → fill-in-the-blank
 *   radio               → multiple-choice
 *   checkbox            → multiple-select
 *   select              → dropdown
 *   matching (standard) → matching
 *   matching (summary)  → summary-completion
 *   matching (heading)  → heading-match
 *   matrix              → classification
 */
export const LISTENING_QUESTION_FORMS = [
    { value: "gap_filling", label: "Gap Filling" },
    { value: "map", label: "Map" },
    { value: "diagram_label", label: "Diagram Label" },
    { value: "matching_features", label: "Matching Features" },
    { value: "matching_information", label: "Matching Information" },
    { value: "multiple_choice_many", label: "Multiple Choice (Many Answers)" },
    { value: "multiple_choice_single", label: "Multiple Choice (Single Answer)" },
    { value: "other", label: "Other Types" },
] as const;

export const READING_QUESTION_FORMS = [
    { value: "gap_filling", label: "Gap Filling" },
    { value: "matching_endings", label: "Matching Endings" },
    { value: "matching_features", label: "Matching Features" },
    { value: "matching_headings", label: "Matching Headings" },
    { value: "matching_information", label: "Matching Information" },
    { value: "multiple_choice_many", label: "Multiple Choice (Many Answers)" },
    { value: "multiple_choice_single", label: "Multiple Choice (Single Answer)" },
    { value: "summary_completion", label: "Summary Completion" },
    { value: "true_false_not_given", label: "True - False - Not Given" },
    { value: "yes_no_not_given", label: "Yes - No - Not Given" },
    { value: "other", label: "Other Types" },
] as const;