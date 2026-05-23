import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { createServerSupabase } from "~supabase/server";
import { getPostBySlug, getPosts } from "~services/post";
import { ROUTES } from "@/shared/routes";
import { isAdminRole } from "~lib/parseRoles";
import type { Post, VoteEntry } from "~services/types/database";
import type { IPost } from "@/shared/types";

export { PageSingle } from "./ui";

/**
 * Transform Supabase Post (snake_case flat) → IPost (WordPress-legacy shape)
 * so that the existing PageSingle UI component renders correctly.
 */
function transformPostToLegacy(post: Post, userId?: string): IPost {
  // Compute rating from votes array
  const votes: VoteEntry[] = post.votes ?? [];
  const voteCount = votes.length;
  const avgRate =
    voteCount > 0
      ? votes.reduce((sum, v) => sum + v.rate, 0) / voteCount
      : 0;
  const hasVoted = userId ? votes.some((v) => v.user_id === userId) : false;

  // Transform categories: string[] → { edges: [...] }
  const categoryEdges = (post.categories ?? []).map((cat, idx) => ({
    node: {
      link: `/${cat}`,
      name: cat,
      id: `cat-${idx}`,
    },
    isPrimary: idx === 0,
  }));

  // SEO: Supabase stores as Record<string, unknown>
  const seo = post.seo as any ?? {};

  return {
    id: post.id,
    databaseId: 0,
    link: `/${post.slug}`,
    title: post.title,
    excerpt: post.excerpt ?? "",
    content: post.content ?? "",
    date: post.published_at ?? post.created_at ?? "",
    featuredImage: post.featured_image
      ? {
          node: {
            sourceUrl: post.featured_image,
            altText: post.title,
          },
        }
      : null,
    categories: {
      edges: categoryEdges,
    },
    seo: {
      title: seo.meta_title ?? post.title,
      metaDesc: seo.meta_description ?? post.excerpt ?? "",
      breadcrumbs: [
        { text: "Trang chủ", url: "/" },
        { text: "Blog", url: "/blog" },
        { text: post.title, url: `/${post.slug}` },
      ],
      ...(seo || {}),
    },
    postMeta: {
      proUserOnly: post.pro_user_only ?? false,
      views: post.views ?? 0,
    },
    rating: {
      rate: Number(avgRate.toFixed(1)),
      count: voteCount,
      voted: hasVoted,
    },
    hasAccess: true,
  };
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
  singleSlug: string
): ReturnType<GetServerSideProps> => {
  const supabase = createServerSupabase(context);

  let post: Awaited<ReturnType<typeof getPostBySlug>>;
  try {
    post = await getPostBySlug(supabase, singleSlug);
  } catch (error) {
    console.error("Error fetching post single:", error);
    return { notFound: true };
  }

  if (!post) {
    return {
      notFound: true,
    };
  }

  // Check Pro access
  let userId: string | undefined;
  if (post.pro_user_only) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        redirect: {
          destination: ROUTES.HOME,
          permanent: false,
        },
      };
    }
    userId = user.id;

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
  } else {
    // Even for non-pro posts, try to get user for vote tracking
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
  }

  // Similar posts: prefer same category, pad with latest if fewer than 4
  const primaryCategory = post.categories?.[0];
  const [sameCategoryResult, latestForSimilarResult, latestForSidebarResult] =
    await Promise.allSettled([
      primaryCategory
        ? getPosts(supabase, { category: primaryCategory, page: 1, pageSize: 8 })
        : Promise.resolve({ data: [] as Post[], count: 0, page: 1, pageSize: 8, totalPages: 0 }),
      getPosts(supabase, { page: 1, pageSize: 12 }),
      getPosts(supabase, { page: 1, pageSize: 7 }),
    ]);

  const sameCategory =
    sameCategoryResult.status === "fulfilled" ? sameCategoryResult.value.data : [];
  const latestForSimilar =
    latestForSimilarResult.status === "fulfilled" ? latestForSimilarResult.value.data : [];
  const latestForSidebar =
    latestForSidebarResult.status === "fulfilled" ? latestForSidebarResult.value.data : [];

  const usedIds = new Set<string>([String(post.id)]);
  const sameCategoryFiltered = sameCategory.filter((p) => !usedIds.has(String(p.id)));
  sameCategoryFiltered.forEach((p) => usedIds.add(String(p.id)));

  let similarPosts: Post[];
  if (sameCategoryFiltered.length >= 4) {
    similarPosts = sameCategoryFiltered.slice(0, 4);
  } else {
    const extras = latestForSimilar.filter((p) => !usedIds.has(String(p.id)));
    similarPosts = [...sameCategoryFiltered, ...extras].slice(0, 4);
  }

  const relatedPosts = latestForSidebar.filter((p) => String(p.id) !== String(post.id));

  return {
    props: {
      post: transformPostToLegacy(post, userId),
      similarPosts: JSON.parse(JSON.stringify(similarPosts)),
      relatedPosts: JSON.parse(JSON.stringify(relatedPosts)),
    },
  };
};

