# Phân tích Code-base mới — Supabase Architecture

> **Mục đích**: Tài liệu chi tiết về code-base mới sau khi migration từ WordPress sang Supabase.
> Các agent sau đọc file này + `LEGACY_CODEBASE_DOCS.md` sẽ nắm rõ phải thay đổi gì, ở đâu.

---

## Mục lục

1. [Kiến trúc tổng quan](#1-kiến-trúc-tổng-quan)
2. [Migration Map — Cũ vs Mới](#2-migration-map)
3. [Supabase Client Setup](#3-supabase-client-setup)
4. [Authentication Flow mới](#4-authentication-flow-mới)
5. [Database Schema & RLS](#5-database-schema--rls)
6. [Service Functions — Thay thế GraphQL](#6-service-functions)
7. [API Routes — Thay đổi](#7-api-routes)
8. [Scoring Engine — Port sang TypeScript](#8-scoring-engine)
9. [Admin Dashboard mới](#9-admin-dashboard-mới)
10. [Data Migration Scripts](#10-data-migration-scripts)
11. [Frontend Changes — Từng page](#11-frontend-changes)
12. [Dependencies thay đổi](#12-dependencies-thay-đổi)
13. [Environment Variables](#13-environment-variables)
14. [File Structure mới](#14-file-structure-mới)
15. [Checklist thực hiện](#15-checklist-thực-hiện)

---

## 1. Kiến trúc tổng quan

### TRƯỚC (WordPress)

```
Frontend (Next.js/Vercel)
    ├── Apollo Client ──────→ WordPress WPGraphQL ──→ MySQL
    ├── API Routes ─────────→ JSON files / Vercel KV
    └── Sepay webhook ──────→ JSON + WordPress REST API
```

### SAU (Supabase)

```
Frontend (Next.js/Vercel)
    ├── Supabase Client ────→ Supabase PostgreSQL (REST API tự động)
    ├── API Routes ─────────→ Supabase PostgreSQL
    └── Sepay webhook ──────→ Supabase PostgreSQL
```

**Thay đổi cốt lõi**:
- Apollo Client + GraphQL → **Supabase JS Client** (REST tự động từ schema)
- JSON files + Vercel KV → **Supabase PostgreSQL tables**
- WordPress JWT → **Supabase Auth** (Email + Google OAuth)
- WordPress REST API → **Supabase Admin SDK** (service_role)
- ACF Custom Fields → **PostgreSQL columns + JSONB**

---

## 2. Migration Map

### 2.1 File-by-file mapping

| File/Module CŨ | Thay đổi | File/Module MỚI |
|----------------|----------|-----------------|
| `src/shared/graphql/createServerApolloClient.ts` | **XÓA** | `lib/supabase/server.ts` |
| `src/appx/providers/apollo-provider.tsx` | **XÓA** | `lib/supabase/client.ts` (không cần Provider) |
| `src/appx/providers/auth-provider.tsx` | **REWRITE** | `src/appx/providers/auth-provider.tsx` (dùng Supabase Auth) |
| `src/appx/providers/app-provider.tsx` | **SỬA** | Giữ context, đổi data source sang Supabase |
| `src/shared/hoc/withMasterData.tsx` | **REWRITE** | `lib/supabase/getMasterData.ts` (Supabase queries) |
| `lib/server/admin-config-helper.ts` | **XÓA** | `services/cms-config.ts` (Supabase `cms_configs` table) |
| `lib/server/affiliate-data-helper.ts` | **XÓA** | `services/affiliate.ts` (Supabase tables) |
| `lib/server/user-id-helper.ts` | **XÓA** | Supabase Auth tự quản lý user ID (UUID) |
| `lib/server/email-helper.ts` | **GIỮ NGUYÊN** | Vẫn dùng Nodemailer SMTP |
| `pages/api/webhooks/sepay.ts` | **SỬA** | Đổi từ JSON/WP REST → Supabase queries |
| `pages/api/admin/*` (38 files) | **SỬA** | Đổi readConfig/writeConfig → Supabase `cms_configs` |
| `pages/api/affiliate/*` (6 files) | **SỬA** | Đổi readData/writeData → Supabase tables |
| `pages/api/orders/*` (2 files) | **SỬA** | Đổi readData/writeData → Supabase `orders` table |
| `pages/api/coupons/*` (2 files) | **SỬA** | Đổi readData/writeData → Supabase `coupons` table |
| `data/*.json` (6 files) | **XÓA** | Data moved to Supabase tables |
| `config/*.json` (17 files) | **XÓA** | Data moved to Supabase `cms_configs` table |
| `wp-content/` (entire directory) | **XÓA** | Không cần WordPress nữa |

### 2.2 Logic mapping

| Logic CŨ (WordPress PHP) | Logic MỚI (TypeScript) | File mới |
|---------------------------|----------------------|---------|
| `calculate_score()` (functions.php L1014–1452) | Port 1:1 sang TS | `services/scoring.ts` |
| `exam_collections_resolve()` (functions.php L1819–1993) | Supabase joins | `services/exam-collection.ts` |
| `TakeTheTest` mutation (functions.php L1471–1586) | Supabase insert | `services/test-flow.ts` |
| `SaveTestResult` mutation (functions.php L815–866) | Supabase update | `services/test-flow.ts` |
| `SubmitTestResult` mutation (functions.php L939–1011) | Supabase update + scoring | `services/test-flow.ts` |
| `UpdatePostRating` mutation (functions.php L1588–1662) | Supabase update (JSONB) | `services/rating.ts` |
| `UpdatePostViewCount` (functions.php L788–813) | Supabase RPC / update | `services/views.ts` |
| `UpdateUserTargetScore` (functions.php L1664–1746) | Supabase update | `services/user.ts` |
| `SendContactEmail` (functions.php L868–937) | Giữ nguyên Nodemailer | `services/email.ts` |
| Device fingerprint (functions.php L2056–2120) | Supabase JSONB column | `services/device.ts` |
| Pro status check (functions.php L755–773) | Supabase query + RLS | `services/user.ts` |
| Quiz filters (bp_quiz_creator L192–440) | Supabase query filters | `services/quiz.ts` |
| Sample essay filters (functions.php L550–671) | Supabase query filters | `services/sample-essay.ts` |

---

## 3. Supabase Client Setup

### 3.1 Browser Client

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Thay thế**: `apollo-provider.tsx` (69 dòng) → **5 dòng**

### 3.2 Server Client (SSR)

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { GetServerSidePropsContext } from "next";

export function createServerSupabase(context: GetServerSidePropsContext) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.entries(context.req.cookies).map(([name, value]) => ({
            name, value: value || "",
          }));
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            context.res.setHeader("Set-Cookie",
              `${name}=${value}; Path=/; ${options?.maxAge ? `Max-Age=${options.maxAge}` : ""}`
            );
          });
        },
      },
    }
  );
}
```

**Thay thế**: `createServerApolloClient.ts` (136 dòng) → **~25 dòng**

### 3.3 Admin Client (Service Role)

```typescript
// lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";

// CHỈ DÙNG TRONG API ROUTES (server-side)
// Bypass RLS — dùng cho admin operations
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

**Thay thế**: WordPress REST API + Basic Auth → Supabase Admin SDK

---

## 4. Authentication Flow mới

### 4.1 So sánh CŨ vs MỚI

| Step | CŨ (WordPress JWT) | MỚI (Supabase Auth) |
|------|--------------------|--------------------|
| Login | GraphQL `login` mutation → authToken + refreshToken → cookie | `supabase.auth.signInWithPassword()` → session cookie (auto) |
| Register | FormData POST → GraphQL `registerUser` mutation | `supabase.auth.signUp()` + insert `users` table |
| Google Login | GraphQL `login(provider: GOOGLE)` → WP headless-login | `supabase.auth.signInWithOAuth({ provider: 'google' })` |
| Token Refresh | Manual: detect 403 → call refreshToken mutation → update cookie | **TỰ ĐỘNG**: Supabase client auto-refresh |
| Logout | Remove cookie "userCredentials" | `supabase.auth.signOut()` |
| SSR Auth | Parse cookie → Bearer header → GraphQL | `createServerSupabase(context)` → auto cookie parsing |
| Get User | GraphQL `viewer` query | `supabase.auth.getUser()` |

### 4.2 Auth Provider mới

```typescript
// src/appx/providers/auth-provider.tsx (REWRITE)
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/router";

export const useAuth = () => {
  const supabase = createClient();
  const router = useRouter();

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    router.push("/");
    return data;
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
    return data;
  };

  const signUp = async ({ email, password, name, dateOfBirth, gender }: SignUpParams) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, date_of_birth: dateOfBirth, gender } },
    });
    if (error) throw error;

    // Insert vào users table (trigger hoặc manual)
    if (data.user) {
      await supabase.from("users").insert({
        id: data.user.id,
        email, name, gender,
        date_of_birth: dateOfBirth,
      });
    }
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/account/login");
  };

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

  return { signIn, signInWithGoogle, signUp, signOut, getUser };
};
```

### 4.3 SSR MasterData mới

```typescript
// lib/supabase/getMasterData.ts (thay thế withMasterData.tsx)
import { createServerSupabase } from "./server";
import { GetServerSidePropsContext } from "next";

export async function getMasterData(context: GetServerSidePropsContext) {
  const supabase = createServerSupabase(context);

  // Lấy user session (thay thế viewer query)
  const { data: { user } } = await supabase.auth.getUser();

  // Lấy site settings (thay thế allSettings + websiteOptions)
  const { data: settings } = await supabase
    .from("site_settings")
    .select("key, value");

  // Lấy menu data
  const { data: menus } = await supabase
    .from("menus")
    .select("location, items");

  // Lấy user profile (nếu đã đăng nhập)
  let userProfile = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    userProfile = data;
  }

  return {
    props: {
      masterData: {
        viewer: userProfile ? {
          id: user!.id,
          name: userProfile.name,
          email: user!.email,
          avatar: userProfile.avatar_url,
          isPro: userProfile.is_pro && new Date(userProfile.pro_expiration_date) > new Date(),
          proExpirationDate: userProfile.pro_expiration_date,
          roles: userProfile.roles || ["subscriber"],
        } : null,
        settings: Object.fromEntries((settings || []).map(s => [s.key, s.value])),
        menus: Object.fromEntries((menus || []).map(m => [m.location, m.items])),
      },
    },
  };
}
```

### 4.4 Device Fingerprint mới

```typescript
// services/device.ts
// CŨ: ACF field "devices" trên WordPress user
// MỚI: JSONB column "devices" trên users table

export async function checkDevice(supabase: SupabaseClient, deviceId: string, deviceType: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("users")
    .select("devices")
    .eq("id", user.id)
    .single();

  return profile?.devices?.[deviceType]?.device_id === deviceId;
}

export async function registerDevice(supabase: SupabaseClient, deviceId: string, deviceType: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("users")
    .select("devices")
    .eq("id", user.id)
    .single();

  const devices = profile?.devices || {};
  devices[deviceType] = { device_id: deviceId };

  await supabase
    .from("users")
    .update({ devices })
    .eq("id", user.id);
}
```

---

## 5. Database Schema & RLS

### 5.1 Tables (15 bảng)

```sql
-- ===========================
-- 1. USERS (mở rộng Supabase auth.users)
-- ===========================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  is_pro BOOLEAN DEFAULT false,
  pro_expiration_date DATE,
  target_score JSONB DEFAULT '{}',
  -- { reading: 7.0, listening: 7.5, speaking: 6.5, writing: 6.5, exam_date: "2026-06-01" }
  gender TEXT,
  date_of_birth DATE,
  phone_number TEXT,
  roles JSONB DEFAULT '["subscriber"]',
  devices JSONB DEFAULT '{}',
  -- { mobile: { device_id: "xxx" }, desktop: { device_id: "yyy" } }
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================
-- 2. QUIZZES (thay thế WP post_type=quiz)
-- ===========================
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  type TEXT NOT NULL CHECK (type IN ('practice', 'exam')),
  skill TEXT NOT NULL CHECK (skill IN ('reading', 'listening')),
  time_minutes INTEGER NOT NULL DEFAULT 60,
  pro_user_only BOOLEAN DEFAULT false,
  score_type TEXT,
  featured_image TEXT,
  audio_url TEXT,
  pdf_url TEXT,
  tests_taken INTEGER DEFAULT 0,
  source TEXT,
  year TEXT,
  quarter TEXT,
  part TEXT,
  question_form TEXT, -- comma-separated: "true_false_not_given,matching"
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  votes JSONB DEFAULT '[]',
  -- [{ user_id: "uuid", rate: 5 }, ...]
  views INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================
-- 3. PASSAGES (thay thế ACF repeater)
-- ===========================
CREATE TABLE public.passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT, -- HTML rich text
  sort_order INTEGER DEFAULT 0,
  audio_start INTEGER,
  audio_end INTEGER
);

-- ===========================
-- 4. QUESTIONS (thay thế ACF repeater nested)
-- ===========================
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id UUID NOT NULL REFERENCES passages(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('radio', 'select', 'fillup', 'checkbox', 'matching', 'matrix')),
  title TEXT,
  question_text TEXT,
  instructions TEXT,
  question_form TEXT,
  list_of_questions JSONB,
  -- radio/select: [{ question: "...", correct: "1", options: [{option_text: "A"}, ...] }]
  list_of_options JSONB,
  -- checkbox: [{ option_text: "A", correct: true }, ...]
  matching_question JSONB,
  -- { layout_type: "standard"|"summary"|"heading", matching_items: [...], answer_options: [...], summary_text: "..." }
  matrix_question JSONB,
  -- { matrix_categories: [{ category_letter: "A", category_text: "..." }], matrix_items: [{ item_text: "...", correct_category_letter: "A" }] }
  explanations JSONB,
  -- fillup: [{ content: "correct answer 1 / alternate" }]
  sort_order INTEGER DEFAULT 0
);

-- ===========================
-- 5. TEST RESULTS (thay thế WP post_type=test-result)
-- ===========================
CREATE TABLE public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  answers JSONB,
  -- { answers: [answer1, answer2, ...] }
  test_part JSONB,
  -- [0, 1, 2] (indices of selected passages)
  time_left TEXT,
  test_time INTEGER,
  test_mode TEXT,
  score FLOAT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================
-- 6. MOCK TESTS (thay thế WP post_type=mock_test)
-- ===========================
CREATE TABLE public.mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  practice_tests JSONB NOT NULL,
  -- [{ reading_test_id: "uuid", listening_test_id: "uuid" }, ...]
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================
-- 7. MOCK TEST COLLECTIONS (thay thế WP post_type=mock-test-collection)
-- ===========================
CREATE TABLE public.mock_test_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  mock_test_ids UUID[] NOT NULL,
  -- Array of mock_test IDs
  featured_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================
-- 8. ORDERS (thay thế data/orders.json)
-- ===========================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  package_type TEXT CHECK (package_type IN ('combo', 'single')),
  duration INTEGER NOT NULL,
  skill_type TEXT,
  amount INTEGER NOT NULL,
  original_amount INTEGER,
  discount_amount INTEGER DEFAULT 0,
  coupon_id UUID REFERENCES coupons(id),
  coupon_code TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  payment_method TEXT,
  transfer_content TEXT,
  affiliate_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================
-- 9. COUPONS (thay thế data/coupons.json)
-- ===========================
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('percent', 'fixed')),
  value INTEGER NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================
-- 10–13. AFFILIATE SYSTEM (thay thế data/affiliate-*.json)
-- ===========================
CREATE TABLE public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id),
  custom_link TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  commission_rate FLOAT DEFAULT 0.1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  custom_link TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.affiliate_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id),
  link_id UUID REFERENCES affiliate_links(id),
  ip TEXT,
  user_agent TEXT,
  converted BOOLEAN DEFAULT false,
  order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id),
  order_id TEXT,
  amount INTEGER,
  commission_rate FLOAT,
  commission_amount INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================
-- 14. CMS CONFIGS (thay thế config/*.json + Vercel KV)
-- ===========================
CREATE TABLE public.cms_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================
-- 15. SITE SETTINGS (thay thế WordPress Options)
-- ===========================
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================
-- 16. MENUS (thay thế WordPress Menus)
-- ===========================
CREATE TABLE public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT UNIQUE NOT NULL, -- 'main-menu', 'footer-menu'
  items JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================
-- 17. POSTS (thay thế WP post_type=post)
-- ===========================
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  status TEXT DEFAULT 'draft',
  pro_user_only BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  votes JSONB DEFAULT '[]',
  seo JSONB DEFAULT '{}',
  categories JSONB DEFAULT '[]',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================
-- 18. SAMPLE ESSAYS (thay thế WP post_type=sample-essay)
-- ===========================
CREATE TABLE public.sample_essays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  skill TEXT, -- reading, listening, speaking, writing
  part TEXT,
  question_type TEXT,
  quarter TEXT,
  year TEXT,
  source TEXT,
  topic TEXT,
  task TEXT,
  passage TEXT,
  featured_image TEXT,
  status TEXT DEFAULT 'draft',
  pro_user_only BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  votes JSONB DEFAULT '[]',
  seo JSONB DEFAULT '{}',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 5.2 RLS Policies

```sql
-- Users: tự đọc/sửa profile, admin đọc tất cả
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full access" ON users USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND roles ? 'administrator')
);

-- Quizzes: public read (published), admin write
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published" ON quizzes FOR SELECT USING (status = 'published');
CREATE POLICY "Admin CRUD" ON quizzes USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND roles ? 'administrator')
);

-- Test Results: user đọc/sửa bài của mình, admin đọc tất cả
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User own results" ON test_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin read all" ON test_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND roles ? 'administrator')
);

-- Orders: user xem đơn của mình, admin full
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin full" ON orders USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND roles ? 'administrator')
);

-- CMS / Settings / Menus: public read, admin write
ALTER TABLE cms_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON cms_configs FOR SELECT USING (true);
CREATE POLICY "Admin write" ON cms_configs FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND roles ? 'administrator')
);
-- (tương tự cho site_settings, menus, posts, sample_essays)
```

---

## 6. Service Functions

### 6.1 Quiz Service

```typescript
// services/quiz.ts
// Thay thế: WPGraphQL quiz queries + bp_quiz_creator filters

