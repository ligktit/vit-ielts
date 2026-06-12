import { withMasterData, withMultipleWrapper } from "@/shared/hoc";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import _ from "lodash";
import { ROUTES } from "@/shared/routes";
import { createServerSupabase } from "~supabase/server";
import { getSampleEssays, getSampleEssayBySlug, getRelatedSampleEssays } from "~services/sample-essay";
import { readConfig } from "~services/cms-config";
import type { SampleEssayBannerConfig } from "./ui/archive/types";
import type { SampleEssayFilters, SampleEssay as SampleEssayDB } from "~services/types/database";
import type { SingleSampleEssay } from "./api";
import { isAdminRole } from "~lib/parseRoles";

export * from "./ui";

/**
 * Transform Supabase SampleEssay (snake_case flat) → SingleSampleEssay (WordPress-legacy shape)
 * so that the existing PageSingle UI component renders correctly.
 */
function transformSampleEssayToLegacy(essay: SampleEssayDB): SingleSampleEssay {
  const seo = essay.seo as any ?? {};

  return {
    id: essay.id,
    slug: essay.slug,
    title: essay.title,
    date: essay.published_at ?? essay.created_at ?? "",
    skill: essay.skill,
    content: essay.content ?? "",
    excerpt: essay.excerpt ?? "",
    featuredImage: essay.featured_image
      ? {
          node: {
            sourceUrl: essay.featured_image,
            altText: essay.title,
          },
        }
      : null,
    sampleEssayFields: {
      quarter: [essay.quarter ?? "", essay.quarter ?? ""],
    },
    speakingSampleEssayFields: {
      part: [essay.part ?? "", essay.part ?? ""],
      questionType: [essay.question_type ?? ""],
    },
    writingSampleEssayFields: {
      topic: [essay.topic ?? ""],
      task: [essay.task ?? "", essay.task ?? ""],
    },
    postMeta: {
      views: essay.views ?? 0,
      proUserOnly: essay.pro_user_only ?? false,
    },
    seo: {
      title: seo.meta_title ?? essay.title,
      metaDesc: seo.meta_description ?? essay.excerpt ?? "",
      breadcrumbs: [
        { text: "Home", url: "/" },
        { text: essay.skill === "writing" ? "Writing Sample" : essay.skill === "speaking" ? "Speaking Sample" : "Sample Essay", url: essay.skill === "writing" ? "/ielts-writing-sample" : essay.skill === "speaking" ? "/ielts-speaking-sample" : "/" },
        { text: essay.title, url: `/${essay.slug}` },
      ],
      ...(seo || {}),
    },
    hasAccess: true,
  };
}

/**
 * SSR for sample essay archive pages.
 * Replaces Apollo GET_SAMPLE_ESSAYS + GET_FILTER_DATA queries and internal API fetch for banner config.
 */
