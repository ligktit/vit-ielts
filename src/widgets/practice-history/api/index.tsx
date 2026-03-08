import { IPracticeSingle } from "@/pages/ielts-practice-single/api";

export const GET_PRACTICE_HISTORY = "";

export type TestResult = {
  id: string;
  status: "publish" | "draft";
  testResultFields: {
    answers: string;
    dateSubmitted: string;
    dateTaken: string;
    quiz: {
      node: IPracticeSingle;
    };
    score: number;
    testTime: string;
    testPart: string;
    timeLeft: string;
  };
};

export type GetPracticeHistory = {
  testResults: {
    edges: {
      node: TestResult;
    }[];
    pageInfo: {
      offsetPagination: {
        hasMore: boolean;
        hasPrevious: boolean;
        total: number;
      };
    };
  };
};

export type GetPracticeHistoryVariables = {
  authorId: string;
  quizSkill: string;
  offset?: number;
  size?: number;
};
