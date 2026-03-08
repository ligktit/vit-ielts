# Task 12 — Test Pages (Take the Test + Test Result)

## Mô tả
Migrate trang làm bài thi và trang xem kết quả từ GraphQL mutations sang Supabase service layer.

## Prerequisites
- Task 06 (Test flow service)

## Context cần đọc
- `LEGACY_CODEBASE_DOCS.md` → mục 3 (Quiz & Test System)
- File: `src/pages/take-the-test/` (context.tsx, components)
- File: `src/pages/test-result/` (components)
- File: `pages/take-the-test/[slug].tsx`
- File: `pages/test-result/[id].tsx`

## Công việc cụ thể

### 1. Take the Test Page
**Files sửa**:
- `pages/take-the-test/[slug].tsx` — getServerSideProps
- `src/pages/take-the-test/context.tsx` — test context (mutations)
- `src/pages/take-the-test/ui/` — timer, question renderer

Thay đổi:
- `getServerSideProps`: `getQuizBySlug(supabase, slug)` thay Apollo query
- TakeTheTest mutation → `takeTheTest(supabase, params)`
- SaveDraft mutation → `saveTestResult(supabase, ...)`
- SubmitTest mutation → `submitTestResult(supabase, ...)`
- Timer logic: giữ nguyên (client-side)
- Auto-save logic: thay Apollo mutation → Supabase service call

### 2. Test Result Page
**Files sửa**:
- `pages/test-result/[id].tsx` — getServerSideProps
- `src/pages/test-result/ui/` — result display components

Thay đổi:
- `getServerSideProps`: `getTestResult(supabase, id)` thay Apollo query
- Answer comparison logic: giữ nguyên (client-side)

### 3. Practice History Widget
**File sửa**: `src/widgets/practice-history/`

Thay đổi: `getUserTestHistory(supabase, userId)` thay Apollo query

## Files sửa
- `pages/take-the-test/[slug].tsx`
- `pages/test-result/[id].tsx`
- `src/pages/take-the-test/` (context.tsx + ui/)
- `src/pages/test-result/` (api/ + ui/)
- `src/widgets/practice-history/`

## KHÔNG chạm vào
- `services/test-flow.ts` (chỉ import)
- `services/scoring.ts` (chỉ import — được gọi bên trong test-flow)
- `src/shared/lib/calculateScore/` (client version — giữ song song)

## Acceptance Criteria
- [ ] TakeTheTest: draft create/resume/retake hoạt động
- [ ] Auto-save: answers được lưu định kỳ
- [ ] Submit: chấm điểm chính xác, status chuyển published
- [ ] Test result: hiển thị score, answers, correct answers
- [ ] Practice history: danh sách kết quả user (paginated)
