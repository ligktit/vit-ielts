import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { ROUTES } from "@/shared/routes";
import { Container } from "@/shared/ui";
import type { Post } from "~services/types/database";
import type { PracticeLibraryBannerConfig } from "./types";
import { ArticleCard } from "./article-card";
import { FeaturedArticle } from "./featured-article";
import { BlogSidebar, type SkillFilter } from "./blog-sidebar";
import { SKILL_ORDER, SKILL_META } from "./skills";
import { HeroSection } from "./hero-section";
import { SkillCarousel } from "./skill-carousel";

interface PageProps {
  bannerConfig: PracticeLibraryBannerConfig;
  initialPosts: {
    data: Post[];
    count: number;
    pageSize: number;
  };
  /** Breadcrumb label under the hero (e.g. "IELTS Prediction" or "Blog"). */
  breadcrumbLabel?: string;
}

const DEFAULT_SECTION_CAP = 3;
const MAX_KEYWORDS = 8;

const SectionHeader = ({
  label,
  onSeeMore,
}: {
  label: string;
  onSeeMore?: () => void;
}) => (
  <div className="mb-6 flex items-center justify-between border-b border-[#E5E7EB] pb-3">
    <div className="flex items-center gap-3">
      <span className="h-6 w-1.5 rounded bg-primary-500" />
      <h2 className="text-[24px] font-extrabold text-[#1F2430]">{label}</h2>
    </div>
    {onSeeMore && (
      <button
        type="button"
        onClick={onSeeMore}
        className="inline-flex items-center gap-0 rounded-md bg-primary-50 py-1 pl-3 pr-1 text-[12px] font-semibold text-primary-500 transition-opacity hover:opacity-80 cursor-pointer"
      >
        Xem thêm
        <span className="material-symbols-rounded text-[14px]">chevron_right</span>
      </button>
    )}
  </div>
)

export const PageIELTSPrediction = ({
  bannerConfig,
  initialPosts,
  breadcrumbLabel = "IELTS Prediction",
}: PageProps) => {
  const posts = useMemo(() => initialPosts.data || [], [initialPosts.data]);
  const bannerData = bannerConfig.reading || bannerConfig.listening;

  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // Skill filter is kept in the URL (?skill=...) via shallow routing so the
  // browser Back button returns to the unfiltered page instead of leaving it.
  const skillParam = router.query.skill;
  const skill: SkillFilter =
    typeof skillParam === "string" && (SKILL_ORDER as readonly string[]).includes(skillParam)
      ? (skillParam as SkillFilter)
      : "all";

  const changeSkill = (next: SkillFilter) => {
    const query = { ...router.query };
    if (next === "all") delete query.skill;
    else query.skill = next;
    router.push({ pathname: router.pathname, query }, undefined, {
      shallow: true,
      scroll: false,
    });
  };

  // Scroll to top whenever the skill filter changes — covers both clicking a
  // filter and using the browser Back/Forward buttons (which only change the
  // ?skill query, not trigger changeSkill). Skip the very first render.
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (typeof window !== "undefined") {
      // behavior:"instant" bypasses the global `scroll-behavior: smooth` so the
      // page jumps straight to the top instead of animating.
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [skill]);

  // Aggregate the most-used tags into the "Popular Keywords" list.
  const popularKeywords = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags || []) {
        if (!tag) continue;
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_KEYWORDS)
      .map(([tag]) => tag);
  }, [posts]);

  const isFiltering =
    skill !== "all" || selectedKeywords.length > 0 || search.trim() !== "";

  const matchesFilters = (post: Post) => {
    if (skill !== "all" && post.skill !== skill) return false;
    if (
      selectedKeywords.length > 0 &&
      !(post.tags || []).some((t) => selectedKeywords.includes(t))
    ) {
      return false;
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const hay = `${post.title} ${post.excerpt || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  };

  const filtered = useMemo(
    () => posts.filter(matchesFilters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [posts, skill, selectedKeywords, search],
  );

  const featured = useMemo(
    () => posts.find((p) => p.is_featured) || posts[0] || null,
    [posts],
  );

  // Group the (filtered) posts by skill, preserving the canonical order.
  const sections = useMemo(() => {
    return SKILL_ORDER.map((key) => ({
      key,
      label: SKILL_META[key].label,
      posts: filtered.filter((p) => p.skill === key),
    })).filter((s) => s.posts.length > 0);
  }, [filtered]);

  const showFeatured = !isFiltering && featured;

  const toggleKeyword = (kw: string) =>
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw],
    );

  const clearAll = () => {
    setSearch("");
    setSelectedKeywords([]);
    changeSkill("all");
  };

  const href = (post: Post) => ROUTES.PREDICTION.SINGLE(post.slug);

  return (
    <>
      <HeroSection title={bannerData.title} skillLabel={breadcrumbLabel} />
      <div className="min-h-screen bg-white pb-20 pt-18">
      <Container>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside>
            <div className="lg:sticky lg:top-[100px]">
              <BlogSidebar
                search={search}
                onSearchChange={setSearch}
                skill={skill}
                onSkillChange={changeSkill}
                keywords={popularKeywords}
                selectedKeywords={selectedKeywords}
                onToggleKeyword={toggleKeyword}
                onClear={clearAll}
              />
            </div>
          </aside>

          {/* Main */}
          <main className="min-w-0 space-y-12">
            {showFeatured && featured && (
              <section>
                <SectionHeader label="Featured Article" />
                <FeaturedArticle post={featured} href={href(featured)} />
              </section>
            )}

            {sections.length > 0 ? (
              sections.map((section) => {
                // In the all-skills view, a section with more than one row of
                // posts becomes a carousel (like the homepage); otherwise a
                // simple grid. The filtered view always shows the full grid.
                const useCarousel = skill === "all" && section.posts.length > DEFAULT_SECTION_CAP;
                return (
                  <section key={section.key}>
                    <SectionHeader
                      label={section.label}
                      // "Xem thêm" only in the all-skills view; clicking filters
                      // to that skill (shows all its posts as a grid).
                      onSeeMore={skill === "all" ? () => changeSkill(section.key) : undefined}
                    />
                    {useCarousel ? (
                      <SkillCarousel posts={section.posts} href={href} />
                    ) : (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {section.posts.map((post) => (
                          <ArticleCard key={post.id} post={post} href={href(post)} />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white px-6 py-16 text-center">
                <h3 className="text-[20px] font-bold text-[#1F2430]">
                  Không tìm thấy bài viết phù hợp
                </h3>
                <p className="mt-2 text-[14px] text-[#6A7282]">
                  Thử xoá bớt bộ lọc hoặc tìm với từ khoá khác.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-5 rounded-full bg-primary-500 px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </Container>
      </div>
    </>
  );
};
