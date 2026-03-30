---
name: figma-to-code-design-system
description: Quy trình chuẩn để chuyển đổi Figma design sang code theo phương pháp Components-First, đảm bảo nhất quán design system, responsive, và dễ maintain.
---

# Figma-to-Code Design System — Components-First Methodology

> Skill này là **quy trình bắt buộc** khi bất kỳ agent nào thực hiện chuyển đổi UI từ Figma sang code.
> Mọi component, page, và layout PHẢI tuân theo quy trình này để đảm bảo tính nhất quán, responsive, và khả năng maintain.

---

## Mục lục

1. [Tổng quan quy trình](#1-tổng-quan-quy-trình)
2. [Phase 1 — Design Token Extraction](#2-phase-1--design-token-extraction)
3. [Phase 2 — Atomic Component Architecture](#3-phase-2--atomic-component-architecture)
4. [Phase 3 — Component Implementation](#4-phase-3--component-implementation)
5. [Phase 4 — Page Assembly](#5-phase-4--page-assembly)
6. [Phase 5 — Responsive Adaptation](#6-phase-5--responsive-adaptation)
7. [Phase 6 — Quality Gate](#7-phase-6--quality-gate)
8. [Design Token Registry](#8-design-token-registry)
9. [Component Catalog](#9-component-catalog)
10. [Anti-patterns](#10-anti-patterns)
11. [File Conventions](#11-file-conventions)
12. [Checklist cho mỗi Component](#12-checklist-cho-mỗi-component)

---

## 1. Tổng quan quy trình

```
┌─────────────────────────────────────────────────────────────────┐
│                    FIGMA-TO-CODE PIPELINE                        │
│                                                                  │
│  Figma Design                                                    │
│      │                                                           │
│      ▼                                                           │
│  ┌──────────────────┐                                            │
│  │ Phase 1: Extract │ → Design Tokens (colors, typography,       │
│  │   Design Tokens  │   spacing, shadows, radii)                 │
│  └────────┬─────────┘                                            │
│           ▼                                                      │
│  ┌──────────────────┐                                            │
│  │ Phase 2: Map     │ → Atomic Hierarchy (atoms → molecules      │
│  │   Component Tree │   → organisms → templates)                 │
│  └────────┬─────────┘                                            │
│           ▼                                                      │
│  ┌──────────────────┐                                            │
│  │ Phase 3: Build   │ → Implement bottom-up (atoms first)        │
│  │   Components     │   Each component = .tsx + .css              │
│  └────────┬─────────┘                                            │
│           ▼                                                      │
│  ┌──────────────────┐                                            │
│  │ Phase 4: Assemble│ → Compose components into pages            │
│  │   Pages          │   Wire data + routing                      │
│  └────────┬─────────┘                                            │
│           ▼                                                      │
│  ┌──────────────────┐                                            │
│  │ Phase 5: Adapt   │ → Responsive breakpoints                   │
│  │   Responsive     │   Mobile → Tablet → Desktop                │
│  └────────┬─────────┘                                            │
│           ▼                                                      │
│  ┌──────────────────┐                                            │
│  │ Phase 6: QA Gate │ → Visual diff, accessibility, perf         │
│  └──────────────────┘                                            │
└─────────────────────────────────────────────────────────────────┘
```

### Nguyên tắc vàng

1. **KHÔNG BAO GIỜ** hardcode giá trị (color, spacing, font-size) trực tiếp trong component. Luôn dùng design token.
2. **KHÔNG BAO GIỜ** tạo component mới nếu đã có component tương tự trong catalog. Extend hoặc compose.
3. **LUÔN** build bottom-up: Atoms → Molecules → Organisms → Pages.
4. **MỌI** component phải có responsive behavior được define rõ ràng.
5. **MỌI** component phải có typed props với JSDoc.

---

## 2. Phase 1 — Design Token Extraction

### 2.1 Đọc Figma Design

Khi nhận được Figma design (screenshot, link, hoặc mô tả), agent PHẢI:

1. **Xác định Color Palette**: Liệt kê TẤT CẢ màu sắc xuất hiện trong design
2. **Xác định Typography Scale**: Font family, font sizes, font weights, line heights
3. **Xác định Spacing Scale**: Padding, margin, gap values
4. **Xác định Border Radii**: Corner radius values
5. **Xác định Shadows**: Box shadow definitions
6. **Xác định Breakpoints**: Responsive breakpoints (nếu có multiple viewport designs)

### 2.2 Token File Structure

Tất cả design tokens được quản lý tập trung tại:

```
src/
├── appx/styles/
│   ├── design-tokens.css       ← ⭐ SINGLE SOURCE OF TRUTH
│   ├── globals.css             ← Import design-tokens.css
│   └── admin-globals.css       ← Admin-specific tokens (existing)
```

### 2.3 Design Token Format

```css
/* ═══ src/appx/styles/design-tokens.css ═══ */

/* ── 1. Color Primitives ── */
:root {
  /* Brand colors — Extracted directly from Figma */
  --ds-color-primary-50:  oklch(...);
  --ds-color-primary-100: oklch(...);
  --ds-color-primary-200: oklch(...);
  --ds-color-primary-300: oklch(...);
  --ds-color-primary-400: oklch(...);
  --ds-color-primary-500: oklch(...);   /* ← Main brand color */
  --ds-color-primary-600: oklch(...);
  --ds-color-primary-700: oklch(...);
  --ds-color-primary-800: oklch(...);
  --ds-color-primary-900: oklch(...);
  --ds-color-primary-950: oklch(...);

  /* Neutral / Gray scale */
  --ds-color-neutral-50:  #fafafa;
  --ds-color-neutral-100: #f5f5f5;
  --ds-color-neutral-200: #e5e5e5;
  --ds-color-neutral-300: #d4d4d4;
  --ds-color-neutral-400: #a3a3a3;
  --ds-color-neutral-500: #737373;
  --ds-color-neutral-600: #525252;
  --ds-color-neutral-700: #404040;
  --ds-color-neutral-800: #262626;
  --ds-color-neutral-900: #171717;
  --ds-color-neutral-950: #0a0a0a;

  /* Semantic colors */
  --ds-color-success: #22c55e;
  --ds-color-warning: #f59e0b;
  --ds-color-error:   #ef4444;
  --ds-color-info:    #3b82f6;

  /* ── 2. Typography ── */
  --ds-font-primary:   'Nunito', sans-serif;
  --ds-font-secondary: 'Noto Sans', sans-serif;
  --ds-font-serif:     'Noto Serif', serif;

  /* Font sizes — Mobile-first scale */
  --ds-text-xs:   0.75rem;    /* 12px */
  --ds-text-sm:   0.875rem;   /* 14px */
  --ds-text-base: 1rem;       /* 16px */
  --ds-text-lg:   1.125rem;   /* 18px */
  --ds-text-xl:   1.25rem;    /* 20px */
  --ds-text-2xl:  1.5rem;     /* 24px */
  --ds-text-3xl:  1.875rem;   /* 30px */
  --ds-text-4xl:  2.25rem;    /* 36px */
  --ds-text-5xl:  3rem;       /* 48px */

  /* Font weights */
  --ds-font-light:    300;
  --ds-font-regular:  400;
  --ds-font-medium:   500;
  --ds-font-semibold: 600;
  --ds-font-bold:     700;
  --ds-font-extrabold: 800;

  /* Line heights */
  --ds-leading-tight:  1.25;
  --ds-leading-snug:   1.375;
  --ds-leading-normal: 1.5;
  --ds-leading-relaxed: 1.625;
  --ds-leading-loose:  2;

  /* ── 3. Spacing ── */
  --ds-space-0:   0;
  --ds-space-1:   0.25rem;    /* 4px */
  --ds-space-2:   0.5rem;     /* 8px */
  --ds-space-3:   0.75rem;    /* 12px */
  --ds-space-4:   1rem;       /* 16px */
  --ds-space-5:   1.25rem;    /* 20px */
  --ds-space-6:   1.5rem;     /* 24px */
  --ds-space-8:   2rem;       /* 32px */
  --ds-space-10:  2.5rem;     /* 40px */
  --ds-space-12:  3rem;       /* 48px */
  --ds-space-16:  4rem;       /* 64px */
  --ds-space-20:  5rem;       /* 80px */
  --ds-space-24:  6rem;       /* 96px */

  /* ── 4. Border Radius ── */
  --ds-radius-none: 0;
  --ds-radius-sm:   4px;
  --ds-radius-md:   8px;
  --ds-radius-lg:   12px;
  --ds-radius-xl:   16px;
  --ds-radius-2xl:  20px;
  --ds-radius-3xl:  24px;
  --ds-radius-full: 9999px;

  /* ── 5. Shadows ── */
  --ds-shadow-xs:  0 1px 2px rgba(0, 0, 0, 0.05);
  --ds-shadow-sm:  0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --ds-shadow-md:  0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  --ds-shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  --ds-shadow-xl:  0 20px 25px rgba(0, 0, 0, 0.1), 0 8px 10px rgba(0, 0, 0, 0.04);
  --ds-shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);

  /* ── 6. Motion / Transitions ── */
  --ds-ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ds-ease-in:      cubic-bezier(0.4, 0, 1, 1);
  --ds-ease-out:     cubic-bezier(0, 0, 0.2, 1);
  --ds-ease-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1);

  --ds-duration-fast:    150ms;
  --ds-duration-base:    250ms;
  --ds-duration-slow:    400ms;
  --ds-duration-slower:  600ms;

  /* ── 7. Z-Index Scale ── */
  --ds-z-dropdown:  1000;
  --ds-z-sticky:    1100;
  --ds-z-fixed:     1200;
  --ds-z-overlay:   1300;
  --ds-z-modal:     1400;
  --ds-z-popover:   1500;
  --ds-z-tooltip:   1600;

  /* ── 8. Layout ── */
  --ds-container-sm:  640px;
  --ds-container-md:  768px;
  --ds-container-lg:  1024px;
  --ds-container-xl:  1200px;
  --ds-container-2xl: 1400px;

  --ds-header-height: 64px;
  --ds-footer-height: 60px;
  --ds-sidebar-width: 260px;
}
```

### 2.4 Token Naming Convention

```
--ds-{category}-{property}-{variant}

Ví dụ:
--ds-color-primary-500
--ds-text-xl
--ds-space-4
--ds-radius-lg
--ds-shadow-md
```

**Prefix `--ds-`** (Design System) giúp phân biệt với:
- `--color-*` (Tailwind v4 theme tokens hiện tại)
- `--admin-*` (Admin-specific tokens hiện tại)

### 2.5 Semantic Token Layer

Ngoài primitive tokens, tạo semantic tokens cho từng context:

```css
:root {
  /* Surface / Background */
  --ds-bg-primary:     var(--ds-color-neutral-50);
  --ds-bg-secondary:   #ffffff;
  --ds-bg-tertiary:    var(--ds-color-neutral-100);
  --ds-bg-inverse:     var(--ds-color-neutral-900);
  --ds-bg-brand:       var(--ds-color-primary-500);

  /* Text */
  --ds-text-primary:   var(--ds-color-neutral-900);
  --ds-text-secondary: var(--ds-color-neutral-600);
  --ds-text-muted:     var(--ds-color-neutral-400);
  --ds-text-inverse:   #ffffff;
  --ds-text-brand:     var(--ds-color-primary-500);

  /* Border */
  --ds-border-default: var(--ds-color-neutral-200);
  --ds-border-hover:   var(--ds-color-neutral-300);
  --ds-border-focus:   var(--ds-color-primary-500);

  /* Interactive */
  --ds-interactive-default:  var(--ds-color-primary-500);
  --ds-interactive-hover:    var(--ds-color-primary-600);
  --ds-interactive-active:   var(--ds-color-primary-700);
  --ds-interactive-disabled: var(--ds-color-neutral-300);
}
```

---

## 3. Phase 2 — Atomic Component Architecture

### 3.1 Component Hierarchy (Atomic Design)

```
Atoms (smallest, independent)
├── Button
├── Input
├── Badge
├── Avatar
├── Icon
├── Tag
├── Logo
├── Skeleton
└── Spinner

Molecules (composed of atoms)
├── SearchBar (Input + Button + Icon)
├── NavLink (Icon + Text + Badge)
├── StatDisplay (Icon + Value + Label)
├── FormField (Label + Input + HelperText)
├── UserChip (Avatar + Name + Badge)
└── ScoreIndicator (Value + Label + Ring)

Organisms (complex, self-contained sections)
├── Header (Logo + NavLinks + SearchBar + UserChip)
├── Sidebar (Logo + NavLinks + UserInfo)
├── HeroBanner (Heading + Description + CTA buttons)
├── TestCard (Image + Title + Meta + Tags + CTA)
├── StatsGrid (StatDisplay × N)
├── Footer (Logo + Links + Social)
└── PricingCard (Title + Price + Features + CTA)

Templates (page-level layout)
├── MainLayout (Header + Sidebar? + Content + Footer)
├── AuthLayout (centered card)
├── DashboardLayout (header + sidebar + content)
└── ExamLayout (split panel)
```

### 3.2 Component Mapping from Figma

Khi phân tích Figma, agent PHẢI tạo component map:

```markdown
## Component Map — [Page Name]

### Atoms needed
- [ ] `DSButton` — CTA buttons (primary, secondary, ghost, link variants)
- [ ] `DSInput` — Text input fields
- [ ] `DSBadge` — Status badges (NEW, PRO, POPULAR)
- [ ] `DSAvatar` — User avatars (sizes: sm, md, lg)

### Molecules needed
- [ ] `DSSearchBar` — Search with filter dropdown
- [ ] `DSNavLink` — Navigation items with icon + label + badge count

### Organisms needed
- [ ] `DSHeader` — Top navigation bar
- [ ] `DSHeroBanner` — Landing page hero section

### Existing components to reuse
- `Container` from `@/shared/ui/container`
- `LinkButton` from `@/shared/ui/link-button`
```

### 3.3 FSD Placement Rules

```
src/
├── shared/ui/ds/              ← ⭐ Design System components live here
│   ├── atoms/
│   │   ├── ds-button/
│   │   │   ├── ds-button.tsx
│   │   │   ├── ds-button.css
│   │   │   └── index.ts
│   │   ├── ds-input/
│   │   ├── ds-badge/
│   │   └── index.ts          ← Re-exports all atoms
│   ├── molecules/
│   │   ├── ds-search-bar/
│   │   ├── ds-nav-link/
│   │   └── index.ts
│   ├── organisms/
│   │   ├── ds-header/
│   │   ├── ds-hero-banner/
│   │   └── index.ts
│   └── index.ts              ← Master re-export
│
├── widgets/                   ← Page-specific compositions
│   ├── layouts/
│   │   ├── main-layout/      ← Uses DS organisms
│   │   └── exam-layout/
│   └── ...
│
├── pages/                     ← Pages compose widgets + DS components
│   ├── home/
│   │   ├── ui/
│   │   │   ├── home-page.tsx  ← Composes DSHeroBanner, TestCard grid, etc.
│   │   │   └── home-page.css
│   │   └── index.ts
│   └── ...
```

---

## 4. Phase 3 — Component Implementation

### 4.1 Component File Template

Mỗi DS component PHẢI tuân theo template này:

```tsx
// ═══ src/shared/ui/ds/atoms/ds-button/ds-button.tsx ═══

import './ds-button.css';

/**
 * Design System Button
 *
 * @figma https://figma.com/file/xxx — Button component
 * @variants primary | secondary | ghost | link | danger
 * @sizes sm | md | lg
 */

type DSButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link' | 'danger';
type DSButtonSize = 'sm' | 'md' | 'lg';

type DSButtonProps = {
  /** Button variant matching Figma design */
  variant?: DSButtonVariant;
  /** Button size */
  size?: DSButtonSize;
  /** Loading state — shows spinner and disables interaction */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Left icon element */
  leftIcon?: React.ReactNode;
  /** Right icon element */
  rightIcon?: React.ReactNode;
  /** HTML button type */
  type?: 'button' | 'submit' | 'reset';
  /** Disabled state */
  disabled?: boolean;
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Children content */
  children: React.ReactNode;
  /** Additional CSS class */
  className?: string;
};

export const DSButton = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  type = 'button',
  disabled = false,
  onClick,
  children,
  className = '',
}: DSButtonProps) => {
  const classNames = [
    'ds-button',
    `ds-button--${variant}`,
    `ds-button--${size}`,
    fullWidth && 'ds-button--full',
    loading && 'ds-button--loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <span className="ds-button__spinner" />}
      {!loading && leftIcon && <span className="ds-button__icon ds-button__icon--left">{leftIcon}</span>}
      <span className="ds-button__label">{children}</span>
      {!loading && rightIcon && <span className="ds-button__icon ds-button__icon--right">{rightIcon}</span>}
    </button>
  );
};
```

### 4.2 Component CSS Template

```css
/* ═══ src/shared/ui/ds/atoms/ds-button/ds-button.css ═══ */

/* ── Base ── */
.ds-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ds-space-2);
  border: none;
  border-radius: var(--ds-radius-md);
  font-family: var(--ds-font-primary);
  font-weight: var(--ds-font-semibold);
  cursor: pointer;
  transition:
    background-color var(--ds-duration-fast) var(--ds-ease-default),
    color var(--ds-duration-fast) var(--ds-ease-default),
    box-shadow var(--ds-duration-fast) var(--ds-ease-default),
    transform var(--ds-duration-fast) var(--ds-ease-default);
  white-space: nowrap;
  user-select: none;
  line-height: var(--ds-leading-tight);
  position: relative;
  overflow: hidden;
}

.ds-button:active:not(:disabled) {
  transform: scale(0.98);
}

.ds-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Sizes ── */
.ds-button--sm {
  height: 32px;
  padding: 0 var(--ds-space-3);
  font-size: var(--ds-text-sm);
}

.ds-button--md {
  height: 40px;
  padding: 0 var(--ds-space-4);
  font-size: var(--ds-text-sm);
}

.ds-button--lg {
  height: 48px;
  padding: 0 var(--ds-space-6);
  font-size: var(--ds-text-base);
}

/* ── Variants ── */
.ds-button--primary {
  background: var(--ds-interactive-default);
  color: var(--ds-text-inverse);
  box-shadow: var(--ds-shadow-xs);
}

.ds-button--primary:hover:not(:disabled) {
  background: var(--ds-interactive-hover);
  box-shadow: var(--ds-shadow-sm);
}

.ds-button--secondary {
  background: transparent;
  color: var(--ds-interactive-default);
  border: 1px solid var(--ds-border-default);
}

.ds-button--secondary:hover:not(:disabled) {
  background: var(--ds-color-primary-50);
  border-color: var(--ds-interactive-default);
}

.ds-button--ghost {
  background: transparent;
  color: var(--ds-text-secondary);
}

.ds-button--ghost:hover:not(:disabled) {
  background: var(--ds-color-neutral-100);
  color: var(--ds-text-primary);
}

.ds-button--link {
  background: transparent;
  color: var(--ds-interactive-default);
  padding: 0;
  height: auto;
}

.ds-button--link:hover:not(:disabled) {
  color: var(--ds-interactive-hover);
  text-decoration: underline;
}

.ds-button--danger {
  background: var(--ds-color-error);
  color: var(--ds-text-inverse);
}

.ds-button--danger:hover:not(:disabled) {
  background: #dc2626;
}

/* ── Modifiers ── */
.ds-button--full {
  width: 100%;
}

/* ── Loading Spinner ── */
.ds-button--loading {
  pointer-events: none;
}

.ds-button__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: ds-spin 0.6s linear infinite;
}

@keyframes ds-spin {
  to { transform: rotate(360deg); }
}

/* ── Icon ── */
.ds-button__icon {
  display: flex;
  align-items: center;
  font-size: 1.1em;
}
```

### 4.3 Component Index Export

```typescript
// ═══ src/shared/ui/ds/atoms/ds-button/index.ts ═══
export { DSButton } from './ds-button';
export type { DSButtonProps } from './ds-button';
```

```typescript
// ═══ src/shared/ui/ds/atoms/index.ts ═══
export * from './ds-button';
export * from './ds-input';
export * from './ds-badge';
// ... all atoms
```

```typescript
// ═══ src/shared/ui/ds/index.ts ═══
export * from './atoms';
export * from './molecules';
export * from './organisms';
```

### 4.4 Naming Rules

| Element | Convention | Example |
|---------|-----------|---------|
| Component Name | `DS` prefix + PascalCase | `DSButton`, `DSSearchBar`, `DSHeader` |
| File Name | kebab-case with `ds-` prefix | `ds-button.tsx`, `ds-search-bar.tsx` |
| CSS Class | BEM with `ds-` prefix | `.ds-button`, `.ds-button--primary`, `.ds-button__icon` |
| CSS Variable | `--ds-` prefix | `--ds-color-primary-500` |
| Type Name | `DS` prefix + PascalCase + `Props` | `DSButtonProps` |
| Folder Name | kebab-case with `ds-` prefix | `ds-button/`, `ds-search-bar/` |

### 4.5 CSS Architecture Rules

```
⚠️ QUAN TRỌNG: Khi nào dùng Vanilla CSS vs Tailwind

1. DESIGN SYSTEM components (src/shared/ui/ds/**)
   → ✅ LUÔN dùng Vanilla CSS (.css files)
   → ✅ LUÔN dùng design tokens (--ds-*)
   → ❌ KHÔNG dùng Tailwind inline classes cho DS components
   → Lý do: DS components phải self-contained, không phụ thuộc Tailwind config

2. PAGE-LEVEL compositions (src/pages/**/ui/*)
   → ✅ CÓ THỂ dùng Tailwind cho layout (flex, grid, spacing)
   → ✅ LUÔN dùng DS components cho UI elements
   → ❌ KHÔNG tạo custom styles cho things DS covers

3. WIDGET compositions (src/widgets/**)
   → ✅ Mix Tailwind + CSS modules nếu cần
   → ✅ LUÔN dùng DS components cho UI elements
```

### 4.6 BEM Naming Convention for CSS

```css
/* Block */
.ds-card { }

/* Element (part of the block) */
.ds-card__header { }
.ds-card__body { }
.ds-card__footer { }
.ds-card__title { }

/* Modifier (variation of block or element) */
.ds-card--elevated { }
.ds-card--bordered { }
.ds-card__header--compact { }

/* State (interactive states) */
.ds-card.is-loading { }
.ds-card.is-selected { }
.ds-card.is-disabled { }
```

---

## 5. Phase 4 — Page Assembly

### 5.1 Page Composition Pattern

```tsx
// ═══ src/pages/home/ui/home-page.tsx ═══

import { DSButton } from '@/shared/ui/ds/atoms';
import { DSSearchBar } from '@/shared/ui/ds/molecules';
import { DSHeader, DSHeroBanner, DSFooter } from '@/shared/ui/ds/organisms';
import { Container } from '@/shared/ui/container';
import { TestCard } from './test-card'; // Page-specific component
import './home-page.css';

type HomePageProps = {
  heroBanner: HeroBannerData;
  featuredTests: TestData[];
  masterData: MasterData;
};

export const HomePage = ({ heroBanner, featuredTests, masterData }: HomePageProps) => {
  return (
    <div className="home-page">
      <DSHeader config={masterData.header} />

      <main className="home-page__main">
        <DSHeroBanner data={heroBanner} />

        <section className="home-page__featured">
          <Container>
            <h2 className="home-page__section-title">Featured Tests</h2>
            <div className="home-page__test-grid">
              {featuredTests.map(test => (
                <TestCard key={test.id} data={test} />
              ))}
            </div>
          </Container>
        </section>
      </main>

      <DSFooter config={masterData.footer} />
    </div>
  );
};
```

### 5.2 Page-Specific Components

Components dùng **chỉ** cho 1 page → đặt trong `src/pages/{page-name}/ui/`:

```
src/pages/home/
├── ui/
│   ├── home-page.tsx       ← Main page component
│   ├── home-page.css       ← Page-specific styles
│   ├── test-card.tsx        ← Used only on home page
│   └── testimonial-section.tsx
├── api/
│   └── index.ts             ← Data types + fetching
└── index.ts                 ← Public export
```

### 5.3 Shared vs Page-Specific Decision Rule

```
Is this component used on MORE THAN ONE page?
  ├── YES → Place in src/shared/ui/ds/ (atoms/molecules/organisms)
  └── NO  → Place in src/pages/{page-name}/ui/
              BUT still use DS tokens and DS atoms/molecules
```

---

## 6. Phase 5 — Responsive Adaptation

### 6.1 Breakpoint System

Sử dụng breakpoints đã define trong `globals.css`:

```css
/* Breakpoints (from Tailwind v4 @theme) */
--breakpoint-xs:  350px;
--breakpoint-sm:  550px;
--breakpoint-md:  850px;
--breakpoint-lg:  1024px;
--breakpoint-xl:  1200px;
--breakpoint-xxl: 1536px;
```

### 6.2 Mobile-First CSS Pattern

```css
/* ═══ Mobile-first approach ═══ */

/* Base = Mobile (< 550px) */
.ds-hero {
  padding: var(--ds-space-6) var(--ds-space-4);
  text-align: center;
}

.ds-hero__title {
  font-size: var(--ds-text-2xl);
  line-height: var(--ds-leading-tight);
}

.ds-hero__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--ds-space-4);
}

/* Tablet (≥ 550px) */
@media (min-width: 550px) {
  .ds-hero {
    padding: var(--ds-space-8) var(--ds-space-6);
  }

  .ds-hero__title {
    font-size: var(--ds-text-3xl);
  }

  .ds-hero__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--ds-space-6);
  }
}

/* Desktop (≥ 1024px) */
@media (min-width: 1024px) {
  .ds-hero {
    padding: var(--ds-space-16) var(--ds-space-8);
    text-align: left;
  }

  .ds-hero__title {
    font-size: var(--ds-text-5xl);
  }

  .ds-hero__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 6.3 Responsive Utility Classes (Optional)

Nếu cần responsive nhanh trong page composition, CÓ THỂ dùng Tailwind:

```tsx
// ✅ OK: Tailwind cho layout composition ở page level
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
  {items.map(item => (
    <DSTestCard key={item.id} data={item} /> // DS component, no Tailwind inside
  ))}
</div>

// ❌ SAI: Tailwind inside DS component
// Bên trong <DSTestCard>, KHÔNG dùng Tailwind classes
```

### 6.4 Responsive Component Props

```tsx
// Cho components cần responsive behavior via props:
type DSContainerProps = {
  /** Max width of container */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
};

// CSS handles the responsive mapping
.ds-container--lg {
  max-width: var(--ds-container-lg);
}

@media (min-width: 1200px) {
  .ds-container--lg {
    max-width: var(--ds-container-xl);
  }
}
```

---

## 7. Phase 6 — Quality Gate

### 7.1 Visual Consistency Checklist

Mỗi component/page PHẢI pass:

- [ ] **Token compliance**: Mọi color/spacing/font-size đều dùng `--ds-*` tokens
- [ ] **Figma accuracy**: Visual output match Figma design ≥ 95%
- [ ] **Responsive**: Tested ở mobile (350px), tablet (768px), desktop (1200px)
- [ ] **Interactive states**: hover, focus, active, disabled đều được define
- [ ] **Dark mode ready**: Component sẽ hoạt động nếu thêm dark theme tokens sau

### 7.2 Code Quality Checklist

- [ ] **TypeScript types**: Props typed đầy đủ, không `any`
- [ ] **JSDoc**: Component có JSDoc mô tả + `@figma` reference
- [ ] **Export**: Component được export qua index.ts chain
- [ ] **CSS BEM**: Class names tuân theo BEM với prefix `ds-`
- [ ] **No hardcoded values**: Không có magic numbers trong CSS
- [ ] **Accessibility**: Semantic HTML, ARIA labels nếu cần

### 7.3 Browser Testing

```bash
# Verify rendering at key breakpoints
# Agent nên dùng browser tool để kiểm tra tại các breakpoints:
# - 375px (iPhone SE)
# - 768px (iPad)
# - 1200px (Desktop)
# - 1536px (Large Desktop)
```

---

## 8. Design Token Registry

### 8.1 Token Tracking Document

Agent PHẢI maintain một registry file:

```
src/shared/ui/ds/REGISTRY.md
```

Format:

```markdown
# Design System — Component Registry

## Last Updated: YYYY-MM-DD

## Design Tokens
| Token | Value | Figma Reference |
|-------|-------|-----------------|
| --ds-color-primary-500 | oklch(60.987% 0.17833 19.421) | Brand Red |
| --ds-text-base | 1rem (16px) | Body text |
| ... | ... | ... |

## Components

### Atoms
| Component | Status | Figma | File |
|-----------|--------|-------|------|
| DSButton | ✅ Done | Frame "Button" | src/shared/ui/ds/atoms/ds-button/ |
| DSInput | 🔄 WIP | Frame "Input Field" | src/shared/ui/ds/atoms/ds-input/ |
| DSBadge | ⬜ TODO | Frame "Badge" | — |

### Molecules
| Component | Status | Figma | File |
|-----------|--------|-------|------|
| DSSearchBar | ⬜ TODO | Frame "Search" | — |

### Organisms
| Component | Status | Figma | File |
|-----------|--------|-------|------|
| DSHeader | ⬜ TODO | Frame "Header" | — |
```

---

## 9. Component Catalog

### 9.1 Core Atoms Specification

Các atoms CẦN THƯỜNG XUYÊN nhất:

| Atom | Variants | Sizes | States |
|------|----------|-------|--------|
| `DSButton` | primary, secondary, ghost, link, danger | sm, md, lg | default, hover, active, disabled, loading |
| `DSInput` | default, search, password, textarea | sm, md, lg | default, focus, error, disabled |
| `DSBadge` | default, success, warning, error, info, brand | sm, md | — |
| `DSAvatar` | image, initials, icon | xs, sm, md, lg, xl | — |
| `DSIcon` | wraps Material Symbols / Lucide | sm, md, lg | — |
| `DSTag` | default, primary, outlined | sm, md | removable |
| `DSSkeleton` | text, circular, rectangular | custom | animated |
| `DSSpinner` | — | sm, md, lg | — |
| `DSDivider` | horizontal, vertical | — | — |

### 9.2 Core Molecules Specification

| Molecule | Composed of | Purpose |
|----------|-------------|---------|
| `DSFormField` | DSInput + Label + HelperText | Form input with label and validation |
| `DSNavLink` | DSIcon + Text + DSBadge | Navigation item |
| `DSStatDisplay` | DSIcon + Value + Label + Trend | Dashboard metric |
| `DSUserChip` | DSAvatar + Name + Role | User identity display |
| `DSEmptyState` | Illustration + Title + Description + CTA | Empty content placeholder |
| `DSBreadcrumb` | Links + Separators | Navigation breadcrumb |

### 9.3 Core Organisms Specification

| Organism | Composed of | Purpose |
|----------|-------------|---------|
| `DSHeader` | Logo + DSNavLink[] + DSSearchBar + DSUserChip | Top navigation |
| `DSSidebar` | Logo + DSNavLink[] + DSUserChip | Side navigation |
| `DSFooter` | Logo + Link groups + Social links | Page footer |
| `DSHeroBanner` | Title + Description + CTA + Image/Illustration | Landing hero |
| `DSCard` | Header + Body + Footer (flexible slots) | Content card |
| `DSModal` | Overlay + Header + Body + Footer + Close | Dialog/modal |
| `DSTable` | Header + Rows + Pagination | Data table |

---

## 10. Anti-patterns

### ❌ TUYỆT ĐỐI KHÔNG LÀM

```css
/* ❌ Hardcoded values */
.my-button {
  background: #d94a56;         /* → Dùng var(--ds-interactive-default) */
  padding: 12px 24px;          /* → Dùng var(--ds-space-3) var(--ds-space-6) */
  font-size: 14px;             /* → Dùng var(--ds-text-sm) */
  border-radius: 8px;          /* → Dùng var(--ds-radius-md) */
  box-shadow: 0 2px 4px ...;   /* → Dùng var(--ds-shadow-sm) */
}

/* ❌ Non-BEM class names */
.button-primary { }     /* → .ds-button--primary */
.cardHeader { }          /* → .ds-card__header */
.big-title { }           /* → .ds-hero__title */

/* ❌ !important overrides */
.ds-button { color: red !important; }

/* ❌ Deep nesting (> 3 levels) */
.ds-card .ds-card__header .ds-card__title span { }
```

```tsx
// ❌ Inline styles in DS components
<button style={{ backgroundColor: '#d94a56', padding: '12px' }}>

// ❌ Mixing Tailwind in DS components
<button className="bg-red-500 px-4 py-2 rounded-lg">

// ❌ Creating duplicate components
// Already have DSButton → Don't create PrimaryButton, RedButton, etc.

// ❌ Props that bypass design system
<DSButton color="#ff0000" fontSize={18}> // Don't allow arbitrary values

// ❌ Not using DS prefix
export const Button = () => { };      // → export const DSButton = () => { };
export const SearchBar = () => { };   // → export const DSSearchBar = () => { };
```

---

## 11. File Conventions

### 11.1 Integration with Existing Project

```
⚠️ BACKWARD COMPATIBILITY:

1. KHÔNG xóa hoặc sửa existing components ngay lập tức
2. Tạo DS components MỚI song song
3. Migrate page-by-page: thay thế old component bằng DS component
4. Khi TẤT CẢ pages đã migrate → xóa old component

Migration flow:
  Old Component → [DEPRECATED] → DS Component replaces → Remove Old
```

### 11.2 Import Order

```typescript
// 1. React / Next.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

// 2. Third-party libraries
import { twMerge } from 'tailwind-merge';

// 3. Design System components (⭐ NEW)
import { DSButton, DSBadge } from '@/shared/ui/ds/atoms';
import { DSSearchBar } from '@/shared/ui/ds/molecules';
import { DSHeader } from '@/shared/ui/ds/organisms';

// 4. Shared utilities
import { useAuth } from '@/appx/providers';
import { ROUTES } from '@/shared/routes';

// 5. Page/feature-specific
import { TestCard } from './test-card';
import type { HomePageProps } from '../api';

// 6. Styles (always last)
import './home-page.css';
```

### 11.3 Complete Directory Structure

```
src/shared/ui/ds/
├── design-tokens.css          ← Centralized tokens
├── index.ts                   ← Master export
├── REGISTRY.md                ← Component tracking
│
├── atoms/
│   ├── ds-button/
│   │   ├── ds-button.tsx
│   │   ├── ds-button.css
│   │   └── index.ts
│   ├── ds-input/
│   │   ├── ds-input.tsx
│   │   ├── ds-input.css
│   │   └── index.ts
│   ├── ds-badge/
│   ├── ds-avatar/
│   ├── ds-icon/
│   ├── ds-tag/
│   ├── ds-skeleton/
│   ├── ds-spinner/
│   ├── ds-divider/
│   └── index.ts               ← export * from all atoms
│
├── molecules/
│   ├── ds-form-field/
│   ├── ds-nav-link/
│   ├── ds-stat-display/
│   ├── ds-user-chip/
│   ├── ds-empty-state/
│   ├── ds-breadcrumb/
│   └── index.ts
│
└── organisms/
    ├── ds-header/
    ├── ds-sidebar/
    ├── ds-footer/
    ├── ds-hero-banner/
    ├── ds-card/
    ├── ds-modal/
    ├── ds-table/
    └── index.ts
```

---

## 12. Checklist cho mỗi Component

Trước khi agent đánh dấu component là **Done**, PHẢI pass TẤT CẢ:

```markdown
### Component: [DSComponentName]

#### Design
- [ ] Matches Figma design accurately
- [ ] All variants implemented (e.g., primary/secondary/ghost)
- [ ] All sizes implemented (e.g., sm/md/lg)
- [ ] Interactive states: hover, focus, active, disabled
- [ ] Loading state (if applicable)

#### Code Quality
- [ ] TypeScript props fully typed (no `any`)
- [ ] JSDoc with @figma reference
- [ ] BEM CSS class naming with `ds-` prefix
- [ ] All values use design tokens (--ds-*)
- [ ] No hardcoded colors, sizes, or spacing
- [ ] No Tailwind classes inside component
- [ ] Proper index.ts export

#### Responsive
- [ ] Works at 350px (mobile)
- [ ] Works at 768px (tablet)
- [ ] Works at 1200px (desktop)

#### Accessibility
- [ ] Semantic HTML element used
- [ ] ARIA attributes where needed
- [ ] Keyboard navigable (buttons, links, inputs)
- [ ] Sufficient color contrast

#### Integration
- [ ] Registered in REGISTRY.md
- [ ] Exported via atoms/molecules/organisms index.ts
- [ ] Exported via ds/index.ts
```

---

## Quick Reference Card

```
┌────────────────────────────────────────────┐
│          DESIGN SYSTEM QUICK REF           │
├────────────────────────────────────────────┤
│                                            │
│  Token prefix:    --ds-*                   │
│  Component prefix: DS*                     │
│  CSS prefix:      .ds-*                    │
│  File prefix:     ds-*                     │
│                                            │
│  Token file:   src/appx/styles/            │
│                design-tokens.css           │
│  Components:   src/shared/ui/ds/           │
│  Registry:     src/shared/ui/ds/           │
│                REGISTRY.md                 │
│                                            │
│  CSS method:   Vanilla CSS + BEM           │
│  Responsive:   Mobile-first media queries  │
│  Values:       ALWAYS design tokens        │
│                                            │
│  Build order:  Tokens → Atoms →            │
│                Molecules → Organisms →     │
│                Pages                       │
│                                            │
│  Tailwind:     ONLY at page-level          │
│                composition, NEVER inside   │
│                DS components               │
│                                            │
│  Migration:    Incremental, page-by-page   │
│                Old → [DEPRECATED] → DS     │
│                                            │
└────────────────────────────────────────────┘
```
