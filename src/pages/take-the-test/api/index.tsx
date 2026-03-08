import { IPracticeSingle } from "@/pages/ielts-practice-single/api"; // Tái sử dụng type chính

export const GET_PRACTICE_SINGLE = "";

export const SAVE_DRAFT = "";

export type IDraft = {
  clientMutationId: string;
};

export type IDraftResponse = {
  saveTestResult: IDraft;
};

export const TAKE_THE_TEST = "";

export type TakeTheTestResponse = {
  takeTheTest: {
    data: {
      id: string;
      quiz: number;
      test_part: string;
      test_time: string;
      test_mode: string;
    };
  };
};

export const GET_TEST_RESULT = "";

export type ITestResult = {
  testResultFields: {
    answers: string;
    testPart: string;
    timeLeft?: string;
    testTime: number;
    testMode: "practice" | "simulation";
  };
};

export type ITestResultResponse = {
  testResult: ITestResult;
};

export const SUBMIT_ANSWER = "";

export type ISubmitAnswerVariables = {
  input: {
    answers: string;
    dateSubmitted: number;
    testId: string;
    timeLeft: string;
  };
};