# Code Conventions — IELTS Prediction

> Tài liệu quy ước code cho toàn bộ dự án. Tất cả agents/developers PHẢI tuân theo khi viết code mới hoặc sửa code cũ.

---

## 1. Project Structure

### Kiến trúc FSD (Feature-Sliced Design)

```
src/
├── appx/                  # App layer — providers, global config
│   ├── providers/          # Context providers (Auth, App)
│   └── styles/             # Global styles
├── pages/                 # Page-level components (UI + logic riêng từng trang)
│   └── {page-name}/
│       ├── ui/             # Page UI components
│       ├── api/            # Page-specific types & data fetching
│       └── index.ts        # Public export
├── widgets/               # Large reusable UI blocks (layouts, headers, footers)
├── entities/              # Domain entities with UI (avatar, star-rating)
├── shared/                # Shared across entire app
│   ├── constants.ts        # App-wide constants
│   ├── routes/             # Route definitions
│   ├── hooks/              # Custom React hooks
│   ├── hoc/                # Higher-order components
│   ├── lib/                # Pure utility functions (no React)
│   ├── types/              # Shared TypeScript types
│   ├── ui/                 # Shared UI components
│   └── graphql/            # [DEPRECATED] → di chuyển sang lib/supabase/
└── types/                 # Global type declarations

lib/
├── supabase/              # Supabase client instances
│   ├── client.ts           # Browser client (anon key)
│   ├── server.ts           # SSR client (cookie-based)
│   ├── admin.ts            # Service role client (API routes only)
│   └── getMasterData.ts    # SSR master data fetcher
└── server/
    └── email-helper.ts     # Nodemailer SMTP

services/                  # Business logic layer (NO React, NO UI)
├── quiz.ts
├── test-flow.ts
├── scoring.ts
└── ...

pages/                     # Next.js Pages Router
├── api/                    # API Routes
├── account/
├── admin/
└── ...
```

### Quy tắc thư mục

| Quy tắc | Ví dụ |
|---------|-------|
| Tên thư mục: **kebab-case** | `ielts-practice-library/`, `take-the-test/` |
| Tên file component: **kebab-case** | `hero-banner.tsx`, `quiz-editor.tsx` |
| Tên file utility/service: **camelCase** | `calculateScore.ts`, `quiz.ts` |
| Tên file type: **kebab-case** | `admin-config.ts`, `exam.ts` |
| Export component: **PascalCase** | `export const HeroBanner = () => {}` |
| Export function: **camelCase** | `export function calculateScore() {}` |
| Export constant: **SCREAMING_SNAKE_CASE** | `export const QUESTION_FORMS = [...]` |
| Export type/interface: **PascalCase** với prefix I cho interface | `type Quiz`, `interface IPost` |

---

## 2. TypeScript

### Strict Mode

`tsconfig.json` đã bật `"strict": true`. Tuân thủ tuyệt đối:

```typescript
// ❌ SAI — any
function getUser(id: any) { ... }

// ✅ ĐÚNG — typed
function getUser(id: string): Promise<User | null> { ... }

// ❌ SAI — non-null assertion lạm dụng
const name = user!.name;

// ✅ ĐÚNG — optional chaining + nullish coalescing
const name = user?.name ?? "Unknown";
```

### Type Definitions

```typescript
// ✅ Dùng `type` cho data shapes, unions, intersections
type QuizType = "practice" | "exam";
type SkillType = "reading" | "listening";

type Quiz = {
  id: string;
  title: string;
  type: QuizType;
  skill: SkillType;
  passages: Passage[];
};

// ✅ Dùng `interface` cho contracts mà component/class implement
interface IPageProps {
  masterData: MasterData;
}

// ✅ Dùng `as const` cho constant arrays dùng làm type source
export const QUESTION_FORMS = [
  { value: "summary_completion", label: "Summary Completion" },
  // ...
] as const;
```

### Path Aliases

```typescript
// ✅ Dùng alias — KHÔNG dùng relative paths dài
import { useAuth } from "@/appx/providers";
import { ROUTES } from "@/shared/routes";
import { supabaseAdmin } from "~server/supabase/admin";

// ❌ SAI
import { useAuth } from "../../../appx/providers";
```

Aliases đã cấu hình:
- `@/*` → `./src/*`
- `~server/*` → `./lib/server/*`

---

## 3. React Components

### Naming & Structure

```typescript
// ✅ File: src/pages/home/ui/hero-banner.tsx
// Component name PHẢI khớp với chức năng, PascalCase

export const HeroBanner = ({ config }: { config: HeroBannerConfig }) => {
  // 1. Hooks (useState, useEffect, custom hooks) — ĐẦU TIÊN
  const [isVisible, setIsVisible] = useState(false);
  const { isSignedIn } = useAuth();

  // 2. Derived values / computed
  const greeting = isSignedIn ? `Xin chào` : "Chào mừng";

  // 3. Event handlers
  const handleClick = () => { ... };

  // 4. Effects
  useEffect(() => { ... }, []);

  // 5. Early returns / guards
  if (!config) return null;

  // 6. Render
  return <section className="hero-banner">...</section>;
};
```

