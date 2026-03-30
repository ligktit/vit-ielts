
export type DSBreadcrumbItem = { label: string; href?: string };

export type DSBreadcrumbProps = {
  items: DSBreadcrumbItem[];
  className?: string;
};

export const DSBreadcrumb = ({ items, className = '' }: DSBreadcrumbProps) => (
  <nav className={`ds-breadcrumb ${className}`} aria-label="Breadcrumb">
    {items.map((item, i) => (
      <span key={i} className="ds-breadcrumb__item">
        {i > 0 && <span className="ds-breadcrumb__sep">/</span>}
        {item.href && i < items.length - 1 ? (
          <a href={item.href} className="ds-breadcrumb__link">{item.label}</a>
        ) : (
          <span className="ds-breadcrumb__current">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);
