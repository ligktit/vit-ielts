import { Input, Select, Form, Space, Button, Divider } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { MATCHING_LAYOUTS } from "../constants";

const { TextArea } = Input;

type MatchingData = {
    layout_type: string;
    matching_items: { questionPart: string; correctAnswer: string }[];
    answer_options: { option_text: string }[];
    summary_text?: string;
};

type MatchingEditorProps = {
    data: MatchingData;
    onChange: (v: MatchingData) => void;
};

export default function MatchingEditor({ data, onChange }: MatchingEditorProps) {
    const update = (field: string, value: unknown) => onChange({ ...data, [field]: value });

    return (
        <div className="bg-gray-50 p-3 rounded">
            <Divider orientation="left">Matching</Divider>
            <Form.Item label="Layout Type">
                <Select value={data.layout_type} onChange={(v) => update("layout_type", v)} options={MATCHING_LAYOUTS} style={{ width: 200 }} />
            </Form.Item>
            {data.layout_type === "summary" && (
                <Form.Item label="Summary Text">
                    <TextArea rows={3} value={data.summary_text ?? ""} onChange={(e) => update("summary_text", e.target.value)} />
                </Form.Item>
            )}
            <Divider orientation="left" plain>Matching Items</Divider>
            {(data.matching_items ?? []).map((item, idx) => (
                <Space key={idx} className="mb-1 w-full">
                    <Input placeholder="Question Part" value={item.questionPart} onChange={(e) => { const arr = [...data.matching_items]; arr[idx] = { ...arr[idx], questionPart: e.target.value }; update("matching_items", arr); }} style={{ width: 250 }} />
                    <Input placeholder="Correct Answer" value={item.correctAnswer} onChange={(e) => { const arr = [...data.matching_items]; arr[idx] = { ...arr[idx], correctAnswer: e.target.value }; update("matching_items", arr); }} style={{ width: 200 }} />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => update("matching_items", data.matching_items.filter((_, i) => i !== idx))} />
                </Space>
            ))}
            <Button icon={<PlusOutlined />} onClick={() => update("matching_items", [...(data.matching_items ?? []), { questionPart: "", correctAnswer: "" }])}>Thêm item</Button>

            <Divider orientation="left" plain>Answer Options</Divider>
            {(data.answer_options ?? []).map((opt, idx) => (
                <Space key={idx} className="mb-1 w-full">
                    <Input placeholder={`Option ${idx + 1}`} value={opt.option_text} onChange={(e) => { const arr = [...data.answer_options]; arr[idx] = { option_text: e.target.value }; update("answer_options", arr); }} style={{ width: 300 }} />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => update("answer_options", data.answer_options.filter((_, i) => i !== idx))} />
                </Space>
            ))}
            <Button icon={<PlusOutlined />} onClick={() => update("answer_options", [...(data.answer_options ?? []), { option_text: "" }])}>Thêm option</Button>
        </div>
    );
}
