// === StreakSummaryCards — Study streak stat cards ===
// Figma: same card pattern as DashboardStats — white bg, border, rounded-[24px], shadow
// Icon slot (44px, tinted bg, rounded-[12px]) + label; right: value (Be Vietnam Pro Bold 24px) + optional trend
import type { StreakSummary } from "../api";

type Props = {
  summary: StreakSummary;
  loading: boolean;
};

const STATS = [
  {
    key: "currentStreak" as const,
    iconClass: "material-symbols-rounded",
    iconContent: "local_fire_department",
    iconTint: "rgba(252,148,89,0.16)",
    iconColor: "#fc945a",
    label: "Current streak",
    unit: "days",
  },
  {
    key: "longestStreak" as const,
    iconClass: "material-symbols-rounded",
    iconContent: "emoji_events",
    iconTint: "rgba(82,129,249,0.16)",
    iconColor: "#5281f9",
    label: "Longest streak",
    unit: "days",
  },
  {
    key: "totalDays" as const,
    iconClass: "material-symbols-rounded",
    iconContent: "calendar_today",
    iconTint: "rgba(179,230,83,0.16)",
    iconColor: "#9ad534",
    label: "Total days",
    unit: "days",
  },
  {
    key: "monthDays" as const,
    iconClass: "material-symbols-rounded",
    iconContent: "calendar_month",
    iconTint: "rgba(140,115,242,0.16)",
    iconColor: "#7c6ef9",
    label: "This month",
    unit: "days",
  },
];

export const StreakSummaryCards = ({ summary, loading }: Props) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[19px] mb-6">
      {STATS.map((stat) => (
        <div
          key={stat.key}
          className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] shadow-[0px_6px_18px_0px_rgba(0,0,0,0.05)] p-[22px] flex items-end justify-between min-w-0 overflow-hidden"
        >
          {/* Left: icon + label */}
          <div className="flex flex-col gap-[10px] items-start shrink-0">
            <div
              className="flex items-center justify-center rounded-[12px] size-[44px] shrink-0"
              style={{ backgroundColor: stat.iconTint }}
            >
              <span
                className={stat.iconClass}
                style={{ color: stat.iconColor, fontSize: 22 }}
              >
                {stat.iconContent}
              </span>
            </div>
            <p className="font-inter font-medium text-[13px] text-[#6a7282] leading-normal">
              {stat.label}
            </p>
          </div>

          {/* Right: value */}
          <div className="flex flex-col gap-[4px] items-end shrink-0 text-right">
            <p className="font-display font-bold text-[24px] tracking-[-0.48px] text-[#191d24] leading-normal">
              {loading ? "—" : `${summary[stat.key]} ${stat.unit}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
