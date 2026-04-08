import { withMasterData, withMultipleWrapper } from "@/shared/hoc";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import type { HeroBannerConfig } from "./ui/hero-banner/types";
import type { TestPlatformIntroConfig } from "./ui/ielts-test-platform-intro/types";
import type { WhyChooseUsConfig } from "./ui/why-choose-us/types";
import type { TestimonialsConfig } from "./ui/testimonials/types";
import { createServerSupabase } from "~supabase/server";
import { readConfig } from "~services/cms-config";
import { getQuizzes } from "~services/quiz";
import { getSampleEssays } from "~services/sample-essay";
import type { SampleEssay } from "~services/types/database";
import type { Quiz } from "~services/types/database";

export { PageHome } from "./ui";

/**
 * Home page — fetch ALL CMS configs in parallel via readConfig(),
 * section_name uses "home/" prefix for all home sections.
 */
export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withMasterData,
  async (context: GetServerSidePropsContext) => {
    const supabase = createServerSupabase(context);

    const [
      heroBanner,
      testPlatformIntro,
      whyChooseUs,
      testimonials,
      examQuizzes,
      listeningQuizzes,
      readingQuizzes,
      writingSamples,
      speakingSamples,
    ] = await Promise.all([
      readConfig<HeroBannerConfig>(supabase, "home/hero-banner").catch(() => null),
      readConfig<TestPlatformIntroConfig>(supabase, "home/test-platform-intro").catch(() => null),
      readConfig<WhyChooseUsConfig>(supabase, "home/why-choose-us").catch(() => null),
      readConfig<TestimonialsConfig>(supabase, "home/testimonials").catch(() => null),
      getQuizzes(supabase, { type: "exam", pageSize: 8 }).catch(() => ({ data: [] as Quiz[] })),
      getQuizzes(supabase, { skill: "listening", type: "practice", pageSize: 8 }).catch(() => ({ data: [] as Quiz[] })),
      getQuizzes(supabase, { skill: "reading", type: "practice", pageSize: 8 }).catch(() => ({ data: [] as Quiz[] })),
      getSampleEssays(supabase, { skill: "writing", pageSize: 8 }).catch(() => ({ data: [] as SampleEssay[] })),
      getSampleEssays(supabase, { skill: "speaking", pageSize: 8 }).catch(() => ({ data: [] as SampleEssay[] })),
    ]);

    return {
      props: {
        heroBannerConfig: heroBanner ?? {},
        testPlatformIntroConfig: testPlatformIntro ?? {},
        whyChooseUsConfig: whyChooseUs ?? {},
        testimonialsConfig: testimonials ?? {},
        examQuizzes: examQuizzes.data,
        listeningQuizzes: listeningQuizzes.data,
        readingQuizzes: readingQuizzes.data,
        writingSamples: writingSamples.data,
        speakingSamples: speakingSamples.data,
      },
    };
  }
);
