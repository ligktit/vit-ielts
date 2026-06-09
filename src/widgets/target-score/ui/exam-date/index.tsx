// === ExamDate — Exam schedule widget ===
// Figma: white card, header (calendar icon + title) + 2 info slots (date + days left)
import { useMemo, useState } from "react";
import { SetExamDateModal } from "../set-exam-date-modal";
import { useWidgetContext } from "../../context";
import dayjs from "dayjs";

export const ExamDate = () => {
  const {
    targetScore: { examDate },
    loading,
    refetch,
  } = useWidgetContext();
  const [isSetExamDateDialogOpen, setIsSetExamDateDialogOpen] = useState(false);

  const parseDate = (date: string | null) => {
    if (date) {
      const d = dayjs(date);
      return `${String(d.date()).padStart(2, "0")}/${String(d.month() + 1).padStart(2, "0")}/${d.year()}`;
    }
    return "— / — / —";
  };

  const daysLeft = useMemo(() => {
    if (!examDate) return null;
    const days = dayjs(examDate).diff(dayjs(), "day");
    const sign = days >= 0 ? "" : "-";
    return `${sign}${Math.abs(days)} days left`;
  }, [examDate]);

  return (
    <div className="h-full flex flex-col">
      <SetExamDateModal
        open={isSetExamDateDialogOpen}
        onCancel={() => setIsSetExamDateDialogOpen(false)}
        onOk={() => {
          setIsSetExamDateDialogOpen(false);
          refetch();
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#e5e6e8]">
        <span className="material-symbols-rounded text-[20px] text-[#191d24] shrink-0">
          calendar_month
        </span>
        <h3 className="font-inter font-bold text-[15px] text-[#191d24]">
          Exam schedule
        </h3>
      </div>

      {/* Content */}
      <div className="p-5 flex-1">
        <div className="grid grid-cols-2 gap-3">
          {/* Exam date slot */}
          <button
            type="button"
            onClick={() => setIsSetExamDateDialogOpen(true)}
            className="flex flex-col gap-2 p-4 rounded-[12px] bg-white border border-[#e5e6e8] hover:border-[#b3e653] transition-colors text-left cursor-pointer"
          >
            <p className="font-inter font-medium text-[11px] text-[#6a7282] leading-none">
              Exam date
            </p>
            <div className="flex items-center justify-between mt-2">
              <p className="font-display font-bold text-[18px] text-[#191d24] leading-none">
                {loading ? parseDate(null) : parseDate(examDate)}
              </p>
              <span className="material-symbols-rounded text-[#6a7282] text-[16px]">
                edit
              </span>
            </div>
          </button>

          {/* Days remaining slot */}
          <div className="flex flex-col gap-2 p-4 rounded-[12px] bg-white border border-[#e5e6e8]">
            <p className="font-inter font-medium text-[11px] text-[#6a7282] leading-none">
              Days remaining
            </p>
            <p className="font-display font-bold text-[22px] text-[#191d24] leading-none mt-2">
              {loading ? "—" : daysLeft || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
