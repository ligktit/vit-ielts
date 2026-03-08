# Task 06 — Test Flow Service

## Mô tả
Tạo service cho toàn bộ luồng làm bài thi: bắt đầu (TakeTheTest), lưu nháp (Save), nộp bài (Submit + chấm điểm), xem kết quả.

## Prerequisites
- Task 03 (Scoring engine)
- Task 04 (Quiz service + types)

## Context cần đọc
- `LEGACY_CODEBASE_DOCS.md` → mục 3.2, 3.3, 3.4 (3 luồng)
- `NEW_CODEBASE_ANALYSIS.md` → mục 6.2 (Test Flow Service code mẫu)
- File cũ: `wp-content/themes/findme-old/functions.php` L1471–1586, L815–866, L939–1011

## Công việc cụ thể

### 1. Tạo Test Flow Service
**File tạo mới**: `services/test-flow.ts`

Functions (xem `LEGACY_CODEBASE_DOCS.md` mục 3.2–3.4 cho logic chi tiết):

**takeTheTest(supabase, params)**
- Check authentication
- Check Pro access (quiz.pro_user_only vs user.is_pro + expiration)
- Find existing draft (user_id + quiz_id + status=draft)
- If draft exists + !retake → return draft (resume)
- If retake → delete old draft
- Create new test_result (status=draft)
- Increment quiz.tests_taken via RPC
- Return new test_result

**saveTestResult(supabase, testId, answers, timeLeft)**
- Check authentication
- Verify ownership (user_id matches)
- Update answers + time_left on draft

**submitTestResult(supabase, testId, answers, timeLeft)**
- Check authentication
- Get test_result + quiz (with passages + questions)
- Call `calculateScore()` from `services/scoring.ts`
- Update: answers, time_left, score, status="published", submitted_at

**getTestResult(supabase, testId)**
- Get test_result with quiz data (for displaying answers)

**getUserTestHistory(supabase, userId, filters)**
- Get all published test_results for user
- Filters: quizId, skill, dateRange, page, pageSize

**getTestResultsByQuiz(supabase, quizId)**
- Admin: get all results for a quiz

## Files tạo mới
- `services/test-flow.ts`

## KHÔNG chạm vào
- `services/scoring.ts` (đã tạo ở Task 03 — chỉ import)
- `services/quiz.ts` (đã tạo ở Task 04 — chỉ import)
- Frontend pages (sửa ở Task 12)

## Acceptance Criteria
- [ ] takeTheTest: draft management (create/resume/retake)
- [ ] saveTestResult: update draft answers
- [ ] submitTestResult: calculate score + publish
- [ ] Test history: filtered + paginated
- [ ] Pro access check works correctly
- [ ] tests_taken increment via Supabase RPC
