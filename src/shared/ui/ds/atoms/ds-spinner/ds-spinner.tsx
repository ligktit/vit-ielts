
export type DSSpinnerSize = 'sm' | 'md' | 'lg';

export type DSSpinnerProps = {
  size?: DSSpinnerSize;
  className?: string;
};

export const DSSpinner = ({ size = 'md', className = '' }: DSSpinnerProps) => (
  <div className={`ds-spinner ds-spinner--${size} ${className}`} role="status" aria-label="Loading">
    <span className="ds-spinner__circle" />
  </div>
);
