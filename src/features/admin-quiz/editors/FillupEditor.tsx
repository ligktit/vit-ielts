import { useEffect, useState } from "react";
import { Input, Popover } from "antd";
import RichTextEditor from "../RichTextEditor";

type FillupEditorProps = {
    question_text: string;
    onChange: (v: string) => void;
    wordExplanations?: Record<string, string>;
    onExplanationsChange?: (v: Record<string, string>) => void;
};

function extractWords(text: string): string[] {
    const regex = /\{(.*?)\}/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        if (match[1].trim() !== "") {
            matches.push(match[1].replace(/\s*\|\s*/g, "|").trim());
        }
    }
    return matches;
}

export default function FillupEditor({
    question_text,
    onChange,
    wordExplanations = {},
    onExplanationsChange,
}: FillupEditorProps) {
    const [words, setWords] = useState<string[]>([]);
    const [openIdx, setOpenIdx] = useState<number | null>(null);

    useEffect(() => {
        setWords(question_text ? extractWords(question_text) : []);
    }, [question_text]);

    const setExplanation = (idx: number, value: string) => {
        if (!onExplanationsChange) return;
        onExplanationsChange({ ...wordExplanations, [String(idx)]: value });
    };

    return (
        <div className="space-y-4">
            <p className="px-4 py-3 bg-neutral-100 dark:bg-gray-800 rounded border border-dashed border-gray-300 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
                Use <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{"{"} {"}"}</code> to mark blanks and write the correct answer inside.{" "}
                Example: <em>The engine was <strong>{"{inefficient}"}</strong> due to its weight.</em>
                <br />
                Multiple accepted answers: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{"{play | hate | love}"}</code>
            </p>

            <RichTextEditor
                value={question_text}
                onChange={onChange}
                placeholder="Enter passage / question content. Wrap answers in { }…"
            />

            {words.length > 0 && (
                <div className="p-3 bg-neutral-50 dark:bg-gray-900 rounded border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
                        {words.length} answer(s) detected
                        {onExplanationsChange
                            ? " — click to add explanation"
                            : ""}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {words.map((word, index) => {
                            const hasExp = !!wordExplanations?.[String(index)];
                            return onExplanationsChange ? (
                                <Popover
                                    key={index}
                                    open={openIdx === index}
                                    onOpenChange={(v) => setOpenIdx(v ? index : null)}
                                    trigger="click"
                                    title={
                                        <span>
                                            Explanation:{" "}
                                            <strong className="text-green-700">{word}</strong>
                                        </span>
                                    }
                                    content={
                                        <Input.TextArea
                                            rows={3}
                                            style={{ width: 280 }}
                                            placeholder="Enter explanation for this answer…"
                                            value={wordExplanations?.[String(index)] ?? ""}
                                            onChange={(e) => setExplanation(index, e.target.value)}
                                        />
                                    }
                                >
                                    <span
                                        className={`
                                            px-2 py-1 rounded text-sm cursor-pointer font-medium
                                            transition-all border
                                            ${hasExp
                                                ? "bg-green-600 text-white border-green-700"
                                                : "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                                            }
                                        `}
                                        title="Click to add explanation"
                                    >
                                        {word}
                                        {hasExp && (
                                            <span className="ml-1 opacity-70 text-xs">💬</span>
                                        )}
                                    </span>
                                </Popover>
                            ) : (
                                <span
                                    key={index}
                                    className="px-2 py-1 rounded text-sm font-medium bg-green-100 text-green-800 border border-green-300"
                                >
                                    {word}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
