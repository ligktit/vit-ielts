# Task 30 — Quiz Editor: UX Polish

## Mô tả

Cải thiện trải nghiệm người dùng cho quiz editor: auto-slug từ title, cảnh báo khi rời trang có thay đổi chưa lưu, loading states, và keyboard shortcuts.

## Prerequisites

- Task 29 (Modularize Components + DnD — PHẢI XONG)

## Context cần đọc

- Components trong `src/features/admin-quiz/`
- `pages/admin/quizzes/[id].tsx` — main editor page

## Công việc cụ thể

### 1. Auto-slug generation

**File sửa**: `src/features/admin-quiz/QuizEditorForm.tsx`

- Khi user nhập title → tự động generate slug (lowercase, dấu cách → dashes, remove diacritics)
- Chỉ auto-generate khi slug trống hoặc chưa bị user edit thủ công
- Dùng simple slugify function (không cần thêm package)

### 2. Unsaved changes warning

**File sửa**: `pages/admin/quizzes/[id].tsx`

- Track `isDirty` state: true khi form hoặc passages thay đổi so với data đã load
- `beforeunload` event: cảnh báo khi close tab/navigate away
- Next.js `routeChangeStart` event: cảnh báo khi navigate trong app

### 3. Better loading & feedback

**File sửa**: `pages/admin/quizzes/[id].tsx`

- Saving state: disable tất cả inputs khi đang save
- Success: hiển thị timestamp "Đã lưu lúc HH:mm"
- Error: hiển thị chi tiết lỗi, highlight field lỗi nếu có

### 4. Keyboard shortcuts (optional)

**File sửa**: `pages/admin/quizzes/[id].tsx`

- `Ctrl+S` → Save draft
- `Ctrl+Shift+S` → Publish

### 5. Quiz preview link (optional)

**File sửa**: `src/features/admin-quiz/QuizEditorForm.tsx`

- Nút "Xem trước" link đến frontend quiz page (`/ielts-practice/[slug]`)
- Chỉ hiện khi quiz đã có slug và status = published

## Files sửa

- `pages/admin/quizzes/[id].tsx`
- `src/features/admin-quiz/QuizEditorForm.tsx`

## KHÔNG chạm vào

- `services/quiz.ts`
- API routes
- Sub-editors
- Frontend quiz pages

## Acceptance Criteria

- [x] Auto-slug generate đúng từ title
- [x] Cảnh báo unsaved changes khi navigate away
- [x] Loading/saving states rõ ràng
- [x] Ctrl+S save draft hoạt động
- [x] Build thành công
