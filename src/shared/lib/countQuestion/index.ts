// file: src/shared/lib/countQuestion/index.ts

import { IPracticeSingle } from "@/pages/ielts-practice-single/api";
import { IQuestion } from "@/shared/types/exam";

const parseMaxOptionsFromText = (
    instructions: string | undefined | null
  ): number => {
    if (!instructions) return 1;
    const lowerText = instructions.toLowerCase();
    if (lowerText.includes("two") || lowerText.includes("2")) return 2;
    if (lowerText.includes("three") || lowerText.includes("3")) return 3;
    if (lowerText.includes("four") || lowerText.includes("4")) return 4;
    if (lowerText.includes("five") || lowerText.includes("5")) return 5;
    return 1;
};

// Hàm con để đếm số câu hỏi trong một object question DUY NHẤT
const countSubQuestions = (question: IQuestion, passageContent?: string): number => {
    if (!question) return 0;

    const questionType = question.type?.[0];

    // 1. Ưu tiên xử lý loại "matching" trước
    if (questionType === "matching" && question.matchingQuestion) {
        const layoutType = String(question.matchingQuestion.layoutType).trim().toLowerCase();

        // A. Nếu là dạng "summary", đếm số ô trống trong summaryText
        if (layoutType === 'summary') {
            const summaryText = question.matchingQuestion.summaryText || "";
            if (summaryText && /\{(.*?)\}/.test(summaryText)) {
                const gapCount = (summaryText.match(/\{(.*?)\}/g) || []).length;
                return gapCount > 0 ? gapCount : 1;
            }
        }

        // B. Nếu là dạng "standard" hoặc "list", đếm số item cần nối
        if ((layoutType === 'standard' || layoutType === 'list') && (question.matchingQuestion.matchingItems?.length ?? 0) > 0) {
            return question.matchingQuestion.matchingItems!.length;
        }

        // C. Nếu là dạng "heading", đếm số ô trống trong passageContent
        if (layoutType === 'heading') {
            const content = passageContent || "";
            const gapCount = (content.match(/\{(.*?)\}/g) || []).length;
            return gapCount > 0 ? gapCount : 1;
        }
    }

    // 2. Xử lý loại "matrix"
    if (questionType === "matrix" && question.matrixQuestion?.matrixItems) {
        return question.matrixQuestion.matrixItems.length;
    }

    // 3. Xử lý các dạng Fillup khác (không nằm trong matching)
    const textWithGaps = question.question || "";
    if (textWithGaps && /\{(.*?)\}/.test(textWithGaps)) {
        const gapCount = (textWithGaps.match(/\{(.*?)\}/g) || []).length;
        if (gapCount > 0) {
            return gapCount;
        }
    }

    // 4. Dạng có danh sách câu hỏi con
    if (question.list_of_questions && question.list_of_questions.length > 0) {
        return question.list_of_questions.length;
    }

    // 5. Dạng Checkbox
    if (questionType === "checkbox") {
        const listCorrectLen = question.list_of_options?.filter((o: any) => o.correct)?.length || 0;
        const parsedMaxOptions = parseMaxOptionsFromText(question.question || question.instructions);
        
        // Cùng chung logic tính số câu hỏi chuẩn của Checkbox:
        // Lấy listCorrectLen nếu > 0. NẾU KHÔNG lấy cái trong optionChoose hoặc nội dung > 1.
        const maxSelectableOptions = Number(question.optionChoose) || (parsedMaxOptions > 1 ? parsedMaxOptions : 0) || listCorrectLen || 1;
        const totalSubQuestions = listCorrectLen || maxSelectableOptions || 1;
        
        return totalSubQuestions;
    }

    // 6. Fallback dựa vào số lượng giải thích
    if (question.explanations && question.explanations.length > 1) {
        return question.explanations.length;
    }

    // 7. Mặc định là 1 câu hỏi
    return 1;
};

type Passage = IPracticeSingle['quizFields']['passages'][number];

// Hàm chính để export
// Hỗ trợ cả Passage và { questions: [...] } để tương thích với PageTakeTheTestWrapper
export function countQuestion(passage: Passage | { questions: IQuestion[] }): number {
    if (!passage) return 0;

    // Xử lý cả hai trường hợp: Passage hoặc { questions: [...] }
    const questions = 'questions' in passage ? passage.questions : (passage as Passage).questions;
    const passageContent = ('passage_content' in passage ? (passage as any).passage_content : undefined) || 
                           ('content' in passage ? (passage as any).content : undefined);

    if (!questions || questions.length === 0) {
        return 0;
    }
    return questions.reduce((total: number, q: any) => total + countSubQuestions(q, passageContent), 0);
}