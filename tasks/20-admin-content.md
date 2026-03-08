# Task 20 — Admin Content (Test Results + Blog + Sample Essays)

## Mô tả
Tạo admin modules cho Test Results (view + stats), Blog Posts (CRUD + rich text), và Sample Essays (CRUD).

## Prerequisites
- Task 04 (Post + Essay services)
- Task 16 (Admin layout)

## Context cần đọc
- `Backend_migration_plan.md` → mục 7.4, 7.6, 7.7
- `LEGACY_CODEBASE_DOCS.md` → mục 10 (Blog & Sample Essays)

## Công việc cụ thể

### 1. Test Results Module
**File tạo mới**: `pages/admin/test-results/index.tsx`

Ant Design Table:
- Columns: User, Quiz, Score, Status, Time Spent, Submitted At
- Filters: user, quiz, score range, status, date range
- Actions: View detail, Delete (draft cleanup)
- Stats: avg score per quiz, score distribution chart

### 2. Blog Posts Module
**Files tạo mới**: 
- `pages/admin/posts/index.tsx` — list
- `pages/admin/posts/[id].tsx` — editor (create + edit)

Editor features:
- Rich text editor (Ant Design + tiptap hoặc react-quill)
- SEO fields: title, description, slug
- Featured image upload
- Status toggle: draft/published
- Categories/tags (optional — JSONB)

### 3. Sample Essays Module
**Files tạo mới**:
- `pages/admin/sample-essays/index.tsx` — list
- `pages/admin/sample-essays/[id].tsx` — editor

Editor features:
- Rich text editor
- Metadata: skill, part, questionType, quarter, year, source, topic, task, passage
- SEO fields
- Status toggle

### 4. API Routes
**Files tạo mới**:
- `pages/api/admin/test-results/index.ts` — GET list, DELETE
- `pages/api/admin/posts/index.ts` — GET list, POST
- `pages/api/admin/posts/[id].ts` — GET, PUT, DELETE
- `pages/api/admin/sample-essays/index.ts` — GET list, POST
- `pages/api/admin/sample-essays/[id].ts` — GET, PUT, DELETE

## Files tạo mới
- 5 page files + 5 API route files

## KHÔNG chạm vào
- `services/` (chỉ import)
- Frontend content pages (Task 14)

## Acceptance Criteria
- [ ] Test results: list, filter, stats
- [ ] Blog CRUD with rich text editor
- [ ] Sample essays CRUD with metadata fields
- [ ] SEO fields cho blog + essays
- [ ] File upload cho featured images
