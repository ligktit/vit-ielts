import { useCallback, useEffect, useRef, useState } from "react";
import {
    Form, Space, Button, Spin, Typography, message, Tag, Alert,
} from "antd";
import {
    ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined,
} from "@ant-design/icons";
import { arrayMove } from "@dnd-kit/sortable";
import AdminLayout from "../_layout";
import { useRouter } from "next/router";
import { withAdmin } from "@/shared/hoc/withAdmin";
import {
    QuizEditorForm,
    PassageList,
    DEFAULT_PASSAGE,
    DEFAULT_QUESTION,
} from "@/features/admin-quiz";
import type { PassageData, QuestionData } from "@/features/admin-quiz";

const { Title, Text } = Typography;

export default function QuizEditorPage() {
    const router = useRouter();
    const { id } = router.query;
    return <QuizEditor quizId={id as string | undefined} />;
}

function QuizEditor({ quizId }: { quizId?: string }) {
    const router = useRouter();
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(!!quizId);
    const [passages, setPassages] = useState<PassageData[]>([{ ...DEFAULT_PASSAGE, sort_order: 0, questions: [] }]);
    const isNew = !quizId;

    // ── UX State ──────────────────────────────────────────────────────────
    const [isDirty, setIsDirty] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const isDirtyRef = useRef(false);
    isDirtyRef.current = isDirty;

    // Track passages changes after initial load
    const initialLoadDone = useRef(false);
    const setPassagesTracked = useCallback((updater: PassageData[] | ((prev: PassageData[]) => PassageData[])) => {
        setPassages(updater);
        if (initialLoadDone.current) setIsDirty(true);
    }, []);

    // Mark form dirty from QuizEditorForm onValuesChange
    const markDirty = useCallback(() => {
        if (initialLoadDone.current) setIsDirty(true);
    }, []);

    useEffect(() => {
        if (quizId) fetchQuiz();
        else {
            // New quiz: mark initialLoadDone so future changes are tracked
            initialLoadDone.current = true;
        }
    }, [quizId]);

    // ── Unsaved changes: beforeunload ─────────────────────────────────────
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (!isDirtyRef.current) return;
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, []);

    // ── Unsaved changes: Next.js route change ────────────────────────────
    useEffect(() => {
        const handler = () => {
            if (isDirtyRef.current && !window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời trang?')) {
                router.events.emit('routeChangeError');
                throw 'Route change aborted due to unsaved changes';
            }
        };
        router.events.on('routeChangeStart', handler);
        return () => router.events.off('routeChangeStart', handler);
    }, [router]);

    // ── Keyboard shortcuts ───────────────────────────────────────────────
    const handleSaveRef = useRef(handleSave);
    handleSaveRef.current = handleSave;

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (e.shiftKey) {
                    handleSaveRef.current('published');
                } else {
                    handleSaveRef.current('draft');
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // ── Data fetching ────────────────────────────────────────────────────
    async function fetchQuiz() {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/quizzes/${quizId}`);
            const json = await res.json();
            if (json.success) {
                const quiz = json.data;
                form.setFieldsValue({
                    title: quiz.title, slug: quiz.slug, excerpt: quiz.excerpt,
                    type: quiz.type, skill: quiz.skill, time_minutes: quiz.time_minutes,
                    pro_user_only: quiz.pro_user_only, score_type: quiz.score_type,
                    featured_image: quiz.featured_image, audio_url: quiz.audio_url,
                    pdf_url: quiz.pdf_url, source: quiz.source, year: quiz.year,
                    quarter: quiz.quarter, part: quiz.part, question_form: quiz.question_form,
                    status: quiz.status,
                });
                setPassages(
                    quiz.passages?.map((p: PassageData, idx: number) => ({
                        ...p, sort_order: idx,
                        questions: (p.questions ?? []).map((q: QuestionData, qIdx: number) => ({ ...q, sort_order: qIdx })),
                    })) ?? [{ ...DEFAULT_PASSAGE, sort_order: 0, questions: [] }]
                );
                // If slug was already set, mark as manually edited
                if (quiz.slug) setSlugManuallyEdited(true);
                // Reset dirty state after load
                setIsDirty(false);
                setSaveError(null);
                setTimeout(() => { initialLoadDone.current = true; }, 0);
            }
        } catch {
            message.error("Error loading quiz");
        } finally {
            setLoading(false);
        }
    }

    // ── Save handler ─────────────────────────────────────────────────────
    async function handleSave(status?: string) {
        try {
            const values = await form.validateFields();
            setSaving(true);
            setSaveError(null);

            const payload = {
                ...values,
                status: status || values.status || "draft",
                passages: passages.map((p, pIdx) => ({
                    ...(p.id ? { id: p.id } : {}),
                    title: p.title ?? null, content: p.content ?? null, sort_order: pIdx,
                    audio_start: p.audio_start ?? null, audio_end: p.audio_end ?? null,
                    questions: (p.questions ?? []).map((q, qIdx) => ({
                        ...(q.id ? { id: q.id } : {}),
                        type: q.type, title: q.title ?? null, question_text: q.question_text ?? null,
                        instructions: q.instructions ?? null, question_form: q.question_form ?? null,
                        sort_order: qIdx,
                        list_of_questions: q.type === "radio" || q.type === "select" ? q.list_of_questions ?? null : null,
                        list_of_options: q.type === "checkbox" ? q.list_of_options ?? null : null,
                        matching_question: q.type === "matching" ? q.matching_question ?? null : null,
                        matrix_question: q.type === "matrix" ? q.matrix_question ?? null : null,
                        explanations: q.type === "fillup" ? q.explanations ?? null : null,
                    })),
                })),
            };

            const url = isNew ? "/api/admin/quizzes" : `/api/admin/quizzes/${quizId}`;
            const method = isNew ? "POST" : "PUT";
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const json = await res.json();

            if (json.success) {
                const now = new Date();
                const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                setLastSavedAt(timeStr);
                setIsDirty(false);
                setSaveError(null);
                message.success(isNew ? "Tạo quiz thành công" : `Đã lưu lúc ${timeStr}`);
                if (isNew && json.data?.id) router.push(`/admin/quizzes/${json.data.id}`);
            } else {
                const errorMsg = json.error || "Error saving quiz";
                setSaveError(errorMsg);
                message.error(errorMsg);
            }
        } catch (err) {
            if (err && typeof err === "object" && "errorFields" in err) {
                const fieldErr = err as { errorFields: { name: string[]; errors: string[] }[] };
                const details = fieldErr.errorFields.map(f => `${f.name.join('.')}: ${f.errors.join(', ')}`).join(' | ');
                setSaveError(`Thiếu thông tin: ${details}`);
                message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            } else {
                setSaveError("Lỗi không xác định khi lưu quiz");
                message.error("Error saving quiz");
            }
        } finally {
            setSaving(false);
        }
    }

    // --- Passage helpers ---
    const addPassage = () => setPassagesTracked([...passages, { ...DEFAULT_PASSAGE, sort_order: passages.length, questions: [] }]);
    const removePassage = (idx: number) => setPassagesTracked(passages.filter((_, i) => i !== idx));
    const reorderPassages = (oldIndex: number, newIndex: number) => setPassagesTracked(arrayMove(passages, oldIndex, newIndex));
    const updatePassage = (idx: number, field: string, value: unknown) => {
        const arr = [...passages];
        (arr[idx] as Record<string, unknown>)[field] = value;
        setPassagesTracked(arr);
    };

    // --- Question helpers ---
    const addQuestion = (pIdx: number) => {
        const arr = [...passages];
        arr[pIdx].questions.push({ ...DEFAULT_QUESTION, sort_order: arr[pIdx].questions.length, list_of_questions: [] });
        setPassagesTracked(arr);
    };
    const removeQuestion = (pIdx: number, qIdx: number) => {
        const arr = [...passages];
        arr[pIdx].questions = arr[pIdx].questions.filter((_, i) => i !== qIdx);
        setPassagesTracked(arr);
    };
    const updateQuestion = (pIdx: number, qIdx: number, field: string, value: unknown) => {
        const arr = [...passages];
        (arr[pIdx].questions[qIdx] as Record<string, unknown>)[field] = value;
        setPassagesTracked(arr);
    };
    const reorderQuestions = (pIdx: number, oldIndex: number, newIndex: number) => {
        const arr = [...passages];
        arr[pIdx].questions = arrayMove(arr[pIdx].questions, oldIndex, newIndex);
        setPassagesTracked(arr);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center" style={{ minHeight: 400 }}><Spin size="large" /></div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div>
                {/* Header bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Space>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/admin/quizzes")}>Quay lại</Button>
                        <Title level={3} style={{ margin: 0 }}>{isNew ? "Tạo Quiz mới" : "Chỉnh sửa Quiz"}</Title>
                        {isDirty && <Tag color="orange">Chưa lưu</Tag>}
                        {lastSavedAt && !isDirty && <Tag icon={<CheckCircleOutlined />} color="green">Đã lưu lúc {lastSavedAt}</Tag>}
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Ctrl+S: Lưu nháp &bull; Ctrl+Shift+S: Xuất bản
                    </Text>
                </div>

                {/* Error banner */}
                {saveError && (
                    <Alert
                        message="Lỗi khi lưu"
                        description={saveError}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setSaveError(null)}
                        style={{ marginBottom: 16 }}
                    />
                )}

                <QuizEditorForm
                    form={form}
                    saving={saving}
                    isNew={isNew}
                    onValuesChange={markDirty}
                    slugManuallyEdited={slugManuallyEdited}
                    onSlugManuallyEdited={setSlugManuallyEdited}
                />

                <PassageList
                    passages={passages}
                    onAdd={addPassage}
                    onRemove={removePassage}
                    onReorder={reorderPassages}
                    onUpdatePassage={updatePassage}
                    onAddQuestion={addQuestion}
                    onRemoveQuestion={removeQuestion}
                    onUpdateQuestion={updateQuestion}
                    onReorderQuestions={reorderQuestions}
                />

                {/* Actions */}
                <Space className="mb-8">
                    <Button type="primary" icon={<SaveOutlined />} loading={saving} disabled={saving} onClick={() => handleSave("draft")}>
                        Lưu nháp
                    </Button>
                    <Button type="primary" style={{ backgroundColor: "#52c41a" }} loading={saving} disabled={saving} onClick={() => handleSave("published")}>
                        Xuất bản
                    </Button>
                    {lastSavedAt && !isDirty && (
                        <Text type="secondary">
                            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                            Đã lưu lúc {lastSavedAt}
                        </Text>
                    )}
                </Space>
            </div>
        </AdminLayout>
    );
}

export const getServerSideProps = withAdmin;
