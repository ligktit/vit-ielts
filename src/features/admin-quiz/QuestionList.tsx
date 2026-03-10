import { useMemo } from "react";
import { Card, Space, Button, Tag } from "antd";
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
import type { QuestionData } from "./types";
import QuestionEditor from "./QuestionEditor";

type QuestionListProps = {
    questions: QuestionData[];
    onAdd: () => void;
    onRemove: (qIdx: number) => void;
    onUpdate: (qIdx: number, field: string, value: unknown) => void;
    onReorder: (oldIndex: number, newIndex: number) => void;
};

function SortableQuestionCard({
    question,
    qIdx,
    totalCount,
    onRemove,
    onUpdate,
}: {
    question: QuestionData;
    qIdx: number;
    totalCount: number;
    onRemove: () => void;
    onUpdate: (field: string, value: unknown) => void;
}) {
    const sortableId = question.id || `q-${qIdx}`;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sortableId });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <Card
                size="small"
                className="mb-3"
                title={
                    <Space>
                        <span {...listeners} style={{ cursor: "grab" }}><HolderOutlined /></span>
                        <span>Q{qIdx + 1}: {question.title || question.type}</span>
                        <Tag>{question.type}</Tag>
                    </Space>
                }
                extra={
                    <Space>
                        <Button size="small" danger icon={<DeleteOutlined />} onClick={onRemove} />
                    </Space>
                }
            >
                <QuestionEditor question={question} onUpdate={onUpdate} />
            </Card>
        </div>
    );
}

export default function QuestionList({ questions, onAdd, onRemove, onUpdate, onReorder }: QuestionListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const safeQuestions = Array.isArray(questions) ? questions : [];

    const sortableIds = useMemo(
        () => safeQuestions.map((q, idx) => q.id || `q-${idx}`),
        [safeQuestions],
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
        <div>
            <Button icon={<PlusOutlined />} onClick={onAdd} className="mb-3">
                Thêm Question
            </Button>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                    {safeQuestions.map((q, qIdx) => (
                        <SortableQuestionCard
                            key={q.id || `q-${qIdx}`}
                            question={q}
                            qIdx={qIdx}
                            totalCount={safeQuestions.length}
                            onRemove={() => onRemove(qIdx)}
                            onUpdate={(field, value) => onUpdate(qIdx, field, value)}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
}
