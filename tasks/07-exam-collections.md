# Task 07 — Exam Collections Service

## Mô tả
Port logic exam_collections_resolve() — query nested 3 cấp (Collection → MockTest → PracticeTest) sang Supabase.

## Prerequisites
- Task 04 (Quiz service + types)

## Context cần đọc
- `LEGACY_CODEBASE_DOCS.md` → mục 5 (Exam Collections) — logic nested phức tạp
- File cũ: `wp-content/themes/findme-old/functions.php` L1819–1993

## Công việc cụ thể

### 1. Tạo Exam Collections Service
**File tạo mới**: `services/exam-collection.ts`

Functions:
- `getExamCollections(supabase, filters)` — thay thế `exam_collections_resolve()`
  - Filters: type, search, questionForm, page, pageSize
  - Return: `{ data: { reading: Collection[], listening: Collection[] }, pageInfo }`

Logic (xem LEGACY_CODEBASE_DOCS.md mục 5):
1. Query quizzes matching filters (type != 'practice')
2. Find mock_tests containing those quizzes (practice_tests JSONB)
3. Find collections containing those mock_tests (mock_test_ids array)
4. Build nested response grouped by skill (reading/listening)

**Lưu ý**: Logic cũ dùng WP_Query nested rất heavy. Với Supabase có thể:
- Dùng Supabase joins hoặc
- Dùng PostgreSQL function (RPC) cho performance tốt hơn

- `getCollectionDetail(supabase, collectionId)` — chi tiết 1 collection

## Files tạo mới
- `services/exam-collection.ts`

## KHÔNG chạm vào
- `services/quiz.ts` (chỉ import types)
- Frontend pages (sửa ở Task 11)

## Acceptance Criteria
- [ ] getExamCollections trả về data grouped by reading/listening
- [ ] Pagination works (total, currentPage)
- [ ] Filters: type, search, questionForm
- [ ] Nested resolution: collection → mock_tests → quizzes