### Component file pattern

```
src/pages/{page-name}/
├── ui/
│   ├── {component-name}.tsx     # Component
│   ├── {component-name}.css     # Scoped styles (nếu cần)
│   └── index.ts                 # Re-export
├── api/
│   ├── index.ts                 # Data fetching + types
│   └── queries.ts               # GraphQL queries (deprecated) hoặc Supabase queries
└── index.ts                     # Page public API
```

### Props Pattern

```typescript
// ✅ Inline cho 1-3 props
const Avatar = ({ src, size = 40 }: { src: string; size?: number }) => { ... };

// ✅ Extracted type cho 4+ props
type QuizCardProps = {
  quiz: Quiz;
  showScore?: boolean;
  onSelect: (id: string) => void;
  className?: string;
};

const QuizCard = ({ quiz, showScore = false, onSelect, className }: QuizCardProps) => { ... };

// ❌ KHÔNG dùng React.FC
const BadComponent: React.FC<Props> = (props) => { ... };
```

---

## 4. State Management

### Zustand Stores

```typescript
// ✅ File: src/shared/hooks/useDeviceID.tsx
// Store naming: use{Domain} (camelCase, bắt đầu bằng "use")

import { create } from "zustand";

type DeviceIDStore = {
  deviceId: string | null;
  getDeviceID: () => Promise<string>;
  getDeviceType: () => string;
};

export const useDeviceID = create<DeviceIDStore>((set, get) => ({
  deviceId: null,
  getDeviceID: async () => { ... },
  getDeviceType: () => { ... },
}));
```

### Client State vs Server State

```typescript
// CLIENT STATE (Zustand) — UI state, forms, modals
const useQuizEditor = create(...);

// SERVER STATE (Supabase queries) — database data
// KHÔNG lưu server data vào Zustand
// Dùng trực tiếp Supabase client hoặc SWR/React Query nếu cần cache

// ✅
const { data: quiz } = await supabase.from("quizzes").select("*").eq("id", id).single();

// ❌ KHÔNG copy server data vào Zustand store rồi đọc từ đó
```

---

## 5. Supabase

### Client Usage Rules

```typescript
// BROWSER (pages, components)
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

// SSR (getServerSideProps)
import { createServerSupabase } from "@/lib/supabase/server";
const supabase = createServerSupabase(context);

// API ROUTES (pages/api/*)
import { supabaseAdmin } from "@/lib/supabase/admin";
// ⚠️ CHỈ DÙNG trong API routes — bypass RLS
```

### Query Pattern

```typescript
// ✅ Service function pattern
// File: services/quiz.ts

import { SupabaseClient } from "@supabase/supabase-js";

export async function getQuizBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from("quizzes")
    .select(`*, passages(*, questions(*))`)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) throw error;
  return data;
}

// ✅ Gọi trong getServerSideProps
export async function getServerSideProps(context) {
  const supabase = createServerSupabase(context);
  const { props: masterProps } = await getMasterData(context);
  const quiz = await getQuizBySlug(supabase, context.params.slug);

  return { props: { ...masterProps, quiz } };
}
```

### RLS & Security

```
NGUYÊN TẮC RLS:
1. MỌI table PHẢI có RLS enabled
2. Public read → chỉ cho published content
3. User data → auth.uid() = user_id
4. Admin → check roles JSONB ? 'administrator'
5. API routes dùng service_role → bypass RLS (đã được bảo vệ bởi API route auth)
```

---

## 6. Services Layer

### Quy tắc

```typescript
// services/ — business logic THUẦN (không React, không Next.js)
// 
// MỌI service function:
// 1. Nhận SupabaseClient làm param đầu tiên
// 2. Return typed data hoặc throw Error
// 3. KHÔNG import React hooks/components
// 4. KHÔNG access request/response objects
// 5. CÓ THỂ dùng ở cả client (browser) và server (SSR/API)

// ✅ ĐÚNG
export async function takeTheTest(
  supabase: SupabaseClient,
  params: TakeTheTestParams
): Promise<TestResult> {
  // validate
  // query
  // return
}

// ❌ SAI — phụ thuộc vào Next.js
export async function takeTheTest(req: NextApiRequest) { ... }
```

### Error Handling

