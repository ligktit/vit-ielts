// === Widget: Target Score + Exam Schedule ===
// Figma: 2-col equal cards (TargetScore + ExamDate), gap 24px, desktop side-by-side; mobile stacked
// Each is a white card with rounded-[20px], border, shadow
// WidgetContextProvider wraps here so this widget works standalone (home page)
// AND when the dashboard wraps an outer provider (DashboardInner reads from the outer one).
import { WidgetContextProvider } from "./context";
import { DetailScore, ExamDate } from "./ui";

export const TargetScore = () => {
  return (
    <WidgetContextProvider>
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        data-section="target-score"
      >
        {/* My IELTS score target card */}
        <div className="bg-white rounded-[20px] border border-[rgba(25,29,36,0.08)] shadow-[0px_6px_18px_0px_rgba(0,0,0,0.05)] overflow-hidden">
          <DetailScore />
        </div>

        {/* Exam schedule card */}
        <div className="bg-white rounded-[20px] border border-[rgba(25,29,36,0.08)] shadow-[0px_6px_18px_0px_rgba(0,0,0,0.05)] overflow-hidden">
          <ExamDate />
        </div>
      </div>
    </WidgetContextProvider>
  );
};
