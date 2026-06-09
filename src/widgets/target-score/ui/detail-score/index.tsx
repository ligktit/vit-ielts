// === DetailScore — My IELTS score target ===
// Figma: card header (icon + title) + grid of 5 score slots (Overall, L, R, S, W)
// Overall slot: primary-tint bg, edit icon; skill slots: white bg, border
import { useMemo, useState } from "react";
import { useWidgetContext } from "../../context";
import { SetTargetScoreModal } from "@/widgets/target-score/ui";
import _ from "lodash";
import { roundIELTSScore } from "@/shared/lib/ielts-round";

export const DetailScore = () => {
  const [isSetTargetScoreDialogOpen, setIsSetTargetScoreDialogOpen] =
    useState(false);
  const { targetScore, loading, refetch } = useWidgetContext();

  const overallScore = useMemo(() => {
    if (
      targetScore.listening == null ||
      targetScore.reading == null ||
      targetScore.speaking == null ||
      targetScore.writing == null
    ) {
      return "—";
    }

    const avg =
      (Number(targetScore.listening) +
        Number(targetScore.reading) +
        Number(targetScore.speaking) +
        Number(targetScore.writing)) /
      4;

    return roundIELTSScore(avg).toFixed(1);
  }, [targetScore]);

  const skills = ["Listening", "Reading", "Speaking", "Writing"] as const;

  return (
    <div className="h-full flex flex-col">
      <SetTargetScoreModal
        open={isSetTargetScoreDialogOpen}
        onCancel={() => setIsSetTargetScoreDialogOpen(false)}
        onOk={() => {
          setIsSetTargetScoreDialogOpen(false);
          refetch();
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#e5e6e8]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={20}
          height={20}
          viewBox="0 0 16 16"
          fill="none"
          className="text-[#191d24] shrink-0"
        >
          <path
            d="M11.3346 8C11.3346 9.84095 9.84225 11.3333 8.0013 11.3333C6.16035 11.3333 4.66797 9.84095 4.66797 8C4.66797 6.15906 6.16035 4.66667 8.0013 4.66667"
            stroke="currentColor"
            strokeLinecap="round"
          />
          <path
            d="M9.33398 1.46669C8.90317 1.37924 8.45727 1.33334 8.00065 1.33334C4.31875 1.33334 1.33398 4.3181 1.33398 8C1.33398 11.6819 4.31875 14.6667 8.00065 14.6667C11.6825 14.6667 14.6673 11.6819 14.6673 8C14.6673 7.54338 14.6214 7.09748 14.534 6.66667"
            stroke="currentColor"
            strokeLinecap="round"
          />
          <path
            d="M11.0688 4.93125L8 8M11.0688 4.93125L10.8521 4.10086C10.688 3.47181 10.9126 2.7461 11.4324 2.2263L12.1987 1.46004C12.4027 1.25601 12.7186 1.30646 12.783 1.55338L13.1273 2.87275L14.4466 3.21699C14.6935 3.28141 14.744 3.59728 14.54 3.80131L13.7737 4.56757C13.2539 5.08737 12.5282 5.31204 11.8991 5.14791L11.0688 4.93125Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3 className="font-inter font-bold text-[15px] text-[#191d24]">
          My IELTS score target
        </h3>
      </div>

      {/* Score grid */}
      <div className="p-5 flex-1">
        <div className="grid grid-cols-5 gap-2">
          {/* Overall score slot */}
          <button
            type="button"
            onClick={() => setIsSetTargetScoreDialogOpen(true)}
            className="col-span-1 flex flex-col gap-2 p-3 rounded-[12px] bg-[#f2fadd] hover:bg-[#e9f6d4] transition-colors text-left cursor-pointer"
          >
            <p className="font-inter font-medium text-[11px] text-[#6a7282] leading-none">
              Overall
            </p>
            <div className="flex items-center justify-between mt-auto">
              <p className="font-display font-bold text-[20px] text-[#191d24] leading-none">
                {loading ? "—" : overallScore}
              </p>
              <span className="material-symbols-rounded text-[#6a7282] text-[16px]">
                edit
              </span>
            </div>
          </button>

          {/* Skill score slots */}
          {skills.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => setIsSetTargetScoreDialogOpen(true)}
              className="col-span-1 flex flex-col gap-2 p-3 rounded-[12px] bg-white border border-[#e5e6e8] hover:border-[#b3e653] transition-colors text-left cursor-pointer"
            >
              <p className="font-inter font-medium text-[11px] text-[#6a7282] leading-none">
                {_.capitalize(skill)}
              </p>
              <p className="font-display font-bold text-[20px] text-[#191d24] leading-none mt-auto">
                {loading
                  ? "—"
                  : targetScore[skill.toLowerCase() as keyof typeof targetScore] != null
                    ? Number(targetScore[skill.toLowerCase() as keyof typeof targetScore]).toFixed(1)
                    : "—"}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
