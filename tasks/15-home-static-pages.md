# Task 15 — Home + Static Pages

## Mô tả
Migrate Home page (5 sections từ CMS) và các trang static (about, subscription, privacy, terms, contact).

## Prerequisites
- Task 05 (CMS Config service)

## Context cần đọc
- `LEGACY_CODEBASE_DOCS.md` → mục 8 (Admin CMS — 17 config sections)
- File: `src/pages/home/` (index.tsx + 9 UI components)

## Công việc cụ thể

### 1. Home Page (5 CMS sections)
**Files sửa**:
- `pages/index.tsx` — getServerSideProps
- `src/pages/home/index.tsx` — home page component
- `src/pages/home/ui/` (9 files: hero-banner, test-platform-intro, why-choose-us, testimonials, faq, etc.)

Thay đổi:
- getServerSideProps: Load 5 CMS configs via `readConfig(supabase, "home/hero-banner")` etc.
- Thay `/api/admin/home/*` calls → Supabase direct

### 2. Subscription Page (3 CMS sections)
**Files sửa**: `pages/subscription.tsx` + `src/pages/subscription/`

Load: `readConfig("subscription/banner")`, `readConfig("subscription/course-packages")`, `readConfig("subscription/payment-guide")`

### 3. Header + Footer (CMS sections)
**Files sửa**: `src/widgets/layouts/` — header + footer

Load: `readConfig("header/top-bar")`, `readConfig("header/header")`, `readConfig("footer/cta-banner")`

### 4. Static Pages
**Files sửa**:
- `pages/admin/privacy-policy.tsx` → `readConfig("privacy-policy")`
- `pages/admin/terms-of-use.tsx` → `readConfig("terms-of-use")`
- About us page

### 5. Admin CMS API Routes
**Files sửa**: `pages/api/admin/*.ts` (tất cả 38 routes)

Pattern cho mỗi route:
```typescript
// CŨ
import { readConfig, writeConfig } from "~server/admin-config-helper";
// MỚI
import { readConfig, writeConfig } from "@/services/cms-config";
import { supabaseAdmin } from "@/lib/supabase/admin";
```

## Files sửa
- `pages/index.tsx`
- `src/pages/home/` (10 files)
- Subscription pages
- Header + Footer widgets
- Privacy policy, Terms of use
- `pages/api/admin/*.ts` (38 files) — chỉ đổi import

## KHÔNG chạm vào
- `services/cms-config.ts` (chỉ import)
- Admin dashboard pages (Task 16-21)
- Contact form (nếu dùng email service đã tạo Task 05)

## Acceptance Criteria
- [ ] Home page 5 sections load từ Supabase cms_configs
- [ ] Subscription page 3 sections load từ Supabase
- [ ] Header/Footer load config từ Supabase
- [ ] Static pages load content từ Supabase
- [ ] 38 admin CMS API routes đổi sang Supabase
