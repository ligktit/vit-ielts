
export type DSNavLinkProps = {
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
};

export const DSNavLink = ({ href, icon, active = false, children, onClick, className = '' }: DSNavLinkProps) => (
  <a
    href={href}
    className={`ds-nav-link ${active ? 'ds-nav-link--active' : ''} ${className}`}
    onClick={onClick}
  >
    {icon && <span className="ds-nav-link__icon">{icon}</span>}
    <span className="ds-nav-link__label">{children}</span>
  </a>
);