```typescript
// ✅ Dùng custom errors cho business logic
export class ProAccessError extends Error {
  constructor() {
    super("This test is only available for PRO users.");
    this.name = "ProAccessError";
  }
}

export class NotAuthenticatedError extends Error {
  constructor() {
    super("Bạn cần đăng nhập để thực hiện thao tác này.");
    this.name = "NotAuthenticatedError";
  }
}

// Trong service:
if (!user) throw new NotAuthenticatedError();
if (quiz.pro_user_only && !profile.is_pro) throw new ProAccessError();

// Trong API route:
try {
  const result = await takeTheTest(supabase, params);
  res.status(200).json(result);
} catch (error) {
  if (error instanceof ProAccessError) return res.status(403).json({ error: error.message });
  if (error instanceof NotAuthenticatedError) return res.status(401).json({ error: error.message });
  return res.status(500).json({ error: "Internal server error" });
}
```

---

## 7. API Routes

### Naming

```
pages/api/
├── admin/
│   ├── home/
│   │   ├── hero-banner.ts       # GET/POST /api/admin/home/hero-banner
│   │   └── testimonials.ts
│   ├── account/
│   └── ...
├── affiliate/
│   ├── register.ts              # POST /api/affiliate/register
│   ├── links.ts                 # GET/POST /api/affiliate/links
│   └── ...
├── orders/
│   ├── create.ts                # POST /api/orders/create
│   └── [orderId].ts             # GET /api/orders/{orderId}
└── webhooks/
    └── sepay.ts                 # POST /api/webhooks/sepay
```

### Standard Pattern

```typescript
// ✅ Mọi API route theo pattern này
import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";

type ResponseData = { success: boolean; data?: any; error?: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // 1. Method check
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // 2. Auth check (nếu cần)
    // 3. Validate input
    // 4. Business logic (gọi service)
    // 5. Return response
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(`[API ${req.url}]`, error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal error",
    });
  }
}
```

---

## 8. Styling

### Thứ tự ưu tiên

1. **Ant Design components** — dùng component + `theme` config (không override CSS trực tiếp)
2. **Tailwind CSS classes** — cho layout, spacing, responsive
3. **CSS Modules / scoped CSS** — cho component-specific styles phức tạp
4. **Global CSS** — chỉ cho design tokens và resets

### Ant Design Theme

```typescript
// Đã cấu hình trong appx/index.tsx
theme: {
  token: {
    colorPrimary: "#d94a56",
    fontFamily: "inherit, sans-serif",
    colorLink: "#d94a56",
  }
}

// ✅ Dùng Ant Design component props để customize
<Button type="primary" size="large" />
<Card className="shadow-primary border-none" />

// ❌ KHÔNG override Ant Design CSS trực tiếp
.ant-btn-primary { background: red !important; }
```

### Glassmorphism (Premium UI)

```css
/* Dùng khi cần "glass" effect */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}
```

### Color Rules

```
❌ KHÔNG dùng generic colors: red, blue, green, #ff0000
✅ Dùng design tokens:
   - Primary: #d94a56 (brand red)
   - Dùng HSL-based cho variations
   - Dùng CSS variables cho theming: var(--color-primary)
```

---

## 9. Naming Conventions

### Database (Supabase PostgreSQL)

```sql
-- Table: snake_case, số nhiều
CREATE TABLE test_results (...);
CREATE TABLE affiliate_links (...);

-- Column: snake_case
user_id, created_at, pro_expiration_date, is_pro

-- Foreign key: {referenced_table_singular}_id
quiz_id, passage_id, affiliate_id

-- Index: idx_{table}_{columns}
CREATE INDEX idx_quizzes_skill_type ON quizzes(skill, type);

-- RLS policy: Mô tả bằng tiếng Anh
CREATE POLICY "Users can view own profile" ON users ...
```

### TypeScript ↔ Database Mapping

```typescript
// Database columns: snake_case
// TypeScript properties: camelCase
// ⚠️ Supabase client TRẢ VỀ snake_case — KHÔNG tự convert

// ✅ Dùng đúng tên database
const quiz = data.pro_user_only;  // snake_case từ Supabase
const timeLeft = data.time_left;

// Nếu cần camelCase cho frontend, convert ở service layer:
function toQuizDTO(row: Database.Quiz): QuizDTO {
  return {
    id: row.id,
    proUserOnly: row.pro_user_only,
    timeMinutes: row.time_minutes,
  };
}
```

### Routes

```typescript
// Route constants: SCREAMING_SNAKE_CASE
export const ROUTES = {
  HOME: "/",
  LOGIN: (redirect?: string) => `/account/login${redirect ? `?redirect=${redirect}` : ""}`,
  ADMIN: {
    DASHBOARD: "/admin",
    USERS: "/admin/users",
  },
  PRACTICE: {
    SINGLE: (slug: string) => `/ielts-practice-library/${slug}`,
  },
};
```

---

## 10. Comments & Documentation

### Khi nào PHẢI comment

