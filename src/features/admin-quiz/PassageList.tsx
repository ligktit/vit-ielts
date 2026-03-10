import { useMemo } from "react";
import { Card, Collapse, Space, Button, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined, HolderOutlined } from "@ant-design/icons";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PassageData } from "./types";
import PassageEditor from "./PassageEditor";

const { Panel } = Collapse;

type PassageListProps = {
    passages: PassageData[];
    onAdd: () => void;
    onRemove: (pIdx: number) => void;
    onReorder: (oldIndex: number, newIndex: number) => void;
    onUpdatePassage: (pIdx: number, field: string, value: unknown) => void;
    onAddQuestion: (pIdx: number) => void;
    onRemoveQuestion: (pIdx: number, qIdx: number) => void;
    onUpdateQuestion: (pIdx: number, qIdx: number, field: string, value: unknown) => void;
    onReorderQuestions: (pIdx: number, oldIndex: number, newIndex: number) => void;
};

function SortablePassagePanel({
    passage,
    pIdx,
    onRemove,
    onUpdatePassage,
    onAddQuestion,
    onRemoveQuestion,
    onUpdateQuestion,
    onReorderQuestions,
}: {
    passage: PassageData;
    pIdx: number;
    onRemove: () => void;
    onUpdatePassage: (field: string, value: unknown) => void;
    onAddQuestion: () => void;
    onRemoveQuestion: (qIdx: number) => void;
    onUpdateQuestion: (qIdx: number, field: string, value: unknown) => void;
    onReorderQuestions: (oldIndex: number, newIndex: number) => void;
}) {
    const sortableId = passage.id || `p-${pIdx}`;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sortableId });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <Collapse accordion className="mb-2">
                <Panel
                    key={sortableId}
                    header={
                        <Space>
                            <span {...listeners} style={{ cursor: "grab" }} onClick={(e) => e.stopPropagation()}>
                                <HolderOutlined />
                            </span>
                            <span>Passage {pIdx + 1}: {passage.title || "(Chưa đặt tên)"}</span>
                            <span className="text-gray-400 text-xs">
                                ({(Array.isArray(passage.questions) ? passage.questions : []).length} questions)
                            </span>
                        </Space>
                    }
                    extra={
                        <Space onClick={(e) => e.stopPropagation()}>
                            <Popconfirm title="Xóa passage?" onConfirm={onRemove} okText="Xóa" cancelText="Hủy">
                                <Button size="small" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </Space>
                    }
                >
                    <PassageEditor
                        passage={passage}
                        pIdx={pIdx}
                        onUpdatePassage={onUpdatePassage}
                        onAddQuestion={onAddQuestion}
                        onRemoveQuestion={onRemoveQuestion}
                        onUpdateQuestion={onUpdateQuestion}
                        onReorderQuestions={onReorderQuestions}
                    />
                </Panel>
            </Collapse>
        </div>
    );
}

export default function PassageList({
    passages,
    onAdd,
    onRemove,
    onReorder,
    onUpdatePassage,
    onAddQuestion,
    onRemoveQuestion,
    onUpdateQuestion,
    onReorderQuestions,
}: PassageListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const sortableIds = useMemo(
        () => passages.map((p, idx) => p.id || `p-${idx}`),
        [passages],
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = sortableIds.indexOf(String(active.id));
        const newIndex = sortableIds.indexOf(String(over.id));
        if (oldIndex !== -1 && newIndex !== -1) {
            onReorder(oldIndex, newIndex);
        }
    };

    return (
        <Card
            title={`Passages (${passages.length})`}
            className="mb-4"
            extra={<Button icon={<PlusOutlined />} onClick={onAdd}>Thêm Passage</Button>}
        >
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                    {passages.map((passage, pIdx) => (
                        <SortablePassagePanel
                            key={passage.id || `p-${pIdx}`}
                            passage={passage}
                            pIdx={pIdx}
                            onRemove={() => onRemove(pIdx)}
                            onUpdatePassage={(field, value) => onUpdatePassage(pIdx, field, value)}
                            onAddQuestion={() => onAddQuestion(pIdx)}
                            onRemoveQuestion={(qIdx) => onRemoveQuestion(pIdx, qIdx)}
                            onUpdateQuestion={(qIdx, field, value) => onUpdateQuestion(pIdx, qIdx, field, value)}
                            onReorderQuestions={(oldIndex, newIndex) => onReorderQuestions(pIdx, oldIndex, newIndex)}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </Card>
    );
}
