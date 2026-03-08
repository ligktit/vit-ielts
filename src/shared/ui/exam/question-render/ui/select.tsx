import { IPracticeSingle } from "@/pages/ielts-practice-single/api";
import parse, {
  DOMNode,
  domToReact,
  Element,
  HTMLReactParserOptions,
} from "html-react-parser";
import { Fragment, JSX, useMemo, useState } from "react";
import { Collapse, Select as SelectAnt, theme } from "antd";
import _ from "lodash";
import { Controller, useFormContext } from "react-hook-form";
import { AnswerFormValues, useExamContext } from "@/pages/take-the-test/context";
import { randomUUID } from "@/shared/lib";
import { TextSelectionWrapper } from "@/shared/ui/text-selection";
import { twMerge } from "tailwind-merge";

export const Select = ({
  question,
  startIndex = 0,
  readOnly = false,
}: {
  question: IPracticeSingle["quizFields"]["passages"][number]["questions"][number];
  startIndex?: number;
  readOnly?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const methods = useFormContext<AnswerFormValues>();
  const { token } = theme.useToken();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // 1. LẤY HÀM TÌM KIẾM TỪ CONTEXT
  const { setActiveQuestionIndex, getQuestionStartIndex } = useExamContext();

  // 2. TÍNH TOÁN INDEX THỰC TẾ (GLOBAL INDEX)
  const realStartIndex = useMemo(() => {
    // QUAN TRỌNG: Trong review mode (readOnly), propStartIndex đã được tính đúng từ newPost
    // Nên LUÔN LUÔN dùng propStartIndex khi readOnly mode để đảm bảo khớp với answers array
    if (readOnly) {
      const finalStartIndex = (question.startIndex !== undefined && question.startIndex >= 0) 
        ? question.startIndex 
        : startIndex;
      
      return finalStartIndex;
    }

    // Gọi hàm lookup từ Context (chỉ khi không phải readOnly)
    const contextIndex = getQuestionStartIndex(question);

    // Nếu Context tìm thấy (>0) thì dùng, ngược lại dùng prop (fallback)
    if (contextIndex > 0) return contextIndex;
    
    // Fallback về prop startIndex nếu context trả về 0
    return startIndex; 
  }, [question, getQuestionStartIndex, startIndex, readOnly]);

  const questionData = useMemo(() => {
    let newContent = question.question || "";
    const questions: {
      id: string;
      answers: string[];
    }[] = [];
    const regex = /\{(.*?)\}/g;
    let match: RegExpExecArray | null,
      i = 0;

    while ((match = regex.exec(question.question || "")) !== null) {
      if (match[1].trim() !== "") {
        const uniqueId = randomUUID();

        questions.push({
          id: uniqueId,
          answers: match[1].split("|").map((a) => a.trim()),
        });

        newContent = newContent.replace(
          match[0],
          `<span data-input-id="${uniqueId}" data-index="${i++}"></span>`
        );
      }
    }

    return {
      content: newContent,
      questions,
    };
  }, [question.question]);

  const options: HTMLReactParserOptions = useMemo(() => ({
    replace(domNode) {
      if ((domNode as Element).attribs) {
        const allowedTags = [
          "p",
          "span",
          "b",
        ] as (keyof JSX.IntrinsicElements)[];

        const { children, tagName } = domNode as Element;
        const Component = allowedTags.includes(
          tagName as keyof JSX.IntrinsicElements
        )
          ? "div"
          : (tagName as keyof JSX.IntrinsicElements);

        const isContainSelect = children.some((child) =>
          _.has((child as Element).attribs, "data-input-id")
        );

        if (isContainSelect) {
          return (
            <Component>
              {children.map((child, index) => {
                const childElement = child as Element;

                // Case 1: Nếu là node SELECT (ô chọn)
                if (_.has(childElement.attribs, "data-input-id")) {
                  // Sử dụng realStartIndex thay vì startIndex
                  const relativeIndex = Number(childElement.attribs["data-index"]);
                  const questionIndex = relativeIndex + 1 + realStartIndex; // Index hiển thị (1-based)
                  const absoluteIndex = questionIndex - 1; // Index lưu data (0-based)
                  
                  const fieldName = `answers.${absoluteIndex}`;
                  const inputId = `#question-no-${questionIndex}`;

                  return (
                    <div
                      key={index}
                      className="inline-flex items-stretch gap-1"
                      id={inputId}
                    >
                      <span // Nhãn Q.X
                        style={{ fontSize: token.fontSize }}
                        className="bg-black/2 px-[11px] border border-[#d9d9d9] flex items-center leading-none rounded-sm"
                      >
                        {`Q.${questionIndex}`}
                      </span>
                      {methods ? (
                        <Controller
                          // 3. QUAN TRỌNG: Key để fix lỗi Ghosting
                          key={absoluteIndex}
                          
                          control={methods.control}
                          name={fieldName as `answers.${number}`}
                          render={({ field }) => (
                            <SelectAnt
                              disabled={readOnly}
                              tagRender={(props) => <div>{props.value}</div>}
                              size="small"
                              options={(question.list_of_options || [])
                                .filter((o) => o.option !== "")
                                .map((o, i) => ({
                                  label: o.option,
                                  value: i,
                                }))}
                              {...field}
                              onFocus={() => {
                                if (!readOnly) {
                                  setActiveIndex(questionIndex); 
                                  setActiveQuestionIndex(absoluteIndex); // Update active state
                                }
                              }}
                              onBlur={() => setActiveIndex(null)}
                            />
                          )}
                        />
                      ) : (
                        <SelectAnt
                          disabled={readOnly}
                          tagRender={(props) => <div>{props.value}</div>}
                          size="small"
                          options={(question.list_of_options || [])
                            .filter((o) => o.option !== "")
                            .map((o, i) => ({
                              label: o.option,
                              value: i,
                            }))}
                          onFocus={() => {
                            if (!readOnly) {
                              setActiveIndex(questionIndex);
                              setActiveQuestionIndex(absoluteIndex);
                            }
                          }}
                          onBlur={() => setActiveIndex(null)}
                        />
                      )}
                    </div>
                  );
                }

                // Case 2: Nếu là node TEXT (tiêu đề)
                else {
                  let questionIndexForThisText: number | null = null;
                  const nextSibling = children[index + 1] as Element;

                  if (nextSibling && _.has(nextSibling.attribs, "data-input-id")) {
                    // Cập nhật logic highlight text dùng realStartIndex
                    questionIndexForThisText =
                      Number(nextSibling.attribs["data-index"]) + 1 + realStartIndex;
                  }

                  const isTextActive = activeIndex === questionIndexForThisText;

                  return (
                    <p
                      className={twMerge("inline", isTextActive && "active-quizz")}
                      key={index}
                    >
                      {domToReact([child as DOMNode])}
                    </p>
                  );
                }
              })}
            </Component>
          );
        }
      }
    },
    // Thêm realStartIndex vào dependency array
  }), [methods, readOnly, realStartIndex, token.fontSize, question.list_of_options, activeIndex, setActiveQuestionIndex]);

  const numberOfGaps = questionData.questions.length;
  // Tính toán hiển thị range câu hỏi
  const displayStart = realStartIndex + 1;
  const displayEnd = realStartIndex + numberOfGaps;

  return (
    <>
      <p className="text-lg font-bold">
        Question {displayStart} - {displayEnd}
      </p>
      <div className="leading-[2] prose prose-sm max-w-none">
        <TextSelectionWrapper>
          {parse(questionData.content, options)}
        </TextSelectionWrapper>
      </div>
      {readOnly && (
        <div className="space-y-4">
          {question.explanations.map((explanation, index) => (
            <Fragment key={index}>
              <p className="space-x-1">
                <span className="font-semibold">
                  Q.{realStartIndex + index + 1}
                </span>
                <span>Answer:</span>
                <span className="text-red-500 font-semibold">
                  {questionData.questions[index].answers.join(", ")}
                </span>
              </p>
              <Collapse
                size="small"
                items={[
                  {
                    key: "1",
                    label: "Explanation",
                    children: (
                      <div className="prose">
                        {parse(explanation.content || "")}
                      </div>
                    ),
                  },
                ]}
              />
            </Fragment>
          ))}
        </div>
      )}
    </>
  );
};