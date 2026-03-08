# Task 16 — Admin Layout + Dashboard

## Mô tả
Tạo admin layout mới (sidebar, header) và dashboard tổng quan với stats cards, charts.

## Prerequisites
- Task 05 (CMS/User services)

## Context cần đọc
- `NEW_CODEBASE_ANALYSIS.md` → mục 9 (Admin Dashboard) — sidebar menu
- `Backend_migration_plan.md` → mục 7.1 (Dashboard tổng quan)
- File cũ: `pages/admin/_layout.tsx` (10KB)

## Công việc cụ thể

### 1. Admin Layout
**File sửa/tạo mới**: `pages/admin/_layout.tsx`

Sidebar menu:
```
📊 Dashboard
👥 Users
📝 Quizzes
  └── Danh sách
  └── Thêm mới
📋 Test Results
💳 Orders
🏷️ Coupons
🤝 Affiliate
📰 Blog Posts
📄 Sample Essays
───────────────
🎨 CMS Content
  └── Home (5 sections)
  └── Exam Library
  └── Practice Library
  └── Subscription
  └── Sample Essay Banner
  └── Header / Footer
  └── Account Pages
  └── Legal Pages
⚙️ Settings
```

### 2. Dashboard Page
**File tạo mới**: `pages/admin/index.tsx` (hoặc `dashboard.tsx`)

Hiển thị:
- Stats cards: Tổng users, users Pro, users mới hôm nay, tổng bài test đã làm
- Doanh thu tháng (sum orders WHERE status=completed AND month=current)
- Chart: user đăng ký theo ngày (7 ngày gần nhất)
- Đơn hàng gần đây (5 đơn pending + completed)
- Top 10 bài test làm nhiều nhất (tests_taken DESC)

Queries:
```typescript
// Stats
const [{ count: totalUsers }] = await supabaseAdmin.from("users").select("*", { count: "exact", head: true });
const [{ count: proUsers }] = await supabaseAdmin.from("users").select("*", { count: "exact", head: true }).eq("is_pro", true);
const [{ count: todayUsers }] = await supabaseAdmin.from("users").select("*", { count: "exact", head: true }).gte("created_at", todayStart);
// etc.
```

### 3. Admin Auth Guard
- Kiểm tra user role = "administrator" trong getServerSideProps
- Redirect về `/` nếu không phải admin

## Files tạo mới
- `pages/admin/index.tsx` (dashboard)

## Files sửa
- `pages/admin/_layout.tsx` (update sidebar)

## KHÔNG chạm vào
- Các admin sub-pages (Tasks 17-21 sẽ tạo)
- `services/` (chỉ import)

## Acceptance Criteria
- [ ] Admin sidebar navigation đầy đủ menu
- [ ] Dashboard hiển thị stats cards
- [ ] Dashboard hiển thị recent orders
- [ ] Dashboard hiển thị top quizzes
- [ ] Admin auth guard hoạt động
