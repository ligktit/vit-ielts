import { IeltsTestPlatformIntro } from "./ielts-test-platform-intro";
import { HeroBanner } from "./hero-banner";
import { WhyChooseUs } from "./why-choose-us";
import { Testimonials } from "./testimonials";
import { PracticeSection } from "./practice-section";
import { MockCollectionSection } from "./mock-collection-section";
import { useAuth } from "@/appx/providers";
import { PracticeHistory, TargetScore } from "@/widgets";
import { ROUTES } from "@/shared/routes";
import type { HeroBannerConfig } from "./hero-banner/types";
import type { TestPlatformIntroConfig } from "./ielts-test-platform-intro/types";
import type { WhyChooseUsConfig } from "./why-choose-us/types";
import type { TestimonialsConfig } from "./testimonials/types";
import type { Quiz, SampleEssay, ExamCollectionResponse } from "~services/types/database";

interface PageHomeProps {
  heroBannerConfig?: HeroBannerConfig;
  testPlatformIntroConfig?: TestPlatformIntroConfig;
  whyChooseUsConfig?: WhyChooseUsConfig;
  testimonialsConfig?: TestimonialsConfig;
  examQuizzes: Quiz[];
  listeningQuizzes: Quiz[];
  readingQuizzes: Quiz[];
  writingSamples: SampleEssay[];
  speakingSamples: SampleEssay[];
  mockCollections: ExamCollectionResponse["data"];
}

export const PageHome = ({
  heroBannerConfig,
  testPlatformIntroConfig,
  whyChooseUsConfig,
  testimonialsConfig,
  examQuizzes,
  listeningQuizzes,
  readingQuizzes,
  writingSamples,
  speakingSamples,
  mockCollections,
}: PageHomeProps) => {
  const { isSignedIn } = useAuth();
  return (
    <>
      {/* === SECTION: Hero Banner === */}
      <HeroBanner config={heroBannerConfig} />
      {/* === SECTION: Platform Intro (Category Cards) === */}
      <IeltsTestPlatformIntro config={testPlatformIntroConfig} />

      {/* === SECTION: Target Score & Practice History (Only for signed in users) === */}
      {isSignedIn && (
        <div className="w-full py-10 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div>
              <TargetScore />
            </div>
            <section className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold text-[#2D3142] font-noto-sans">
                History
              </h3>
              <PracticeHistory />
            </section>
          </div>
        </div>
      )}

      {/* === SECTION: Practice Tests Carousel === */}
      <div data-section="practice-tests" className="w-full bg-white flex flex-col gap-8 pb-10 pt-4 px-4 sm:px-6">
        {/* Tạm ẩn section "IELTS Online Test" ở trang chủ — bật lại bằng cách
            uncomment khối PracticeSection bên dưới. */}
        {/* <PracticeSection
          title="IELTS Online Test"
          viewMoreLink={ROUTES.EXAM.ARCHIVE}
          items={examQuizzes}
          useExamModal={true}
        /> */}

        {/* === SECTION: Mock Collections (bộ đề thi thử) === */}
        <MockCollectionSection collections={mockCollections} />

        <PracticeSection
          title="IELTS Listening Practice"
          viewMoreLink={ROUTES.PRACTICE.ARCHIVE_LISTENING}
          items={listeningQuizzes}
        />
        <PracticeSection
          title="IELTS Reading Practice"
          viewMoreLink={ROUTES.PRACTICE.ARCHIVE_READING}
          items={readingQuizzes}
        />
        {/* === SECTION: Writing Sample Carousel === */}
        <PracticeSection
          title="IELTS Writing Sample"
          viewMoreLink={ROUTES.SAMPLE_ESSAY.ARCHIVE_WRITING}
          items={writingSamples as unknown as Quiz[]}
          getItemHref={(item) => ROUTES.SAMPLE_ESSAY.SINGLE(item.slug)}
          actionText="Xem thêm"
          hideAttempts={true}
        />
        {/* === SECTION: Speaking Sample Carousel === */}
        <PracticeSection
          title="IELTS Speaking Sample"
          viewMoreLink={ROUTES.SAMPLE_ESSAY.ARCHIVE_SPEAKING}
          items={speakingSamples as unknown as Quiz[]}
          getItemHref={(item) => ROUTES.SAMPLE_ESSAY.SINGLE(item.slug)}
          actionText="Xem thêm"
          hideAttempts={true}
        />
      </div>
      {/* === SECTION: Testimonials (Marquee) === */}
      <Testimonials config={testimonialsConfig} />
      {/* === SECTION: Why Choose Us (Statistics) === */}
      <WhyChooseUs config={whyChooseUsConfig} />
    </>
  );
};
