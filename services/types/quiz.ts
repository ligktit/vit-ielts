/**
 * Quiz type definitions for the scoring engine.
 *
 * @origin WordPress ACF fields on quiz post type
 * @see LEGACY_CODEBASE_DOCS.md#3-quiz--test-system (Data Model)
 */

export type QuestionType = "radio" | "select" | "fillup" | "checkbox" | "matching" | "matrix";
export type MatchingLayoutType = "standard" | "summary" | "heading";

export type QuizQuestion = {
    id: string;
    type: QuestionType;
    title?: string;
    question_text?: string;
    instructions?: string;
    question_form?: string;
    sort_order: number;
    list_of_questions?: Array<{ question: string; correct: string; options: Array<{ option_text: string }> }>;
    list_of_options?: Array<{ option_text: string; correct: boolean }>;
    matching_question?: {
        layout_type: MatchingLayoutType;
        matching_items: Array<{ questionPart: string; correctAnswer: string }>;
        answer_options: Array<{ option_text: string }>;
        summary_text?: string;
    };
    matrix_question?: {
        matrix_categories: Array<{ category_letter: string; category_text: string }>;
        matrix_items: Array<{ item_text: string; correct_category_letter: string }>;
    };
    explanations?: Array<{ content: string }>;
};

export type QuizPassage = {
    id: string;
    title?: string;
    content?: string;
    sort_order: number;
    audio_start?: number;
    audio_end?: number;
    start_question_number?: number;
    questions: QuizQuestion[];
};

export type QuizWithPassages = {
    id: string;
    title: string;
    passages: QuizPassage[];
};
