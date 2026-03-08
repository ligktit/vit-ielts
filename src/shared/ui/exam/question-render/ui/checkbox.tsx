import parse from "html-react-parser";
import { Checkbox as AntCheckbox, Collapse } from "antd";
import { Controller, useFormContext } from "react-hook-form";
import { useState, useMemo } from "react"; // Thêm useMemo
import { twMerge } from "tailwind-merge";

// Import từ đúng đường dẫn trong dự án của bạn
import { IPracticeSingle } from "@/pages/ielts-practice-single/api";
import { AnswerFormValues, useExamContext } from "@/pages/take-the-test/context";
import { TextSelectionWrapper } from "@/shared/ui/text-selection";

// ▼▼▼ HÀM HELPER ▼▼▼
const parseMaxOptionsFromText = (
  instructions: string | undefined | null
): number => {
  if (!instructions) return 1;
  const lowerText = instructions.toLowerCase();
  if (lowerText.includes("two") || lowerText.includes("2")) return 2;
  if (lowerText.includes("three") || lowerText.includes("3")) return 3;
  if (lowerText.includes("four") || lowerText.includes("4")) return 4;
  if (lowerText.includes("five") || lowerText.includes("5")) return 5;
  return 1;
};
// ▲▲▲ KẾT THÚC HÀM HELPER ▲▲▲

export const Checkbox = ({
  question,
  startIndex: propStartIndex = 0,
  readOnly = false,
}: {
  question: IPracticeSingle["quizFields"]["passages"][number]["questions"][number];
  startIndex?: number;
  readOnly?: boolean;
}) => {
  const methods = useFormContext<AnswerFormValues>();
  const [isFocused, setIsFocused] = useState(false);
  // 1. LẤY HÀM TÌM KIẾM TỪ CONTEXT
  const { setActiveQuestionIndex, getQuestionStartIndex, activeQuestionIndex } = useExamContext();

  // 2. TÍNH TOÁN INDEX THỰC TẾ (GLOBAL INDEX)
  const realStartIndex = useMemo(() => {
    // QUAN TRỌNG: Trong review mode (readOnly), propStartIndex đã được tính đúng từ newPost
    // Nên LUÔN LUÔN dùng propStartIndex hoặc question.startIndex khi readOnly mode
    if (readOnly) {
      const finalStartIndex = (question.startIndex !== undefined && question.startIndex >= 0) 
        ? question.startIndex 
        : propStartIndex;
      return finalStartIndex;
    }

    // Gọi hàm lookup từ Context (chỉ khi không phải readOnly)
    const contextIndex = getQuestionStartIndex(question);

    // Nếu Context tìm thấy (>0) thì dùng, ngược lại dùng prop (fallback)
    if (contextIndex > 0) return contextIndex;
    
    // Nếu context trả về 0 nhưng prop > 0, có thể do lỗi tìm kiếm, 
    // nhưng để fix lỗi ghosting (trùng 0), ta ưu tiên kết quả từ ContextMap (nếu tin tưởng Context đúng).
    // Với cấu trúc hiện tại, ContextMap là nguồn chân lý.
    return contextIndex; 
  }, [question, getQuestionStartIndex, propStartIndex, readOnly]);

  // Logic tính toán option
  const maxSelectableOptions = Number(question.optionChoose) || 1;
  // @ts-ignore
  const totalSubQuestions = question.list_of_options?.filter((o: any) => o.correct).length || maxSelectableOptions || 1;

  // Hiển thị dải câu hỏi (VD: Questions 21-22)
  const displayStart = realStartIndex + 1;
  const displayEnd = realStartIndex + totalSubQuestions;
  const questionRange = (displayStart !== displayEnd)
    ? `${displayStart}–${displayEnd}`
    : `${displayStart}`;

  return (
    <div className="space-y-4" id={`#question-no-${realStartIndex + 1}`}>
      <h3 className={twMerge("text-lg font-bold", isFocused && "active-quizz")}>
          Questions {questionRange}
      </h3>

      <div className="leading-[2] prose prose-sm max-w-none">
        <TextSelectionWrapper>
          {parse(question.question || question.instructions || "")}
        </TextSelectionWrapper>
      </div>
          
      <div
        tabIndex={-1}
        style={{ outline: 'none' }}
        onBlur={() => setIsFocused(false)}
      >
        <Controller
          // 3. QUAN TRỌNG: Key để fix lỗi Ghosting
          key={realStartIndex}
          
          control={methods.control}
          name={`answers.${realStartIndex}`} // Bind đúng vào index thực tế
          defaultValue={[]}
          render={({ field }) => {

            const currentValues = Array.isArray(field.value) ? field.value : [];
            const isLimitReached = currentValues.length >= maxSelectableOptions;

            return (
              <AntCheckbox.Group
                disabled={readOnly}
                className={twMerge(
                  "flex flex-col space-y-[1px]",
                  "exam-checkbox-group"
                )}
                value={currentValues}
                onChange={(checkedValues) => {
                  let finalValues = checkedValues;
                  const oldValue = Array.isArray(field.value) ? field.value : [];

                  if (maxSelectableOptions === 1) {
                    if (checkedValues.length > 1) {
                      finalValues = [checkedValues[checkedValues.length - 1]];
                    } else if (checkedValues.length === 0 && oldValue.length === 1) {
                      finalValues = oldValue;
                    }
                  }

                  // Sort để lưu dữ liệu đẹp hơn (VD: [0, 2])
                  field.onChange(finalValues.sort((a, b) => (a as number) - (b as number)));
                }}
              >
                {/* Map qua các options */}
                {(question.list_of_options || []).map((option: any, index: number) => {
                  const isSelected = currentValues.includes(index);
                  
                  return (
                    <AntCheckbox
                      key={index}
                      value={index}
                      disabled={readOnly || (isLimitReached && !isSelected)}
                      onFocus={(e) => {
                        setIsFocused(true);

                        // 4. TÍNH TOÁN ACTIVE INDEX DỰA TRÊN REAL START INDEX
                        const optionIndex = index; // 0, 1, 2...
                        let absoluteQuestionIndex: number;

                        if (optionIndex < maxSelectableOptions) {
                          // Nếu click option 0 -> active câu (realStartIndex + 0)
                          absoluteQuestionIndex = realStartIndex + optionIndex;
                        } else {
                          // Nếu click option thừa -> active câu cuối của nhóm
                          absoluteQuestionIndex = realStartIndex + maxSelectableOptions - 1;
                        }

                        setActiveQuestionIndex(absoluteQuestionIndex);
                      }}
                      // Giữ focus khi click label
                      onClick={() => setIsFocused(true)} 
                    >
                      <TextSelectionWrapper>
                        {parse(option.option)}
                      </TextSelectionWrapper>
                    </AntCheckbox>
                  );
                })}
              </AntCheckbox.Group>
            );
          }}
        />
      </div>

      {readOnly && (
        <div className="space-y-2 pt-2">
           {question.explanations?.[0]?.content && (
            <Collapse
              size="small"
              items={[
                {
                  key: "1",
                  label: "Explanation",
                  children: (
                    <div className="prose">
                      <TextSelectionWrapper>
                        {parse(question.explanations[0].content || "")}
                      </TextSelectionWrapper>
                    </div>
                  ),
                },
              ]}
            />
          )}
        </div>
      )}
    </div>
  );
};