export interface WhyChooseUsConfig {
  badge: {
    text: string;
  };
  title: string;
  description: string;
  statistics: Array<{
    icon: string;
    value: string;
    label: string;
  }>;
}

