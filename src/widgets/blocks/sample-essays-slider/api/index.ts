
export const GET_SAMPLE_ESSAYS = "";

export type GET_SAMPLE_ESSAY_VARIABLES = {
  skill?: "speaking" | "writing" | "reading" | "listening";
  orderby?: {
    field: string;
    order: string;
  }[];
  quarter?: string;
  questionType?: string;
  search?: string;
  year?: string;
  sampleSource?: string;
  part?: string;
  topic?: string;
  task?: string;
  passage?: string;
  offsetPagination?: {
    offset: number;
    size: number;
  };
};

export type SampleEssay = {
  id: string;
  slug: string;
  title: string;
  date: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
  sampleEssayFields: {
    quarter: [string, string];
    year: [string, string];
    sampleSource: [string, string];
  };
  speakingSampleEssayFields: {
    part: [string, string];
    questionType: [string, string];
  };
  writingSampleEssayFields: {
    topic: [string, string];
    task: [string, string];
  };
  postMeta: {
    views: number;
    proUserOnly: boolean;
  };
  hasAccess: boolean;
};

export type SampleEssayResponse = {
  sampleEssayType: {
    sampleEssays: {
      edges: {
        node: SampleEssay;
      }[];
      pageInfo: {
        offsetPagination: {
          total: number;
          hasMore: boolean;
          hasPrevious: boolean;
        };
      };
    };
  };
};