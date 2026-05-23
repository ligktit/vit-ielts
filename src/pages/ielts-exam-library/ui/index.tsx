import { useEffect, useMemo, useState } from "react";

import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { Container } from "@/shared/ui";
import { QuizLibraryNav, SEOHeader } from "@/widgets";
import { ExamLibraryHeroBanner } from "./hero-banner";
import { Filter } from "./filter";
import { ExamCollection } from "./exam-collection";
import type { ExamLibraryHeroConfig } from "./types";
import type { ExamCollectionResponse } from "~services/types/database";
import { BatchResultsProvider } from "./batch-results-context";

export type FilterFormValues = {
  type: "all" | "academic" | "general";
  skill: "all" | "reading" | "listening";
  collection: string;
  sort: "newest" | "popular" | "high-ranking";
  search: string;
  page: number;
  size: number;
};

const PAGE_SIZE = 5;

const SORT_OPTIONS: Array<{ label: string; value: FilterFormValues["sort"] }> = [
  { label: "Newest", value: "newest" },
  { label: "Popular", value: "popular" },
  { label: "High Ranking", value: "high-ranking" },
];

const buildPages = (current: number, total: number) => {
  if (total <= 1) return [1];
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  return Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
};

interface PageIELTSExamLibraryProps {
  heroConfig: ExamLibraryHeroConfig;
  initialData: ExamCollectionResponse;
}

