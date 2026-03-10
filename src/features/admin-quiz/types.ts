export type QuizFormData = {
    title: string;
    slug: string;
    excerpt?: string;
    type: "practice" | "exam";
    skill: "reading" | "listening";
    time_minutes: number;
    pro_user_only: boolean;
    score_type?: string;
    featured_image?: string;
    audio_url?: string;
    pdf_url?: string;
    source?: string;
    year?: string;
    quarter?: string;
    part?: string;
    question_form?: string;
    status: "draft" | "published";
    passages: PassageData[];
};

export type PassageData = {
    id?: string;
    title?: string;
    content?: string;
    sort_order: number;
    audio_start?: number;
    audio_end?: number;
    questions: QuestionData[];
};

export type QuestionData = {
    id?: string;
    type: string;
    title?: string;
    question_text?: string;
    instructions?: string;
    question_form?: string;
    sort_order: number;
    list_of_questions?: { question: string; correct: string; options: { option_text: string }[] }[];
    list_of_options?: { option_text: string; correct: boolean }[];
    matching_question?: {
        layout_type: string;
        matching_items: { questionPart: string; correctAnswer: string }[];
        answer_options: { option_text: string }[];
        summary_text?: string;
    };
    matrix_question?: {
        matrix_categories: { category_letter: string; category_text: string }[];
        matrix_items: { item_text: string; correct_category_letter: string }[];
    };
    explanations?: { content: string }[];
};