export async function getQuizBySlug(supabase: SupabaseClient, slug: string) {
  const { data } = await supabase
    .from("quizzes")
    .select(`*, passages(*, questions(*))`)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  // Sort passages + questions by sort_order
  if (data?.passages) {
    data.passages.sort((a, b) => a.sort_order - b.sort_order);
    data.passages.forEach(p => p.questions?.sort((a, b) => a.sort_order - b.sort_order));
  }
  return data;
}

export async function getQuizzes(supabase: SupabaseClient, filters: {
  skill?: string; type?: string; questionForm?: string; year?: string;
  source?: string; quarter?: string; part?: string;
  page?: number; pageSize?: number; search?: string;
}) {
  let query = supabase
    .from("quizzes")
    .select("*, passages(id, title)", { count: "exact" })
    .eq("status", "published");

  if (filters.skill) query = query.eq("skill", filters.skill);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.year) query = query.eq("year", filters.year);
  if (filters.source) query = query.eq("source", filters.source);
  if (filters.quarter) query = query.eq("quarter", filters.quarter);
  if (filters.part) query = query.eq("part", filters.part);
  if (filters.questionForm) query = query.ilike("question_form", `%${filters.questionForm}%`);
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);

  const page = filters.page || 1;
  const size = filters.pageSize || 12;
  query = query.range((page - 1) * size, page * size - 1).order("created_at", { ascending: false });

  return query;
}
```

### 6.2 Test Flow Service

```typescript
// services/test-flow.ts
// Thay thế: TakeTheTest + SaveTestResult + SubmitTestResult mutations

