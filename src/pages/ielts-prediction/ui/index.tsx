import { ROUTES } from "@/shared/routes";
import { FormProvider, useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { PostCard } from "./post-card";
import type { Post } from "~services/types/database";
import dayjs from "dayjs";
import { Container } from "@/shared/ui";
import type { PracticeLibraryBannerConfig } from "./types";
import { Filter } from "./filter";
import { HeroSection } from "./hero-section";

export type FilterFormValues = {
  sort: "newest" | "oldest" | "a-z" | "z-a";
  search: string;
  page: number;
  size: number;
};

const PAGE_SIZE = 9;

const SORT_OPTIONS: Array<{ label: string; value: FilterFormValues["sort"] }> = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "A-Z", value: "a-z" },
  { label: "Z-A", value: "z-a" },
];

const createQueryPayload = (values: FilterFormValues) => {
  const query: Record<string, string> = {};

  if (values.sort !== "newest") query.sort = values.sort;
  if (values.search) query.search = values.search;
  if (values.page > 1) query.page = String(values.page);
  if (values.size !== PAGE_SIZE) query.size = String(values.size);

  return query;
};

const getSingleQueryValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
};

const buildPages = (current: number, total: number) => {
  if (total <= 1) return [1];
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= total)
    .sort((left, right) => left - right);
};

interface PageProps {
  bannerConfig: PracticeLibraryBannerConfig;
  initialPosts: {
    data: Post[];
    count: number;
    pageSize: number;
  };
}

