# Task 19 — Admin Orders + Coupons Module

## Mô tả
Tạo module quản lý orders (xem, xác nhận thủ công, export) và coupons (CRUD).

## Prerequisites
- Task 08 (Order service)
- Task 09 (Coupon service)
- Task 16 (Admin layout)

## Context cần đọc
- `Backend_migration_plan.md` → mục 7.5 (Quản lý Orders)
- `LEGACY_CODEBASE_DOCS.md` → mục 6 (Orders)

## Công việc cụ thể

### 1. Orders List Page
**File tạo mới**: `pages/admin/orders/index.tsx`

Ant Design Table:
- Columns: OrderID, User, Package, Amount, Status, Payment Method, Date
- Filters: status (pending/completed/cancelled), date range, search
- Actions: View, Manual Confirm, Cancel

### 2. Order Detail + Manual Confirm
**File tạo mới**: `pages/admin/orders/[id].tsx`

Hiển thị: order info, user info, coupon info, affiliate ref
Manual Confirm: chuyển pending → completed → gọi `activateProAccount()` + send emails

### 3. Coupons Page
**File tạo mới**: `pages/admin/coupons/index.tsx`

Ant Design Table + Form:
- CRUD: create, read, update, delete
- Fields: code, type (percent/fixed), value, max_uses, current_uses, is_active, expires_at

### 4. API Routes
**Files tạo mới**:
- `pages/api/admin/orders/index.ts` — GET list
- `pages/api/admin/orders/[id].ts` — GET detail, PUT (manual confirm/cancel)
- `pages/api/admin/orders/export.ts` — GET CSV export
- `pages/api/admin/coupons/index.ts` — GET list, POST create
- `pages/api/admin/coupons/[id].ts` — PUT update, DELETE

## Files tạo mới
- `pages/admin/orders/index.tsx`
- `pages/admin/orders/[id].tsx`
- `pages/admin/coupons/index.tsx`
- API routes (5 files)

## KHÔNG chạm vào
- `services/order.ts`, `services/coupon.ts` (chỉ import)
- `pages/api/webhooks/sepay.ts` (đã sửa Task 08)
- Frontend checkout pages (Task 13)

## Acceptance Criteria
- [ ] Orders: list, filter, paginate
- [ ] Manual confirm: activate Pro + send email
- [ ] CSV export
- [ ] Coupons CRUD
- [ ] Order detail: full info
