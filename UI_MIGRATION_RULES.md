# UI Migration Rules — IELTS Prediction

> **MỌI agent/developer PHẢI đọc file này TRƯỚC KHI thực hiện bất kỳ UI migration task nào.**
> Đây là bộ quy tắc bổ sung cho `CODE_CONVENTIONS.md`, áp dụng riêng cho quá trình chuyển đổi UI.

---

## 1. Scope Boundaries — KHÔNG ĐƯỢC vi phạm

### 🔒 Protected Pages (KHÔNG CHẠM VÀO)

```
pages/take-the-test/**     → Trang thi — KHÔNG thay đổi bất cứ thứ gì
pages/preview.tsx          → DS gallery tool — giữ nguyên  
pages/admin/**             → Admin dashboard — giữ nguyên Ant Design
```

### ✅ Migratable Pages (ĐƯỢC chuyển đổi)

Mọi trang user-facing khác đều nằm trong scope. Xem danh sách đầy đủ trong `implementation_plan.md`.

### ⚠️ globals.css — Cẩn thận đặc biệt

```css
/* ✅ ĐƯỢC XÓA: Ant Design overrides cho user-facing pages */
.ant-btn-primary { ... }

/* ❌ KHÔNG XÓA: CSS liên quan test-taking */
.plyr--audio { ... }           /* Audio player cho bài thi */
.ant-splitter { ... }          /* Splitter cho test-result */
.quiz-*, .passage-* { ... }   /* Quiz UI components */
```

---

## 2. CSS Strategy — Tailwind-Only

### 🚨 QUY TẮC MỚI: KHÔNG TẠO CUSTOM CSS CLASSES

> **Toàn bộ styling PHẢI dùng Tailwind utility classes trực tiếp trong JSX.**
> KHÔNG tạo file `.css` mới, KHÔNG viết BEM classes, KHÔNG dùng `<style jsx>`.
> Ngoại lệ DUY NHẤT: `button.css` (DS Button) vì quá phức tạp với hover/disabled states — sẽ refactor sau.

### ❌ CẤM tuyệt đối

```tsx
// ❌ KHÔNG tạo custom CSS classes
.hero-banner { }
.hero-banner__title { }
.header__container { }

// ❌ KHÔNG tạo file .css mới cho components
hero-banner.css ❌
header.css ❌

// ❌ KHÔNG dùng <style jsx>
<style jsx>{`
  .my-class { color: red; }
`}</style>

// ❌ KHÔNG import Ant Design components trong user-facing pages
import { Button, Card, Modal, Collapse, Table } from "antd";

// ❌ KHÔNG dùng hardcoded colors
<div style={{ color: "#d94a56" }}>
<div className="text-[#d94a56]">

// ❌ KHÔNG dùng !important (trừ override third-party CSS)
.my-class { color: red !important; }

// ❌ KHÔNG dùng CSS global selectors cho component styles
div.my-page h2 { ... }

// ❌ KHÔNG dùng inline style (trừ dynamic runtime values)
<div style={{ width: "661px" }}>  ❌ → dùng className="max-w-[661px] w-full"
```

### ✅ PHẢI dùng

```tsx
// ✅ Tailwind utility classes cho MỌI styling
<header className="sticky top-5 z-50 bg-transparent pointer-events-none px-5">
<div className="flex items-center justify-between max-w-[1597px] mx-auto 
  px-[50px] py-[15px] h-20 bg-white/50 shadow-md backdrop-blur-[7.5px] 
  rounded-[60px] pointer-events-auto">

// ✅ DS tokens qua arbitrary values khi cần
<div className="text-[var(--color-primary-600)]">
<div className="bg-[var(--bg-secondary)]">

// ✅ DS components cho UI elements
import { Button, TestCard, Badge } from "@/shared/ui/ds";

// ✅ Tailwind cho layout, spacing, responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// ✅ Tailwind @keyframes qua tailwind.config hoặc arbitrary animation
<div className="animate-[float_4s_ease-in-out_infinite]">
```

