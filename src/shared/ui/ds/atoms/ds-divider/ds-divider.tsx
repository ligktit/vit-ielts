
export type DSDividerProps = {
  direction?: 'horizontal' | 'vertical';
  className?: string;
};

export const DSDivider = ({ direction = 'horizontal', className = '' }: DSDividerProps) => (
  <div className={`ds-divider ds-divider--${direction} ${className}`} role="separator" />
);
