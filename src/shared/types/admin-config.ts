// ─── Re-export UI config types (single source of truth) ───────────────────────
export type { HeroBannerConfig } from "@/pages/home/ui/hero-banner/types";
export type { TestPlatformIntroConfig } from "@/pages/home/ui/ielts-test-platform-intro/types";
export type { WhyChooseUsConfig } from "@/pages/home/ui/why-choose-us/types";
export type { TestimonialsConfig, ReviewItem } from "@/pages/home/ui/testimonials/types";

// ─── Other config types (not yet refactored — keep as-is) ────────────────────

export interface FooterCtaBannerConfig {
  title: string;
  description: string;
  backgroundGradient: string;
  button: {
    text: string;
    link: string;
  };
}

export interface PracticeLibraryBannerConfig {
  listening: {
    title: string;
  };
  reading: {
    title: string;
  };
}

export interface ExamLibraryHeroConfig {
  title: string;
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
    basePrice?: number;
    monthlyIncrementPrice?: number;
    plans: CoursePackageItem[];
  };
  single: {
    title: string;
    ctaText: string;
    basePrice?: number;
    monthlyIncrementPrice?: number;
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

export interface ContactPageConfig {
  banner: {
    title: string;
    backgroundImage: string;
  };
  form: {
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    subjectLabel: string;
    subjectPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    buttonText: string;
    successMessage: string;
    errorMessage: string;
  };
  socialLinks: Array<{
    platform: "facebook" | "tiktok" | "youtube" | "zalo" | "instagram" | "other";
    label: string;
    username: string;
    url: string;
    iconUrl?: string; // Bổ sung field upload icon tuỳ chỉnh
  }>;
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

export interface DefaultContentImageConfig {
  defaultContentImage: string;
}

export interface SubscriptionBannerConfig {
  title: string;
}

export interface SampleEssayBannerConfig {
  writing: {
    title: string;
    description: {
      line1: string;
      line2: string;
    };
    backgroundColor: string;
  };
  speaking: {
    title: string;
    description: {
      line1: string;
      line2: string;
    };
    backgroundColor: string;
  };
}
