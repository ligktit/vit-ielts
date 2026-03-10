import { Input, Space, Button, Divider } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

type FillupEditorProps = {
    explanations: { content: string }[];
    onChange: (v: { content: string }[]) => void;
};

export default function FillupEditor({ explanations, onChange }: FillupEditorProps) {
    return (
        <div className="bg-gray-50 p-3 rounded">
            <Divider orientation="left">Fill-up Explanations</Divider>
            {(Array.isArray(explanations) ? explanations : []).map((e, idx) => (
                <Space key={idx} className="mb-1 w-full">
                    <Input
                        value={e.content}
                        onChange={(ev) => {
                            const arr = [...explanations];
                            arr[idx] = { content: ev.target.value };
                            onChange(arr);
                        }}
                        placeholder={`Answer ${idx + 1}`}
                        style={{ width: 400 }}
                    />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onChange(explanations.filter((_, i) => i !== idx))} />
                </Space>
            ))}
            <Button icon={<PlusOutlined />} onClick={() => onChange([...explanations, { content: "" }])}>Thêm đáp án</Button>
        </div>
    );
}
