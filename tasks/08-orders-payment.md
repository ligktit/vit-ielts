# Task 08 — Orders + Payment Service & API Routes

## Mô tả
Migrate orders system + Sepay payment webhook từ JSON/KV + WordPress REST API sang Supabase.

## Prerequisites
- Task 05 (User service — activateProAccount)

## Context cần đọc
- `LEGACY_CODEBASE_DOCS.md` → mục 6 (Orders & Payment) — toàn bộ flow
- File cũ: `pages/api/webhooks/sepay.ts` (816 dòng)
- File cũ: `pages/api/orders/` (2 files)
- File cũ: `data/orders.json` (data structure)

## Công việc cụ thể

### 1. Tạo Order Service
**File tạo mới**: `services/order.ts`

Functions:
- `createOrder(supabaseAdmin, params)` — tạo đơn hàng (generate orderId, transferContent)
- `getOrderByTransferContent(supabaseAdmin, content)` — tìm order theo nội dung chuyển khoản
- `getOrderById(supabaseAdmin, orderId)`
- `getOrdersByUser(supabase, userId, { page, pageSize })`
- `updateOrderStatus(supabaseAdmin, orderId, status)` — pending → completed/cancelled
- `getOrders(supabaseAdmin, filters)` — admin: danh sách đơn (status, date range, search)

### 2. Sửa API Route: Create Order
**File sửa**: `pages/api/orders/create.ts`

Thay đổi:
- `readData`/`writeData` → `supabaseAdmin.from("orders").insert()`
- Giữ nguyên logic generate orderId + transferContent

### 3. Sửa API Route: Get Order
**File sửa**: `pages/api/orders/[orderId].ts`

Thay đổi: `readData` → `supabaseAdmin.from("orders").select().eq()`

### 4. Sửa Sepay Webhook
**File sửa**: `pages/api/webhooks/sepay.ts`

Thay đổi (816 dòng → ~200 dòng):
- `getOrders()`/`saveOrders()` → `services/order.ts` functions
- `updateUserProAccount()` → `services/user.ts:activateProAccount()` (đã tạo ở Task 05)
- `sendCustomerEmail()`/`sendAdminEmail()` → `services/email.ts` (đã tạo ở Task 05)
- Giữ nguyên: parse logic (regex orderId, amount validation, partial match)
- **XÓA**: WordPress REST API calls (GET/POST users)

## Files tạo mới
- `services/order.ts`

## Files sửa
- `pages/api/orders/create.ts`
- `pages/api/orders/[orderId].ts`
- `pages/api/webhooks/sepay.ts`

## KHÔNG chạm vào
- `services/user.ts` (đã tạo ở Task 05 — chỉ import)
- `services/email.ts` (đã tạo ở Task 05 — chỉ import)
- `data/orders.json` (xóa ở Task 23)
- `lib/server/affiliate-data-helper.ts` (Task 09 sẽ xử lý)
- `pages/checkout.tsx` (sửa ở Task 13)

## Acceptance Criteria
- [ ] Order CRUD qua Supabase
- [ ] Sepay webhook: parse orderId, validate amount, activate Pro, send emails
- [ ] KHÔNG còn import từ `lib/server/affiliate-data-helper`
- [ ] KHÔNG còn WordPress REST API calls
- [ ] Error handling giữ nguyên (404, 400, 500 responses)
