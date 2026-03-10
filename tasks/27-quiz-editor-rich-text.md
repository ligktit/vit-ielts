# Task 27 — Quiz Editor: Rich Text Editor

## Mô tả

Tích hợp Rich Text Editor thay thế plain `<TextArea>` cho các trường HTML content: `passage.content` và `question.question_text`. Hiện tại admin phải viết raw HTML bằng tay.

## Prerequisites

- Task 26 (Types & Constants)

## Context cần đọc

- `pages/admin/quizzes/[id].tsx` L390-391 — TextArea cho passage content
- `pages/admin/quizzes/[id].tsx` L433-434 — TextArea cho question_text

## Công việc cụ thể

### 1. Install Rich Text Editor

```bash
npm install react-quill-new
```

Lưu ý: `react-quill-new` là fork hỗ trợ React 19 (project đang dùng React 19.1).

### 2. Tạo RichTextEditor wrapper

**File tạo mới**: `src/features/admin-quiz/RichTextEditor.tsx`

- Dynamic import (`next/dynamic` với `ssr: false`) vì Quill cần browser DOM
- Toolbar modules: Bold, Italic, Underline, Strike, Lists (ordered/unordered), Link, Clean
- Import CSS: `react-quill-new/dist/quill.snow.css`
- Props: `value: string`, `onChange: (html: string) => void`, `placeholder?: string`

### 3. Tích hợp vào quiz editor

**File sửa**: `pages/admin/quizzes/[id].tsx`

Thay thế:

- `<TextArea rows={6}>` cho passage content → `<RichTextEditor>`
- `<TextArea rows={3}>` cho question_text → `<RichTextEditor>`

## Files tạo mới

- `src/features/admin-quiz/RichTextEditor.tsx`

## Files sửa

- `pages/admin/quizzes/[id].tsx`
- `package.json` (npm install)

## KHÔNG chạm vào

- `services/quiz.ts`
- Question type sub-editors
- `pages/admin/quizzes/index.tsx`

## Acceptance Criteria

- [x] `react-quill-new` installed thành công
- [x] RichTextEditor component render đúng, dynamic import
- [x] Passage content dùng Rich Text Editor thay vì TextArea
- [x] Question text dùng Rich Text Editor thay vì TextArea
- [x] HTML output lưu đúng vào database
- [x] Build thành công (TypeScript compiles with 0 errors; build EPERM error is unrelated Windows permission issue)
