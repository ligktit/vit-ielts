# Figma-to-Code UI Migration — Implementation Plan

## Tổng quan

Chuyển đổi toàn bộ UI của IELTS Prediction Test từ design Figma mới sang code, theo phương pháp **Components-First**. File Figma bao gồm **8 pages** với design system hoàn chỉnh.

---

## Phân tích Figma Design

### Pages trong Figma

````carousel
![Design System — Overview gồm Header, Footer, CTA, Breadcrumb, HoverCells, Buttons, Icons, Color Palette, Typography, Logo](C:\Users\LIGKT\.gemini\antigravity\brain\a3280fca-0648-4ce3-bbf2-7f4c0e2df192\figma_des_system_overview_final_1774885501047.png)
<!-- slide -->
![Home Page — Hero section + mascot, test categories (Reading, Listening, Speaking, Writing), blog grid, CTA banner](C:\Users\LIGKT\.gemini\antigravity\brain\a3280fca-0648-4ce3-bbf2-7f4c0e2df192\figma_home_page_1774885363794.png)
<!-- slide -->
![Tests Page — Library Reading, Library Listening, giao diện làm bài thi. Grid cards với test thumbnails](C:\Users\LIGKT\.gemini\antigravity\brain\a3280fca-0648-4ce3-bbf2-7f4c0e2df192\figma_tests_page_1774885368944.png)
<!-- slide -->
![Login/Sign Up — Form đăng nhập + đăng ký, breadcrumb, Google OAuth, clean minimal layout](C:\Users\LIGKT\.gemini\antigravity\brain\a3280fca-0648-4ce3-bbf2-7f4c0e2df192\figma_login_signup_page_1774885378894.png)
<!-- slide -->
![Dashboard/Profile/Checkout — My Dashboard, Checkout flow (cart, payment, QR), practice history table](C:\Users\LIGKT\.gemini\antigravity\brain\a3280fca-0648-4ce3-bbf2-7f4c0e2df192\figma_dashboard_profile_page_1774885387965.png)
<!-- slide -->
![Result Page — Band score display, answer keys, skill/result/time info cards, explanation sections](C:\Users\LIGKT\.gemini\antigravity\brain\a3280fca-0648-4ce3-bbf2-7f4c0e2df192\figma_result_page_1774885396418.png)
<!-- slide -->
![Subscription — Combo + Single pack pricing cards, FAQ, features highlight, CTA banner](C:\Users\LIGKT\.gemini\antigravity\brain\a3280fca-0648-4ce3-bbf2-7f4c0e2df192\figma_subscription_page_actual_1774885422965.png)
<!-- slide -->
![Blog — Archive listing + single post page, related posts grid](C:\Users\LIGKT\.gemini\antigravity\brain\a3280fca-0648-4ce3-bbf2-7f4c0e2df192\figma_blog_page_1774885432179.png)
````

### Visual Style Analysis

