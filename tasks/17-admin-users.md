# Task 17 — Admin Users Module

## Mô tả
Tạo module quản lý users: danh sách, chi tiết, bật/tắt Pro, khóa tài khoản.

## Prerequisites
- Task 05 (User service)
- Task 16 (Admin layout)

## Context cần đọc
- `Backend_migration_plan.md` → mục 7.2 (Quản lý Users)
- `LEGACY_CODEBASE_DOCS.md` → mục 9 (User Management)

## Công việc cụ thể

### 1. Users List Page
**File tạo mới**: `pages/admin/users/index.tsx`

Ant Design Table:
- Columns: Avatar, Name, Email, Pro Status, Pro Expiration, Created At
- Filters: search (name/email), Pro/Free toggle, sort
- Pagination
- Actions: View, Toggle Pro

### 2. User Detail Page
**File tạo mới**: `pages/admin/users/[id].tsx`

Hiển thị:
- Profile info (name, email, avatar, gender, DOB, phone)
- Pro status + expiration + toggle Pro (set duration)
- Lịch sử làm bài (test results — top 20)
- Lịch sử thanh toán (orders)
- Devices info (JSONB)
- Target score

### 3. API Routes
**Files tạo mới**:
- `pages/api/admin/users/index.ts` — GET (list), POST (create)
- `pages/api/admin/users/[id].ts` — GET (detail), PUT (update), DELETE
- `pages/api/admin/users/[id]/toggle-pro.ts` — POST (activate/deactivate Pro)

## Files tạo mới
- `pages/admin/users/index.tsx`
- `pages/admin/users/[id].tsx`
- `pages/api/admin/users/index.ts`
- `pages/api/admin/users/[id].ts`
- `pages/api/admin/users/[id]/toggle-pro.ts`

## KHÔNG chạm vào
- `services/user.ts` (chỉ import)
- Frontend account pages (Task 13)

## Acceptance Criteria
- [ ] User list: search, filter Pro/Free, pagination, sortable
- [ ] User detail: full profile info
- [ ] Toggle Pro: set duration + calculate expiration
- [ ] Test history in user detail
- [ ] Order history in user detail