export async function takeTheTest(supabase: SupabaseClient, params: {
  quizId: string; testPart: number[]; testTime: number; testMode: string; retake: boolean;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check Pro access
  const { data: quiz } = await supabase.from("quizzes").select("pro_user_only").eq("id", params.quizId).single();
  if (quiz?.pro_user_only) {
    const { data: profile } = await supabase.from("users").select("is_pro, pro_expiration_date").eq("id", user.id).single();
    if (!profile?.is_pro || new Date(profile.pro_expiration_date) < new Date())
      throw new Error("This test is only available for PRO users.");
  }

  // Check existing draft
  const { data: existingDraft } = await supabase
    .from("test_results")
    .select("*")
    .eq("user_id", user.id).eq("quiz_id", params.quizId).eq("status", "draft")
    .maybeSingle();

  if (existingDraft && !params.retake) return existingDraft; // Resume

  if (existingDraft && params.retake) {
    await supabase.from("test_results").delete().eq("id", existingDraft.id);
  }

  // Create new test result
  const { data: newResult } = await supabase
    .from("test_results")
    .insert({
      user_id: user.id, quiz_id: params.quizId,
      test_part: params.testPart, test_time: params.testTime,
      test_mode: params.testMode, status: "draft",
    })
    .select().single();

  // Increment tests_taken
  await supabase.rpc("increment_tests_taken", { quiz_id: params.quizId });

  return newResult;
}

export async function saveTestResult(supabase: SupabaseClient, testId: string, answers: any, timeLeft: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  return supabase
    .from("test_results")
    .update({ answers, time_left: timeLeft })
    .eq("id", testId).eq("user_id", user.id).eq("status", "draft");
}

export async function submitTestResult(supabase: SupabaseClient, testId: string, answers: any, timeLeft: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get test result + quiz data
  const { data: testResult } = await supabase
    .from("test_results")
    .select("*, quizzes(*, passages(*, questions(*)))")
    .eq("id", testId).eq("user_id", user.id)
    .single();

  if (!testResult) throw new Error("Test not found");

  // Calculate score (dùng scoring engine đã port)
  const score = calculateScore(answers.answers, testResult.quizzes, testResult.test_part);

  // Update + publish
  return supabase
    .from("test_results")
    .update({ answers, time_left: timeLeft, score, status: "published", submitted_at: new Date().toISOString() })
    .eq("id", testId);
}
```

### 6.3 CMS Config Service

```typescript
// services/cms-config.ts
// Thay thế: admin-config-helper.ts (253 dòng) → ~20 dòng

export async function readConfig<T>(supabase: SupabaseClient, section: string): Promise<T> {
  const { data } = await supabase
    .from("cms_configs")
    .select("data")
    .eq("section_name", section)
    .single();
  return data?.data as T;
}

export async function writeConfig<T>(supabase: SupabaseClient, section: string, config: T) {
  return supabase
    .from("cms_configs")
    .upsert({ section_name: section, data: config, updated_at: new Date().toISOString() }, { onConflict: "section_name" });
}
```

---

## 7. API Routes — Thay đổi

### Pattern cũ → mới

```typescript
// CŨ (pages/api/admin/home/hero-banner.ts):
import { readConfig, writeConfig } from "@/lib/server/admin-config-helper";
const data = readConfig("home/hero-banner");

// MỚI:
import { supabaseAdmin } from "@/lib/supabase/admin";
const { data } = await supabaseAdmin.from("cms_configs").select("data").eq("section_name", "home/hero-banner").single();
```

### Sepay Webhook thay đổi

```typescript
// CŨ: updateUserProAccount() → WordPress REST API (fetch + Basic Auth)
// MỚI: Supabase Admin SDK

async function updateUserProAccount(userId: string, duration: number) {
  // Lấy user hiện tại
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("is_pro, pro_expiration_date")
    .eq("id", userId)
    .single();

  // Tính ngày hết hạn mới (logic giữ nguyên)
  const newExpDate = calculateProExpirationDate(
    user?.pro_expiration_date, duration, user?.is_pro
  );

  // Update trực tiếp
  return supabaseAdmin
    .from("users")
    .update({ is_pro: true, pro_expiration_date: newExpDate })
    .eq("id", userId);
}
```

---

## 8. Scoring Engine

```typescript
// services/scoring.ts
// Port 1:1 từ PHP calculate_score() (functions.php L1014–1452)
// Client-side version đã có tại src/shared/lib/calculateScore/
// Server-side version PHẢI GIỐNG HỆT client-side

// Signature:
export function calculateScore(
  answers: any[],                    // Flat array of user answers
  quiz: Quiz & { passages: Passage[] }, // Quiz with nested passages → questions
  testPart: number[]                 // Indices of selected passages
): number {
  // Step 1: Filter passages by testPart
  const selectedPassages = quiz.passages
    .sort((a, b) => a.sort_order - b.sort_order)
    .filter((_, i) => testPart.includes(i));

  // Step 2: Flatten questions + attach passage content
  const questions = selectedPassages.flatMap(p =>
    (p.questions || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(q => ({ ...q, associated_passage_content: p.content }))
  );

  // Step 3: Score each question (logic giữ nguyên 100% từ PHP)
  let correct = 0;
  let totalQuestions = 0;
  let answerIndex = 0;

  for (const question of questions) {
    switch (question.type) {
      case "radio":
      case "select":
        // ... (giống PHP — xem LEGACY_CODEBASE_DOCS.md mục 4.2)
      case "fillup":
        // ...
      case "checkbox":
        // ...
      case "matching":
        // ... (3 layouts: standard, summary, heading)
      case "matrix":
        // ...
    }
  }

  // Step 4: Calculate final score (0–9, bước 0.5)
  const rawScore = totalQuestions > 0 ? (correct / totalQuestions) * 9 : 0;
  return Math.round(rawScore * 2) / 2;
}
```

> ⚠️ **QUAN TRỌNG**: `calculateScore()` phải cho kết quả GIỐNG HỆT PHP version. Mọi edge case (null answers, empty arrays, case sensitivity) phải được handle y hệt.

---

## 9. Admin Dashboard mới

### 8 Modules (theo thứ tự ưu tiên)

| # | Module | Routes | Components |
|---|--------|--------|-----------|
| 1 | Users | `/admin/users`, `/admin/users/[id]` | UserList, UserDetail, ProToggle |
| 2 | Quizzes | `/admin/quizzes`, `/admin/quizzes/new`, `/admin/quizzes/[id]` | QuizList, QuizEditor (passages + questions builder) |
| 3 | Orders | `/admin/orders`, `/admin/orders/[id]` | OrderList, OrderDetail, ManualConfirm |
| 4 | Dashboard | `/admin` | Stats cards, charts, recent orders |
| 5 | Test Results | `/admin/test-results` | ResultList, ResultDetail, Stats |
| 6 | Blog Posts | `/admin/posts`, `/admin/posts/new`, `/admin/posts/[id]` | PostList, PostEditor (rich text) |
| 7 | Sample Essays | `/admin/sample-essays`, `/admin/sample-essays/[id]` | EssayList, EssayEditor |
| 8 | Settings | `/admin/settings` | SiteSettings, MenuEditor, SMTPConfig |

### Quiz Editor (module phức tạp nhất)

```
QuizEditor
├── GeneralInfo (title, slug, skill, type, time, proOnly)
├── MediaUpload (featured image, audio, pdf)
├── PassageList (drag & drop sortable)
│   └── PassageItem
│       ├── PassageEditor (title, content = rich text)
│       ├── AudioTimestamps (audio_start, audio_end)
│       └── QuestionList (drag & drop sortable)
│           └── QuestionItem
│               ├── QuestionTypeSelector (radio|select|fillup|checkbox|matching|matrix)
│               ├── QuestionEditor (title, text, instructions)
│               └── AnswerEditor (dynamic based on type)
│                   ├── RadioOptions (list_of_questions)
│                   ├── FillupAnswers (explanations)
│                   ├── CheckboxOptions (list_of_options)
│                   ├── MatchingConfig (layout, items, options)
│                   └── MatrixConfig (categories, items)
└── Actions (Save Draft, Publish, Clone, Delete)
```

---

## 10. Data Migration Scripts

```
scripts/
├── migrate-wp-users.ts         -- WP REST API → Supabase users + auth.users
├── migrate-wp-quizzes.ts       -- WP REST API → quizzes + passages + questions
├── migrate-wp-test-results.ts  -- WP REST API → test_results
├── migrate-wp-posts.ts         -- WP REST API → posts
├── migrate-wp-sample-essays.ts -- WP REST API → sample_essays
├── migrate-json-orders.ts      -- data/orders.json → orders table
├── migrate-json-affiliates.ts  -- data/affiliate-*.json → affiliate tables
├── migrate-json-coupons.ts     -- data/coupons.json → coupons table
├── migrate-configs.ts          -- config/*.json → cms_configs table
├── migrate-menus.ts            -- WP menus → menus table
└── migrate-settings.ts         -- WP options → site_settings table
```

### ID Mapping

```
CŨ: WordPress User ID = 844
    → GraphQL ID = base64("user:844") = "dXNlcjo4NDQ="

MỚI: Supabase Auth User ID = UUID (ví dụ: "a1b2c3d4-e5f6-7890-...")
    → Cần tạo mapping table khi migrate: wp_user_id → supabase_user_id
    → Cập nhật tất cả foreign keys (test_results, orders)
```

---

## 11. Frontend Changes — Từng page

| Page | GraphQL Query CŨ | Supabase Query MỚI |
|------|-------------------|---------------------|
| Home | GET_MASTER_DATA + admin config API | `getMasterData()` + `readConfig("home/*")` |
| Practice Library | quizzes connection (filtered) | `getQuizzes({ type: "practice", skill: ... })` |
| Exam Library | ExamCollection query (nested) | `getExamCollections()` (Supabase joins) |
| Practice Single | GET_PRACTICE_SINGLE (slug) | `getQuizBySlug(slug)` |
| Take the Test | TakeTheTest mutation | `takeTheTest(...)` |
| Test Result | GET_TEST_RESULT | `getTestResult(id)` |
| Account Profile | viewer + updateUser | `supabase.from("users")` |
| Account History | test-results connection | `supabase.from("test_results").eq("user_id", ...)` |
| Checkout | /api/orders/create | Same API route, đổi storage |
| Blog Archive | posts connection | `supabase.from("posts").eq("status", "published")` |
| Blog Single | post by slug | `supabase.from("posts").eq("slug", slug).single()` |
| Sample Essay | sample-essays connection (filtered) | `supabase.from("sample_essays")` + filters |
| Login | login mutation | `supabase.auth.signInWithPassword()` |
| Register | registerUser mutation + FormData | `supabase.auth.signUp()` + `users.insert()` |
| Admin/* | /api/admin/* | Same routes, đổi storage backend |

---

## 12. Dependencies thay đổi

### XÓA

```json
{
  "@apollo/client": "^3.13.5",
  "apollo-upload-client": "^18.0.1",
  "graphql": "^16.10.0",
  "@vercel/kv": "^3.0.0",
  "sync-fetch": "^0.6.0-2",
  "@types/apollo-upload-client": "^18.0.0"
}
```

### THÊM

```json
{
  "@supabase/supabase-js": "^2.x",
  "@supabase/ssr": "^0.x"
}
```

### GIỮ NGUYÊN

```json
{
  "next": "^15.5.9",
  "react": "^19.1.0",
  "antd": "^5.24.6",
  "tailwindcss": "^4.1.2",
  "zustand": "^5.0.6",
  "axios": "^1.8.4",
  "nodemailer": "^7.0.12",
  "js-cookie": "^3.0.5",
  "@fingerprintjs/fingerprintjs": "^4.6.2",
  "@react-oauth/google": "^0.12.2"
}
```

---

## 13. Environment Variables

### XÓA

```env
NEXT_PUBLIC_WORDPRESS_CMS_URL=...
WP_ADMIN_USER=...
WP_ADMIN_PASSWORD=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

### THÊM

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...        # Chỉ server-side
```

### GIỮ NGUYÊN

```env
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
ADMIN_EMAIL=...
SEPAY_WEBHOOK_SECRET=...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=639199263575-...
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

---

## 14. File Structure mới

```diff
  d:\Projects\IELTS-Prediction\
+ ├── lib/supabase/
+ │   ├── client.ts            # Browser client
+ │   ├── server.ts            # SSR client
+ │   ├── admin.ts             # Service role client
+ │   └── getMasterData.ts     # Thay thế withMasterData
+ ├── services/
+ │   ├── quiz.ts              # Quiz CRUD + filters
+ │   ├── test-flow.ts         # TakeTheTest + Save + Submit
+ │   ├── scoring.ts           # calculate_score() TS version
+ │   ├── exam-collection.ts   # Exam collections resolver
+ │   ├── user.ts              # User profile + target score
+ │   ├── rating.ts            # Post/quiz rating
+ │   ├── device.ts            # Device fingerprint
+ │   ├── cms-config.ts        # CMS config CRUD
+ │   ├── affiliate.ts         # Affiliate system
+ │   ├── email.ts             # Email (giữ Nodemailer)
+ │   ├── sample-essay.ts      # Sample essay filters
+ │   └── post.ts              # Blog post queries
+ ├── supabase/
+ │   └── migrations/
+ │       └── 001_initial_schema.sql
  ├── lib/server/
- │   ├── admin-config-helper.ts   # XÓA
- │   ├── affiliate-data-helper.ts # XÓA
- │   ├── user-id-helper.ts        # XÓA
  │   └── email-helper.ts          # GIỮ
  ├── src/shared/graphql/
- │   ├── createServerApolloClient.ts  # XÓA
- │   └── YoastSEO.ts                 # XÓA
  ├── src/appx/providers/
- │   ├── apollo-provider.tsx    # XÓA
  │   ├── auth-provider.tsx      # REWRITE (Supabase Auth)
  │   └── app-provider.tsx       # SỬA (đổi data source)
  ├── src/shared/hoc/
- │   └── withMasterData.tsx     # XÓA (thay bằng getMasterData)
- ├── data/                      # XÓA TOÀN BỘ (moved to Supabase)
- ├── config/                    # XÓA TOÀN BỘ (moved to Supabase)
- ├── wp-content/                # XÓA TOÀN BỘ (không cần WordPress)
  └── pages/api/                 # SỬA storage backend
```

---

## 15. Checklist thực hiện

### Phase 1: Foundation (3–4 ngày)
- [ ] Tạo Supabase project + chạy migration SQL
- [ ] Tạo `lib/supabase/` (client, server, admin)
- [ ] Tạo `services/` skeleton
- [ ] Viết migration scripts + chạy thử

### Phase 2: Auth (2–3 ngày)
- [ ] Setup Supabase Auth (Email + Google OAuth)
- [ ] Rewrite `auth-provider.tsx`
- [ ] Rewrite `getMasterData.ts`
- [ ] Xóa Apollo Provider
- [ ] Test login/register/logout/refresh

### Phase 3: Quiz & Test (5–7 ngày)
- [ ] Port `calculateScore()` sang TypeScript + unit tests
- [ ] Implement `services/quiz.ts`
- [ ] Implement `services/test-flow.ts`
- [ ] Implement `services/exam-collection.ts`
- [ ] Update practice library / exam library / take the test / test result pages
- [ ] Test toàn bộ flow làm bài

### Phase 4: Data & Commerce (4–5 ngày)
- [ ] Update orders API routes → Supabase
- [ ] Update Sepay webhook → Supabase
- [ ] Update affiliate API routes → Supabase
- [ ] Update coupons API routes → Supabase
- [ ] Update checkout flow
- [ ] Test payment + Pro activation

### Phase 5: Admin & Content (5–7 ngày)
- [ ] Update admin CMS routes → Supabase `cms_configs`
- [ ] Build admin Dashboard module
- [ ] Build admin Users module
- [ ] Build admin Quizzes module (Quiz Editor)
- [ ] Build admin Orders module
- [ ] Build admin Blog/Essays modules
- [ ] Build admin Settings module

### Phase 6: Cleanup & Deploy (3–4 ngày)
- [ ] Remove Apollo/GraphQL dependencies
- [ ] Remove `wp-content/`, `data/`, `config/` directories
- [ ] Update `.env` on Vercel
- [ ] Full integration testing
- [ ] Deploy + monitor
