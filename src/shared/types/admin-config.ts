// Types cho admin config
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

export interface HeroBannerConfig {
  trustpilot: {
    image: string;
    rating: string;
  };
  headline: {
    line1: string;
    line2: string;
    line3: string;
    line4: string;
  };
  description: {
    text: string;
    highlightText: string;
  };
  buttons: {
    primary: {
      text: string;
      link: string;
    };
    secondary?: {
      text: string;
      link: string;
    };
  };
  backgroundImage: string;
  bannerImage: string;
  featureCards: Array<{
    icon: string;
    title?: string;
    value?: string;
    subtitle: string;
    avatars?: string[];
  }>;
  decorativeShape: {
    image: string;
  };
}

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

export interface FooterCtaBannerConfig {
  title: string;
  description: string;
  backgroundGradient: string;
  button: {
    text: string;
    link: string;
  };
}

export interface TestimonialsConfig {
  title: string;
  description: string;
  button: {
    text: string;
    link: string;
  };
  testimonials: Array<{
    name: string;
    title: string;
    company: string;
    quote: string;
    avatar: string;
  }>;
}

export interface PracticeLibraryBannerConfig {
  listening: {
    title: string;
    description: {
      line1: string;
      line2: string;
      line3: string;
    };
    backgroundColor: string;
    button: {
      text: string;
      link: string;
    };
  };
  reading: {
    title: string;
    description: {
      line1: string;
      line2: string;
      line3: string;
    };
    backgroundColor: string;
    button: {
      text: string;
      link: string;
    };
  };
}

export interface ExamLibraryHeroConfig {
  title: string;
  backgroundColor: string;
  breadcrumb: {
    homeLabel: string;
    currentLabel: string;
  };
}

export type SkillType = "listening" | "reading";

export interface CoursePackageItem {
  name: string;
  months: number;
  price: number;
  originalPrice?: number;
  popular?: boolean;
  featuredDeal?: boolean;
  dealNote?: string;
  samePriceAsMonths?: number;
}

export interface CoursePackagesConfig {
  currencySuffix: string;
  popularBadgeText: string;
  priceSuffix: string;
  monthText: {
    singular: string;
    plural: string;
  };
  accessText: string;
  dealNoteTemplate: string;
  features: {
    included: string[];
    excluded: string[];
  };
  skillLabels: {
    listening: string;
    reading: string;
  };
  combo: {
    title: string;
    ctaText: string;
    basePrice?: number; // Giá cơ bản cho tháng đầu tiên
    monthlyIncrementPrice?: number; // Giá tăng thêm mỗi tháng (mặc định 100000)
    plans: CoursePackageItem[];
  };
  single: {
    title: string;
    ctaText: string;
    basePrice?: number; // Giá cơ bản cho tháng đầu tiên
    monthlyIncrementPrice?: number; // Giá tăng thêm mỗi tháng (mặc định 100000)
    skills: SkillType[];
    plans: CoursePackageItem[];
  };
}

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

export interface TermsOfUseConfig {
  banner: {
    title: string;
    subtitle: string;
    backgroundImage: string;
  };
  heroImage: string;
  content: {
    introTitle: string;
    introParagraphs: string[];
    sections: Array<{
      title: string;
      content: string;
    }>;
  };
}

export interface PrivacyPolicyConfig {
  banner: {
    title: string;
    subtitle: string;
    backgroundImage: string;
  };
  heroImage: string;
  content: {
    introTitle: string;
    introParagraphs: string[];
    sections: Array<{
      title: string;
      content: string;
    }>;
  };
}

export interface PracticeSectionConfig {
  backgroundGradient: string;
}

export interface LoginPageConfig {
  backgroundColor: string;
}

export interface RegisterPageConfig {
  backgroundColor: string;
}

export interface SubscriptionBannerConfig {
  backgroundImage: string;
  subtitle: {
    text: string;
  };
  title: string;
  description: string;
}

// Re-export TopBarConfig từ header types
export type { TopBarConfig } from "@/widgets/layouts/base/ui/header/types";
