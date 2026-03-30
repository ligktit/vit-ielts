import { DSButton } from '../../atoms/ds-button';

/**
 * @figma IELTS Prediction Test — Subscription page pricing cards
 */

export type DSPricingCardProps = {
  name: string;
  price: string;
  priceLabel?: string;
  popular?: boolean;
  features: string[];
  ctaText?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  className?: string;
};

export const DSPricingCard = ({
  name,
  price,
  priceLabel,
  popular = false,
  features,
  ctaText = 'Mua ngay',
  ctaHref,
  onCtaClick,
  className = '',
}: DSPricingCardProps) => (
  <div className={`ds-pricing-card ${popular ? 'ds-pricing-card--popular' : ''} ${className}`}>
    {popular && <span className="ds-pricing-card__badge">Phổ biến</span>}
    <h3 className="ds-pricing-card__name">{name}</h3>
    <div className="ds-pricing-card__price-row">
      <span className="ds-pricing-card__price">{price}</span>
      {priceLabel && <span className="ds-pricing-card__price-label">{priceLabel}</span>}
    </div>
    <ul className="ds-pricing-card__features">
      {features.map((f, i) => (
        <li key={i} className="ds-pricing-card__feature">
          <span className="ds-pricing-card__check">✓</span>
          {f}
        </li>
      ))}
    </ul>
    <DSButton
      variant={popular ? 'primary' : 'secondary'}
      fullWidth
      onClick={onCtaClick}
    >
      {ctaText}
    </DSButton>
  </div>
);
