import { withMasterData, withMultipleWrapper } from "@/shared/hoc";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import type { ExamLibraryHeroConfig } from "./ui/types";
import { createServerSupabase } from "~supabase/server";
import { readConfig } from "~services/cms-config";

export { PageIELTSExamLibrary } from "./ui";

export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withMasterData,
  async (context: GetServerSidePropsContext) => {
    const supabase = createServerSupabase(context);

    let heroConfig: ExamLibraryHeroConfig;

    try {
      const config = await readConfig<ExamLibraryHeroConfig>(
        supabase,
        "ielts-exam-library/hero-banner"
      );
      heroConfig = config ?? {
        title: "IELTS Exam Library",
        backgroundColor:
          "linear-gradient(rgb(255, 255, 255) 0%, rgb(239, 241, 255) 100%)",
        breadcrumb: {
          homeLabel: "Home",
          currentLabel: "IELTS Exam Library",
        },
      };
    } catch {
      heroConfig = {
        title: "IELTS Exam Library",
        backgroundColor:
          "linear-gradient(rgb(255, 255, 255) 0%, rgb(239, 241, 255) 100%)",
        breadcrumb: {
          homeLabel: "Home",
          currentLabel: "IELTS Exam Library",
        },
      };
    }

    return {
      props: {
        heroConfig,
      },
    };
  }
);
