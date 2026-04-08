
import { useRef } from "react";
import { Container } from "@/shared/ui";
import { TestCardWithScore } from "@/entities/practice-test";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import "@splidejs/react-splide/css/core";
import type { Splide as SplideType } from "@splidejs/splide";
import Link from "next/link";
import type { Quiz } from "~services/types/database";
import { ROUTES } from "@/shared/routes";
import { normalizeSectionBadge } from "@/shared/lib/quiz-part";

export type PracticeSectionProps = {
  title?: string;
  viewMoreLink?: string;
  items?: Quiz[];
  getItemHref?: (item: any) => string;
};

export const PracticeSection = ({
  title = "IELTS Online Test",
  viewMoreLink = "#",
  items = [],
  getItemHref,
}: PracticeSectionProps) => {
  const splideRef = useRef<{ splide: SplideType } | null>(null);

  const handlePrev = () => splideRef.current?.splide?.go("<");
  const handleNext = () => splideRef.current?.splide?.go(">");

  if (items.length === 0) return null;

  return (
    <div data-section="practice-carousel" className="py-[48px] bg-white">
      <Container>
        {/* Header */}
        <div className="flex justify-between items-end mb-8 pl-1 pr-1">
          <h2 className="text-[28px] md:text-[32px] font-bold text-[#2D3142]">{title}</h2>
          <Link
            href={viewMoreLink}
            className="text-gray-900 font-bold text-[15px] hover:text-[#D94A56] flex items-center gap-1 transition-colors"
          >
            Xem thêm
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-current"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>

        {/* Carousel wrapper: [Prev] [Track] [Next] */}
        <div className="flex items-center gap-4 -mx-4 sm:mx-0">
          {/* Prev arrow */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous"
            className="hidden sm:flex shrink-0 items-center justify-center w-7 h-7 rounded-full bg-[#d94a56] hover:bg-[#ea8d95] shadow-lg transition-colors"
          >
            <img
              src="/assets/figma/icons/Arrow1.svg"
              alt=""
              className="w-3 h-3 [filter:brightness(0)_invert(1)]"
              style={{ transform: "rotate(180deg)" }}
            />
          </button>

          {/* Splide carousel — pt on each slide matches card lift distance (14px) */}
          <div className="flex-1 min-w-0">
            <Splide
              ref={splideRef as any}
              hasTrack={false}
              options={{
                type: "slide",
                perPage: 4,
                perMove: 1,
                gap: "24px",
                pagination: false,
                arrows: false,
                breakpoints: {
                  1280: { perPage: 3 },
                  1024: { perPage: 2 },
                  640: { perPage: 1.2, gap: "16px", focus: "center" },
                },
              }}
            >
              <SplideTrack>
                {items.map((quiz) => {
                  let partLabel = "Part 1";
                  if (quiz.type === 'exam') {
                    partLabel = "Trọn bộ";
                  } else {
                    const skillSource = Array.isArray(quiz.skill) ? quiz.skill[0] : quiz.skill;
                    const skillValue = typeof skillSource === 'string' ? skillSource.toLowerCase() : 'listening';
                    const rawPart = quiz.part || (quiz as any).task;
                    partLabel = normalizeSectionBadge(skillValue, rawPart).label;
                  }

                  return (
                    <SplideSlide key={quiz.id} className="pb-8 pt-[14px] px-1">
                      <TestCardWithScore
                        quizId={quiz.id}
                        title={quiz.title}
                        image={quiz.featured_image ?? undefined}
                        skill={quiz.skill as any}
                        part={partLabel}
                        attempts={quiz.tests_taken || (quiz as any).views || 0}
                        isPro={quiz.pro_user_only}
                        href={getItemHref ? getItemHref(quiz) : ROUTES.PRACTICE.SINGLE(quiz.slug)}
                      />
                    </SplideSlide>
                  );
                })}
              </SplideTrack>
            </Splide>
          </div>

          {/* Next arrow */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next"
            className="hidden sm:flex shrink-0 items-center justify-center w-7 h-7 rounded-full bg-[#d94a56] hover:bg-[#ea8d95] shadow-lg transition-colors"
          >
            <img
              src="/assets/figma/icons/Arrow1.svg"
              alt=""
              className="w-3 h-3 [filter:brightness(0)_invert(1)]"
            />
          </button>
        </div>
      </Container>
    </div>
  );
};
