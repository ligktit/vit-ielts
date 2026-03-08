# Task 04 — Quiz Service + Types

## Mô tả
Tạo service layer cho Quiz CRUD, filters, và related quizzes. Thay thế toàn bộ WPGraphQL quiz queries và `bp_quiz_creator` filters.

## Prerequisites
- Task 01 (Supabase clients)
- Task 03 (Quiz types đã tạo)

## Context cần đọc
- `LEGACY_CODEBASE_DOCS.md` → mục 3.1 (Data Model), mục 10 (Blog & Sample Essays)
- `NEW_CODEBASE_ANALYSIS.md` → mục 6.1 (Quiz Service)
- File cũ: `wp-content/themes/findme-old/bp_quiz_creator/index.php` lines 192–440 (filters)
- File cũ: `src/shared/types/exam.ts` (hiện tại)

## Công việc cụ thể

### 1. Tạo Shared DB Types
**File tạo mới**: `services/types/database.ts`

Types cho các table khác (không quiz — quiz types đã ở Task 03):
```typescript
export type TestResult = { id: string; user_id: string; quiz_id: string; ... };
export type Order = { id: string; order_id: string; user_id: string; ... };
export type Post = { id: string; title: string; slug: string; ... };
export type SampleEssay = { id: string; title: string; skill: string; ... };
export type CmsConfig = { id: string; section_name: string; data: any; ... };
export type SiteSetting = { id: string; key: string; value: any; ... };
export type Menu = { id: string; location: string; items: any[]; ... };
// etc.
```

### 2. Tạo Quiz Service
**File tạo mới**: `services/quiz.ts`

Functions:
- `getQuizBySlug(supabase, slug)` — lấy quiz + passages + questions (sorted)
- `getQuizzes(supabase, filters)` — danh sách quiz với filters (skill, type, year, source, quarter, part, questionForm, search, page, pageSize)
- `getQuizFilterOptions(supabase)` — lấy distinct values cho filter dropdowns (years, sources, parts, quarters)
- `getRelatedQuizzes(supabase, quizId)` — tìm quiz tương tự (cùng source, year, quarter, skill)
- `createQuiz(supabase, data)` — admin create (insert quiz + passages + questions)
- `updateQuiz(supabase, id, data)` — admin update
- `deleteQuiz(supabase, id)` — admin delete (CASCADE sẽ xóa passages + questions)

### 3. Tạo Post Service
**File tạo mới**: `services/post.ts`

Functions:
- `getPostBySlug(supabase, slug)` — chi tiết bài viết
- `getPosts(supabase, { page, pageSize, category, search })` — danh sách
- `incrementViews(supabase, postId)` — tăng lượt xem
- `ratePost(supabase, postId, userId, rate)` — đánh giá (votes JSONB)

### 4. Tạo Sample Essay Service
**File tạo mới**: `services/sample-essay.ts`

Functions:
- `getSampleEssayBySlug(supabase, slug)`
- `getSampleEssays(supabase, filters)` — filters: skill, part, questionType, quarter, year, source, topic, task, passage, search, page, pageSize

Origin: functions.php L550–671 (filter logic)

## Files tạo mới
- `services/types/database.ts`
- `services/quiz.ts`
- `services/post.ts`
- `services/sample-essay.ts`

## KHÔNG chạm vào
- `services/scoring.ts` (Task 03)
- `src/` (frontend pages — chưa sửa)
- `pages/api/` (API routes — chưa sửa)

## Acceptance Criteria
- [ ] Quiz service: getBySlug trả về quiz + nested passages/questions sorted
- [ ] Quiz filters: skill, type, year, source, quarter, part, questionForm, search, pagination
- [ ] Related quizzes: tìm quiz tương tự dựa trên metadata
- [ ] Post service: CRUD + views + rating
- [ ] Sample essay service: 10+ filter params
- [ ] Database types export đầy đủ cho tất cả tables
