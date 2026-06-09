// === PAGE: Student Dashboard ===
// Figma node 3336:1742 "09 · Dashboard — Logged in"
// Layout: greeting top-bar, stat cards, resume card, target score, practice history, study streak
import { TargetScore, PracticeHistory } from "@/widgets";
import { StudyStreak } from "@/widgets/study-streak";
import { AppShell } from "@/widgets/layouts";
import { DashboardStats } from "./dashboard-stats";
import { useWidgetContext, WidgetContextProvider } from "@/widgets/target-score/context";
import { useStreakData } from "@/widgets/study-streak/hooks/useStreakData";
import { useAuth } from "@/appx/providers";
import { useMemo } from "react";
import { roundIELTSScore } from "@/shared/lib/ielts-round";

// Inner component that reads from contexts
const DashboardInner = () => {
  const { targetScore, loading: targetLoading } = useWidgetContext();
  const { summary } = useStreakData();
  const { currentUser } = useAuth();

  const firstName = useMemo(() => {
    const name = currentUser?.name || "";
    return name.split(" ").at(-1) || "bạn";
  }, [currentUser]);

  const currentBand = useMemo(() => {
    if (
      targetScore.listening == null ||
      targetScore.reading == null ||
      targetScore.speaking == null ||
      targetScore.writing == null
    ) {
      return null;
    }
    const avg =
      (Number(targetScore.listening) +
        Number(targetScore.reading) +
        Number(targetScore.speaking) +
        Number(targetScore.writing)) /
      4;
    return roundIELTSScore(avg).toFixed(1);
  }, [targetScore]);

  return (
    <div className="space-y-8" data-section="dashboard-main">

      {/* === SECTION: Greeting Top Bar === */}
      {/* Figma node 3346:163 "Top Bar" */}
      <section data-section="dashboard-greeting">
        <h1 className="font-display font-bold text-[26px] tracking-[-0.52px] text-[#191d24] leading-none">
          Welcome back, {firstName}
        </h1>
        {summary.currentStreak > 0 && (
          <p className="mt-1.5 font-inter font-normal text-[15px] text-[#6a7282]">
            {`You're on a ${summary.currentStreak}-day streak — keep it going.`}
          </p>
        )}
      </section>

      {/* === SECTION: Statistics Row === */}
      {/* Figma node 3346:166 "Stat Cards" — 4 cards */}
      <DashboardStats
        currentBand={targetLoading ? null : currentBand}
        studyStreakDays={summary.currentStreak}
      />

      {/* === SECTION: Target Score + Exam Schedule === */}
      {/* Figma: 2-col equal cards, each white, rounded-xl */}
      <TargetScore />

      {/* === SECTION: Practice History Table === */}
      {/* Full width, tabs + table */}
      <section data-section="dashboard-practice-history">
        <PracticeHistory />
      </section>

      {/* === SECTION: Study Streak Calendar === */}
      {/* Figma: streak summary cards + calendar/weekly toggle */}
      <section data-section="dashboard-streak">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-[20px] text-[#191d24]">
            Biểu đồ chăm chỉ
          </h2>
        </div>
        <StudyStreak />
      </section>

    </div>
  );
};

export const PageDashboard = () => {
  return (
    <WidgetContextProvider>
      <DashboardInner />
    </WidgetContextProvider>
  );
};

PageDashboard.Layout = AppShell;