export const PageIELTSExamLibrary = ({
  heroConfig,
  initialData,
}: PageIELTSExamLibraryProps) => {
  const router = useRouter();

  // Derive initial form values from the URL so back/forward and direct links
  // hydrate the form correctly. SSR has already resolved data based on the
  // same query, so the form just mirrors the server state.
  const initialValues = useMemo<FilterFormValues>(
    () => ({
      type: (router.query.type as FilterFormValues["type"]) || "academic",
      skill: (router.query.skill as FilterFormValues["skill"]) || "reading",
      collection: (router.query.collection as string) || "",
      sort: (router.query.sort as FilterFormValues["sort"]) || "newest",
      search: (router.query.search as string) || "",
      page: Number(router.query.page) || 1,
      size: PAGE_SIZE,
    }),
    // initialValues are seeded once per SSR navigation; the form mutates after
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const methods = useForm<FilterFormValues>({ defaultValues: initialValues });
  const {
    watch,
    setValue,
    reset,
    formState: { isDirty },
  } = methods;

  const values = watch();

  const [navigating, setNavigating] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Skeleton state during SSR navigation triggered by filter changes
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

  // After every URL change (including the ones we trigger ourselves),
  // reset the form to mirror the URL and clear isDirty. This makes
  // back/forward navigation work, and resets the dirty flag so the next
  // user interaction can fire the form→URL effect again.
  useEffect(() => {
    if (!router.isReady) return;
    reset({
      type: (router.query.type as FilterFormValues["type"]) || "academic",
      skill: (router.query.skill as FilterFormValues["skill"]) || "reading",
      collection: (router.query.collection as string) || "",
      sort: (router.query.sort as FilterFormValues["sort"]) || "newest",
      search: (router.query.search as string) || "",
      page: Number(router.query.page) || 1,
      size: PAGE_SIZE,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query]);

  // Sync form → URL; non-shallow so SSR re-runs and props refresh
  useEffect(() => {
    if (!isDirty) return;
    const q: Record<string, string> = {};
    if (values.type) q.type = values.type;
    if (values.skill) q.skill = values.skill;
    if (values.collection) q.collection = values.collection;
    if (values.search) q.search = values.search;
    if (values.sort !== "newest") q.sort = values.sort;
    if (values.page > 1) q.page = String(values.page);

    const currentQ = JSON.stringify(router.query);
    const nextQ = JSON.stringify(q);
    if (currentQ === nextQ) return;

    router.push({ pathname: router.pathname, query: q }, undefined, {
      scroll: false,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, isDirty]);

  // Group exams by collection, filtering individual exams by search term
  const groupedCollections = useMemo(() => {
    const map = new Map<string, any>();
    const skillParam = values.skill || "all";

    // Prepare search words for client-side filtering of individual exams
    const searchWords = values.search
      ? values.search.toLowerCase().split(/\s+/).filter((w) => w.length > 0)
      : [];

    // Client-side filter: keep only exams whose title matches ALL search words.
    // When a search like "28" matched a collection via range detection (e.g.
    // "Test 21-40"), the server returns all exams inside that collection. We
    // narrow down to only the relevant items here.
    const examMatchesSearch = (exam: any): boolean => {
      if (searchWords.length === 0) return true;
      const title = (exam.title || "").toLowerCase();
      return searchWords.every((word) => title.includes(word));
    };

    if (skillParam === "all" || skillParam === "reading") {
       (initialData.data.reading || []).forEach(col => {
           if (values.collection && col.title !== values.collection) return;
           const mappedExams = col.exams
             .map((e: any) => ({ ...e, skill: "reading" }))
             .filter(examMatchesSearch);
           if (mappedExams.length > 0) {
             map.set(col.id, { ...col, exams: mappedExams });
           }
       });
    }

    if (skillParam === "all" || skillParam === "listening") {
       (initialData.data.listening || []).forEach(col => {
           if (values.collection && col.title !== values.collection) return;
           const mappedExams = col.exams
             .map((e: any) => ({ ...e, skill: "listening" }))
             .filter(examMatchesSearch);
           if (mappedExams.length === 0) return;
           if (map.has(col.id)) {
               map.get(col.id).exams.push(...mappedExams);
           } else {
               map.set(col.id, { ...col, exams: mappedExams });
           }
       });
    }

    return Array.from(map.values());
  }, [initialData, values.skill, values.collection, values.search]);

  const currentPage = values.page || 1;
  const totalPages = initialData.pageInfo?.totalPages ?? 1;
  const visiblePages = buildPages(currentPage, totalPages);
  const pagedCols = groupedCollections;
  const goToPage = (page: number) => {
    setValue("page", page, { shouldDirty: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const availableCollections = useMemo<string[]>(() => {
    const readingCols = (initialData.data.reading || []).map((c) => c.title);
    const listeningCols = (initialData.data.listening || []).map((c) => c.title);
    return Array.from(new Set([...readingCols, ...listeningCols]));
  }, [initialData]);

  const allQuizIds = useMemo(() => {
    const ids: string[] = [];
    for (const col of pagedCols) {
      for (const exam of col.exams ?? []) {
        if (exam.id) ids.push(exam.id);
      }
    }
    return ids;
  }, [pagedCols]);

  return (
    <FormProvider {...methods}>
      <SEOHeader fullHead={""} title={"IELTS Exam Library"} />

      <div className="min-h-screen bg-white pb-20">
        <ExamLibraryHeroBanner config={heroConfig} />

        <section className="mt-12 px-4 sm:px-6">
        <Container>
          {/* === SECTION: Mock Tests === */}
          <section id="iel-main" data-section="iel-main">
            <div className="mb-10 flex flex-col gap-6">
              <h2 className="font-noto-sans text-3xl font-extrabold text-[#2D3142]">
                IELTS Mock Tests
              </h2>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <QuizLibraryNav />

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
                      onChange={(e) => {
                        setValue("sort", e.target.value as FilterFormValues["sort"], {
                          shouldDirty: true,
                        });
                        setValue("page", 1, { shouldDirty: true });
                      }}
                      className="w-full appearance-none rounded-full border border-[rgba(0,0,0,0.1)] bg-white px-5 py-3 pr-11 text-sm font-semibold text-[#242938] outline-none transition hover:bg-gray-50"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
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
              {/* Sidebar */}
              <aside className="hidden lg:block">
                <div className="sticky top-[100px]">
                  <Filter collections={availableCollections} />
                </div>
              </aside>

              {/* List */}
              <BatchResultsProvider quizIds={allQuizIds}>
              <div className="space-y-12 min-w-0">
                {navigating ? (
                  <div className="space-y-12">
                    {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                      <ExamCollection key={i} loading={true} />
                    ))}
                  </div>
                ) : pagedCols.length ? (
                  <div className="space-y-12">
                    {pagedCols.map((col) => (
                      <ExamCollection key={col.id} data={col} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[30px] border border-dashed border-[rgba(0,0,0,0.1)] bg-[#FAF7EB]/50 px-6 py-16 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#242938]/40">
                      No results
                    </p>
                    <h3 className="mt-3 font-noto-sans text-2xl font-extrabold text-[#242938]">
                      No mock tests matched the current filters.
                    </h3>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#242938]/60">
                      Clear a few filters or search with a broader keyword to explore more tests.
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-[8px] pt-4">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => goToPage(Math.max(1, currentPage - 1))}
                      className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[6px] text-[#2D3142] transition cursor-pointer disabled:cursor-not-allowed disabled:text-black/30 hover:bg-gray-50"
                    >
                      <span className="material-symbols-rounded text-xl">chevron_left</span>
                    </button>

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
              </BatchResultsProvider>
            </div>
          </section>
        </Container>
        </section>

        {/* Mobile Filter Drawer */}
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
              <Filter
                mobile
                collections={availableCollections}
                onClose={() => setDrawerOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </FormProvider>
  );
};