### Priority (từ cao → thấp)

| # | Nguồn | Khi nào dùng | Ví dụ |
|---|---|---|---|
| 1 | **DS Design Tokens** (CSS vars via Tailwind arbitrary) | Màu, font, spacing, shadow | `text-[var(--color-primary-600)]` |
| 2 | **DS Components** | UI elements chuẩn | `<DSButton variant="primary">` |
| 3 | **Tailwind utilities** | Mọi thứ còn lại | `className="flex items-center gap-8"` |
| 4 | **Inline styles** | ❌ KHÔNG DÙNG (trừ dynamic runtime values) | — |

### Xử lý CSS phức tạp bằng Tailwind

```tsx
// Hover states → Tailwind hover:
<a className="text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">

// Pseudo elements → nếu không thể dùng Tailwind → tạo helper SVG/HTML component
// KHÔNG viết CSS cho ::before, ::after

// Dropdown visibility → dùng state + conditional classes
<div className={`absolute top-full left-0 min-w-[200px] bg-white border 
  rounded-lg shadow-lg p-2 transition-all duration-150
  ${isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-2"}`
}>

// Animations → Tailwind config hoặc arbitrary
// Đơn giản: className="animate-bounce" hoặc "animate-pulse"
// Tùy chỉnh: thêm vào tailwind.config.ts → animation: { float: "float 4s ease-in-out infinite" }
// Hoặc arbitrary: className="animate-[float_4s_ease-in-out_infinite]"

// @keyframes → định nghĩa trong tailwind.config.ts
// tailwind.config.ts → theme.extend.keyframes.float = { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-15px)" } }
```

---

## 3. Component Architecture

### File Pattern — BẮT BUỘC

```
src/pages/{page-name}/
├── ui/
│   ├── index.tsx              # Page composition — import + compose sections
│   ├── hero-section.tsx       # Section component (Tailwind-only, KHÔNG có .css)
│   ├── filter-bar.tsx
│   └── test-grid.tsx
├── api/                       # GIỮ NGUYÊN — không thay đổi
│   └── index.ts
├── index.ts                   # GIỮ NGUYÊN — getServerSideProps
└── types.ts                   # GIỮ NGUYÊN
```

> ⚠️ LƯU Ý: KHÔNG có file `.css` đi kèm component. Toàn bộ styling nằm trong className.

### Naming Rules

```tsx
// Component files: kebab-case
hero-banner.tsx ✅
HeroBanner.tsx  ❌

// Component exports: PascalCase
export const HeroBanner = () => { ... } ✅

// ❌ KHÔNG dùng BEM class names — dùng Tailwind thay thế
.hero-banner { }             ❌
.hero-banner__title { }      ❌
.hero-banner--dark { }       ❌

// ✅ Tailwind trực tiếp
<section className="relative w-full overflow-hidden bg-white">  ✅
<h1 className="text-4xl font-bold text-[var(--text-primary)]"> ✅
```

### Component Structure — Thứ tự BẮT BUỘC

```tsx
// 1. Imports (grouped: react → third-party → DS → local)
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button, Badge } from "@/shared/ui/ds";
import { useAuth } from "@/appx/providers";
import type { HeroConfig } from "../types";

// 2. Types (inline nếu < 4 props, extracted nếu >= 4)
type HeroBannerProps = {
  config: HeroConfig;
  className?: string;
};

