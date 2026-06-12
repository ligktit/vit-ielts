import { Radio, Checkbox, Input, Select, Table, Collapse } from "antd";
import parse, { HTMLReactParserOptions } from "html-react-parser";
import type { QuestionData } from "./types";
import { formatPresetOptionText } from "@/shared/lib/preset-option";

type QuestionPreviewProps = {
    data: QuestionData;
};

export default function QuestionPreview({ data }: QuestionPreviewProps) {
    if (!data.type) return null;

    const renderRichText = (value?: string, fallback?: string) => {
        const trimmed = value?.trim();
        if (!trimmed) return fallback ?? null;
        return parse(trimmed);
    };

    // ── Fillup ────────────────────────────────────────────────────────────────
    const renderFillup = () => {
        const rawContent = data.question_text || "";
        let componentIndex = 0;

        const options: HTMLReactParserOptions = {
            replace(domNode) {
                if (domNode.type === "text" && domNode.data) {
                    const parts = domNode.data.split(/(\{.*?\})/);
                    if (parts.length > 1) {
                        return (
                            <>
                                {parts.map((part, i) => {
                                    if (part.startsWith("{") && part.endsWith("}")) {
                                        const qNum = ++componentIndex;
                                        const answer = part.slice(1, -1).trim();
                                        return (
                                            <Input
                                                key={`fillup-${i}`}
                                                size="small"
                                                addonBefore={`Q.${qNum}`}
                                                className="w-fit inline-block mx-1 align-middle"
                                                placeholder={answer || "..."}
                                                readOnly
                                            />
                                        );
                                    }
                                    return <span key={`text-${i}`}>{part}</span>;
                                })}
                            </>
                        );
                    }
                }
            },
        };

        return (
            <div className="space-y-4">
                <div className="prose prose-sm max-w-none leading-loose text-[#2D3142] dark:text-gray-200">
                    {parse(rawContent, options)}
                </div>
                {data.explanations?.[0]?.content && (
                    <ExplanationBlock
                        content={data.explanations[0].content}
                        renderRichText={renderRichText}
                    />
                )}
            </div>
        );
    };

    // ── Radio / Select ────────────────────────────────────────────────────────
    const renderRadioSelect = () => {
        const isSelect = data.type === "select";
        return (
            <div className="space-y-6">
                {(data.list_of_questions || []).map((q, idx) => {
                    const correctIdx =
                        typeof q.correct === "number"
                            ? q.correct
                            : parseInt(String(q.correct), 10);
                    return (
                        <div key={idx} className="rounded-lg border border-[#eadfba] dark:border-[#524a2c] bg-[#FAF7EB] dark:bg-[#201f19] p-4">
                            {/* Question stem */}
                            <div className="mb-3 flex items-start gap-2 font-semibold leading-6">
                                <span className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 text-sm">
                                    Q.{idx + 1}
                                </span>
                                <div className="min-w-0 flex-1 break-words prose prose-sm max-w-none">
                                    {renderRichText(q.question, "[Empty Question Text]")}
                                </div>
                            </div>

                            {/* Options */}
                            <div className="pl-2">
                                {isSelect ? (
                                    <div className="max-w-md rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                                        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Answer Options
                                        </div>
                                        <Select
                                            disabled
                                            placeholder="Select answer…"
                                            className="w-full"
                                            options={(q.options || []).map((opt: any, oIdx) => ({
                                                value: oIdx,
                                                label: formatPresetOptionText(
                                                    opt.option_text ||
                                                        opt.content ||
                                                        opt.label ||
                                                        `[Option ${oIdx + 1}]`,
                                                    data.question_form,
                                                ),
                                            }))}
                                        />
                                        {!isNaN(correctIdx) && q.options?.[correctIdx] && (
                                            <CorrectAnswerBadge
                                                label={formatPresetOptionText(
                                                    (q.options[correctIdx] as any).option_text ||
                                                        `Option ${correctIdx + 1}`,
                                                    data.question_form,
                                                )}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {(q.options || []).map((opt: any, oIdx) => {
                                            const isCorrect = oIdx === correctIdx;
                                            return (
                                                <div
                                                    key={oIdx}
                                                    className={`rounded-lg border px-3 py-2 shadow-sm transition-colors ${
                                                        isCorrect
                                                            ? "border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-950/20"
                                                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                                                    }`}
                                                >
                                                    <div className="flex items-center w-full">
                                                        <Radio
                                                            value={oIdx}
                                                            checked={isCorrect}
                                                            disabled
                                                            className="m-0 mt-0.5 w-full flex items-start"
                                                        >
                                                            <div className="flex items-center justify-between w-full">
                                                                <div className="min-w-0 break-words prose prose-sm max-w-none">
                                                                    {renderRichText(
                                                                        formatPresetOptionText(
                                                                            opt.option_text || opt.content || opt.label,
                                                                            data.question_form,
                                                                        ),
                                                                        `[Option ${oIdx + 1}]`
                                                                    )}
                                                                </div>
                                                                {isCorrect && (
                                                                    <span className="ml-2 shrink-0 text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                                        ✓ Correct
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </Radio>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Per-question explanation */}
                            {q.explanation && (
                                <ExplanationBlock content={q.explanation} renderRichText={renderRichText} />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // ── Checkbox ──────────────────────────────────────────────────────────────
    const renderCheckbox = () => {
        return (
            <div className="bg-[#FAF7EB] dark:bg-[#201f19] p-4 rounded-lg space-y-3">
                {(data.list_of_options || []).map((opt: any, idx) => {
                    const isCorrect = opt.correct === true;
                    return (
                        <div key={idx}>
                            <div
                                className={`rounded-lg px-3 py-2 border w-full ${
                                    isCorrect
                                        ? "bg-green-50 border-green-300 dark:bg-green-950/20 dark:border-green-800"
                                        : "bg-white dark:bg-gray-900 border-transparent dark:border-gray-850"
                                }`}
                            >
                                <Checkbox checked={isCorrect} disabled className="mt-0.5 w-full flex items-start">
                                    <div className="flex items-center justify-between w-full">
                                        <span className="flex-1 text-sm min-w-0 pr-2">
                                            {renderRichText(opt.option_text || opt.option || opt.content, `[Option ${idx + 1}]`)}
                                        </span>
                                        {isCorrect && (
                                            <span className="shrink-0 text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full ml-auto">
                                                ✓ Correct
                                            </span>
                                        )}
                                    </div>
                                </Checkbox>
                            </div>
                            {opt.explanation && (
                                <ExplanationBlock content={opt.explanation} renderRichText={renderRichText} />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // ── Matching ──────────────────────────────────────────────────────────────
    const renderMatching = () => {
        const mq = (data.matching_question || {}) as any;
        const matchingItems: any[] = mq.matchingItems || mq.matching_items || [];
        const answerOptions: any[] = mq.answerOptions || mq.answer_options || [];
        const layoutType: string = mq.layoutType || mq.layout_type;
        const summaryText: string = mq.summaryText || mq.summary_text;

        return (
            <div className="space-y-4">
                {layoutType === "summary" && summaryText && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium mb-2 text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Summary
                        </h4>
                        <p className="text-sm leading-relaxed">{summaryText}</p>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium mb-2">{mq.optionsTitle || mq.options_title || "List of options"}</h4>
                    <div className="flex flex-col gap-2">
                        {answerOptions.map((opt: any, i: number) => (
                            <div key={i} className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-sm border border-gray-200 dark:border-gray-700">
                                <span className="font-bold mr-2 text-blue-600">{String.fromCharCode(65 + i)}.</span>
                                {opt.optionText || opt.option_text || `[Option ${i + 1}]`}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    {matchingItems.map((item: any, idx: number) => {
                        const correctAnswer = item.correctAnswer || item.correct_answer || "";
                        return (
                            <div key={idx}>
                                <div className="flex gap-3 items-center bg-[#FAF7EB] dark:bg-[#201f19] p-3 rounded">
                                    <span className="bg-white dark:bg-gray-850 px-2 rounded border border-gray-200 dark:border-gray-750 font-medium text-sm">
                                        Q.{idx + 1}
                                    </span>
                                    <span className="flex-1">
                                        {item.questionPart || item.question_part || `[Item ${idx + 1}]`}
                                    </span>
                                    {correctAnswer ? (
                                        <span className="shrink-0 bg-green-100 border border-green-400 text-green-700 font-bold px-3 py-1 rounded text-sm">
                                            {correctAnswer}
                                        </span>
                                    ) : (
                                        <Select
                                            size="small"
                                            className="w-24"
                                            placeholder="Select"
                                            options={answerOptions.map((_: any, i: number) => ({
                                                value: i,
                                                label: String.fromCharCode(65 + i),
                                            }))}
                                        />
                                    )}
                                </div>
                                {item.explanation && (
                                    <ExplanationBlock
                                        content={item.explanation}
                                        renderRichText={renderRichText}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // ── Matrix ────────────────────────────────────────────────────────────────
    const renderMatrix = () => {
        const mq = (data.matrix_question || {}) as any;
        const matrixCategories: any[] = mq.matrixCategories || mq.matrix_categories || [];
        const matrixItems: any[] = mq.matrixItems || mq.matrix_items || [];

        const columns = [
            { title: "Question", dataIndex: "question", key: "question" },
            ...matrixCategories.map((cat: any) => {
                const letter = cat.categoryLetter || cat.category_letter || "";
                const text = cat.categoryText || cat.category_text || "";
                return {
                    title: letter || text,
                    dataIndex: letter,
                    key: letter,
                    render: (_: any, record: any) => {
                        const isCorrect = record.correctLetter === letter;
                        return <Radio disabled checked={isCorrect} />;
                    },
                    align: "center" as const,
                };
            }),
        ];

        const tableData = matrixItems.map((item: any, i: number) => ({
            key: i,
            question: (
                <div>
                    <span className="font-medium">
                        Q.{i + 1} {item.itemText || item.item_text}
                    </span>
                    {item.explanation && (
                        <ExplanationBlock
                            content={item.explanation}
                            renderRichText={renderRichText}
                        />
                    )}
                </div>
            ),
            correctLetter: item.correctCategoryLetter || item.correct_category_letter || "",
        }));

        return (
            <div className="overflow-x-auto">
                <Table
                    columns={columns}
                    dataSource={tableData}
                    pagination={false}
                    size="small"
                    bordered
                    className="w-full"
                />
            </div>
        );
    };

    // ── Root render ───────────────────────────────────────────────────────────
    return (
        <div className="text-left font-noto-sans text-[#2D3142] dark:text-gray-200">
            {/* Title & Instructions */}
            <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">{data.title || "Untitled Question"}</h3>
                {data.instructions && data.type !== "fillup" && (
                    <div className="prose prose-sm text-gray-600 dark:text-gray-400 italic">
                        {renderRichText(data.instructions)}
                    </div>
                )}
            </div>

            {/* Type-specific renderer */}
            <div>
                {(data.type === "radio" || data.type === "select") && renderRadioSelect()}
                {data.type === "fillup" && renderFillup()}
                {data.type === "checkbox" && renderCheckbox()}
                {data.type === "matching" && renderMatching()}
                {data.type === "matrix" && renderMatrix()}
            </div>
        </div>
    );
}

// ─── Helper sub-components ────────────────────────────────────────────────────

function CorrectAnswerBadge({ label }: { label: string }) {
    return (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-300 dark:border-green-800 px-3 py-2">
            <span className="text-green-600 dark:text-green-400 font-bold text-sm">✓ Correct:</span>
            <span className="text-sm text-green-800 dark:text-green-200">{label}</span>
        </div>
    );
}

function ExplanationBlock({
    content,
    renderRichText,
}: {
    content: string;
    renderRichText: (v?: string, fallback?: string) => ReturnType<typeof parse> | null;
}) {
    if (!content?.trim()) return null;
    return (
        <div className="mt-2">
            <Collapse
                ghost
                size="small"
                className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/50 rounded-md overflow-hidden"
                items={[
                    {
                        key: "1",
                        label: (
                            <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1 text-xs">
                                💡 Explanation
                            </span>
                        ),
                        children: (
                            <div className="text-sm text-amber-900 dark:text-amber-200 py-1">
                                <span className="prose prose-sm max-w-none inline">
                                    {renderRichText(content)}
                                </span>
                            </div>
                        ),
                    },
                ]}
            />
        </div>
    );
}
