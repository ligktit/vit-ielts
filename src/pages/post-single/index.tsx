import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { createServerSupabase } from "~supabase/server";
import { getPostBySlug } from "~services/post";
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

  return {
    props: {
      post: transformPostToLegacy(post, userId),
    },
  };
};

