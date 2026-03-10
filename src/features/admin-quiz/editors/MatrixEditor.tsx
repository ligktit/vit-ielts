import { Input, Space, Button, Divider } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

type MatrixData = {
    matrix_categories: { category_letter: string; category_text: string }[];
    matrix_items: { item_text: string; correct_category_letter: string }[];
};

type MatrixEditorProps = {
    data: MatrixData;
    onChange: (v: MatrixData) => void;
};

export default function MatrixEditor({ data, onChange }: MatrixEditorProps) {
    const update = (field: string, value: unknown) => onChange({ ...data, [field]: value });

    return (
        <div className="bg-gray-50 p-3 rounded">
            <Divider orientation="left">Matrix</Divider>
            <Divider orientation="left" plain>Categories</Divider>
            {(data.matrix_categories ?? []).map((cat, idx) => (
                <Space key={idx} className="mb-1 w-full">
                    <Input placeholder="Letter (A, B, C...)" value={cat.category_letter} onChange={(e) => { const arr = [...data.matrix_categories]; arr[idx] = { ...arr[idx], category_letter: e.target.value }; update("matrix_categories", arr); }} style={{ width: 120 }} />
                    <Input placeholder="Category text" value={cat.category_text} onChange={(e) => { const arr = [...data.matrix_categories]; arr[idx] = { ...arr[idx], category_text: e.target.value }; update("matrix_categories", arr); }} style={{ width: 300 }} />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => update("matrix_categories", data.matrix_categories.filter((_, i) => i !== idx))} />
                </Space>
            ))}
            <Button icon={<PlusOutlined />} onClick={() => update("matrix_categories", [...(data.matrix_categories ?? []), { category_letter: "", category_text: "" }])}>Thêm category</Button>

            <Divider orientation="left" plain>Items</Divider>
            {(data.matrix_items ?? []).map((item, idx) => (
                <Space key={idx} className="mb-1 w-full">
                    <Input placeholder="Item text" value={item.item_text} onChange={(e) => { const arr = [...data.matrix_items]; arr[idx] = { ...arr[idx], item_text: e.target.value }; update("matrix_items", arr); }} style={{ width: 300 }} />
                    <Input placeholder="Correct letter" value={item.correct_category_letter} onChange={(e) => { const arr = [...data.matrix_items]; arr[idx] = { ...arr[idx], correct_category_letter: e.target.value }; update("matrix_items", arr); }} style={{ width: 120 }} />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => update("matrix_items", data.matrix_items.filter((_, i) => i !== idx))} />
                </Space>
            ))}
            <Button icon={<PlusOutlined />} onClick={() => update("matrix_items", [...(data.matrix_items ?? []), { item_text: "", correct_category_letter: "" }])}>Thêm item</Button>
        </div>
    );
}
