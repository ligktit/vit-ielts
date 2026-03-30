
/**
 * DSButton — Design System Button
 *
 * @figma IELTS Prediction Test — "BUTTONS" node 1076-2183
 *
 * Variants (matching Figma button groups):
 *   primary      — Button1: Solid #D94A56, white text, glow on hover
 *   secondary    — Button2: White bg, red border → fills red on hover (alias: outlined)
 *   outlined     — Same as secondary
 *   ghost        — Button3: Transparent, dark text, light bg on hover
 *   ghost-dark   — Button4: Translucent white, for use on dark/colored backgrounds
 *   accent       — Button5: Red icons+bold text on white → fills red on hover
 *   link         — Text only, brand color underline on hover
 *   danger       — Error red bg
 *   icon-circle  — Button-Next/Prev: Circle icon button, brand red
 *   icon-circle-outline — Circle icon, outlined ring variant
 */

export type DSButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outlined'
  | 'ghost'
  | 'ghost-dark'
  | 'accent'
  | 'link'
  | 'danger'
  | 'icon-circle'
  | 'icon-circle-outline';

export type DSButtonSize = 'sm' | 'md' | 'lg';

export type DSButtonProps = {
  variant?: DSButtonVariant;
  size?: DSButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** For icon-circle and icon-circle-outline variants — renders as the only content */
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

export const DSButton = ({
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
}: DSButtonProps) => {
  const classNames = [
    'ds-btn',
    `ds-btn--${variant}`,
    `ds-btn--${size}`,
    fullWidth && 'ds-btn--full',
    loading && 'ds-btn--loading',
    className,
  ].filter(Boolean).join(' ');

  const isIconOnly = (variant === 'icon-circle' || variant === 'icon-circle-outline') && !children;

  const content = (
    <>
      {loading && <span className="ds-btn__spinner" aria-hidden="true" />}
      {!loading && leftIcon && (
        <span className="ds-btn__icon ds-btn__icon--left" aria-hidden="true">{leftIcon}</span>
      )}
      {!loading && isIconOnly && icon && (
        <span className="ds-btn__icon" aria-hidden="true">{icon}</span>
      )}
      {!loading && !isIconOnly && children && (
        <span className="ds-btn__label">{children}</span>
      )}
      {!loading && !isIconOnly && icon && !leftIcon && !rightIcon && (
        <span className="ds-btn__icon" aria-hidden="true">{icon}</span>
      )}
      {!loading && rightIcon && (
        <span className="ds-btn__icon ds-btn__icon--right" aria-hidden="true">{rightIcon}</span>
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
