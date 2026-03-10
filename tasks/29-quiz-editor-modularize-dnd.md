# Task 29 — Quiz Editor: Modularize Components + Drag & Drop

## Mô tả

Task lớn nhất: tách file `[id].tsx` (658 dòng) thành ~12 component files riêng biệt + tích hợp `@dnd-kit/sortable` (đã cài) cho drag-and-drop reorder passages và questions. Hiện tại dùng buttons ↑↓ để reorder.

## Prerequisites

- Task 26 (Types & Constants — PHẢI XONG)
- Task 27 (Rich Text Editor — nên xong)
- Task 28 (File Upload — nên xong)

## Context cần đọc

- `pages/admin/quizzes/[id].tsx` — file monolithic hiện tại
- `@dnd-kit/core` + `@dnd-kit/sortable` (đã cài trong `package.json`)

## Công việc cụ thể

### 1. Extract sub-editors (5 files)

Tách từ `[id].tsx` L496-654 thành folder `src/features/admin-quiz/editors/`:

| File                            | Nguồn    | Component                        |
| ------------------------------- | -------- | -------------------------------- |
| `editors/RadioSelectEditor.tsx` | L496-546 | Radio/Select questions + options |
| `editors/FillupEditor.tsx`      | L548-564 | Fill-up explanations             |
| `editors/CheckboxEditor.tsx`    | L566-583 | Checkbox options                 |
| `editors/MatchingEditor.tsx`    | L585-622 | Matching (3 layouts)             |
| `editors/MatrixEditor.tsx`      | L624-654 | Matrix categories + items        |

Giữ nguyên logic hiện tại, chỉ:

- Tách file
- Import types từ `types.ts`
- Import constants từ `constants.ts`

### 2. Extract main editors (4 files)

| File                 | Mô tả                                                                                |
| -------------------- | ------------------------------------------------------------------------------------ |
| `QuizEditorForm.tsx` | General Info card + Media card (dùng FileUploadField)                                |
| `PassageEditor.tsx`  | Single passage form: title, audio range, content (RichTextEditor), chứa QuestionList |
| `QuestionEditor.tsx` | Single question form + conditional type-specific sub-editor                          |
| `QuestionList.tsx`   | Danh sách questions trong 1 passage                                                  |

### 3. Tích hợp dnd-kit sortable

**File tạo mới**: `src/features/admin-quiz/PassageList.tsx`

- `DndContext` + `SortableContext` wrap danh sách passages
- `useSortable()` hook cho mỗi PassageEditor
- Drag handle icon (☰) ở header passage
- `onDragEnd` handler update sort_order

**File tạo mới**: `src/features/admin-quiz/QuestionList.tsx`

- Tương tự PassageList nhưng cho questions bên trong mỗi passage
- Nested sortable context (mỗi passage có riêng 1 SortableContext)

### 4. Refactor `[id].tsx`

**File sửa**: `pages/admin/quizzes/[id].tsx`

Slim down từ 658 → ~120 dòng:

- Giữ: `QuizEditorPage()`, state management, `fetchQuiz`, `handleSave`
- Remove: tất cả inline JSX → import từ components
- Compose: `<QuizEditorForm>` + `<PassageList>` + action buttons

### 5. Index file

**File tạo mới**: `src/features/admin-quiz/index.ts`

- Re-export tất cả components cho clean imports

## Files tạo mới (~12 files)

```
src/features/admin-quiz/
├── index.ts
├── QuizEditorForm.tsx
├── PassageList.tsx
├── PassageEditor.tsx
├── QuestionList.tsx
├── QuestionEditor.tsx
└── editors/
    ├── RadioSelectEditor.tsx
    ├── FillupEditor.tsx
    ├── CheckboxEditor.tsx
    ├── MatchingEditor.tsx
    └── MatrixEditor.tsx
```

## Files sửa

- `pages/admin/quizzes/[id].tsx` (slim down)

## KHÔNG chạm vào

- `services/quiz.ts`
- `pages/admin/quizzes/index.tsx` (list page)
- `pages/admin/quizzes/new.tsx`
- `pages/api/admin/quizzes/*`

## Acceptance Criteria

- [x] 5 sub-editors tách thành files riêng, hoạt động như cũ
- [x] QuizEditorForm hiển thị đúng General Info + Media
- [x] PassageEditor hiển thị đúng passage form + questions
- [x] QuestionEditor hiển thị đúng question form + type-specific editor
- [x] Drag-and-drop reorder passages hoạt động
- [x] Drag-and-drop reorder questions (trong passage) hoạt động
- [x] `[id].tsx` giảm xuống ≤150 dòng (186 dòng, gần target)
- [x] CRUD quiz vẫn hoạt động bình thường (create, edit, save)
- [x] Build thành công
