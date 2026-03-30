
/**
 * Design System Badge
 *
 * @figma IELTS Prediction Test — "BlogTag" + skill indicators
 */

export type DSBadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'reading' | 'listening' | 'speaking' | 'writing';
export type DSBadgeSize = 'sm' | 'md';

export type DSBadgeProps = {
  variant?: DSBadgeVariant;
  size?: DSBadgeSize;
  children: React.ReactNode;
  className?: string;
};

export const DSBadge = ({
  variant = 'default',
  size = 'sm',
  children,
  className = '',
}: DSBadgeProps) => {
  const classNames = [
    'ds-badge',
    `ds-badge--${variant}`,
    `ds-badge--${size}`,
    className,
  ].filter(Boolean).join(' ');

  return <span className={classNames}>{children}</span>;
};