| Element | Observation |
|---------|-------------|
| **Brand Color** | Đỏ-cam gradient (#EB5757 → #F2994A), dùng cho CTA, buttons, highlights |
| **Background** | Trắng clean (#FFFFFF), light gray sections |
| **Text** | Nền tối (#242938 hoặc gần #1A1B2E), body text gray |
| **Font** | Sans-serif hiện đại (giống Inter/Poppins) |
| **Cards** | White cards, subtle shadow, border-radius ~8-12px |
| **Header** | White bg, logo trái, nav links giữa, auth buttons phải |
| **Footer** | Dark navy (#242938), columns layout, social icons |
| **CTA Banner** | Đỏ-cam gradient background, mascot illustration, full-width |
| **Style** | Clean, minimal, professional. Không glassmorphism cho public-facing |

---

## User Review Required

> [!IMPORTANT]
> **Quyết định quan trọng cần bạn xác nhận:**

### 1. Scope & Migration Order
Đề xuất migrate theo thứ tự ưu tiên:

| Wave | Pages | Lý do |
|------|-------|-------|
| **Wave 1** | Design Tokens + Atoms + Molecules | Foundation |
| **Wave 2** | Header + Footer + Layout | Shared organisms, ảnh hưởng mọi page |
| **Wave 3** | Home Page | Trang chính, high visibility |
| **Wave 4** | Tests Page (Library) | Core feature |
| **Wave 5** | Login/Sign Up | Auth flow |
| **Wave 6** | Dashboard / Profile | User area |
| **Wave 7** | Subscription + Checkout | Revenue flow |
| **Wave 8** | Result Page | Post-test flow |
| **Wave 9** | Blog | Content pages |

### 2. Ant Design
Design mới có phong cách **clean, custom** — không thấy Ant Design components. Đề xuất:
- **Replace** Ant Design components dần dần bằng DS components cho public-facing pages
- **Giữ** Ant Design cho Admin dashboard (admin đã có design system riêng)
- Bạn đồng ý approach này không?

### 3. Tailwind CSS
Project đang dùng Tailwind v4. Đề xuất:
- **DS components** → Vanilla CSS (theo skill guidelines)
- **Page compositions** → Tailwind cho layout nhanh
- Bạn có muốn hoàn toàn bỏ Tailwind cho public pages hoặc giữ hybrid?

---

## Proposed Changes

### Phase 1 — Design Tokens + Foundation

#### [NEW] [design-tokens.css](file:///d:/Projects/IELTS-Prediction/src/appx/styles/design-tokens.css)
Tạo file design tokens tập trung, extracted từ Figma:
- Colors: Brand red-orange primary, standard neutrals, semantic colors
- Typography: Font family, size scale, weight scale, line-height scale
- Spacing: 4px-based spacing scale
- Border radius: 4px → full
- Shadows: xs → 2xl
- Motion: Easing curves + durations

#### [NEW] [ds directory](file:///d:/Projects/IELTS-Prediction/src/shared/ui/ds/)
Tạo toàn bộ cấu trúc DS components:
```
src/shared/ui/ds/
├── design-tokens.css
├── index.ts
├── REGISTRY.md
├── atoms/
├── molecules/
└── organisms/
```

---

### Phase 2 — Atoms (Bottom-up)

Based on Figma analysis, cần các atoms sau:

| Component | Figma Reference | Variants |
|-----------|----------------|----------|
| **DSButton** | "BUTTONS" frame | primary (gradient), secondary (outline), ghost, link, icon-only |
| **DSInput** | Login/Sign Up forms | text, password, search, textarea |
| **DSBadge** | "BlogTag" components | default, skill (Reading/Listening/Writing/Speaking), status |
| **DSAvatar** | Dashboard, result page | image, initials; sizes xs/sm/md/lg |
| **DSTag** | Tests page filter tags | filled, outlined; skill-colored |
| **DSSkeleton** | Loading states | text, card, image |
| **DSSpinner** | Loading states | sm, md, lg |
| **DSDivider** | Multiple pages | horizontal, vertical |
| **DSIcon** | "ICONS" frame | Wrapper cho icon system |

---

### Phase 3 — Molecules

| Component | Composed of | Figma Reference |
|-----------|-------------|----------------|
| **DSFormField** | Label + DSInput + HelperText | Login/Sign Up forms |
| **DSNavLink** | DSIcon + Text | Header nav items |
| **DSBreadcrumb** | Links + Separators | "BreadCrumb" component |
| **DSTestCard** | Image + Title + Meta + Tags + CTA | "HoverBox1/2" + Test cards in Library |
| **DSBlogCard** | Image + Title + Meta + Tags | "BlogCell" components |
| **DSStatCard** | Icon + Value + Label | Dashboard metrics |
| **DSScoreDisplay** | Ring + Score + Label | Result page band score |
| **DSPricingCard** | Title + Price + Features + CTA | Subscription cards |

---

### Phase 4 — Organisms

| Component | Figma Reference | Notes |
|-----------|----------------|-------|
| **DSHeader** | "Header" component | Logo + Nav + Auth buttons, sticky |
| **DSFooter** | "Footer" component | Dark navy bg, 4-column layout, social + newsletter |
| **DSCTABanner** | "CTA" component | Red-orange gradient, mascot, full-width |
| **DSHeroBanner** | Home Page hero | Title + subtitle + CTA + mascot illustration |
| **DSFAQSection** | Subscription page | Accordion-style Q&A |
| **DSFeatureHighlight** | Subscription page | Feature cards grid |

---

### Phase 5-9 — Page Assembly

Mỗi page sẽ compose DS components, migrate tuần tự theo wave plan ở trên.

#### [MODIFY] Các page files hiện tại
Thay thế dần Ant Design + inline styles bằng DS components.

---

## Open Questions

> [!IMPORTANT]
> **Cần bạn trả lời trước khi bắt đầu:**

1. **Migration order**: Bạn đồng ý với wave plan ở trên không? Hay muốn ưu tiên page nào khác?

2. **Ant Design**: Bỏ hoàn toàn Ant Design cho public pages, hay giữ cho một số component phức tạp (Table, Modal, Collapse)?

3. **Tailwind**: Giữ hybrid approach (DS = Vanilla CSS, pages = Tailwind layout), hay bỏ Tailwind hoàn toàn?

4. **Mascot/Illustrations**: Các hình ảnh mascot (con vịt vàng) và illustrations — bạn đã có sẵn assets chưa, hay cần export từ Figma?

5. **Font**: Figma dùng font gì chính xác? Tôi thấy giống Inter/Poppins nhưng cần confirm để extract chính xác.

---

## Verification Plan

### Automated Tests
- Build pass: `npm run build` không lỗi sau mỗi wave
- Visual regression: Browser testing tại 3 breakpoints (375px, 768px, 1200px)

### Manual Verification
- So sánh visual output vs Figma screenshots cho từng page
- Kiểm tra responsive behavior trên mobile/tablet/desktop
- Verify không break existing functionality (forms, navigation, data loading)
