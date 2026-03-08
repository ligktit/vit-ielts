---
name: modern-ui-library
description: Specialized skillset for building high-end, premium web interfaces using Vanilla CSS and Glassmorphism.
---

# Modern Premium UI/UX Design System

Skillset focused on high-end aesthetic presentation for the IELTS-Prediction project.

## Core Capabilities
1. **Design Tokens**: Standardizing colors, spacing, and typography across the application.
2. **Glassmorphism**: Implementing frosted glass effects, subtle borders, and blur backdrops for a "Premium" feel.
3. **Micro-animations**: Adding hover effects, layout transitions, and interactive visual feedback.
4. **Responsive Layouts**: Designing "Mobile-First" while ensuring stunning desktop experiences.
5. **Dynamic Theming**: Supporting HSL-based color adjustments for easy theme switching.

## Guidelines
- **Visual Hierarchy**: Use typography (Inter/Roboto/Outfit) to create clear content structure.
- **Color Palettes**: Avoid generic colors. Use curated, harmonious palettes (e.g., deep blues, professional accent colors).
- **Interactive States**: Every button and link must have defined hover/active/focus states.
- **Glassmorphism Spec**:
  ```css
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  ```

## Component Architecture
- **Atomized Components**: Keep components small and reusable (e.g., `GlassCard`, `AnimatedLink`, `PrimeButton`).
- **Utility CSS**: Prefer CSS variables (`--primary-color`) for theming global tokens.
- **Iconography**: Use clean, modern icons (e.g., Lucide, Phosphor) consistent with the overall style.

## Excellence Checklist
- [ ] No default browser colors.
- [ ] Smooth transitions for all hover states.
- [ ] Proper contrast for accessibility.
- [ ] High-fidelity images/mockups.
- [ ] Responsive behavior on all breakpoints.
