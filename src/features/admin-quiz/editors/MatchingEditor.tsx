import { useState } from "react";
import { Input, Select, Form, Button, Divider, Popover, Alert } from "antd";
import { PlusOutlined, DeleteOutlined, CommentOutlined } from "@ant-design/icons";
import { MATCHING_LAYOUTS } from "../constants";
import RichTextEditor from "../RichTextEditor";

type MatchingItem = { questionPart: string; correctAnswer: string; explanation?: string };

type MatchingData = {
    layoutType: string;
    matchingItems: MatchingItem[];
    answerOptions: { optionText: string }[];
    summaryText?: string;
    optionsTitle?: string;
};

type MatchingEditorProps = {
    data: MatchingData;
    onChange: (v: MatchingData) => void;
};

export default function MatchingEditor({ data, onChange }: MatchingEditorProps) {
    const [openExpIdx, setOpenExpIdx] = useState<number | null>(null);

    const update = (field: string, value: unknown) =>
        onChange({ ...data, [field]: value });

    const updateItem = (idx: number, patch: Partial<MatchingItem>) => {
        const arr = [...data.matchingItems];
        arr[idx] = { ...arr[idx], ...patch };
        update("matchingItems", arr);
    };

    const answerOptionLetters = (data.answerOptions ?? []).map((_, i) =>
        String.fromCharCode(65 + i)
    );

    const validAnswers = new Set(answerOptionLetters.map((l) => l.toUpperCase()));

    const summaryGapCount = (data.summaryText ?? "").match(/\{[^}]+\}/g)?.length ?? 0;

    const isHeading = data.layoutType === "heading";
    const isSummary = data.layoutType === "summary";

    return (
        <div className="space-y-4">
            <Form.Item label="Layout Type" className="mb-4">
                <Select
                    value={data.layoutType}
                    onChange={(v) => update("layoutType", v)}
                    options={MATCHING_LAYOUTS}
                    style={{ width: 220 }}
                />
            </Form.Item>



            {/* ── SUMMARY layout ── */}
            {isSummary && (
                <Form.Item label="Summary Text" className="mb-0">
                    <p className="px-3 py-2 mb-2 bg-neutral-100 dark:bg-gray-800 rounded border border-dashed border-gray-300 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
                        Use <code className="bg-gray-200 dark:bg-gray-750 px-1 rounded">{"{ }"}</code> to mark blanks, write the correct answer inside.{" "}
                        Example: <em>The process is <strong>{"{" + "efficient" + "}"}</strong> and cost-effective.</em>
                    </p>
                    <RichTextEditor
                        value={data.summaryText ?? ""}
                        onChange={(v) => update("summaryText", v)}
                        placeholder="Type the summary paragraph here. Wrap each blank with { correct_answer }…"
                        height={180}
                    />
                    {summaryGapCount === 0 && (data.summaryText ?? "").length > 0 && (
                        <Alert
                            type="warning"
                            showIcon
                            message="No blanks { } found. Wrap correct answers in curly braces."
                            className="mt-2"
                        />
                    )}
                    {summaryGapCount > 0 && (
                        <p className="text-xs text-green-700 mt-1">
                            ✓ <strong>{summaryGapCount}</strong> blank(s) detected
                        </p>
                    )}
                </Form.Item>
            )}

            {/* ── STANDARD / HEADING layout — Matching Items ── */}
            {!isSummary && (
                <>
                    <Divider orientation="left" plain className="!my-2">
                        {isHeading
                            ? "Sections to match (e.g. Paragraph i, ii, iii…)"
                            : "Matching Items"}
                    </Divider>

                    {isHeading && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2 mb-1">
                            Left column: paragraph labels (i, ii, iii…). Right column: correct heading letter (A, B, C…) from the Answer Options list below.
                        </p>
                    )}

                    <div className="space-y-2">
                        {(data.matchingItems ?? []).map((item, idx) => {
                            const answerUpper = item.correctAnswer?.trim().toUpperCase();
                            const isInvalid =
                                answerUpper &&
                                validAnswers.size > 0 &&
                                !validAnswers.has(answerUpper);

                            return (
                                <div key={idx} className="flex items-center gap-2" style={{ minWidth: 0 }}>
                                    <div
                                        style={{
                                            background: "var(--admin-surface-active, #f3f4f6)",
                                            padding: "4px 10px",
                                            borderRadius: 4,
                                            border: "1px solid var(--admin-border, #e5e7eb)",
                                            color: "var(--admin-text-secondary, #4b5563)",
                                            fontSize: 12,
                                            fontWeight: 500,
                                            whiteSpace: "nowrap",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {isHeading
                                            ? ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"][idx] ?? idx + 1
                                            : idx + 1}
                                    </div>
                                    <Input
                                        placeholder={isHeading ? "Paragraph label (e.g. Section A)" : "Statement / sentence to match"}
                                        value={item.questionPart}
                                        onChange={(e) => updateItem(idx, { questionPart: e.target.value })}
                                        style={{ flex: 2, minWidth: 0 }}
                                    />
                                    <Select
                                        placeholder="Answer"
                                        value={item.correctAnswer || undefined}
                                        onChange={(v) => updateItem(idx, { correctAnswer: v })}
                                        options={answerOptionLetters.map((l) => ({ value: l, label: l }))}
                                        style={{ width: 90, flexShrink: 0 }}
                                        status={isInvalid ? "error" : undefined}
                                        allowClear
                                        showSearch
                                        notFoundContent={
                                            answerOptionLetters.length === 0
                                                ? "Add Answer Options first"
                                                : "Not found"
                                        }
                                    />
                                    <Popover
                                        open={openExpIdx === idx}
                                        onOpenChange={(v) => setOpenExpIdx(v ? idx : null)}
                                        trigger="click"
                                        title="Explanation for this item"
                                        content={
                                            <Input.TextArea
                                                rows={3}
                                                style={{ width: 280 }}
                                                placeholder="Enter explanation…"
                                                value={item.explanation ?? ""}
                                                onChange={(e) =>
                                                    updateItem(idx, { explanation: e.target.value })
                                                }
                                            />
                                        }
                                    >
                                    </Popover>
                                    <Button
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        style={{ flexShrink: 0 }}
                                        onClick={() =>
                                            update(
                                                "matchingItems",
                                                data.matchingItems.filter((_, i) => i !== idx)
                                            )
                                        }
                                    />
                                </div>
                            );
                        })}
                        <Button
                            icon={<PlusOutlined />}
                            size="small"
                            onClick={() =>
                                update("matchingItems", [
                                    ...(data.matchingItems ?? []),
                                    { questionPart: "", correctAnswer: "" },
                                ])
                            }
                        >
                            Add Item
                        </Button>
                    </div>
                </>
            )}

            {/* ── Answer Options (always shown) ── */}
            <Divider orientation="left" orientationMargin={0} plain className="!my-2">
                {isHeading ? "Headings (Answer Options)" : "Answer Options"}
            </Divider>

            {isHeading && (
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2 mb-1">
                    List of headings to match — automatically labelled A, B, C…
                </p>
            )}

            <Form.Item label="Options Title" className="mb-4">
                <Input
                    placeholder="List of options"
                    value={data.optionsTitle ?? ""}
                    onChange={(e) => update("optionsTitle", e.target.value)}
                    style={{ width: 320 }}
                />
            </Form.Item>

            <div className="space-y-2">
                {(data.answerOptions ?? []).map((opt, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <div
                            style={{
                                background: "var(--admin-brand-glow, rgba(154, 213, 52, 0.12))",
                                padding: "4px 8px",
                                borderRadius: 4,
                                border: "1px solid var(--admin-brand-light, rgba(154, 213, 52, 0.3))",
                                fontSize: 12,
                                fontWeight: 700,
                                minWidth: 28,
                                textAlign: "center",
                                flexShrink: 0,
                                color: "var(--admin-brand-dark, #7DB024)",
                            }}
                        >
                            {String.fromCharCode(65 + idx)}
                        </div>
                        <Input
                            placeholder={isHeading ? `Heading ${String.fromCharCode(65 + idx)}` : `Answer option ${String.fromCharCode(65 + idx)}`}
                            value={opt.optionText}
                            onChange={(e) => {
                                const arr = [...data.answerOptions];
                                arr[idx] = { optionText: e.target.value };
                                update("answerOptions", arr);
                            }}
                            style={{ flex: 1, minWidth: 0 }}
                        />
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            style={{ flexShrink: 0 }}
                            onClick={() =>
                                update(
                                    "answerOptions",
                                    data.answerOptions.filter((_, i) => i !== idx)
                                )
                            }
                        />
                    </div>
                ))}
                <Button
                    icon={<PlusOutlined />}
                    size="small"
                    onClick={() =>
                        update("answerOptions", [
                            ...(data.answerOptions ?? []),
                            { optionText: "" },
                        ])
                    }
                >
                    Add {isHeading ? "Heading" : "Answer Option"}
                </Button>
            </div>
        </div>
    );
}
