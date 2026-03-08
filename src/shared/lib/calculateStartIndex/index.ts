// file: src/shared/lib/calculateStartIndex/index.ts
// Hàm tập trung để tính startIndex cho tất cả questions trong quiz
// Đảm bảo logic nhất quán với PageTakeTheTestWrapper và ExamProvider

import { countQuestion } from "../countQuestion";

/**
 * Tính startIndex cho tất cả questions trong quiz
 * Logic này PHẢI GIỐNG HỆT với PageTakeTheTestWrapper và ExamProvider
 */
export function calculateStartIndexForAllQuestions(quiz: any): Map<string, number> {
  const startIndexMap = new Map<string, number>();
  let currentIndex = 0;

  if (!quiz?.quizFields?.passages) {
    return startIndexMap;
  }

  quiz.quizFields.passages.forEach((passage: any, passageIndex: number) => {
    if (passage && passage.questions) {
      passage.questions.forEach((question: any, questionIndex: number) => {
        const questionType = question.type?.[0];
        let numberOfSubQuestions = 1;

        // Xử lý matching với layoutType = 'heading' - đếm gaps trong passage_content
        if (questionType === 'matching' && String(question.matchingQuestion?.layoutType).trim().toLowerCase() === 'heading') {
          let gapCount = 0;
          (passage.passage_content || "").replace(/\{(.*?)\}/g, () => { gapCount++; return ''; });
          numberOfSubQuestions = gapCount > 0 ? gapCount : 1;
        } else if (questionType === 'checkbox') {
          // @ts-ignore
          numberOfSubQuestions = Number(question.optionChoose) || 1;
        } else {
          // Dùng countQuestion cho các loại câu hỏi khác
          numberOfSubQuestions = countQuestion({ questions: [question] } as any);
        }

        if (isNaN(numberOfSubQuestions) || numberOfSubQuestions < 1) {
          numberOfSubQuestions = 1;
        }

        // Lưu startIndex vào map với key là question.id hoặc signature
        const key = question.id || `passage-${passageIndex}-question-${questionIndex}`;
        startIndexMap.set(key, currentIndex);

        // Cũng lưu với signature để lookup dễ dàng hơn
        if (question.title || question.question) {
          const signature = `${passageIndex}-${questionIndex}-${question.title || question.question?.substring(0, 50) || ''}`;
          startIndexMap.set(signature, currentIndex);
        }

        currentIndex += numberOfSubQuestions;
      });
    }
  });

  return startIndexMap;
}

/**
 * Tính startIndex cho một question cụ thể
 */
export function getQuestionStartIndex(
  question: any,
  passageIndex: number,
  questionIndex: number,
  allQuestionsStartIndexMap: Map<string, number>
): number {
  // Thử tìm bằng question.id
  if (question.id && allQuestionsStartIndexMap.has(question.id)) {
    return allQuestionsStartIndexMap.get(question.id) || 0;
  }

  // Thử tìm bằng signature
  const signature = `${passageIndex}-${questionIndex}-${question.title || question.question?.substring(0, 50) || ''}`;
  if (allQuestionsStartIndexMap.has(signature)) {
    return allQuestionsStartIndexMap.get(signature) || 0;
  }

  return 0;
}
