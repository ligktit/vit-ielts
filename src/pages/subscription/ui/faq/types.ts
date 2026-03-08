export interface FAQConfig {
  badge: {
    text: string;
  };
  title: string;
  description: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
}

