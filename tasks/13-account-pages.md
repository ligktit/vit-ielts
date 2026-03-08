# Task 13 — Account Pages (Profile, History, Checkout, Affiliate)

## Mô tả
Migrate tất cả trang account: profile, order history, checkout, order received, và affiliate.

## Prerequisites
- Task 05 (User service)
- Task 08 (Order service)
- Task 09 (Affiliate service)

## Context cần đọc
- `LEGACY_CODEBASE_DOCS.md` → mục 6 (Orders), mục 7 (Affiliate), mục 9 (User Management)
- Files: `pages/account/*.tsx` (9 files)
- Files: `src/pages/account/` (components)

## Công việc cụ thể

### 1. Dashboard Page
**File sửa**: `pages/account/dashboard.tsx` + components

Thay đổi: Apollo viewer query → Supabase user profile + test stats

### 2. My Profile Page
**File sửa**: `pages/account/my-profile.tsx` + components

Thay đổi:
- Load profile: Supabase `getUserProfile()`
- Update profile: Supabase `updateUserProfile()`
- Target score: Supabase `updateTargetScore()`
- Avatar upload: Supabase Storage hoặc keep existing

### 3. Order History Page
**File sửa**: `pages/account/order-history.tsx` + components

Thay đổi: `readData("orders")` → `getOrdersByUser(supabase, userId)`

### 4. Checkout Page
**File sửa**: `pages/account/checkout.tsx` + components

Thay đổi:
- Coupon validation: API `/api/coupons/validate` (đã sửa Task 09)
- Create order: API `/api/orders/create` (đã sửa Task 08)
- Giữ nguyên UI flow

### 5. Order Received Page
**File sửa**: `pages/account/order-received.tsx`

Thay đổi: Poll order status từ Supabase thay vì JSON

### 6. Affiliate Page
**File sửa**: `pages/account/affiliate.tsx` + components

Thay đổi: API calls → affiliate API routes (đã sửa Task 09)

### 7. Target Score Widget
**File sửa**: `src/widgets/target-score/`

Thay đổi: GraphQL mutation → `updateTargetScore(supabase, ...)`

## Files sửa
- `pages/account/dashboard.tsx`
- `pages/account/my-profile.tsx`
- `pages/account/order-history.tsx`
- `pages/account/checkout.tsx`
- `pages/account/order-received.tsx`
- `pages/account/affiliate.tsx`
- `src/pages/account/` (components)
- `src/widgets/target-score/`

## KHÔNG chạm vào
- `pages/account/login.tsx`, `register.tsx` (đã sửa Task 10)
- `services/` (chỉ import)
- `pages/api/` (đã sửa Tasks 08, 09)

## Acceptance Criteria
- [ ] Profile: xem + sửa thông tin cá nhân
- [ ] Order history: danh sách đơn đã mua
- [ ] Checkout: tạo đơn + coupon validation
- [ ] Order received: hiển thị thông tin chuyển khoản
- [ ] Affiliate: đăng ký + xem stats + commissions
- [ ] Target score: set + update mục tiêu