export const PageIELTSPrediction = ({ bannerConfig, initialPosts }: PageProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const router = useRouter();

  const initialValues = useMemo<FilterFormValues>(
    () => ({
      sort: (getSingleQueryValue(router.query.sort) as FilterFormValues["sort"]) || "newest",
      search: getSingleQueryValue(router.query.search),
      page: Number(getSingleQueryValue(router.query.page) || 1),
      size: Number(getSingleQueryValue(router.query.size) || PAGE_SIZE),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const methods = useForm<FilterFormValues>({ defaultValues: initialValues });

  const {
    watch,
    reset,
    setValue,
    getValues,
    formState: { isDirty },
  } = methods;

  const bannerData = bannerConfig.reading || bannerConfig.listening;

  useEffect(() => {
    const start = (url: string) => {
      if (url.split("?")[0] === router.pathname) setNavigating(true);
    };
    const end = () => setNavigating(false);
    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", end);
    router.events.on("routeChangeError", end);
    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", end);
      router.events.off("routeChangeError", end);
    };
  }, [router.events, router.pathname]);

  useEffect(() => {
    if (!router.isReady) return;
    reset({
      sort: (getSingleQueryValue(router.query.sort) as FilterFormValues["sort"]) || "newest",
      search: getSingleQueryValue(router.query.search),
      page: Number(getSingleQueryValue(router.query.page) || 1),
      size: Number(getSingleQueryValue(router.query.size) || PAGE_SIZE),
    });
  }, [reset, router.isReady, router.query]);

  const values = watch();

  useEffect(() => {
    if (!isDirty) return;

    const nextQuery = createQueryPayload(getValues());
    const currentQuery = createQueryPayload({
      sort: (getSingleQueryValue(router.query.sort) as FilterFormValues["sort"]) || "newest",
      search: getSingleQueryValue(router.query.search),
      page: Number(getSingleQueryValue(router.query.page) || 1),
      size: Number(getSingleQueryValue(router.query.size) || PAGE_SIZE),
    });

    if (JSON.stringify(nextQuery) === JSON.stringify(currentQuery)) return;

    router.push(
      { pathname: router.pathname, query: nextQuery },
      undefined,
      { scroll: false },
    );
  // Primitive deps avoid the watch()-new-ref-every-render loop while SSR
  // navigation is in flight.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.sort, values.search, values.page, values.size, isDirty]);

  const items = useMemo(
    () => (initialPosts.data || []).map((post) => ({ node: post })),
    [initialPosts.data],
  );

  const currentPage = Number(getSingleQueryValue(router.query.page) || 1);
  const total = initialPosts.count || 0;
  const totalPages = Math.max(1, Math.ceil(total / initialPosts.pageSize));
  const visiblePages = buildPages(currentPage, totalPages);
  const goToPage = (page: number) => {
    setValue("page", page, { shouldDirty: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleSortChange = (nextSort: FilterFormValues["sort"]) => {
    setValue("sort", nextSort, { shouldDirty: true });
    setValue("page", 1, { shouldDirty: true });
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-white pb-20">
        <HeroSection
          title={bannerData.title}
          skillLabel="IELTS Prediction"
        />

        <section className="mt-12 px-4 sm:px-6">
        <Container>
          {/* === SECTION: IELTS Practice === */}
          <section id="ipl-practice" data-section="ipl-practice">
            <div className="mb-10 flex flex-col gap-6">
              <h2 className="font-noto-sans text-3xl font-extrabold text-[#2D3142]">
                IELTS Prediction
              </h2>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-end">

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.1)] bg-white px-4 py-3 text-sm font-bold text-[#242938] transition hover:bg-gray-50 lg:hidden"
                  >
                    <span className="material-symbols-rounded text-base">tune</span>
                    Filter
                  </button>
                  <div className="relative min-w-[11rem]">
                    <select
                      value={values.sort}
                      onChange={(event) =>
                        handleSortChange(event.target.value as FilterFormValues["sort"])
                      }
                      className="w-full appearance-none rounded-full border border-[rgba(0,0,0,0.1)] bg-white px-5 py-3 pr-11 text-sm font-semibold text-[#242938] outline-none transition hover:bg-gray-50"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-rounded pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#242938]/60">
                      keyboard_arrow_down
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-[60px] xl:gap-[80px]">
              <aside className="hidden lg:block">
                <div className="sticky top-[100px]">
                  <Filter />
                </div>
              </aside>

              <div className="space-y-10">
                {navigating ? (
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                      <div
                        key={index}
                        className="h-[400px] w-full max-w-[356px] animate-pulse rounded-[30px] bg-black/5"
                      />
                    ))}
                  </div>
                ) : items.length ? (
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map(({ node }, index) => (
                      <PostCard
                        key={node.id || index}
                        image={node.featured_image || undefined}
                        title={node.title}
                        date={node.published_at ? dayjs(node.published_at).format("DD/MM/YYYY") : undefined}
                        isPro={node.pro_user_only}
                        href={ROUTES.PREDICTION.SINGLE(node.slug)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[30px] border border-dashed border-[rgba(0,0,0,0.1)] bg-[#FAF7EB]/50 px-6 py-16 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#242938]/40">
                      No results
                    </p>
                    <h3 className="mt-3 font-noto-sans text-2xl font-extrabold text-[#242938]">
                      No practice tests matched the current filters.
                    </h3>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#242938]/60">
                      Clear a few filters or search with a broader keyword to explore more test pages.
                    </p>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-[8px] pt-4">
                    {/* Previous Button */}
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => goToPage(Math.max(1, currentPage - 1))}
                      className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[6px] text-[#2D3142] transition cursor-pointer disabled:cursor-not-allowed disabled:text-black/30 hover:bg-gray-50"
                    >
                      <span className="material-symbols-rounded text-xl">chevron_left</span>
                    </button>

                    {/* Page Numbers */}
                    {visiblePages.map((page, index, array) => {
                      const isGap = index > 0 && page - array[index - 1] > 1;
                      return (
                        <div key={page} className="flex items-center gap-[8px]">
                          {isGap && (
                            <div className="flex h-[32px] w-[32px] items-end justify-center pb-1 text-black/30 font-bold tracking-widest leading-none">
                              ...
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => goToPage(page)}
                            className={`flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[6px] text-base font-semibold transition cursor-pointer ${
                              page === currentPage
                                ? "bg-primary-500 text-white"
                                : "text-[#2D3142] hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}

                    {/* Next Button */}
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                      className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[6px] text-[#2D3142] transition cursor-pointer disabled:cursor-not-allowed disabled:text-black/30 hover:bg-gray-50"
                    >
                      <span className="material-symbols-rounded text-xl">chevron_right</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </Container>
        </section>

        {drawerOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
            <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-white p-5 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2D3142]/40">
                    Filters
                  </p>
                  <h3 className="mt-1 font-noto-sans text-2xl font-extrabold text-[#2D3142]">
                    Refine results
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(0,0,0,0.1)] text-[#2D3142]"
                >
                  <span className="material-symbols-rounded">close</span>
                </button>
              </div>
              <Filter mobile onClose={() => setDrawerOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </FormProvider>
  );
};
