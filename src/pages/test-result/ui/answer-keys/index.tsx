import { ScoreResult } from "@/shared/lib/calculateScore";
import parse from "html-react-parser";

// Strip fill-history-correct span wrappers, keep inner text
const removeFillHistoryCorrectTags = (text: string | undefined): string => {
  if (!text) return "";
  let cleaned = String(text);
  cleaned = cleaned.replace(
    /<span[^>]*class\s*=\s*["']?[^"'>]*fill-history-correct[^"'>]*["']?[^>]*>(.*?)<\/span>/gi,
    "$1",
  );
  cleaned = cleaned.replace(
    /<span[^>]*class\s*=\s*["']?[^"'>]*fill-history-correct[^"'>]*["']?[^>]*>(.*?)<\/span>/gi,
    "$1",
  );
  return cleaned;
};

type QuestionChip = {
  number: number;
  status: "correct" | "incorrect" | "skipped";
};

function AnswerKeys({
  data,
  skill,
}: {
  data: ScoreResult;
  skill: "listening" | "reading";
}) {
  // Build a flat ordered list of all question chips
  const chips: QuestionChip[] = [];
  Object.values(data.details).forEach((part) => {
    const startingNum = parseInt(part.questionRange.match(/\d+/)?.[0] || "1", 10);
    part.details.forEach((q, idx) => {
      const isMissed = !q.userAnswer || String(q.userAnswer).trim() === "";
      chips.push({
        number: startingNum + idx,
        status: q.correct ? "correct" : isMissed ? "skipped" : "incorrect",
      });
    });
  });

  // Per-part detail rows (below the chips grid)
  const partLabel = skill === "listening" ? "Part" : "Passage";

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Header row with legend */}
      <div className="flex items-center justify-between">
        <p className="font-display font-bold text-[18px] text-[#191d24]">
          Answer key
        </p>
        <div className="flex gap-[18px] items-center">
          <div className="flex gap-[6px] items-center">
            <span className="w-[12px] h-[12px] rounded-[4px] bg-[#b3e653] shrink-0" />
            <span className="font-inter font-medium text-[13px] text-[#6a7282]">Correct</span>
          </div>
          <div className="flex gap-[6px] items-center">
            <span className="w-[12px] h-[12px] rounded-[4px] bg-[#f96b8b] shrink-0" />
            <span className="font-inter font-medium text-[13px] text-[#6a7282]">Incorrect</span>
          </div>
          <div className="flex gap-[6px] items-center">
            <span className="w-[12px] h-[12px] rounded-[4px] bg-[#d9dee5] shrink-0" />
            <span className="font-inter font-medium text-[13px] text-[#6a7282]">Skipped</span>
          </div>
        </div>
      </div>

      {/* Q-number chip grid */}
      <div className="flex flex-wrap gap-[10px]">
        {chips.map((chip) => {
          const bg =
            chip.status === "correct"
              ? "bg-[#b3e653]"
              : chip.status === "incorrect"
                ? "bg-[#f96b8b]"
                : "bg-[#d9dee5]";
          const textColor =
            chip.status === "incorrect"
              ? "text-white"
              : "text-[#191d24]";
          return (
            <div
              key={chip.number}
              className={`${bg} ${textColor} flex items-center justify-center rounded-[10px] w-[40px] h-[40px] font-inter font-bold text-[13px] shrink-0`}
            >
              {chip.number}
            </div>
          );
        })}
      </div>

      {/* Per-part detailed answer list */}
      {Object.entries(data.details).map(([key, part]) => {
        const startingNum = parseInt(part.questionRange.match(/\d+/)?.[0] || "1", 10);
        return (
          <div key={key} className="flex flex-col gap-[12px] pt-[4px]">
            <p className="font-inter font-semibold text-[14px] text-[#191d24] border-t border-[#e5e6e8] pt-[14px]">
              {partLabel} {Number(key) + 1} — {part.questionRange}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {part.details.map((q, idx) => {
                const qNum = startingNum + idx;
                const isMissed = !q.userAnswer || String(q.userAnswer).trim() === "";
                const isCorrect = q.correct;
                const isIncorrect = !isCorrect && !isMissed;

                const numBg = isCorrect
                  ? "bg-[#b3e653] text-[#191d24]"
                  : isIncorrect
                    ? "bg-[#f96b8b] text-white"
                    : "bg-[#d9dee5] text-[#191d24]";

                return (
                  <div key={idx} className="flex items-start gap-[10px]">
                    {/* Q number chip */}
                    <span
                      className={`${numBg} shrink-0 w-[26px] h-[26px] mt-0.5 rounded-[6px] flex items-center justify-center font-inter font-bold text-[12px]`}
                    >
                      {qNum}
                    </span>
                    {/* Answer text */}
                    <div className="text-[14px] font-inter leading-relaxed min-w-0">
                      {isCorrect ? (
                        <span className="text-[#191d24] font-medium [&_p]:inline [&_div]:inline">
                          {parse(removeFillHistoryCorrectTags(q.userAnswer ?? ""))}
                        </span>
                      ) : (
                        <>
                          <span
                            className={[
                              "[&_p]:inline [&_div]:inline font-medium",
                              isMissed ? "text-[#6a7282]" : "text-[#f96b8b]",
                            ].join(" ")}
                          >
                            {isMissed
                              ? "Skipped"
                              : parse(removeFillHistoryCorrectTags(q.userAnswer ?? ""))}
                          </span>
                          <span className="text-[#d9dee5] mx-[6px]">→</span>
                          <span className="text-[#b3e653] font-semibold [&_p]:inline [&_div]:inline">
                            {parse(removeFillHistoryCorrectTags(q.answer))}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AnswerKeys;
