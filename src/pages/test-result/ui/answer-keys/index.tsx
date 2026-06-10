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

  const partLabel = skill === "listening" ? "Part" : "Passage";

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Header row with legend */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="font-display font-bold text-title-m text-ink-900">
          Answer key
        </p>
        <div className="flex gap-[18px] items-center">
          <div className="flex gap-1.5 items-center">
            <span className="w-3 h-3 rounded-[4px] bg-brand shrink-0" />
            <span className="font-body font-medium text-[13px] text-ink-muted">Correct</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <span className="w-3 h-3 rounded-[4px] bg-accent-rose shrink-0" />
            <span className="font-body font-medium text-[13px] text-ink-muted">Incorrect</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <span className="w-3 h-3 rounded-[4px] bg-border-hairline shrink-0" />
            <span className="font-body font-medium text-[13px] text-ink-muted">Skipped</span>
          </div>
        </div>
      </div>

      {/* Q-number chip grid */}
      <div className="flex flex-wrap gap-2.5">
        {chips.map((chip) => {
          const bgClass =
            chip.status === "correct"
              ? "bg-brand"
              : chip.status === "incorrect"
                ? "bg-accent-rose"
                : "bg-border-hairline";
          const textClass =
            chip.status === "incorrect"
              ? "text-white"
              : "text-ink-900";
          return (
            <div
              key={chip.number}
              className={`${bgClass} ${textClass} flex items-center justify-center rounded-[10px] w-10 h-10 font-body font-bold text-[13px] shrink-0`}
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
          <div key={key} className="flex flex-col gap-3 pt-1">
            <p className="font-body font-semibold text-body-s text-ink-900 border-t border-border-hairline pt-3.5">
              {partLabel} {Number(key) + 1} — {part.questionRange}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {part.details.map((q, idx) => {
                const qNum = startingNum + idx;
                const isMissed = !q.userAnswer || String(q.userAnswer).trim() === "";
                const isCorrect = q.correct;
                const isIncorrect = !isCorrect && !isMissed;

                const numBgClass = isCorrect
                  ? "bg-brand text-ink-900"
                  : isIncorrect
                    ? "bg-accent-rose text-white"
                    : "bg-border-hairline text-ink-900";

                return (
                  <div key={idx} className="flex items-start gap-2.5">
                    {/* Q number chip */}
                    <span
                      className={`${numBgClass} shrink-0 w-[26px] h-[26px] mt-0.5 rounded-[6px] flex items-center justify-center font-body font-bold text-[12px]`}
                    >
                      {qNum}
                    </span>
                    {/* Answer text */}
                    <div className="text-body-s font-body leading-relaxed min-w-0">
                      {isCorrect ? (
                        <span className="text-ink-900 font-medium [&_p]:inline [&_div]:inline">
                          {parse(removeFillHistoryCorrectTags(q.userAnswer ?? ""))}
                        </span>
                      ) : (
                        <>
                          <span
                            className={[
                              "[&_p]:inline [&_div]:inline font-medium",
                              isMissed ? "text-ink-muted" : "text-accent-rose",
                            ].join(" ")}
                          >
                            {isMissed
                              ? "Skipped"
                              : parse(removeFillHistoryCorrectTags(q.userAnswer ?? ""))}
                          </span>
                          <span className="text-border-hairline mx-1.5">→</span>
                          <span className="text-brand font-semibold [&_p]:inline [&_div]:inline">
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
