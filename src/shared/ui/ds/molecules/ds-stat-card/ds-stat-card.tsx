
export type DSStatCardProps = {
  icon?: React.ReactNode;
  value: string | number;
  label: string;
  trend?: { value: string; positive: boolean };
  className?: string;
};

export const DSStatCard = ({ icon, value, label, trend, className = '' }: DSStatCardProps) => (
  <div className={`ds-stat-card ${className}`}>
    {icon && <div className="ds-stat-card__icon">{icon}</div>}
    <div className="ds-stat-card__content">
      <span className="ds-stat-card__value">{value}</span>
      <span className="ds-stat-card__label">{label}</span>
    </div>
    {trend && (
      <span className={`ds-stat-card__trend ${trend.positive ? 'ds-stat-card__trend--up' : 'ds-stat-card__trend--down'}`}>
        {trend.positive ? '↑' : '↓'} {trend.value}
      </span>
    )}
  </div>
);
