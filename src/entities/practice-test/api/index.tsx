
export const GET_PRACTICE_TESTS = "";

export type IPracticeTest = {
  id: string;
  title: string;
  slug: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
  quizFields: {
    testsTaken: number;
    type: ["academic" | "general" | "practice", string];
    skill: ["reading" | "listening", string];
    proUserOnly: boolean;
    passages: {
      questions: {
        __typename: string;
        explanations: object[];
      }[];
    }[];
    part: string;
    quarter: string;
    source: string;
    year: string;
  };
};

export type IPracticeTestResponses = {
  quizzes: {
    edges: {
      node: IPracticeTest;
    }[];
    pageInfo: {
      offsetPagination: {
        total: number;
      };
    };
  };
};

export const GET_TEST_RESULT = "";

export type ITestResult = {
  id: string;
  testResultFields: {
    answers: string;
  };
};

export type IPublishedResult = {
  id: string;
};

export type ITestResultResponses = {
  testResults: {
    nodes: ITestResult[];
  };
  publishedResults: {
    nodes: IPublishedResult[];
  };
};