// 3. Component
export const HeroBanner = ({ config, className }: HeroBannerProps) => {
  // 3a. Hooks
  const { isSignedIn } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  // 3b. Derived / computed values
  const greeting = isSignedIn ? "Welcome back" : "Get Started";

  // 3c. Event handlers
  const handleCTA = () => { ... };

  // 3d. Effects
  useEffect(() => { ... }, []);

  // 3e. Guards / early returns
  if (!config) return null;

  // 3f. Render — MỌI styling dùng Tailwind className
  return (
    <section className={`relative w-full overflow-hidden bg-white min-h-[700px] 
      flex items-center pt-24 pb-12 lg:pt-32 lg:pb-20 ${className ?? ""}`}>
      ...
    </section>
  );
};
```

---

## 4. Design Token Usage — KHÔNG ngoại lệ

### Font

```tsx
// ✅ CHỈ dùng Noto Sans — qua Tailwind arbitrary
className="font-[var(--font-primary)]"
// hoặc nếu đã map trong tailwind.config:
className="font-primary"

// ❌ KHÔNG dùng font khác
font-family: 'Inter', sans-serif;
font-family: Arial;
```

### Colors — LUÔN qua Tailwind

```tsx
// ✅ Dùng Tailwind với design tokens
className="text-[var(--color-primary-600)] bg-[var(--color-bg-secondary)]"

// ✅ Hoặc Tailwind classes nếu đã map tokens
className="text-primary-600 bg-surface-secondary"

// ❌ KHÔNG hardcode
className="text-[#d94a56]"   ❌
style={{ color: "#d94a56" }} ❌
```

### Spacing & Sizing

```tsx
// ✅ Tailwind spacing
className="p-4 gap-6 mb-8"

// ✅ Arbitrary values khi cần exact pixel
className="max-w-[661px] gap-[32px] h-[80px]"

// ❌ KHÔNG dùng inline styles cho spacing
style={{ padding: "17px" }}     ❌
style={{ maxWidth: "661px" }}   ❌
```

### Shadows & Border Radius

```tsx
// ✅ Tailwind classes
className="shadow-lg rounded-xl"

// ✅ Arbitrary values cho Figma specs
className="shadow-[0px_4px_10px_rgba(0,0,0,0.25)] rounded-[60px]"

// ❌ KHÔNG viết CSS cho shadows
box-shadow: 0 2px 8px rgba(0,0,0,0.15);  ❌
```

---

## 5. Import Rules cho User-Facing Pages

### ✅ APPROVED Imports

```tsx
// DS Components
import { Button, Input, Badge, Tag, Avatar } from "@/shared/ui/ds";
import { TestCard, BlogCard, PricingCard } from "@/shared/ui/ds";
import { Header, Footer, CTABanner } from "@/shared/ui/ds";

// Shared
import { useAuth } from "@/appx/providers";
import { ROUTES } from "@/shared/routes";
import { cn } from "@/shared/lib/utils"; // className merge utility

// Next.js
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

// Third-party (allowed)
import { motion, AnimatePresence } from "framer-motion"; // animations
import { Swiper, SwiperSlide } from "swiper/react";       // carousels
```

### ❌ BANNED Imports (user-facing pages)

```tsx
// Ant Design — CẤM trong user-facing pages
import { Button } from "antd";           ❌
import { Card, Modal } from "antd";      ❌
import { Table, Collapse } from "antd";  ❌
import { ConfigProvider } from "antd";   ❌

// Ngoại lệ DUY NHẤT: pages/admin/**, pages/take-the-test/**
```

---

## 6. Responsive Design — Mobile First

### Breakpoints (theo Tailwind config)

```
Mobile:  < 640px   → default styles (viết trước)
Tablet:  >= 640px  → sm:
Desktop: >= 1024px → lg:
Wide:    >= 1280px → xl:
```

### Pattern BẮT BUỘC

```tsx
// ✅ Mobile first — default = mobile, override cho larger
<div className="
  grid grid-cols-1 gap-4          /* mobile: 1 cột */
  sm:grid-cols-2 sm:gap-6         /* tablet: 2 cột */
  lg:grid-cols-3 lg:gap-8         /* desktop: 3 cột */
">

// ✅ Font responsive
<h1 className="
  text-2xl                        /* mobile */
  lg:text-4xl                     /* desktop */
">

