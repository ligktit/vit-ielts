
/**
 * Design System Footer
 *
 * @figma IELTS Prediction Test — "Footer" component
 * Dark navy background, 4-column layout, social icons, newsletter
 */

export type DSFooterLink = { label: string; href: string };
export type DSFooterColumn = { title: string; links: DSFooterLink[] };

export type DSFooterProps = {
  logoSrc?: string;
  description?: string;
  columns: DSFooterColumn[];
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  socialLinks?: { icon: React.ReactNode; href: string; label: string }[];
  showNewsletter?: boolean;
  onNewsletterSubmit?: (email: string) => void;
  className?: string;
};

export const DSFooter = ({
  logoSrc = '/logo.svg',
  description,
  columns,
  contactInfo,
  socialLinks,
  showNewsletter = true,
  onNewsletterSubmit,
  className = '',
}: DSFooterProps) => (
  <footer className={`ds-footer ${className}`}>
    <div className="ds-footer__container">
      {/* Brand Column */}
      <div className="ds-footer__brand">
        <img src={logoSrc} alt="Logo" className="ds-footer__logo" />
        {description && <p className="ds-footer__description">{description}</p>}
        {socialLinks && (
          <div className="ds-footer__social">
            {socialLinks.map((s, i) => (
              <a key={i} href={s.href} className="ds-footer__social-link" aria-label={s.label} target="_blank" rel="noopener noreferrer">
                {s.icon}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Link Columns */}
      {columns.map((col, i) => (
        <div key={i} className="ds-footer__column">
          <h4 className="ds-footer__column-title">{col.title}</h4>
          <ul className="ds-footer__links">
            {col.links.map((link, j) => (
              <li key={j}>
                <a href={link.href} className="ds-footer__link">{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Contact + Newsletter Column */}
      <div className="ds-footer__column">
        <h4 className="ds-footer__column-title">Liên hệ</h4>
        {contactInfo && (
          <ul className="ds-footer__links">
            {contactInfo.phone && <li className="ds-footer__contact-item">📞 {contactInfo.phone}</li>}
            {contactInfo.email && <li className="ds-footer__contact-item">✉️ {contactInfo.email}</li>}
            {contactInfo.address && <li className="ds-footer__contact-item">📍 {contactInfo.address}</li>}
          </ul>
        )}
        {showNewsletter && (
          <div className="ds-footer__newsletter">
            <span className="ds-footer__newsletter-label">Newsletter</span>
            <form
              className="ds-footer__newsletter-form"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                onNewsletterSubmit?.(fd.get('email') as string);
              }}
            >
              <input name="email" type="email" placeholder="Email..." className="ds-footer__newsletter-input" />
              <button type="submit" className="ds-footer__newsletter-btn">Subscribe</button>
            </form>
          </div>
        )}
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="ds-footer__bottom">
      <span>© {new Date().getFullYear()} IELTS Prediction Test. All rights reserved.</span>
    </div>
  </footer>
);
