import { AppShell } from "@/widgets/layouts";

// ─── Data ─────────────────────────────────────────────────────────────────────

const STAT_CARDS = [
  {
    icon: "trophy",
    iconBg: "rgba(179,230,83,0.16)",
    iconColor: "#b3e653",
    value: "7.0",
    label: "Overall band",
    sub: "+0.5 this month",
  },
  {
    icon: "assignment",
    iconBg: "rgba(82,129,249,0.16)",
    iconColor: "#5281f9",
    value: "42",
    label: "Tests taken",
    sub: "8 this week",
  },
  {
    icon: "calendar_today",
    iconBg: "rgba(252,148,89,0.16)",
    iconColor: "#fc945a",
    value: "6 days",
    label: "Study streak",
    sub: "Personal best",
  },
  {
    icon: "schedule",
    iconBg: "rgba(124,110,249,0.16)",
    iconColor: "#7c6ef9",
    value: "68h",
    label: "Study time",
    sub: "12h this week",
  },
] as const;

// Bar heights (px) from Figma: W1–W6 are muted, W7–W8 are green
const BAND_BARS: { week: string; height: number; active: boolean }[] = [
  { week: "W1", height: 46, active: false },
  { week: "W2", height: 46, active: false },
  { week: "W3", height: 82, active: false },
  { week: "W4", height: 82, active: false },
  { week: "W5", height: 118, active: false },
  { week: "W6", height: 118, active: false },
  { week: "W7", height: 154, active: true },
  { week: "W8", height: 154, active: true },
];

// skill score out of 9 → flex ratio out of 90
const SKILLS = [
  { name: "Listening", score: 7.5, color: "#5281f9" },
  { name: "Reading", score: 7.0, color: "#b3e653" },
  { name: "Writing", score: 6.5, color: "#fc945a" },
  { name: "Speaking", score: 6.5, color: "#7c6ef9" },
] as const;

const RECENT_TESTS = [
  { title: "Cambridge 18 — Reading Test 1", meta: "Reading · 5 Jun 2026", band: "Band 7.0", last: false },
  { title: "Cambridge 17 — Listening Test 3", meta: "Listening · 3 Jun 2026", band: "Band 7.5", last: false },
  { title: "Cambridge 19 — Writing Task 2", meta: "Writing · 1 Jun 2026", band: "Band 6.5", last: false },
  { title: "Cambridge 16 — Reading Test 2", meta: "Reading · 28 May 2026", band: "Band 6.5", last: true },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  sub,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  sub: string;
}) => (
  <div className="flex-1 min-w-0 bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] p-[22px] flex flex-col gap-[10px]">
    <div
      className="flex items-center justify-center rounded-[12px] shrink-0 w-[42px] h-[42px]"
      style={{ background: iconBg }}
    >
      <span
        className="material-symbols-rounded text-[22px] leading-none"
        style={{ color: iconColor }}
      >
        {icon}
      </span>
    </div>
    <div className="flex flex-col gap-[2px]">
      <p className="font-display font-bold text-[24px] text-[#191d24] leading-none">{value}</p>
      <p className="font-inter font-normal text-[13px] text-[#6a7282] leading-normal">{label}</p>
      <p className="font-inter font-semibold text-[12px] text-[#9ad534] leading-normal">{sub}</p>
    </div>
  </div>
);

const SkillBar = ({
  name,
  score,
  color,
}: {
  name: string;
  score: number;
  color: string;
}) => {
  // score / 9 gives the fill ratio; remaining = (9 - score) / 9
  const filled = Math.round((score / 9) * 100);
  const remaining = 100 - filled;
  return (
    <div className="flex flex-col gap-[8px] w-full">
      <div className="flex items-center justify-between w-full">
        <span className="font-inter font-semibold text-[15px] text-[#191d24]">{name}</span>
        <span className="font-inter font-bold text-[14px] text-[#191d24]">{score}</span>
      </div>
      <div className="bg-[#e5ebe0] flex h-[10px] items-center overflow-hidden rounded-full w-full">
        <div
          className="h-full rounded-full shrink-0"
          style={{ width: `${filled}%`, background: color }}
        />
        <div className="h-full" style={{ width: `${remaining}%` }} />
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export const PageMyProgress = () => {
  return (
    <div className="space-y-[28px]">

      {/* ── Top bar ── */}
      <div>
        <h1 className="font-display font-bold text-[26px] tracking-[-0.52px] text-[#191d24] leading-none">
          My Progress
        </h1>
        <p className="mt-[6px] font-inter font-normal text-[15px] text-[#6a7282]">
          Track your bands, skills and study habits over time.
        </p>
      </div>

      {/* ── Stat cards row ── */}
      <div className="flex gap-[20px] items-stretch">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* ── Analytics row: Band trend + By skill ── */}
      <div className="flex gap-[20px] items-stretch">

        {/* Band trend */}
        <div className="flex-1 min-w-0 bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] p-[26px] flex flex-col gap-[6px]">
          <p className="font-display font-bold text-[18px] text-[#191d24] leading-none whitespace-nowrap">
            Band trend
          </p>
          <p className="font-inter font-normal text-[13px] text-[#6a7282] whitespace-nowrap">
            Estimated band over the last 8 weeks
          </p>
          {/* Chart */}
          <div className="flex gap-[16px] items-end pt-[24px]">
            {BAND_BARS.map(({ week, height, active }) => (
              <div key={week} className="flex-1 min-w-0 flex flex-col gap-[8px] items-center justify-end">
                <div
                  className="rounded-[8px] w-[40px] shrink-0"
                  style={{
                    height: `${height}px`,
                    background: active ? "#b3e653" : "#d9e0cf",
                  }}
                />
                <p className="font-inter font-medium text-[11px] text-[#6a7282] whitespace-nowrap">
                  {week}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* By skill */}
        <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] p-[26px] flex flex-col gap-[16px] shrink-0 w-[380px]">
          <p className="font-display font-bold text-[18px] text-[#191d24] leading-none whitespace-nowrap">
            By skill
          </p>
          {SKILLS.map((skill) => (
            <SkillBar key={skill.name} name={skill.name} score={skill.score} color={skill.color} />
          ))}
        </div>

      </div>

      {/* ── Recent tests ── */}
      <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] p-[26px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-[8px]">
          <p className="font-display font-bold text-[18px] text-[#191d24] whitespace-nowrap">
            Recent tests
          </p>
          <button className="font-inter font-semibold text-[14px] text-[#9ad534] hover:text-[#b3e653] transition-colors">
            View all
          </button>
        </div>

        {/* Rows */}
        {RECENT_TESTS.map(({ title, meta, band, last }) => (
          <div
            key={title}
            className={`flex items-center justify-between py-[14px] ${last ? "" : "border-b border-[rgba(25,29,36,0.1)]"}`}
          >
            <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
              <p className="font-inter font-semibold text-[15px] text-[#191d24] whitespace-nowrap">
                {title}
              </p>
              <p className="font-inter font-normal text-[13px] text-[#6a7282] whitespace-nowrap">
                {meta}
              </p>
            </div>
            <div className="bg-[#b3e653] flex items-center justify-center px-[14px] py-[6px] rounded-full shrink-0">
              <p className="font-inter font-bold text-[13px] text-[#191d24] whitespace-nowrap">
                {band}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

PageMyProgress.Layout = AppShell;
