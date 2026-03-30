
/**
 * Design System Blog Card
 *
 * @figma IELTS Prediction Test — "BlogCell" + Blog page cards
 */

export type DSBlogCardProps = {
  image?: string;
  title: string;
  excerpt?: string;
  category?: string;
  date?: string;
  readTime?: string;
  author?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
};

export const DSBlogCard = ({
  image,
  title,
  excerpt,
  category,
  date,
  readTime,
  author,
  href,
  onClick,
  className = '',
}: DSBlogCardProps) => {
  const Tag = href ? 'a' : 'div';
  const linkProps = href ? { href } : {};

  return (
    <Tag {...linkProps} className={`ds-blog-card ${className}`} onClick={onClick}>
      <div className="ds-blog-card__image-wrapper">
        {image ? (
          <img src={image} alt={title} className="ds-blog-card__image" loading="lazy" />
        ) : (
          <div className="ds-blog-card__image-placeholder" />
        )}
      </div>
      <div className="ds-blog-card__body">
        {category && <span className="ds-blog-card__category">{category}</span>}
        <h3 className="ds-blog-card__title">{title}</h3>
        {excerpt && <p className="ds-blog-card__excerpt">{excerpt}</p>}
        <div className="ds-blog-card__meta">
          {author && <span>{author}</span>}
          {date && <span>{date}</span>}
          {readTime && <span>{readTime}</span>}
        </div>
      </div>
    </Tag>
  );
};
