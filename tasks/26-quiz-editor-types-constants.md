# Task 26 — Quiz Editor: Types & Constants

## Mô tả

Extract shared types (`QuizFormData`, `PassageData`, `QuestionData`) và constants (`QUESTION_TYPES`, `MATCHING_LAYOUTS`, defaults) ra khỏi file monolithic `[id].tsx` (658 dòng) thành module riêng. Đây là bước nền tảng cho toàn bộ refactor.

## Prerequisites

- Task 18 (Admin Quizzes Module — đã hoàn thành cơ bản)

## Context cần đọc

- `pages/admin/quizzes/[id].tsx` L33-100 — types & defaults hiện tại
- `services/types/quiz.ts` — types dùng cho scoring engine (tham khảo, không sửa)

## Công việc cụ thể

### 1. Tạo types file

**File tạo mới**: `src/features/admin-quiz/types.ts`

Extract từ `[id].tsx`:

- `QuizFormData` (L33-52) — form data cho quiz editor
- `PassageData` (L54-62)
- `QuestionData` (L64-85)

### 2. Tạo constants file

**File tạo mới**: `src/features/admin-quiz/constants.ts`

Extract từ `[id].tsx`:

- `QUESTION_TYPES` (L18-25)
- `MATCHING_LAYOUTS` (L27-31)
- `DEFAULT_PASSAGE` (L87-92)
- `DEFAULT_QUESTION` (L94-100)

### 3. Update imports

**File sửa**: `pages/admin/quizzes/[id].tsx`

Import types & constants từ `src/features/admin-quiz/` thay vì define inline.

## Files tạo mới

- `src/features/admin-quiz/types.ts`
- `src/features/admin-quiz/constants.ts`

## Files sửa

- `pages/admin/quizzes/[id].tsx`

## KHÔNG chạm vào

- `services/types/quiz.ts` (chỉ tham khảo)
- `pages/admin/quizzes/index.tsx`
- `pages/admin/quizzes/new.tsx`

## Acceptance Criteria

- [x] Types exported từ `src/features/admin-quiz/types.ts`
- [x] Constants exported từ `src/features/admin-quiz/constants.ts`
- [x] `[id].tsx` import từ files mới, không define inline nữa
- [x] Build thành công, không lỗi TypeScript