```typescript
// ✅ Business logic phức tạp
// Làm tròn score đến 0.5 gần nhất: 6.3 → 6.5, 6.7 → 6.5, 6.8 → 7.0
const roundedScore = Math.round(rawScore * 2) / 2;

// ✅ Workaround / hack
// WORKAROUND: Ant Design v5 + React 19 compatibility
unstableSetRender((node, container) => { ... });

// ✅ Mapping logic gốc
// Origin: functions.php L1014–1452 (calculate_score)
// Xem LEGACY_CODEBASE_DOCS.md mục 4.2 để hiểu chi tiết
export function calculateScore(...) { ... }

// ✅ TODOs phải có context
// TODO(migration): Replace with Supabase Auth after Phase 2
// TODO(perf): Consider caching this query result

// ❌ KHÔNG comment điều hiển nhiên
// Lấy user
const user = await getUser();
```

### JSDoc cho service functions

```typescript
/**
 * Tính điểm IELTS dựa trên câu trả lời của user
 *
 * @param answers - Mảng phẳng câu trả lời (mỗi phần tử là 1 question group)
 * @param quiz - Quiz object kèm passages + questions (nested)
 * @param testPart - Mảng indices passages được chọn [0, 1, 2]
 * @returns Score từ 0.0 đến 9.0 (bước 0.5)
 *
 * @origin functions.php L1014–1452
 * @see LEGACY_CODEBASE_DOCS.md#4-scoring-engine
 */
export function calculateScore(
  answers: any[],
  quiz: QuizWithPassages,
  testPart: number[]
): number { ... }
```

---

## 11. Git Conventions

### Branch Naming

```
feature/supabase-auth          # Tính năng mới
fix/scoring-checkbox-bug       # Sửa bug
refactor/remove-apollo         # Refactor
migration/wp-quizzes           # Data migration
admin/quiz-editor              # Admin module
```

### Commit Messages

```
feat(auth): implement Supabase login/register flow
fix(scoring): handle null answers in matching questions
refactor(api): replace JSON storage with Supabase queries
migration(data): migrate orders.json to Supabase orders table
chore: remove Apollo Client dependencies
docs: update LEGACY_CODEBASE_DOCS with scoring details
```

Format: `{type}({scope}): {description}`

Types: `feat`, `fix`, `refactor`, `migration`, `chore`, `docs`, `test`, `style`

---

## 12. Performance Rules

```typescript
// ✅ SSR: Dùng Promise.all cho concurrent queries
const [masterData, quiz, testResult] = await Promise.all([
  getMasterData(context),
  getQuizBySlug(supabase, slug),
  getTestResults(supabase, userId),
]);

// ✅ Select chỉ columns cần thiết
const { data } = await supabase
  .from("quizzes")
  .select("id, title, slug, skill, type, featured_image, tests_taken");
// ❌ .select("*") khi chỉ cần vài columns

// ✅ Pagination
.range((page - 1) * pageSize, page * pageSize - 1)

// ✅ Dùng .maybeSingle() khi có thể không có kết quả
const { data } = await supabase
  .from("test_results")
  .select("*")
  .eq("id", testId)
  .maybeSingle(); // Returns null nếu không tìm thấy, không throw error

// ❌ .single() sẽ throw error nếu không tìm thấy
```

---

## 13. Security Rules

```
1. KHÔNG BAO GIỜ expose SUPABASE_SERVICE_ROLE_KEY ở client-side
   → Chỉ dùng trong pages/api/ (server-side)

2. KHÔNG BAO GIỜ trust client input
   → Validate + sanitize trong API routes

3. LUÔN dùng RLS policies
   → Mỗi table mới PHẢI có RLS enabled + policies

4. KHÔNG lưu sensitive data trong cookies/localStorage
   → Supabase Auth tự quản lý session

5. Webhook verification
   → Luôn verify SEPAY_WEBHOOK_SECRET nếu có

6. Admin routes
   → Check user role = "administrator" trước khi xử lý
```

---

## Tóm tắt nhanh cho Agent

```
TRƯỚC KHI VIẾT CODE, ĐỌC CÁC FILE SAU:
1. CODE_CONVENTIONS.md          ← Quy ước code (file này)
2. LEGACY_CODEBASE_DOCS.md     ← Logic hệ thống cũ (WordPress)
3. NEW_CODEBASE_ANALYSIS.md    ← Kiến trúc hệ thống mới (Supabase)
4. Backend_migration_plan.md   ← Kế hoạch migration tổng thể

Khi port PHP → TypeScript:
1. Đọc function gốc trong LEGACY_CODEBASE_DOCS.md
2. Tạo TypeScript interface cho input/output
3. Viết logic dùng modern TS (map, filter, reduce)
4. Comment origin location: "// Origin: functions.php L1014–1452"
5. Verify output khớp với PHP version
```
