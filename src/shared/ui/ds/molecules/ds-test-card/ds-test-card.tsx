import { DSBadge } from '../../atoms/ds-badge';

/**
 * Design System Test Card
 *
 * @figma IELTS Prediction Test — "HoverBox1/2" + Library cards
 */

export type DSTestCardProps = {
  image?: string;
  title: string;
  subtitle?: string;
  skill?: 'reading' | 'listening' | 'speaking' | 'writing';
  author?: string;
  authorAvatar?: string;
  views?: number;
  href?: string;
  onClick?: () => void;
  className?: string;
};

const formatViews = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

export const DSTestCard = ({
  image,
  title,
  subtitle,
  skill,
  author,
  authorAvatar,
  views,
  href,
  onClick,
  className = '',
}: DSTestCardProps) => {
  const Tag = href ? 'a' : 'div';
  const linkProps = href ? { href } : {};

  return (
    <Tag {...linkProps} className={`ds-test-card ${className}`} onClick={onClick}>
      <div className="ds-test-card__image-wrapper">
        {image ? (
          <img src={image} alt={title} className="ds-test-card__image" loading="lazy" />
        ) : (
          <div className="ds-test-card__image-placeholder" />
        )}
        {skill && (
          <DSBadge variant={skill} size="sm" className="ds-test-card__skill-badge">
            {skill.charAt(0).toUpperCase() + skill.slice(1)}
          </DSBadge>
        )}
      </div>
      <div className="ds-test-card__body">
        <h3 className="ds-test-card__title">{title}</h3>
        {subtitle && <p className="ds-test-card__subtitle">{subtitle}</p>}
        <div className="ds-test-card__meta">
          {author && (
            <div className="ds-test-card__author">
              {authorAvatar && <img src={authorAvatar} alt={author} className="ds-test-card__author-avatar" />}
              <span className="ds-test-card__author-name">{author}</span>
            </div>
          )}
          {views !== undefined && (
            <span className="ds-test-card__views">👁 {formatViews(views)}</span>
          )}
        </div>
      </div>
    </Tag>
  );
};
