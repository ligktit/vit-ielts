export interface TestPlatformIntroConfig {
  badge: {
    text: string;
  };
  backgroundGradient: string;
  title: {
    line1: string;
    line2: string;
    line3: string;
    line4: string;
  };
  categories: Array<{
    name: string;
    href: string;
    icon: string;
  }>;
}
