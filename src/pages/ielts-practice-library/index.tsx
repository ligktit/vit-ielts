import { withMasterData, withMultipleWrapper } from "@/shared/hoc";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import type { PracticeLibraryBannerConfig } from "./ui/types";
import { createServerSupabase } from "~supabase/server";
import { readConfig } from "~services/cms-config";
import { getQuizFilterOptions, getQuizzes } from "~services/quiz";
import type { Quiz, SkillType } from "~services/types/database";

export { PageIELTSPracticeLibrary } from "./ui";

const PAGE_SIZE = 9;

const getSingleQueryValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
};

export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withMasterData,
  async (context: GetServerSidePropsContext) => {
    const { resolvedUrl, query } = context;
    const lastSegment = resolvedUrl.split("?")[0].split("/").at(-1);
    const skill: SkillType = lastSegment === "listening" ? "listening" : "reading";
    const supabase = createServerSupabase(context);

    const size = Number(getSingleQueryValue(query.size) || PAGE_SIZE);
    const page = Number(getSingleQueryValue(query.page) || 1);
    const search = getSingleQueryValue(query.search) || undefined;
    const source = getSingleQueryValue(query.source) || undefined;
    const part = getSingleQueryValue(query.part) || undefined;
    const quarter = getSingleQueryValue(query.quarter) || undefined;
    const year = getSingleQueryValue(query.year) || undefined;
    const questionFormRaw = query.question_form;
    const questionForm = Array.isArray(questionFormRaw)
      ? questionFormRaw.flatMap((item) => item.split(",")).filter(Boolean).join(",")
      : (questionFormRaw || "").toString().split(",").filter(Boolean).join(",") || undefined;

    const [quizFilterData, bannerConfig, quizzesResult] = await Promise.all([
      getQuizFilterOptions(supabase).catch(() => ({
        years: [],
        sources: [],
        parts: [],
        quarters: [],
      })),
      readConfig<PracticeLibraryBannerConfig>(supabase, "ielts-practice-library/banner").catch(
        () => null
      ),
      getQuizzes(supabase, {
        skill,
        type: "practice",
        search,
        source,
        part,
        quarter,
        year,
        questionForm,
        page,
        pageSize: size,
      }).catch(() => ({ data: [] as Quiz[], count: 0 })),
    ]);

    const defaultBannerConfig: PracticeLibraryBannerConfig = {
      listening: {
        title: "IELTS Listening Practice Tests",
        description: {
          line1:
            "IELTS Listening Practice Tests Online miễn phí tại IELTS PREDICTION với đề",
          line2:
            "thi, audio, transcript, answer key, giải thích chi tiết từ vựng đi kèm và",
          line3: "trải nghiệm làm bài thi thử như trên máy.",
        },
        backgroundColor: "linear-gradient(180deg, #FFF3F3 0%, #FFF8F0 100%)",
        button: {
          text: "Tìm hiểu khóa học",
          link: "#",
        },
      },
      reading: {
        title: "IELTS Reading Practice Tests",
        description: {
          line1:
            "IELTS Reading Practice Tests Online miễn phí tại DOL Academy với đề",
          line2:
            "thi, transcript, answer key, giải thích chi tiết từ vựng đi kèm và",
          line3: "trải nghiệm làm bài thi thử như trên máy.",
        },
        backgroundColor: "linear-gradient(180deg, #FFF3F3 0%, #FFF8F0 100%)",
        button: {
          text: "Tìm hiểu khóa học",
          link: "#",
        },
      },
    };

    return {
      props: {
        quizFilterData: {
          ...quizFilterData,
          skill: skill || null,
        },
        bannerConfig: {
          listening: bannerConfig?.listening ?? defaultBannerConfig.listening,
          reading: bannerConfig?.reading ?? defaultBannerConfig.reading,
        },
        initialQuizzes: {
          data: quizzesResult.data,
          count: quizzesResult.count,
          pageSize: size,
        },
      },
    };
  }
);
