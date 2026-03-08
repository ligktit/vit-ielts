# Task 05 — User, CMS Config & Device Services

## Mô tả
Tạo services cho user profile, device fingerprint, và CMS config. Thay thế `admin-config-helper.ts` và các WordPress user mutations.

## Prerequisites
- Task 01 (Supabase clients)

## Context cần đọc
- `LEGACY_CODEBASE_DOCS.md` → mục 2.4 (Device Fingerprint), mục 2.5 (Pro Status), mục 8 (Admin CMS), mục 9 (User Management)
- `NEW_CODEBASE_ANALYSIS.md` → mục 4.4 (Device), mục 6.3 (CMS Config)
- File cũ: `lib/server/admin-config-helper.ts` (253 dòng)
- File cũ: `lib/server/affiliate-data-helper.ts` (204 dòng)

## Công việc cụ thể

### 1. Tạo User Service
**File tạo mới**: `services/user.ts`

Functions:
- `getUserProfile(supabase, userId)` — lấy profile
- `updateUserProfile(supabase, userId, { name, avatar_url, gender, date_of_birth, phone_number })`
- `updateTargetScore(supabase, userId, { reading, listening, speaking, writing, exam_date })`
- `checkProStatus(supabase, userId)` → `{ isPro, expirationDate }` (check `is_pro` + `pro_expiration_date > now()`)
- `activateProAccount(supabaseAdmin, userId, durationMonths)` — tính expiration date (cộng thêm nếu đã Pro)

Origin Pro status: functions.php L755–773
Origin Target score: functions.php L1664–1746
Origin Pro activation: pages/api/webhooks/sepay.ts L94–145 (calculateProExpirationDate)

### 2. Tạo Device Service
**File tạo mới**: `services/device.ts`

Functions:
- `checkDevice(supabase, deviceId, deviceType)` → boolean
- `registerDevice(supabase, deviceId, deviceType)` — save vào users.devices JSONB

Origin: functions.php L2056–2120

### 3. Tạo CMS Config Service
**File tạo mới**: `services/cms-config.ts`

Thay thế `lib/server/admin-config-helper.ts` (253 dòng → ~30 dòng):
- `readConfig<T>(supabase, sectionName)` → T
- `writeConfig<T>(supabase, sectionName, data)` → void

### 4. Tạo Email Service
**File tạo mới**: `services/email.ts`

Wrapper quanh `lib/server/email-helper.ts` hiện có:
- `sendContactEmail(name, email, subject, message)` — Origin: functions.php L868–937
- `sendOrderConfirmEmail(customerEmail, customerName, orderId, amount, duration)`
- `sendAdminNotificationEmail(orderId, customerName, customerEmail, amount, duration)`

## Files tạo mới
- `services/user.ts`
- `services/device.ts`
- `services/cms-config.ts`
- `services/email.ts`

## KHÔNG chạm vào
- `lib/server/admin-config-helper.ts` (giữ tạm, xóa ở Task 23)
- `lib/server/affiliate-data-helper.ts` (giữ tạm)
- `lib/server/email-helper.ts` (giữ nguyên, services/email.ts wrap nó)
- `src/shared/hooks/useDeviceID.tsx` (giữ nguyên — hook FingerprintJS vẫn dùng)

## Acceptance Criteria
- [ ] User service: CRUD profile + Pro status check + Pro activation
- [ ] Device service: check + register device fingerprint
- [ ] CMS config service: read/write thay thế 253 dòng helper cũ
- [ ] Email service: 3 email functions
- [ ] Pro expiration: logic cộng dồn khi đã Pro (giữ nguyên từ sepay.ts)
