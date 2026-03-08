# Task 18 — Admin Quizzes Module

## Mô tả
Module quản lý quiz phức tạp nhất: CRUD quiz + nested Passages + Questions editor. Hỗ trợ 6 question types.

## Prerequisites
- Task 04 (Quiz service)
- Task 16 (Admin layout)

## Context cần đọc
- `Backend_migration_plan.md` → mục 7.3 (Quản lý Quizzes) — ĐỌC KỸ
- `LEGACY_CODEBASE_DOCS.md` → mục 3.1 (Quiz data model) — 6 question types
- File cũ: `wp-content/themes/findme-old/bp_quiz_creator/` (quiz editor hiện tại)

## Công việc cụ thể

### 1. Quiz List Page
**File tạo mới**: `pages/admin/quizzes/index.tsx`

Ant Design Table:
- Columns: Title, Skill, Type, Status, Tests Taken, Pro Only, Created
- Filters: skill, type, status, search
- Bulk actions: publish, draft, delete
- Actions: Edit, Clone, Delete

### 2. Quiz Editor Page (PHỨC TẠP)
**File tạo mới**: `pages/admin/quizzes/[id].tsx` + `pages/admin/quizzes/new.tsx`

Nested form với 3 cấp:
```
Quiz Form
├── General Info: title, slug, skill, type, time_minutes, score_type, pro_user_only
├── Media: featured_image (upload), audio (upload), pdf (upload)
├── Passages (sortable list — drag & drop)
│   └── Passage Form
│       ├── title, content (Rich Text Editor)
│       ├── audio_start, audio_end
│       └── Questions (sortable list — drag & drop)
│           └── Question Form
│               ├── type selector (radio|select|fillup|checkbox|matching|matrix)
│               ├── title, question_text (Rich Text), instructions, question_form
│               └── Answer Editor (dynamic — thay đổi theo type)
│                   ├── [radio/select] list_of_questions: [{question, correct, options}]
│                   ├── [fillup] explanations: [{content}]
│                   ├── [checkbox] list_of_options: [{option_text, correct}]
│                   ├── [matching] matching_question: {layout_type, matching_items, answer_options, summary_text}
│                   └── [matrix] matrix_question: {matrix_categories, matrix_items}
└── Actions: Save Draft, Publish, Clone
```

Components cần tạo:
- `QuizEditorForm` — main form
- `PassageEditor` — passage form với sortable
- `QuestionEditor` — question form với type-based answer editor
- `RadioOptionsEditor` — list_of_questions editor
- `FillupAnswersEditor` — explanations editor
- `CheckboxOptionsEditor` — list_of_options editor
- `MatchingQuestionEditor` — matching config editor (3 layouts)
- `MatrixQuestionEditor` — matrix config editor

### 3. API Routes
**Files tạo mới**:
- `pages/api/admin/quizzes/index.ts` — GET list, POST create
- `pages/api/admin/quizzes/[id].ts` — GET detail, PUT update, DELETE
- `pages/api/admin/quizzes/[id]/clone.ts` — POST clone (deep copy)

### 4. File Upload
Sử dụng Supabase Storage hoặc Vercel Blob cho:
- Quiz featured image
- Audio files (Listening)
- PDF files

## Files tạo mới
- `pages/admin/quizzes/index.tsx`
- `pages/admin/quizzes/new.tsx`
- `pages/admin/quizzes/[id].tsx`
- `src/pages/admin/quizzes/` (components folder — ~10 files)
- `pages/api/admin/quizzes/index.ts`
- `pages/api/admin/quizzes/[id].ts`
- `pages/api/admin/quizzes/[id]/clone.ts`

## KHÔNG chạm vào
- `services/quiz.ts` (chỉ import)
- `wp-content/themes/findme-old/bp_quiz_creator/` (WordPress editor — sẽ xóa Task 23)
- Frontend quiz pages (Task 11)

## Acceptance Criteria
- [ ] Quiz CRUD: create, read, update, delete
- [ ] 6 question type editors hoạt động
- [ ] Matching: 3 layout types (standard, summary, heading)
- [ ] Passage + Question sortable (drag & drop)
- [ ] Clone quiz (deep copy)
- [ ] File upload (image, audio, PDF)
- [ ] Rich text editor cho passage content
