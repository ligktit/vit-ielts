import { ReactNode, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Drawer } from "antd";
import type { Dispatch, SetStateAction } from "react";
import type { SampleEssayProps } from "../..";
import type { FilterFormValues } from ".";

// ─── Custom primitives (đồng bộ với exam-library) ─────────────────────────────

const FilterCheckbox = ({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) => (
  <label className="flex items-center gap-[12px] cursor-pointer group">
    <div
      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
        checked
          ? "border-primary-500 bg-primary-500 text-white"
          : "border-black/20 bg-white text-transparent group-hover:border-primary-400"
      }`}
    >
      <span className="material-symbols-rounded text-[14px]">check</span>
    </div>
    <span className="text-[14px] text-[#2D3142] selection:bg-transparent">{label}</span>
    <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
  </label>
);

const FilterSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section
    className="bg-white rounded-[32px] px-[16px] py-[25px]"
    style={{
      boxShadow:
        "0 4px 8px -2px rgba(16, 24, 40, 0.10), 0 2px 4px -2px rgba(16, 24, 40, 0.06)",
    }}
  >
    <h3 className="font-[var(--font-noto-sans)] font-bold text-[#2D3142] text-[16px] leading-[1.2] mb-[18px]">
      {title}
    </h3>
    {children}
  </section>
);

// ─── Filter configs ────────────────────────────────────────────────────────────

const FILTER_CONFIGS = {
  quarters: [
    { slug: "Q1", name: "Quarter 1 T1-T4" },
    { slug: "Q2", name: "Quarter 2 T5-T8" },
    { slug: "Q3", name: "Quarter 3 T9-T12" },
  ],
  speakingParts: [
    { slug: "part-1", name: "Part 1" },
    { slug: "part-2", name: "Part 2" },
    { slug: "part-3", name: "Part 3" },
  ],
  writingTasks: [
    { slug: "task-1", name: "Task 1" },
    { slug: "task-2", name: "Task 2" },
  ],
  listeningParts: [
    { slug: "part-1", name: "Part 1" },
    { slug: "part-2", name: "Part 2" },
    { slug: "part-3", name: "Part 3" },
    { slug: "part-4", name: "Part 4" },
  ],
  readingPassages: [
    { slug: "passage-1", name: "Passage 1" },
    { slug: "passage-2", name: "Passage 2" },
    { slug: "passage-3", name: "Passage 3" },
  ],
  questionTypes: [
    { slug: "FILL_BLANK", name: "Gap Filling" },
    { slug: "MATCHING_HEADING", name: "Matching Headings" },
    { slug: "TRUE_FALSE", name: "True - False - Not Given" },
    { slug: "YES_NO", name: "Yes - No - Not Given" },
    { slug: "MULTIPLE_CHOICE_ONE", name: "Multiple Choice (One Answer)" },
    { slug: "MATCHING_INFO", name: "Matching Information" },
    { slug: "MATCHING_NAMES", name: "Matching Names" },
    { slug: "MULTIPLE_CHOICE_MANY", name: "Multiple Choice (Many Answers)" },
    { slug: "MAP_DIAGRAM_LABEL", name: "Map, Diagram Label" },
    { slug: "OTHERS", name: "Other Types" },
  ],
  topics: [
    { slug: "LINE", name: "Line Graph" },
    { slug: "BAR", name: "Bar Chart" },
    { slug: "PIE", name: "Pie Chart" },
    { slug: "TABLE", name: "Table" },
    { slug: "MIXED", name: "Mixed Graph" },
    { slug: "MAP", name: "Map" },
    { slug: "PROCESS", name: "Process" },
  ],
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface FilterProps {
  drawerOpen: boolean;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  filterData: SampleEssayProps["filterData"];
  skill: "speaking" | "writing" | "reading" | "listening";
  mobile?: boolean;
}

// ─── Main Filter ───────────────────────────────────────────────────────────────

export const Filter: React.FC<FilterProps> = ({
  drawerOpen,
  setDrawerOpen,
  filterData,
  skill,
  mobile = false,
}) => {
  const { watch, setValue } = useFormContext<FilterFormValues>();
  const values = watch();

  const [searchDraft, setSearchDraft] = useState((values.search as string) ?? "");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchDraft((values.search as string) ?? "");
  }, [values.search]);

  const applySearch = () => {
    setValue("search", searchDraft.trim(), { shouldDirty: true });
  };

  const yearOptions: { slug: string; name: string }[] =
    filterData?.annualPeriods?.nodes ||
    filterData?.sampleEssayFilterData?.years?.map((y: string) => ({ slug: y, name: y })) ||
    [];

  const sourceOptions: { slug: string; name: string }[] =
    filterData?.sampleSources?.nodes ||
    filterData?.sampleEssayFilterData?.sources?.map((s: string) => ({ slug: s, name: s })) ||
    [];

  const getChecked = (field: keyof FilterFormValues, slug: string) => {
    const val = values[field];
    if (Array.isArray(val)) return val.includes(slug);
    return val === slug;
  };

  const toggleValue = (field: keyof FilterFormValues, slug: string) => {
    const val = values[field];
    if (Array.isArray(val)) {
      const next = val.includes(slug) ? val.filter((v) => v !== slug) : [...val, slug];
      setValue(field, next as any, { shouldDirty: true });
    } else {
      setValue(field, val === slug ? "" : (slug as any), { shouldDirty: true });
    }
  };

  const skillSections = () => {
    switch (skill) {
      case "speaking":
        return (
          <FilterSection title="Speaking Part">
            <div className="flex flex-col gap-[18px]">
              {FILTER_CONFIGS.speakingParts.map((opt) => (
                <FilterCheckbox
                  key={opt.slug}
                  checked={getChecked("part", opt.slug)}
                  label={opt.name}
                  onChange={() => toggleValue("part", opt.slug)}
                />
              ))}
            </div>
          </FilterSection>
        );
      case "writing":
        return (
          <>
            <FilterSection title="Topic">
              <div className="flex flex-col gap-[18px]">
                {FILTER_CONFIGS.topics.map((opt) => (
                  <FilterCheckbox
                    key={opt.slug}
                    checked={getChecked("topic", opt.slug)}
                    label={opt.name}
                    onChange={() => toggleValue("topic", opt.slug)}
                  />
                ))}
              </div>
            </FilterSection>
            <FilterSection title="Task">
              <div className="flex flex-col gap-[18px]">
                {FILTER_CONFIGS.writingTasks.map((opt) => (
                  <FilterCheckbox
                    key={opt.slug}
                    checked={getChecked("task" as keyof FilterFormValues, opt.slug)}
                    label={opt.name}
                    onChange={() => toggleValue("task" as keyof FilterFormValues, opt.slug)}
                  />
                ))}
              </div>
            </FilterSection>
          </>
        );
      case "reading":
        return (
          <>
            <FilterSection title="Question Form">
              <div className="flex flex-col gap-[18px]">
                {FILTER_CONFIGS.questionTypes.map((opt) => (
                  <FilterCheckbox
                    key={opt.slug}
                    checked={getChecked("questionType", opt.slug)}
                    label={opt.name}
                    onChange={() => toggleValue("questionType", opt.slug)}
                  />
                ))}
              </div>
            </FilterSection>
            <FilterSection title="Passage">
              <div className="flex flex-col gap-[18px]">
                {FILTER_CONFIGS.readingPassages.map((opt) => (
                  <FilterCheckbox
                    key={opt.slug}
                    checked={getChecked("passage" as keyof FilterFormValues, opt.slug)}
                    label={opt.name}
                    onChange={() => toggleValue("passage" as keyof FilterFormValues, opt.slug)}
                  />
                ))}
              </div>
            </FilterSection>
          </>
        );
      case "listening":
        return (
          <>
            <FilterSection title="Listening Part">
              <div className="flex flex-col gap-[18px]">
                {FILTER_CONFIGS.listeningParts.map((opt) => (
                  <FilterCheckbox
                    key={opt.slug}
                    checked={getChecked("part", opt.slug)}
                    label={opt.name}
                    onChange={() => toggleValue("part", opt.slug)}
                  />
                ))}
              </div>
            </FilterSection>
            <FilterSection title="Question Form">
              <div className="flex flex-col gap-[18px]">
                {FILTER_CONFIGS.questionTypes.map((opt) => (
                  <FilterCheckbox
                    key={opt.slug}
                    checked={getChecked("questionType", opt.slug)}
                    label={opt.name}
                    onChange={() => toggleValue("questionType", opt.slug)}
                  />
                ))}
              </div>
            </FilterSection>
          </>
        );
      default:
        return null;
    }
  };

  const content = (
    <div className={`flex flex-col gap-[24px] ${mobile ? "pb-24 pt-4 px-2" : ""}`}>
      {/* Search */}
      <FilterSection title="Search">
        <div className="relative flex items-center h-[40px] w-full rounded-full border border-[rgba(0,0,0,0.15)] overflow-hidden bg-white focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-100 transition-shadow">
          <input
            ref={searchInputRef}
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applySearch();
              }
            }}
            placeholder="Search"
            className="flex-1 w-full h-full bg-transparent px-[16px] text-[14px] text-[#2D3142] outline-none placeholder:text-black/30"
          />
          <button
            type="button"
            onClick={applySearch}
            className="flex h-full w-[44px] items-center justify-center bg-[#D94A56] text-white transition hover:bg-[#D94A56]/90"
          >
            <span className="material-symbols-rounded text-[20px]">search</span>
          </button>
        </div>
      </FilterSection>

      {/* Year */}
      {yearOptions.length > 0 && (
        <FilterSection title="Year">
          <div className="flex flex-col gap-[18px]">
            {yearOptions.map((opt) => (
              <FilterCheckbox
                key={opt.slug}
                checked={getChecked("year", opt.slug)}
                label={opt.name}
                onChange={() => toggleValue("year", opt.slug)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Sample Source */}
      {sourceOptions.length > 0 && (
        <FilterSection title="Sample Source">
          <div className="flex flex-col gap-[18px]">
            {sourceOptions.map((opt) => (
              <FilterCheckbox
                key={opt.slug}
                checked={getChecked("sampleSource", opt.slug)}
                label={opt.name}
                onChange={() => toggleValue("sampleSource", opt.slug)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Quarter */}
      <FilterSection title="Quarter">
        <div className="flex flex-col gap-[18px]">
          {FILTER_CONFIGS.quarters.map((opt) => (
            <FilterCheckbox
              key={opt.slug}
              checked={getChecked("quarter", opt.slug)}
              label={opt.name}
              onChange={() => toggleValue("quarter", opt.slug)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Skill-specific sections */}
      {skillSections()}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      {content}

      {/* Mobile drawer */}
      <Drawer
        title="Filter"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        closeIcon={
          <span className="material-symbols-rounded text-[20px] text-[#2D3142]">close</span>
        }
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="flex-1 rounded-full bg-primary-500 py-3 text-[14px] font-bold text-white transition hover:bg-primary-600"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="flex-1 rounded-full border border-[rgba(0,0,0,0.1)] bg-white py-3 text-[14px] font-bold text-[#2D3142] transition hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-[24px] py-2">
          {content}
        </div>
      </Drawer>
    </>
  );
};
