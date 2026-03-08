# Task 10 — Auth Pages (Login, Register, Forgot Password)

## Mô tả
Migrate login/register/forgot-password pages từ GraphQL mutations sang Supabase Auth.

## Prerequisites
- Task 02 (Auth provider mới)

## Context cần đọc
- `LEGACY_CODEBASE_DOCS.md` → mục 2.1 (Login), 2.3 (Register)
- File cũ: `pages/account/login.tsx`, `pages/account/register.tsx`
- File cũ: `src/pages/account/` (16 files — xem ui/ components)

## Công việc cụ thể

### 1. Sửa Login Page
**File sửa**: `pages/account/login.tsx` + `src/pages/account/` login components

- Thay `loginMutation` → `useAuth().signIn({ email, password })`
- Thay Google login → `useAuth().signInWithGoogle()`
- XÓA: deviceId/deviceType từ login form (chuyển sang device check riêng)

### 2. Sửa Register Page
**File sửa**: `pages/account/register.tsx` + register components

- Thay FormData POST → `useAuth().signUp({ email, password, name, dateOfBirth, gender })`
- Avatar upload: dùng Supabase Storage hoặc giữ imgBB

### 3. Sửa getServerSideProps
Các page account cần `withMasterData`:
- Thay `withMasterData(context)` → `getMasterData(context)` (từ Task 02)

### 4. Sửa withAuth / withGuest HOCs
**Files sửa**: `src/shared/hoc/withAuth.tsx`, `src/shared/hoc/withGuest.tsx`

- Thay logic check `userCredentials` cookie → check Supabase session

## Files sửa
- `pages/account/login.tsx`
- `pages/account/register.tsx`
- `src/pages/account/` (login + register UI components)
- `src/shared/hoc/withAuth.tsx`
- `src/shared/hoc/withGuest.tsx`

## KHÔNG chạm vào
- `pages/account/dashboard.tsx` (Task 13)
- `pages/account/my-profile.tsx` (Task 13)
- `pages/account/order-history.tsx` (Task 13)
- `pages/account/affiliate.tsx` (Task 13)
- `pages/account/checkout.tsx` (Task 13)

## Acceptance Criteria
- [ ] Login (email/password) works với Supabase Auth
- [ ] Google login works
- [ ] Register creates auth.users + public.users
- [ ] withAuth/withGuest HOCs check Supabase session
- [ ] Redirect sau login/register hoạt động
