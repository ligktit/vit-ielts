import { Input, Space, Switch, Button, Divider } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

type CheckboxOption = { option_text: string; correct: boolean };

type CheckboxEditorProps = {
    options: CheckboxOption[];
    onChange: (v: CheckboxOption[]) => void;
};

export default function CheckboxEditor({ options, onChange }: CheckboxEditorProps) {
    return (
        <div className="bg-gray-50 p-3 rounded">
            <Divider orientation="left">Checkbox Options</Divider>
            {(Array.isArray(options) ? options : []).map((o, idx) => (
                <Space key={idx} className="mb-1 w-full">
                    <Input
                        value={o.option_text}
                        onChange={(e) => {
                            const arr = [...options];
                            arr[idx] = { ...arr[idx], option_text: e.target.value };
                            onChange(arr);
                        }}
                        placeholder={`Option ${idx + 1}`}
                        style={{ width: 300 }}
                    />
                    <Switch
                        checked={o.correct}
                        onChange={(v) => {
                            const arr = [...options];
                            arr[idx] = { ...arr[idx], correct: v };
                            onChange(arr);
                        }}
                        checkedChildren="✓"
                        unCheckedChildren="✗"
                    />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onChange(options.filter((_, i) => i !== idx))} />
                </Space>
            ))}
            <Button icon={<PlusOutlined />} onClick={() => onChange([...options, { option_text: "", correct: false }])}>Thêm option</Button>
        </div>
    );
}
