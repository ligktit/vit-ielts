import { AppShell } from "@/widgets/layouts";

// ─── Static data ──────────────────────────────────────────────────────────────

interface StatCard {
  value: string;
  label: string;
  accentColor: string;
}

const STAT_CARDS: StatCard[] = [
  { value: "840", label: "Words learned", accentColor: "#b3e653" },
  { value: "612", label: "Mastered", accentColor: "#5281f9" },
  { value: "48", label: "Due for review", accentColor: "#fc945a" },
  { value: "6", label: "Day streak", accentColor: "#7c6ef9" },
];

interface WordSet {
  name: string;
  mastered: number;
  total: number;
  chipBg: string;
  chipText: string;
  progressColor: string;
  action: "Practice" | "Review";
}

const WORD_SETS: WordSet[] = [
  {
    name: "Academic verbs",
    mastered: 78,
    total: 90,
    chipBg: "rgba(179,230,83,0.16)",
    chipText: "#86ad3e",
    progressColor: "#b3e653",
    action: "Practice",
  },
  {
    name: "Linking words",
    mastered: 64,
    total: 64,
    chipBg: "rgba(82,129,249,0.16)",
    chipText: "#3e61bb",
    progressColor: "#5281f9",
    action: "Review",
  },
  {
    name: "Environment",
    mastered: 30,
    total: 72,
    chipBg: "rgba(252,148,89,0.16)",
    chipText: "#bd6f43",
    progressColor: "#fc945a",
    action: "Practice",
  },
  {
    name: "Education",
    mastered: 45,
    total: 60,
    chipBg: "rgba(124,110,249,0.16)",
    chipText: "#5d52bb",
    progressColor: "#7c6ef9",
    action: "Practice",
  },
  {
    name: "Technology",
    mastered: 12,
    total: 68,
    chipBg: "rgba(249,107,139,0.16)",
    chipText: "#bb5068",
    progressColor: "#f96b8b",
    action: "Practice",
  },
  {
    name: "Health & medicine",
    mastered: 0,
    total: 75,
    chipBg: "rgba(22,155,134,0.16)",
    chipText: "#107464",
    progressColor: "#169b86",
    action: "Practice",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCardItem = ({ stat }: { stat: StatCard }) => (
  <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] flex-1 min-w-0 flex flex-col gap-[4px] p-[22px]">
    <p className="font-display font-bold text-[26px] leading-normal text-[#191d24] whitespace-nowrap">
      {stat.value}
    </p>
    <p className="font-inter font-normal text-[13px] leading-normal text-[#6a7282] whitespace-nowrap">
      {stat.label}
    </p>
    <div
      className="h-[4px] w-[36px] rounded-[3px] mt-[2px]"
      style={{ backgroundColor: stat.accentColor }}
    />
  </div>
);

const WordSetCard = ({ set }: { set: WordSet }) => {
  const progressPct = set.total > 0 ? (set.mastered / set.total) * 100 : 0;

  return (
    <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] flex-1 min-w-0 flex flex-col gap-[14px] p-[24px]">
      {/* "Aa" chip */}
      <div
        className="flex items-center justify-center rounded-[12px] size-[44px] shrink-0"
        style={{ backgroundColor: set.chipBg }}
      >
        <span
          className="font-inter font-bold text-[16px] leading-normal"
          style={{ color: set.chipText }}
        >
          Aa
        </span>
      </div>

      {/* Title + subtitle */}
      <div className="flex flex-col gap-[4px] w-full">
        <p className="font-display font-bold text-[18px] leading-normal text-[#191d24]">
          {set.name}
        </p>
        <p className="font-inter font-normal text-[13px] leading-normal text-[#6a7282]">
          {set.mastered} of {set.total} mastered
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-[#f6f7f4] rounded-full h-[8px] w-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${progressPct}%`,
            backgroundColor: set.progressColor,
            minWidth: progressPct > 0 ? "4px" : "0",
          }}
        />
      </div>

      {/* Action button */}
      <button className="self-start border-[1.5px] border-[rgba(25,29,36,0.1)] rounded-full bg-white px-[18px] py-[10px] font-inter font-bold text-[13px] leading-normal text-[#191d24] hover:bg-[#f6f7f4] transition-colors">
        {set.action}
      </button>
    </div>
  );
};

// ─── Page component ───────────────────────────────────────────────────────────

export const PageVocabulary = () => {
  const row1 = WORD_SETS.slice(0, 3);
  const row2 = WORD_SETS.slice(3, 6);

  return (
    <div className="flex flex-col gap-[28px]">
      {/* Page heading */}
      <div className="flex flex-col gap-[6px]">
        <h1 className="font-display font-bold text-[26px] leading-normal text-[#191d24]">
          Vocabulary
        </h1>
        <p className="font-inter font-normal text-[15px] leading-normal text-[#6a7282]">
          Build the academic word power examiners reward.
        </p>
      </div>

      {/* Stat cards */}
      <div className="flex gap-[20px]">
        {STAT_CARDS.map((stat) => (
          <StatCardItem key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Review CTA */}
      <div className="bg-[#b3e653] rounded-[24px] flex items-center justify-between gap-[24px] px-[32px] py-[24px]">
        <div className="flex flex-col gap-[4px] flex-1 min-w-0">
          <p className="font-display font-bold text-[20px] leading-normal text-[#191d24]">
            48 words are due for review
          </p>
          <p className="font-inter font-medium text-[14px] leading-normal text-[#33421a]">
            A quick 10-minute session keeps them in long-term memory.
          </p>
        </div>
        <button className="shrink-0 bg-[#191d24] text-white font-inter font-bold text-[14px] leading-normal rounded-full px-[24px] py-[14px] hover:bg-[#2d3142] transition-colors whitespace-nowrap">
          Review now
        </button>
      </div>

      {/* Word sets section header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-[18px] leading-normal text-[#191d24]">
          Your word sets
        </h2>
        <button className="font-inter font-semibold text-[14px] leading-normal text-[#9ad534] hover:text-[#b3e653] transition-colors">
          Browse all
        </button>
      </div>

      {/* Word sets grid */}
      <div className="flex flex-col gap-[20px]">
        {/* Row 1 */}
        <div className="flex gap-[20px]">
          {row1.map((set) => (
            <WordSetCard key={set.name} set={set} />
          ))}
        </div>
        {/* Row 2 */}
        <div className="flex gap-[20px]">
          {row2.map((set) => (
            <WordSetCard key={set.name} set={set} />
          ))}
        </div>
      </div>
    </div>
  );
};

PageVocabulary.Layout = AppShell;
