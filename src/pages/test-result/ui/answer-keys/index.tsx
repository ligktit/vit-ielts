import { ScoreResult } from "@/shared/lib/calculateScore";
import _ from "lodash";
import { twMerge } from "tailwind-merge";
import parse from "html-react-parser";

// Hàm helper để loại bỏ thẻ span với class fill-history-correct
const removeFillHistoryCorrectTags = (text: string | undefined): string => {
  if (!text) return "";
  let cleanedText = String(text);
  // Loại bỏ các thẻ span với class fill-history-correct, chỉ giữ lại nội dung bên trong
  cleanedText = cleanedText.replace(
    /<span[^>]*class\s*=\s*["']?[^"'>]*fill-history-correct[^"'>]*["']?[^>]*>(.*?)<\/span>/gi,
    "$1"
  );
  // Xử lý thêm trường hợp nested spans
  cleanedText = cleanedText.replace(
    /<span[^>]*class\s*=\s*["']?[^"'>]*fill-history-correct[^"'>]*["']?[^>]*>(.*?)<\/span>/gi,
    "$1"
  );
  return cleanedText;
};

function AnswerKeys({
  data,
  skill,
}: {
  data: ScoreResult;
  skill: "listening" | "reading";
}) {
  const partLabel = skill === "listening" ? "Part" : "Passage";

  return (
    <div className="space-y-6">
      <h3 className="flex items-center text-lg sm:text-2xl font-semibold text-[#374151] space-x-2">
        <span className="material-symbols-rounded sm:text-4xl!">lightbulb</span>
        <span>Answer Keys:</span>
      </h3>
      {Object.entries(data.details).map(([key, part]) => {
        // Lấy số thứ tự câu hỏi bắt đầu
        const startingQuestionNumber = parseInt(part.questionRange.match(/\d+/)?.[0] || '1', 10);

        // Dùng trực tiếp part.details vì calculateScore trả về mảng đã flatten
        const flattenedDetails = part.details;

        return (
          <div key={key} className="space-y-4">
            <h4 className="text-base font-semibold text-[#374151]">
              {partLabel} {Number(key) + 1}: {part.questionRange}
            </h4>
            <div className="flex -m-2 flex-wrap">
              {/* Sử dụng lại logic chunk gốc của bạn */}
              {_.chunk(flattenedDetails, Math.ceil(flattenedDetails.length / 2)).map(
                (chunk, chunkIndex) => (
                  <div className="w-full sm:w-1/2 p-2 space-y-2" key={chunkIndex}>
                    {chunk.map((q, itemIndex) => {
                      // Tính index tuyệt đối trong mảng flattenedDetails
                      const absoluteFlatIndex = (chunkIndex * Math.ceil(flattenedDetails.length / 2)) + itemIndex;
                      // Số thứ tự = số bắt đầu + index tuyệt đối
                      const questionNumber = startingQuestionNumber + absoluteFlatIndex;

                      const isMissed = !q.userAnswer || String(q.userAnswer).trim() === "";
                      const isCorrect = q.correct;
                      const isIncorrect = !isCorrect && !isMissed;

                      let circleColor = "";
                      if (isCorrect) circleColor = "bg-[#2b9d58]";
                      else if (isIncorrect) circleColor = "bg-[#e24a29]";
                      else circleColor = "bg-[#6c757d]";

                      return (
                        <div key={itemIndex} className="flex space-x-3 items-start">
                          <span
                            className={twMerge(
                              "mt-0.5 w-[26px] h-[26px] text-white rounded-full flex justify-center items-center shrink-0 font-bold text-[13px]",
                              circleColor
                            )}
                          >
                            {questionNumber}
                          </span>
                          <div className=" items-center gap-x-1.5 text-[15px] leading-relaxed">
                            {isCorrect ? (
                              <span className="text-[#2b9d58] font-medium [&_p]:inline [&_div]:inline">
                                {parse(removeFillHistoryCorrectTags(q.userAnswer))}
                              </span>
                            ) : (
                              <>
                                <span className={twMerge(
                                  "[&_p]:inline [&_div]:inline",
                                  isMissed ? "text-[#a0a5ab] font-medium" : "text-[#e24a29] font-medium"
                                )}>
                                  {isMissed ? "Missed" : parse(removeFillHistoryCorrectTags(q.userAnswer))}
                                </span>
                                <span className="text-gray-300"> | </span>
                                <span className="text-[#2b9d58] font-medium [&_p]:inline [&_div]:inline">
                                  {parse(removeFillHistoryCorrectTags(q.answer))}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  </div>
                )
              )}
            </div>
          </div>
        )
      })}
    </div>
  );
}

export default AnswerKeys;