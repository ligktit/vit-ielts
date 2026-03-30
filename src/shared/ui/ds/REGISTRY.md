# Design System — Component Registry

> Last updated: 2026-03-30
> Source: Figma — IELTS Prediction Test

## Status Legend
- ✅ Implemented
- 🟡 In Progress
- ⬜ Planned

---

## Atoms

| Component | Status | Figma Ref | Notes |
|-----------|--------|-----------|-------|
| DSButton | ✅ | "BUTTONS" frame | primary (gradient), secondary, ghost, link, danger |
| DSInput | ✅ | Login/Sign Up forms | text, password, email, tel, search |
| DSBadge | ✅ | "BlogTag" + skill indicators | IELTS skill variants included |
| DSAvatar | ✅ | Dashboard, Result | image + initials fallback |
| DSTag | ✅ | Tests Page filter chips | filled, outlined, skill-colored |
| DSDivider | ✅ | Multiple pages | horizontal, vertical |
| DSSpinner | ✅ | Loading states | sm, md, lg |

## Molecules

| Component | Status | Composed of | Notes |
|-----------|--------|-------------|-------|
| DSFormField | ✅ | Label + DSInput + Helper | Used in auth forms |
| DSNavLink | ✅ | Icon + Text | Header navigation |
| DSBreadcrumb | ✅ | Links + Separators | "BreadCrumb" component |
| DSTestCard | ✅ | Image + Title + Meta + Tags | "HoverBox" + Library cards |
| DSBlogCard | ✅ | Image + Title + Meta | "BlogCell" |
| DSStatCard | ✅ | Icon + Value + Label | Dashboard metrics |
| DSPricingCard | ✅ | Title + Price + Features + CTA | Subscription pricing |

## Organisms

| Component | Status | Notes |
|-----------|--------|-------|
| DSHeader | ✅ | Sticky, responsive, dropdown nav, hamburger menu |
| DSFooter | ✅ | Dark navy, 4-col, social + newsletter |
| DSCTABanner | ✅ | Red-orange gradient, mascot, full-width CTA |
| DSHeroBanner | ⬜ | Home page hero section |
| DSFAQSection | ⬜ | Subscription page accordion |
