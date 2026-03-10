import type { PassageData, QuestionData } from "./types";

export const QUESTION_TYPES = [
    { value: "radio", label: "Radio (Single Choice)" },
    { value: "select", label: "Select (Dropdown)" },
    { value: "fillup", label: "Fill Up (Gap Fill)" },
    { value: "checkbox", label: "Checkbox (Multiple)" },
    { value: "matching", label: "Matching" },
    { value: "matrix", label: "Matrix" },
];

export const MATCHING_LAYOUTS = [
    { value: "standard", label: "Standard" },
    { value: "summary", label: "Summary Completion" },
    { value: "heading", label: "Heading Match" },
];

export const DEFAULT_PASSAGE: PassageData = {
    title: "",
    content: "",
    sort_order: 0,
    questions: [],
};

export const DEFAULT_QUESTION: QuestionData = {
    type: "radio",
    title: "",
    question_text: "",
    sort_order: 0,
    list_of_questions: [],
};
