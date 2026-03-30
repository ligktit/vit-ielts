
/**
 * Design System Button
 *
 * @figma IELTS Prediction Test — "BUTTONS" frame
 * @variants primary | secondary | ghost | link | danger
 * @sizes sm | md | lg
 */

export type DSButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link' | 'danger';
export type DSButtonSize = 'sm' | 'md' | 'lg';

export type DSButtonProps = {
  variant?: DSButtonVariant;
  size?: DSButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
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
    'ds-btn',
    `ds-btn--${variant}`,
    `ds-btn--${size}`,
    fullWidth && 'ds-btn--full',
    loading && 'ds-btn--loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <span className="ds-btn__spinner" />}
      {!loading && leftIcon && <span className="ds-btn__icon ds-btn__icon--left">{leftIcon}</span>}
      <span className="ds-btn__label">{children}</span>
      {!loading && rightIcon && <span className="ds-btn__icon ds-btn__icon--right">{rightIcon}</span>}
    </button>
  );
};
