import { DSButton } from '../../atoms/ds-button';

/**
 * Design System CTA Banner
 *
 * @figma IELTS Prediction Test — "CTA" component
 * Red-orange gradient, mascot image, full-width call-to-action
 */

export type DSCTABannerProps = {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  mascotSrc?: string;
  className?: string;
};

export const DSCTABanner = ({
  title,
  subtitle,
  ctaText = 'Bắt đầu ngay',
  ctaHref,
  onCtaClick,
  mascotSrc,
  className = '',
}: DSCTABannerProps) => (
  <section className={`ds-cta-banner ${className}`}>
    <div className="ds-cta-banner__container">
      <div className="ds-cta-banner__content">
        <h2 className="ds-cta-banner__title">{title}</h2>
        {subtitle && <p className="ds-cta-banner__subtitle">{subtitle}</p>}
        <DSButton
          variant="secondary"
          onClick={onCtaClick}
          className="ds-cta-banner__btn"
        >
          {ctaText}
        </DSButton>
      </div>
      {mascotSrc && (
        <div className="ds-cta-banner__mascot-wrapper">
          <img src={mascotSrc} alt="Mascot" className="ds-cta-banner__mascot" />
        </div>
      )}
    </div>
  </section>
);
