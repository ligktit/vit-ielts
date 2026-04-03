
import { useRef } from "react";
import { Container } from "@/shared/ui";
import { TestCard } from "@/shared/ui/ds/molecules/test-card/test-card";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import "@splidejs/react-splide/css/core";
import type { Splide as SplideType } from "@splidejs/splide";
import Link from "next/link";

const MOCK_ONLINE_TESTS = [
  { title: "IELTS Reading Vol 8 Test 1", attempts: 1195, score: "5.5", actionText: "Thử lại", isPro: true, image: "/assets/figma/icons/Background-1.png" },
  { title: "IELTS Reading Vol 8 Test 2", attempts: 1195, score: "7.5", actionText: "Kiểm Tra", isPro: false, image: "/assets/figma/icons/Background-2.png" },
  { title: "IELTS Reading Vol 8 Test 3", attempts: 1195, actionText: "Kiểm Tra", isPro: true, image: "/assets/figma/icons/Background-3.png" },
  { title: "IELTS Reading Vol 8 Test 4", attempts: 1195, actionText: "Kiểm Tra", isPro: false, image: "/assets/figma/icons/Background-4.png" },
  { title: "IELTS Reading Vol 8 Test 5", attempts: 231, actionText: "Kiểm Tra", isPro: true, image: "/assets/figma/icons/Background-5.png" },
];

export type PracticeSectionProps = {
  title?: string;
  viewMoreLink?: string;
  items?: any[];
};

export const PracticeSection = ({
  title = "IELTS Online Test",
  viewMoreLink = "#",
  items = MOCK_ONLINE_TESTS,
}: PracticeSectionProps) => {
  const splideRef = useRef<{ splide: SplideType } | null>(null);

  const handlePrev = () => splideRef.current?.splide?.go("<");
  const handleNext = () => splideRef.current?.splide?.go(">");

  return (
    <div data-section="practice-carousel" className="py-[60px] bg-white">
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

        {/* Carousel wrapper with external arrows */}
        <div className="relative -mx-4 sm:mx-0">
          {/* Prev arrow — external, fully outside Splide DOM */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous"
            className="hidden sm:flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-[-52px] z-10 w-10 h-10 rounded-full bg-[#d94a56] hover:bg-[#ea8d95] shadow-lg transition-colors"
          >
            <img
              src="/assets/figma/icons/Arrow1.svg"
              alt=""
              className="w-5 h-5 [filter:brightness(0)_invert(1)]"
              style={{ transform: "rotate(180deg)" }}
            />
          </button>

          {/* Next arrow — external, fully outside Splide DOM */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next"
            className="hidden sm:flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-[-52px] z-10 w-10 h-10 rounded-full bg-[#d94a56] hover:bg-[#ea8d95] shadow-lg transition-colors"
          >
            <img
              src="/assets/figma/icons/Arrow1.svg"
              alt=""
              className="w-5 h-5 [filter:brightness(0)_invert(1)]"
            />
          </button>

          <Splide
            ref={splideRef as any}
            hasTrack={false}
            options={{
              type: "slide",
              perPage: 4,
              perMove: 1,
              gap: "24px",
              pagination: false,
              arrows: false, // arrows handled externally via splideRef
              breakpoints: {
                1280: { perPage: 3 },
                1024: { perPage: 2 },
                640: { perPage: 1.2, gap: "16px", focus: "center" },
              },
            }}
          >
            <SplideTrack>
              {items.map((item, idx) => (
                <SplideSlide key={idx} className="pb-8 pt-2 px-1">
                  <TestCard
                    title={item.title}
                    attempts={item.attempts}
                    score={item.score}
                    actionText={item.actionText}
                    isPro={item.isPro}
                    image={item.image}
                    className="h-full"
                    href="#"
                  />
                </SplideSlide>
              ))}
            </SplideTrack>
          </Splide>
        </div>
      </Container>
    </div>
  );
};
