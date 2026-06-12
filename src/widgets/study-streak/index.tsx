// === Widget: Study Streak ===
// Figma: 4 summary stat cards + white card with DS Tabs toggle (calendar/weekly) + skill breakdown + calendar/weekly view
// DS Tabs replaces antd Segmented; antd Spin kept for loading behaviour
import { Spin } from "antd";
import { useState } from "react";
import { useStreakData } from "./hooks/useStreakData";
import {
  StreakSummaryCards,
  StreakCalendar,
  WeeklyStats,
  SkillBreakdown,
} from "./ui";
import { Tabs } from "@/shared/ui/ds/molecules/tabs";
import type { TabItem } from "@/shared/ui/ds/molecules/tabs";

type ViewMode = "calendar" | "weekly";

const VIEW_TABS: TabItem[] = [
  { id: "calendar", label: "Monthly" },
  { id: "weekly", label: "Weekly" },
];

export const StudyStreak = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  const {
    loading,
    summary,
    activities,
    calendarWeeks,
    currentMonth,
    skillTotals,
    goToPrevMonth,
    goToNextMonth,
    goToCurrentMonth,
  } = useStreakData();

  return (
    <div data-section="study-streak">
      {/* Summary stat cards */}
      <StreakSummaryCards summary={summary} loading={loading} />

      {/* Main card: toggle + skill breakdown + calendar/weekly view */}
      <div className="bg-white rounded-[20px] border border-[rgba(25,29,36,0.08)] shadow-[0px_6px_18px_0px_rgba(0,0,0,0.05)] overflow-x-auto">
        <div className="px-6 py-5">
          {/* View toggle using DS Tabs */}
          <div className="mb-5">
            <Tabs
              tabs={VIEW_TABS}
              activeId={viewMode}
              onChange={(id) => setViewMode(id as ViewMode)}
            />
          </div>

          {/* Skill breakdown bar */}
          <div className="mb-5">
            <SkillBreakdown skillTotals={skillTotals} />
          </div>

          {/* Main content */}
          <Spin spinning={loading}>
            {viewMode === "calendar" ? (
              <StreakCalendar
                weeks={calendarWeeks}
                currentMonth={currentMonth}
                onPrevMonth={goToPrevMonth}
                onNextMonth={goToNextMonth}
                onToday={goToCurrentMonth}
                loading={loading}
              />
            ) : (
              <WeeklyStats
                weeks={calendarWeeks}
                activities={activities}
                currentMonth={currentMonth}
              />
            )}
          </Spin>
        </div>
      </div>
    </div>
  );
};
