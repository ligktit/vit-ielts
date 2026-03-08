# Task 11 — Library Pages (Practice + Exam)

## Mô tả
Migrate practice library, practice single, và exam library pages từ Apollo/GraphQL sang Supabase.

## Prerequisites
- Task 04 (Quiz service)
- Task 07 (Exam collections service)

## Context cần đọc
- `LEGACY_CODEBASE_DOCS.md` → mục 3.1 (Quiz data model), mục 5 (Exam Collections)
- Các page: `pages/ielts-practice-library/`, `src/pages/ielts-practice-library/`, `src/pages/ielts-practice-single/`
- Các page: `pages/ielts-exam-library/`, `src/pages/ielts-exam-library/`

## Công việc cụ thể

### 1. Practice Library (danh sách)
**Files sửa**: 
- `pages/ielts-practice-library/*.tsx` — getServerSideProps
- `src/pages/ielts-practice-library/` — components

Thay đổi:
- `getServerSideProps`: Thay `apolloClient.query(GET_PRACTICE_TESTS)` → `getQuizzes(supabase, { type: "practice", skill })`
- Thay `getMasterData()` call
- Filters: skill toggle (reading/listening), search, questionForm, pagination

### 2. Practice Single (chi tiết 1 bài)
**Files sửa**:
- `pages/ielts-practice-library/[slug].tsx` — getServerSideProps
- `src/pages/ielts-practice-single/` — components

Thay đổi:
- `getServerSideProps`: Thay `apolloClient.query(GET_PRACTICE_SINGLE)` → `getQuizBySlug(supabase, slug)`
- Related quizzes: `getRelatedQuizzes(supabase, quizId)`
- Rating: `ratePost(supabase, quizId, userId, rate)`

### 3. Exam Library (bộ sưu tập)
**Files sửa**:
- `pages/ielts-exam-library/*.tsx`
- `src/pages/ielts-exam-library/`

Thay đổi:
- `getServerSideProps`: Thay `apolloClient.query(GET_EXAM_COLLECTIONS)` → `getExamCollections(supabase, filters)`
- Nested data: collections → mock_tests → quizzes

### 4. Quiz Library Nav Widget
**File sửa**: `src/widgets/quiz-library-nav/`

Thay đổi: filter options từ `getQuizFilterOptions(supabase)`

## Files sửa
- `pages/ielts-practice-library/*.tsx`
- `pages/ielts-exam-library/*.tsx`
- `src/pages/ielts-practice-library/`
- `src/pages/ielts-practice-single/`
- `src/pages/ielts-exam-library/`
- `src/widgets/quiz-library-nav/`

## KHÔNG chạm vào
- `pages/take-the-test/` (Task 12)
- `pages/test-result/` (Task 12)
- `services/` (chỉ import)

## Acceptance Criteria
- [ ] Practice library renders danh sách quiz từ Supabase
- [ ] Filters (skill, search, questionForm) hoạt động
- [ ] Practice single hiển thị quiz detail + related quizzes
- [ ] Exam library hiển thị nested collections
- [ ] Pagination hoạt động ở tất cả danh sách
- [ ] SSR data fetching (getServerSideProps)