// ❌ Desktop first — KHÔNG dùng
<div className="grid-cols-3 max-md:grid-cols-1">
```

### Container — BẮT BUỘC

```tsx
// ✅ Mọi page section PHẢI có container
<section className="py-12 lg:py-20">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {/* content */}
  </div>
</section>

// ❌ Content không có container → overflow trên mobile
<section>
  <div className="flex gap-8">...</div>  // ❌ sẽ tràn
</section>
```

---

## 7. Accessibility — Minimum Requirements

```tsx
// ✅ Images PHẢI có alt text
<Image src={hero} alt="IELTS Prediction student studying" />

// ✅ Buttons PHẢI có accessible label
<button aria-label="Close modal">✕</button>

// ✅ Form inputs PHẢI có label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ Semantic HTML
<nav>      /* navigation */
<main>     /* page content */
<section>  /* content sections */
<article>  /* blog posts */
<aside>    /* sidebars */
<header>   /* page/section headers */
<footer>   /* page/section footers */

// ❌ KHÔNG dùng div cho mọi thứ
<div className="navigation">  ❌ → dùng <nav>
<div className="footer">      ❌ → dùng <footer>
```

---

## 8. Performance Rules

```tsx
// ✅ Images: Dùng Next.js Image component
import Image from "next/image";
<Image src={url} alt="..." width={400} height={300} loading="lazy" />

// ❌ KHÔNG dùng <img> tag trực tiếp
<img src={url} />

// ✅ Dynamic imports cho heavy components
const HeavyChart = dynamic(() => import("./heavy-chart"), {
  loading: () => <Spinner />,
  ssr: false,
});

// ✅ Debounce search inputs
const debouncedSearch = useDebouncedCallback(handleSearch, 300);

// ✅ Memoize expensive renders
const filteredTests = useMemo(() => 
  tests.filter(t => t.skill === selectedSkill),
  [tests, selectedSkill]
);
```

---

## 9. Git Conventions cho Migration

### Branch Naming

```
ui/phase-1-design-system       # Phase 1: DS upgrade
ui/phase-2-layout              # Phase 2: Header/Footer
ui/home-page                   # Từng trang cụ thể
ui/exam-library
ui/subscription
```

### Commit Messages

```
ui(ds): add HeroBanner organism component
ui(ds): update design tokens — sync with Figma
ui(layout): redesign header with glassmorphism
ui(home): replace hero section with DS components
ui(library): migrate exam library — remove AntD
ui(auth): redesign login page with AuthForm
ui(cleanup): remove unused AntD CSS overrides from globals.css
```

Format: `ui({scope}): {description}`

---

## 10. Pre-Migration Checklist — Trước mỗi PR

```
□ getServerSideProps KHÔNG thay đổi
□ services/ KHÔNG thay đổi
□ types.ts KHÔNG thay đổi (trừ khi thêm UI-only types)
□ Không có import từ "antd" trong user-facing pages
□ KHÔNG có file .css mới được tạo (Tailwind-only)
□ KHÔNG có <style jsx> trong component
□ Mọi color dùng Tailwind + CSS variable tokens
□ Mọi font = Noto Sans
□ Mobile responsive tested (375px viewport)
□ Semantic HTML (section, nav, main, article)
□ Alt text trên tất cả images
□ `npm run build` pass — không errors
□ Pages trong 🔒 Protected list KHÔNG bị ảnh hưởng
```

---

## Quick Reference — Copy/Paste

```tsx
// Skeleton cho mọi page migration:
import { useAuth } from "@/appx/providers";
import { Button, Badge } from "@/shared/ui/ds";
import Image from "next/image";
import Link from "next/link";

type PageProps = {
  masterData: MasterData;
  // ... page-specific props (giữ nguyên từ getServerSideProps)
};

export const PageUI = ({ masterData, ...props }: PageProps) => {
  return (
    <main>
      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section content — Tailwind classes only */}
        </div>
      </section>
    </main>
  );
};
```
