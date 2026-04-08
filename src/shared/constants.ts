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
    { value: "fill-in-the-blank", label: "Gap Filling" },
    { value: "matching", label: "Matching" },
    { value: "multiple-select", label: "Multiple Choice (Many Answers)" },
    { value: "multiple-choice", label: "Multiple Choice (One Answer)" },
    { value: "classification", label: "Classification" },
    { value: "dropdown", label: "Dropdown" },
] as const;

export const READING_QUESTION_FORMS = [
    { value: "fill-in-the-blank", label: "Gap Filling" },
    { value: "heading-match", label: "Matching Headings" },
    { value: "matching", label: "Matching" },
    { value: "multiple-select", label: "Multiple Choice (Many Answers)" },
    { value: "multiple-choice", label: "Multiple Choice (One Answer)" },
    { value: "summary-completion", label: "Summary Completion" },
    { value: "classification", label: "Classification" },
    { value: "dropdown", label: "Dropdown" },
] as const;