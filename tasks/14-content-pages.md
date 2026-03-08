# Task 14 — Content Pages (Blog + Sample Essays)

## Mô tả
Migrate blog archive, blog single, sample essay archive, và sample essay single pages.

## Prerequisites
- Task 04 (Post + Sample Essay services)

## Context cần đọc
- `LEGACY_CODEBASE_DOCS.md` → mục 10 (Blog & Sample Essays)
- Pages: blog archive, blog `[slug]`, sample essay archives (4 skills), sample essay `[slug]`

## Công việc cụ thể

### 1. Blog Archive + Single
**Files sửa**:
- `pages/blog/` hoặc `pages/news/` — archive page
- `pages/[slug].tsx` hoặc `pages/blog/[slug].tsx` — single page
- Components trong `src/pages/news/` hoặc similar

Thay đổi:
- getServerSideProps: Apollo `GET_POSTS` → `getPosts(supabase, filters)`
- Single: Apollo query by slug → `getPostBySlug(supabase, slug)`
- View count: `incrementViews(supabase, postId)`
- Rating: `ratePost(supabase, postId, userId, rate)`

### 2. Sample Essay Archives (4 skill pages)
**Files sửa**:
- `pages/ielts-speaking-sample/`, `ielts-writing-sample/`, `ielts-reading-sample/`, `ielts-listening-sample/`
- Components trong `src/pages/sample-essay/`

Thay đổi:
- getServerSideProps: Apollo query → `getSampleEssays(supabase, { skill, ...filters })`
- Filters: part, questionType, quarter, year, source, topic, task, passage, search

### 3. Sample Essay Single
**File sửa**: Dynamic route cho sample essay single

Thay đổi: `getSampleEssayBySlug(supabase, slug)`

## Files sửa
- Blog pages + components
- Sample essay pages + components (4 archives + single)
- `src/pages/sample-essay/` (shared components)

## KHÔNG chạm vào
- `services/post.ts`, `services/sample-essay.ts` (chỉ import)
- Admin CMS pages (Task 20)

## Acceptance Criteria
- [ ] Blog archive: paginated, searchable
- [ ] Blog single: views + rating
- [ ] Sample essay archives: 4 skills, 10+ filters
- [ ] Sample essay single: đầy đủ content
- [ ] SSR (getServerSideProps) cho tất cả pages
