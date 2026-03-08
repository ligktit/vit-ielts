# Task 21 — Admin Settings + Affiliate Module

## Mô tả
Tạo admin Settings page (site settings, SMTP, payment config) và Affiliate management module.

## Prerequisites
- Task 05 (CMS/User services)
- Task 09 (Affiliate service)
- Task 16 (Admin layout)

## Context cần đọc
- `Backend_migration_plan.md` → mục 7.8 (Settings)
- `LEGACY_CODEBASE_DOCS.md` → mục 7 (Affiliate)

## Công việc cụ thể

### 1. Settings Page
**File tạo mới**: `pages/admin/settings/index.tsx`

Ant Design Tabs:
- **General**: Site name, logo URL, favicon, default SEO
- **Menu**: Header menu items editor (JSONB), Footer menu items
- **Email (SMTP)**: host, port, user, password — test send button
- **Payment**: Sepay account info, webhook secret
- **Auth**: Google OAuth client ID

API: Read/write `site_settings` table

### 2. Affiliate Module
**File tạo mới**: `pages/admin/affiliate/index.tsx`

Ant Design Tabs:
- **Affiliates**: list all affiliates (status, commission rate, earnings)
- **Commissions**: list all commissions (pending → paid)
- **Visits**: recent visits

### 3. API Routes
**Files tạo mới**:
- `pages/api/admin/settings/index.ts` — GET/PUT site settings
- `pages/api/admin/settings/menus.ts` — GET/PUT menus
- `pages/api/admin/affiliate/index.ts` — GET affiliates list
- `pages/api/admin/affiliate/commissions.ts` — GET/PUT commissions
- `pages/api/admin/affiliate/[id].ts` — PUT (update rate, status)

## Files tạo mới
- 2 page files + 5 API route files

## KHÔNG chạm vào
- `services/` (chỉ import)
- Frontend affiliate page (Task 13)

## Acceptance Criteria
- [ ] Settings: CRUD site settings (5 tabs)
- [ ] Menu editor: add/edit/remove/reorder menu items
- [ ] Affiliate list with stats
- [ ] Commission management (status update)
