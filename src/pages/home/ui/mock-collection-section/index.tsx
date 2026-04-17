import { useMemo } from "react";
import { ExamCollection } from "@/pages/ielts-exam-library/ui/exam-collection";
import { Container } from "@/shared/ui";
import { ScrollFadeIn } from "@/shared/lib/use-scroll-fade-in";
import Link from "next/link";
import { ROUTES } from "@/shared/routes";
import type { ExamCollectionResponse } from "~services/types/database";

type MockCollectionSectionProps = {
  collections: ExamCollectionResponse["data"];
};

const HOME_SLIDER_OPTIONS = {
  perPage: 4,
  breakpoints: {
    1280: { perPage: 3 },
    1024: { perPage: 2, gap: "20px" },
    768: { perPage: 2, gap: "16px" },
    480: { perPage: 1, gap: "16px" },
  },
};

/**
 * Homepage section hiển thị Mock Test Collections bên dưới "IELTS Online Test".
 * Tái sử dụng ExamCollection + ExamItem từ ielts-exam-library để đảm bảo
 * behavior (modal, login gate, PRO badge, score) đồng nhất.
 *
 * Mỗi row tự hiển thị tên bộ đề (data.title) — không có heading section cố định.
 * Reading + Listening được merge theo collection ID.
 */
export const MockCollectionSection = ({ collections }: MockCollectionSectionProps) => {
  // Merge reading + listening theo collection ID (giống Exam Library page)
  const mergedCollections = useMemo(() => {
    const map = new Map<string, any>();

    (collections.reading || []).forEach((col) => {
      map.set(col.id, {
        ...col,
        exams: col.exams.map((e) => ({ ...e, skill: "reading" })),
      });
    });

    (collections.listening || []).forEach((col) => {
      const mappedExams = col.exams.map((e) => ({ ...e, skill: "listening" }));
      if (map.has(col.id)) {
        map.get(col.id).exams.push(...mappedExams);
      } else {
        map.set(col.id, { ...col, exams: mappedExams });
      }
    });

    return Array.from(map.values());
  }, [collections]);

  if (mergedCollections.length === 0) return null;

  return (
    <ScrollFadeIn data-section="mock-collections" className="bg-white">
      <Container>
        {/* === SECTION: Mock Collections List === */}
        {/* Mỗi ExamCollection tự render tên bộ đề (data.title) */}
        <div className="space-y-12">
          {mergedCollections.map((col) => (
            <ExamCollection
              key={col.id}
              data={col}
              optionsOverride={HOME_SLIDER_OPTIONS}
            />
          ))}
        </div>

        {/* Link xem thêm */}
        <div className="mt-10 flex justify-center">
          <Link
            href={ROUTES.EXAM.ARCHIVE}
            className="inline-flex items-center gap-2 font-bold text-[15px] text-gray-900 hover:text-[#D94A56] transition-colors"
          >
            Xem tất cả bộ đề
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
      </Container>
    </ScrollFadeIn>
  );
};