export const getServerSidePropsArchive = async (
  context: GetServerSidePropsContext,
  skill: "speaking" | "writing" | "reading" | "listening"
): ReturnType<GetServerSideProps> => {
  const pageSize = 18;
  const paged =
    context.query.slug?.at(-2) === "page" ? context.query.slug.at(-1) : 1;

  const params = _.omit(context.query, ["slug"]);
  const supabase = createServerSupabase(context);

  // Build filters for Supabase
  const filters: SampleEssayFilters = {
    skill,
    page: Number(paged),
    pageSize,
    part: params.part as string | undefined,
    questionType: params.questionType as string | undefined,
    quarter: params.quarter as string | undefined,
    year: params.year as string | undefined,
    source: params.source as string | undefined,
    topic: params.topic as string | undefined,
    task: params.task as string | undefined,
    passage: params.passage as string | undefined,
    search: params.search as string | undefined,
  };

  // Parallel: fetch essays + banner config
  let essaysResult: Awaited<ReturnType<typeof getSampleEssays>>;
  let bannerConfig: SampleEssayBannerConfig | null;
  try {
    [essaysResult, bannerConfig] = await Promise.all([
      getSampleEssays(supabase, filters),
      readConfig<SampleEssayBannerConfig>(supabase, "sample-essay/banner").catch(() => null),
    ]);
  } catch (error) {
    console.error("Error fetching sample essays archive:", error);
    return { notFound: true };
  }

  const defaultBannerConfig: SampleEssayBannerConfig = {
    writing: {
      title: "DOL IELTS Writing Task 1 Academic Sample",
      description: {
        line1: "IELTS Writing Task 1 sample essays with step-by-step guidance,",
        line2: "detailed topic vocabulary included.",
      },
      backgroundColor: "linear-gradient(180deg, #FFF3F3 0%, #FFF8F0 100%)",
    },
    speaking: {
      title: "DOL IELTS Speaking Sample",
      description: {
        line1: "IELTS Speaking sample answers with step-by-step guidance,",
        line2: "detailed topic vocabulary included.",
      },
      backgroundColor: "linear-gradient(180deg, #FFF3F3 0%, #FFF8F0 100%)",
    },
  };

  return {
    props: {
      nodes: essaysResult.data,
      pageInfo: {
        offsetPagination: {
          total: essaysResult.count,
        },
      },
      filterData: {
        sampleEssayFilterData: {
          parts: [],
          questionTypes: [],
          quarters: [],
          years: [],
          sources: [],
          topics: [],
        },
      },
      sampleEssays: {
        edges: essaysResult.data.map((node: any) => ({ node })),
        pageInfo: {
          offsetPagination: {
            total: essaysResult.count,
          },
        },
      },
      paged: Number(paged),
      pageSize,
      skill,
      bannerConfig: bannerConfig ?? defaultBannerConfig,
    },
  };
};

export type SampleEssayProps = {
  paged: number;
  pageSize: number;
  skill: "speaking" | "writing" | "reading" | "listening";
  filterData: Record<string, any>;
  bannerConfig: SampleEssayBannerConfig;
  nodes: any[];
  pageInfo: { offsetPagination: { total: number } };
  // Legacy compat fields used by UI components
  sampleEssays?: any;
  seo?: any;
};

/**
 * SSR for sample essay single pages.
 * Replaces Apollo GET_SAMPLE_ESSAY_BY_SLUG query.
 */
export const getServerSidePropsSingle = async (
  context: GetServerSidePropsContext,
  singleID: string
): ReturnType<GetServerSideProps> => {
  const supabase = createServerSupabase(context);

  let essay: Awaited<ReturnType<typeof getSampleEssayBySlug>>;
  try {
    essay = await getSampleEssayBySlug(supabase, singleID);
  } catch (error) {
    console.error("Error fetching sample essay single:", error);
    return { notFound: true };
  }

  if (!essay) {
    return { notFound: true };
  }

  const relatedEssays = await getRelatedSampleEssays(supabase, essay.id, {
    skill: essay.skill,
    source: essay.source ?? null,
    year: essay.year ?? null,
  }).catch(() => []);

  // Sidebar: latest 6 essays of the same skill (excluding current)
  const sidebarEssaysQuery = supabase
    .from("sample_essays")
    .select("id, slug, title, featured_image")
    .eq("status", "published")
    .neq("id", essay.id)
    .order("created_at", { ascending: false })
    .limit(6);

  const sidebarEssaysResult = essay.skill
    ? await sidebarEssaysQuery.eq("skill", essay.skill)
    : await sidebarEssaysQuery;
  const sidebarEssays = sidebarEssaysResult.data ?? [];

  // Check Pro access
  if (essay.pro_user_only) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        redirect: {
          destination: ROUTES.HOME,
          permanent: false,
        },
      };
    }

    const { data: profile } = await supabase
      .from("users")
      .select("is_pro, pro_expiration_date, roles")
      .eq("id", user.id)
      .single();

    const isPro =
      isAdminRole(profile?.roles) ||
      (profile?.is_pro &&
        profile?.pro_expiration_date &&
        new Date(profile.pro_expiration_date) > new Date());

    if (!isPro) {
      return {
        redirect: {
          destination: ROUTES.HOME,
          permanent: false,
        },
      };
    }
  }

  return {
    props: {
      sampleEssay: transformSampleEssayToLegacy(essay),
      relatedEssays: JSON.parse(JSON.stringify(relatedEssays)),
      sidebarEssays: JSON.parse(JSON.stringify(sidebarEssays)),
    },
  };
};

