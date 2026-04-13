
/**
 * Button — Design System Button (Tailwind-only)
 *
 * @figma IELTS Prediction Test — "BUTTONS" node 1076-2183
 *
 * Migrated from button.css (BEM) to Tailwind classes.
 * All Figma values extracted from API are preserved in comments.
 *
 * Variants:
 *   primary      — Solid #D94A56, white text, glow on hover
 *   secondary    — White bg, red border → fills red on hover
 *   outlined     — White bg, dark border → fills red on hover
 *   ghost        — Transparent, dark text, light bg on hover
 *   accent       — White bg, red border → fills red with glow on hover
 *   link         — Text only, underline on hover
 *   danger       — Error red bg
 *   icon-circle  — Round icon button (NO position:absolute — consumer decides layout)
 */

import { twMerge } from "tailwind-merge";

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outlined'
  | 'ghost'
  | 'accent'
  | 'link'
  | 'danger'
  | 'icon-circle'
  | 'white';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** For icon-circle variant — renders as the only content */
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  className?: string;
  /** Render as <a> tag */
  href?: string;
  'aria-label'?: string;
};

/* ═══════════════════════════════════════════════════════════════
   Variant classes — exact Figma values preserved
   ═══════════════════════════════════════════════════════════════ */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  /* Figma: Button1 — fill #d94a56, hover #e3636e + glow blur=10 */
  primary: [
    'bg-[#d94a56] text-white',
    'hover:bg-[#e3636e] hover:shadow-[0_0_10px_#d94a56]',
  ].join(' '),

  /* Figma: Button2 — white bg, text/border #d94a56, hover fills #e3636e */
  secondary: [
    'bg-white text-[#d94a56] border-[#d94a56]',
    'hover:bg-[#e3636e] hover:text-white hover:border-white',
    'hover:shadow-[0_2px_3px_rgba(0,0,0,0.5),0_6px_10px_4px_rgba(0,0,0,0.2)]',
  ].join(' '),

  /* Figma: Button4 — white bg, border #191d24, hover fills #d94a56 */
  outlined: [
    'bg-white text-[#191d24] border-[#191d24] font-normal',
    'hover:bg-[#d94a56] hover:text-white hover:border-transparent',
    'disabled:bg-[#b6b6b6]',
  ].join(' '),

  /* Figma: Button3 — transparent, text #191d24, hover bg 10% black */
  ghost: [
    'bg-transparent text-[#191d24] border-transparent',
    'hover:bg-black/10',
  ].join(' '),

  /* Similar to outlined but uses Primary colors */
  accent: [
    'bg-white text-[#d94a56] border-[#d94a56]',
    'hover:bg-[#d94a56] hover:text-white',
    'hover:shadow-[0_4px_16px_rgba(217,74,86,0.4)]',
  ].join(' '),

  /* Text-only link style */
  link: [
    'bg-transparent text-[#d94a56] border-transparent',
    '!p-0 !min-h-0 !rounded-none',
    'hover:text-[#e3636e] hover:underline',
  ].join(' '),

  /* Error/delete actions */
  danger: [
    'bg-[#ef4444] text-white border-transparent',
    'hover:bg-[#dc2626]',
  ].join(' '),

  /* Figma: Button-Next/Prev — 28×28, radius 14px
     ⚠️ NO position:absolute — consumer decides layout via className */
  'icon-circle': [
    'w-7 h-7 !min-h-7 !p-0',
    'bg-[#d94a56] !rounded-full border-transparent text-white',
    'hover:bg-[#ea8d95]',
  ].join(' '),

  /* Figma: In Testimonials — white bg, hover fills lighter red with white border */
  white: [
    'bg-white text-[#d94a56] border-white',
    'hover:bg-[#e3636e] hover:text-white hover:border-white hover:border-2',
    'disabled:bg-white/50 disabled:text-white/50',
  ].join(' '),
};

/* ═══ Size classes — Figma measurements ═══ */
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',                    /* 36px height */
  md: 'min-h-[49px] px-5 text-sm', /* Figma: 49px, padding [15,20] */
  lg: 'min-h-[56px] px-6 text-sm',
};

/* ═══ Icon sizing per context ═══ */
const ICON_SIZE: Record<string, string> = {
  sm:            '[&>svg]:w-4 [&>svg]:h-4 [&>img]:w-4 [&>img]:h-4',
  md:            '[&>svg]:w-5 [&>svg]:h-5 [&>img]:w-5 [&>img]:h-5',
  lg:            '[&>svg]:w-6 [&>svg]:h-6 [&>img]:w-6 [&>img]:h-6',
  'icon-circle': '[&>svg]:w-3.5 [&>svg]:h-auto [&>img]:w-3.5 [&>img]:h-auto', /* 14px in 28px circle */
};

/* ═══ Component ═══ */
export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  icon,
  type = 'button',
  disabled = false,
  onClick,
  children,
  className = '',
  href,
  'aria-label': ariaLabel,
}: ButtonProps) => {
  const isIconOnly = variant === 'icon-circle' && !children;

  const classNames = twMerge(
    // Base styles (Figma: gap 16px, radius 25px, font Noto Sans 700)
    'inline-flex items-center justify-center gap-4',
    'border border-transparent rounded-[100px]',
    'font-bold cursor-pointer whitespace-nowrap select-none leading-normal',
    'transition-[background,color,border-color,box-shadow,transform] duration-[180ms]',
    'active:enabled:scale-[0.96]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    // Size (icon-circle has own sizing via variant)
    variant !== 'icon-circle' && SIZE_CLASSES[size],
    // Variant
    VARIANT_CLASSES[variant],
    // Modifiers
    fullWidth && 'w-full',
    loading && 'pointer-events-none',
    // Consumer className last — twMerge lets these win
    className,
  );

  // Icon wrapper classes
  const iconSizeKey = variant === 'icon-circle' ? 'icon-circle' : size;
  const iconClasses = `flex items-center justify-center shrink-0 leading-none ${ICON_SIZE[iconSizeKey]}`;

  const content = (
    <>
      {/* Spinner */}
      {loading && (
        <span
          className="w-[18px] h-[18px] border-2 border-current border-r-transparent rounded-full animate-[spin_0.65s_linear_infinite] shrink-0"
          aria-hidden="true"
        />
      )}
      {/* Left icon */}
      {!loading && leftIcon && (
        <span className={iconClasses} aria-hidden="true">{leftIcon}</span>
      )}
      {/* Icon-only mode (icon-circle without children) */}
      {!loading && isIconOnly && icon && (
        <span className={iconClasses} aria-hidden="true">{icon}</span>
      )}
      {/* Label text */}
      {!loading && !isIconOnly && children && (
        <span className="inline-flex items-center">{children}</span>
      )}
      {/* Icon alongside text (non icon-only) */}
      {!loading && !isIconOnly && icon && !leftIcon && !rightIcon && (
        <span className={iconClasses} aria-hidden="true">{icon}</span>
      )}
      {/* Right icon */}
      {!loading && rightIcon && (
        <span className={iconClasses} aria-hidden="true">{rightIcon}</span>
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <a href={href} className={classNames} aria-label={ariaLabel}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      {content}
    </button>
  );
};
