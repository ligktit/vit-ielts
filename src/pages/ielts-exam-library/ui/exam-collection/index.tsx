import { decode } from "html-entities";
import { IExamCollection } from "../../api";
import { ExamItem } from "../exam-item";

export function ExamCollection({
  loading = false,
  data,
}: {
  loading?: boolean;
  data?: IExamCollection["data"]["reading" | "listening"][number] & { skill?: string };
  /** Override Splide options — kept in signature for backwards compat but unused after grid migration */
  optionsOverride?: Record<string, unknown>;
}) {
  return (
    <article className="space-y-6">
      <header className="mb-5">
        <h3 className="text-2xl font-extrabold font-noto-sans text-ink-700 leading-tight">
          {data?.title ? (
            decode(data.title)
          ) : (
            <div className="h-8 w-64 animate-pulse rounded bg-black/5" />
          )}
        </h3>
      </header>

      {/* Responsive 3-column grid matching Figma "Row" frame:
          card width ~355px, col gap ~30px, row gap ~20px
          1 col mobile → 2 col sm/md → 3 col xl */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-[30px] gap-y-5">
        {loading || !data
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[350px] animate-pulse rounded-[30px] bg-black/5"
              />
            ))
          : data.exams.map((item, index) => {
              const skill = (item as any).skill || data.skill || "reading";
              return (
                <ExamItem
                  key={(item as any).id ?? index}
                  item={{ ...(item as any), skill } as any}
                />
              );
            })}
      </div>
    </article>
  );
}

export default ExamCollection;
