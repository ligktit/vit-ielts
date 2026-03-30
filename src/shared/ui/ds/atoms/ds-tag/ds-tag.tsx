
/**
 * Design System Tag — Filter/category tags
 *
 * @figma IELTS Prediction Test — Tests Page filter chips
 */

export type DSTagVariant = 'filled' | 'outlined';

export type DSTagProps = {
  variant?: DSTagVariant;
  color?: 'default' | 'primary' | 'reading' | 'listening' | 'speaking' | 'writing';
  active?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
};

export const DSTag = ({
  variant = 'filled',
  color = 'default',
  active = false,
  removable = false,
  onRemove,
  onClick,
  children,
  className = '',
}: DSTagProps) => {
  const classNames = [
    'ds-tag',
    `ds-tag--${variant}`,
    `ds-tag--${color}`,
    active && 'ds-tag--active',
    onClick && 'ds-tag--clickable',
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classNames} onClick={onClick}>
      <span className="ds-tag__label">{children}</span>
      {removable && (
        <button
          type="button"
          className="ds-tag__remove"
          onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
          aria-label="Remove tag"
        >
          ×
        </button>
      )}
    </span>
  );
};
