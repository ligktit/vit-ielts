import { withMasterData, withMultipleWrapper } from "@/shared/hoc";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import type { HeroBannerConfig } from "./ui/hero-banner/types";
import type { TestPlatformIntroConfig } from "./ui/ielts-test-platform-intro/types";
import type { PracticeSectionConfig } from "@/shared/types/admin-config";
import { createServerSupabase } from "~supabase/server";
import { readConfig } from "~services/cms-config";

export { PageHome } from "./ui";

// Type definitions (giữ nguyên — UI components vẫn cần)
interface WhyChooseUsConfig {
  badge: { text: string };
  title: string;
  description: string;
  statistics: Array<{
    icon: string;
    value: string;
    label: string;
  }>;
}

interface TestimonialsConfig {
  title: string;
  description: string;
  button: { text: string; link: string };
  testimonials: Array<{
    name: string;
    title: string;
    company: string;
    quote: string;
    avatar: string;
  }>;
}

// Default configs
const DEFAULT_HERO_BANNER: HeroBannerConfig = {
  title: {
    line1: "Practice for the",
    line2: {
      prefix: "IELTS",
      highlighted: "Exam",
      suffix: "",
      underlined: "Here.",
    },
  },
  subtitle: "Luyện tập và thi thử IELTS Online trên máy tính miễn phí.",
  button: { text: "Start Practicing", link: "#" },
  backgroundGradient:
    "linear-gradient(180deg, #FFFDF7 0%, #FFF8E7 50%, #FFF3D6 100%)",
};

const DEFAULT_TESTIMONIALS: TestimonialsConfig = {
  title: "Testimonials",
  description: "Họ nói gì về chúng tôi?",
  button: { text: "Đăng ký ngay", link: "#" },
  testimonials: [],
};

/**
 * Home page — fetch ALL CMS configs in parallel via readConfig(),
 * replacing 5 separate internal-API-fetch wrapper functions (~300 lines).
 */
export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withMasterData,
  async (context: GetServerSidePropsContext) => {
    const supabase = createServerSupabase(context);

    // Parallel fetch of all 5 home page CMS sections
    const [heroBanner, testPlatformIntro, whyChooseUs, testimonials, practiceSection] =
      await Promise.all([
        readConfig<HeroBannerConfig>(supabase, "home/hero-banner").catch(() => null),
        readConfig<TestPlatformIntroConfig>(supabase, "home/test-platform-intro").catch(() => null),
        readConfig<WhyChooseUsConfig>(supabase, "home/why-choose-us").catch(() => null),
        readConfig<TestimonialsConfig>(supabase, "home/testimonials").catch(() => null),
        readConfig<PracticeSectionConfig>(supabase, "home/practice-section").catch(() => null),
      ]);

    return {
      props: {
        heroBannerConfig: heroBanner ?? DEFAULT_HERO_BANNER,
        testPlatformIntroConfig: testPlatformIntro ?? {},
        whyChooseUsConfig: whyChooseUs ?? {},
        testimonialsConfig: testimonials ?? DEFAULT_TESTIMONIALS,
        practiceSectionConfig: practiceSection ?? {},
      },
    };
  }
);
