# Task 09 — Affiliate + Coupons Service & API Routes

## Mô tả
Migrate affiliate system (6 API routes) và coupon system (2 API routes) từ JSON/KV sang Supabase.

## Prerequisites
- Task 05 (CMS/User services)

## Context cần đọc
- `LEGACY_CODEBASE_DOCS.md` → mục 7 (Affiliate System)
- File cũ: `pages/api/affiliate/*` (6 files)
- File cũ: `pages/api/coupons/*` (2 files)
- File cũ: `data/affiliate-*.json` (4 files), `data/coupons.json`

## Công việc cụ thể

### 1. Tạo Affiliate Service
**File tạo mới**: `services/affiliate.ts`

Functions:
- `registerAffiliate(supabaseAdmin, userId, customLink)` → create affiliate record
- `getAffiliateByUserId(supabase, userId)` → affiliate info
- `getAffiliateLinks(supabase, affiliateId)` → links list
- `createAffiliateLink(supabaseAdmin, affiliateId, customLink)`
- `trackVisit(supabaseAdmin, affiliateId, linkId, ip, userAgent)`
- `resolveAffiliateRef(supabaseAdmin, ref)` → affiliate info by custom_link
- `getCommissions(supabase, affiliateId)` → commissions list
- `createCommission(supabaseAdmin, params)` → create commission record
- `getAffiliateStats(supabase, affiliateId)` → { totalVisits, conversions, totalCommission }

### 2. Tạo Coupon Service
**File tạo mới**: `services/coupon.ts`

Functions:
- `validateCoupon(supabase, code)` → coupon info (check active, max_uses, expiry)
- `useCoupon(supabaseAdmin, couponId)` → increment current_uses
- `getCoupons(supabaseAdmin)` → admin: all coupons
- `createCoupon(supabaseAdmin, params)`
- `updateCoupon(supabaseAdmin, id, params)`
- `deleteCoupon(supabaseAdmin, id)`

### 3. Sửa Affiliate API Routes
**Files sửa**: `pages/api/affiliate/*.ts` (6 files)

Mỗi file: thay `readData`/`writeData` → service functions

### 4. Sửa Coupon API Routes
**Files sửa**: `pages/api/coupons/*.ts` (2 files)

Thay `readData`/`writeData` → service functions

## Files tạo mới
- `services/affiliate.ts`
- `services/coupon.ts`

## Files sửa
- `pages/api/affiliate/register.ts`
- `pages/api/affiliate/links.ts`
- `pages/api/affiliate/visits.ts`
- `pages/api/affiliate/commissions.ts`
- `pages/api/affiliate/stats.ts`
- `pages/api/affiliate/resolve.ts`
- `pages/api/coupons/*.ts` (2 files)

## KHÔNG chạm vào
- `data/*.json` (xóa ở Task 23)
- `lib/server/affiliate-data-helper.ts` (xóa ở Task 23)
- Frontend pages (sửa ở Task 13)

## Acceptance Criteria
- [ ] 6 affiliate API routes dùng Supabase
- [ ] 2 coupon API routes dùng Supabase
- [ ] Không còn import từ `affiliate-data-helper`
- [ ] Affiliate flow: register → create link → track visit → resolve → commission
- [ ] Coupon flow: validate → use → track usage count
