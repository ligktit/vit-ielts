import { useCallback, useState } from "react";
import {
    Card, Form, Input, Select, InputNumber, Switch, Row, Col, Button,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import FileUploadField from "./FileUploadField";
import Link from "next/link";

const { TextArea } = Input;

// ---------------------------------------------------------------------------
// Slugify helper — remove Vietnamese diacritics, lowercase, dashes
// ---------------------------------------------------------------------------
function slugify(text: string): string {
    const diacriticsMap: Record<string, string> = {
        'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'đ': 'd',
        'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    };
    return text
        .toLowerCase()
        .split('')
        .map(ch => diacriticsMap[ch] || ch)
        .join('')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

type QuizEditorFormProps = {
    form: FormInstance;
    saving?: boolean;
    isNew?: boolean;
    onValuesChange?: () => void;
    slugManuallyEdited?: boolean;
    onSlugManuallyEdited?: (v: boolean) => void;
};

export default function QuizEditorForm({
    form,
    saving,
    isNew,
    onValuesChange,
    slugManuallyEdited,
    onSlugManuallyEdited,
}: QuizEditorFormProps) {
    // Watch media fields for FileUploadField sync
    const watchFeaturedImage = Form.useWatch('featured_image', form) || '';
    const watchAudioUrl = Form.useWatch('audio_url', form) || '';
    const watchPdfUrl = Form.useWatch('pdf_url', form) || '';
    // Watch slug & status for preview link
    const currentSlug = Form.useWatch('slug', form);
    const currentStatus = Form.useWatch('status', form);

    // Internal fallback if parent doesn't manage slugManuallyEdited
    const [localSlugEdited, setLocalSlugEdited] = useState(false);
    const isSlugEdited = slugManuallyEdited ?? localSlugEdited;
    const setSlugEdited = onSlugManuallyEdited ?? setLocalSlugEdited;

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        form.setFieldsValue({ title: newTitle });
        if (!isSlugEdited) {
            form.setFieldsValue({ slug: slugify(newTitle) });
        }
        onValuesChange?.();
    }, [form, isSlugEdited, onValuesChange]);

    const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSlugEdited(true);
        form.setFieldsValue({ slug: e.target.value });
        onValuesChange?.();
    }, [form, setSlugEdited, onValuesChange]);

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                type: "practice",
                skill: "reading",
                time_minutes: 60,
                pro_user_only: false,
                status: "draft",
            }}
            onValuesChange={() => onValuesChange?.()}
        >
            {/* General Info */}
            <Card title="Thông tin chung" className="mb-4">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: "Bắt buộc" }]}>
                            <Input onChange={handleTitleChange} disabled={saving} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="slug"
                            label={
                                <span>
                                    Slug
                                    {/* Preview link */}
                                    {!isNew && currentSlug && currentStatus === 'published' && (
                                        <Link href={`/ielts-practice/${currentSlug}`} target="_blank" legacyBehavior>
                                            <a target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
                                                <Button size="small" type="link" icon={<EyeOutlined />}>
                                                    Xem trước
                                                </Button>
                                            </a>
                                        </Link>
                                    )}
                                </span>
                            }
                            rules={[{ required: true, message: "Bắt buộc" }]}
                        >
                            <Input onChange={handleSlugChange} disabled={saving} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item name="skill" label="Skill" rules={[{ required: true }]}>
                            <Select disabled={saving} options={[{ value: "reading", label: "Reading" }, { value: "listening", label: "Listening" }]} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                            <Select disabled={saving} options={[{ value: "practice", label: "Practice" }, { value: "exam", label: "Exam" }]} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="time_minutes" label="Thời gian (phút)">
                            <InputNumber min={1} max={180} className="w-full" disabled={saving} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="pro_user_only" label="Chỉ Pro" valuePropName="checked">
                            <Switch disabled={saving} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={6}><Form.Item name="source" label="Source"><Input disabled={saving} /></Form.Item></Col>
                    <Col span={6}><Form.Item name="year" label="Year"><Input disabled={saving} /></Form.Item></Col>
                    <Col span={6}><Form.Item name="quarter" label="Quarter"><Input disabled={saving} /></Form.Item></Col>
                    <Col span={6}><Form.Item name="part" label="Part"><Input disabled={saving} /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                    <Col span={8}><Form.Item name="score_type" label="Score Type"><Input disabled={saving} /></Form.Item></Col>
                    <Col span={8}><Form.Item name="question_form" label="Question Form"><Input disabled={saving} /></Form.Item></Col>
                    <Col span={8}><Form.Item name="status" label="Status">
                        <Select disabled={saving} options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }]} />
                    </Form.Item></Col>
                </Row>
                <Form.Item name="excerpt" label="Excerpt"><TextArea rows={2} disabled={saving} /></Form.Item>
            </Card>

            {/* Media */}
            <Card title="Media" className="mb-4">
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="featured_image" hidden><Input /></Form.Item>
                        <FileUploadField
                            label="Featured Image"
                            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
                            value={watchFeaturedImage}
                            onChange={(url) => form.setFieldsValue({ featured_image: url })}
                        />
                    </Col>
                    <Col span={8}>
                        <Form.Item name="audio_url" hidden><Input /></Form.Item>
                        <FileUploadField
                            label="Audio"
                            accept={{ 'audio/*': ['.mp3', '.wav', '.ogg'] }}
                            value={watchAudioUrl}
                            onChange={(url) => form.setFieldsValue({ audio_url: url })}
                        />
                    </Col>
                    <Col span={8}>
                        <Form.Item name="pdf_url" hidden><Input /></Form.Item>
                        <FileUploadField
                            label="PDF"
                            accept={{ 'application/pdf': ['.pdf'] }}
                            value={watchPdfUrl}
                            onChange={(url) => form.setFieldsValue({ pdf_url: url })}
                        />
                    </Col>
                </Row>
            </Card>
        </Form>
    );
}
