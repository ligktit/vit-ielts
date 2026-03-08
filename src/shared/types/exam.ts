// File: src/shared/types/exam.ts

import { IPracticeSingle } from "@/pages/ielts-practice-single/api";

// Di chuyển type này từ file context ra đây để phá vỡ vòng lặp
export type AnswerFormValues = {
    answers: (string | number[] | object)[];
};

// Type dùng chung cho một câu hỏi
export type IQuestion = IPracticeSingle["quizFields"]["passages"][number]["questions"][number] & {
    // Thêm trường matchingQuestion vào type để TypeScript không báo lỗi
    matchingQuestion?: {
        layoutType?: "standard" | "summary" | "heading" | "list" | string[];
        matchingItems?: { questionPart: string; correctAnswer: string }[];
        summaryText?: string;
        answerOptions?: { optionText: string }[];
    };
    matrixQuestion?: {
        matrixCategories: {
            categoryLetter: string;
            categoryText: string;
        }[];
        matrixItems: {
            itemText: string;
            correctCategoryLetter: string;
        }[];
        layoutType?: "standard" | "simple";
        legendTitle?: string;
    };
};