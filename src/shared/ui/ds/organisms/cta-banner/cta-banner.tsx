import Image from "next/image";

export type CTABannerProps = {
  /** Main heading text */
  title: string;
  /** Supporting description */
  subtitle?: string;
  /** Button label */
  ctaText?: string;
  /** Button destination URL */
  ctaHref?: string;
  /** Click handler (if no href) */
  onCtaClick?: () => void;
  /** Mascot image path */
  mascotSrc?: string;
  /** Additional CSS class on outermost element */
  className?: string;
};

export const CTABanner = ({
  title,
  subtitle,
  ctaText = 'Nâng cấp Premium',
  ctaHref,
  onCtaClick,
  mascotSrc = '/assets/figma/icons/mascot.png',
  className = '',
}: CTABannerProps) => {
  const buttonContent = (
    <span className="font-noto-sans font-bold text-[#D94A56] text-[1.25cqi] whitespace-nowrap">
      {ctaText}
    </span>
  );

  return (
    <section className={`relative w-full overflow-visible flex justify-center ${className}`.trim()}>
      {/* Red pill shape wrapper (@container for cqi sizing) */}
      <div className="@container relative w-full max-w-[1600px] aspect-[1600/250] bg-[#D94A56] rounded-[999px] overflow-visible">
        {/* Dot pattern overlay */}
        <div 
          className="absolute inset-0 rounded-[999px] pointer-events-none z-[1]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.25) 4px, transparent 4.5px)",
            backgroundSize: "24px 24px"
          }}
        />

        {/* Text content group */}
        <div className="relative flex flex-col justify-center items-start gap-[2cqi] max-w-[55%] ml-[12.625cqi] py-[32px] z-[2]">
          <div className="flex flex-col gap-[0.375cqi]">
            <h2 className="font-noto-sans font-extrabold text-white text-[2.875cqi] leading-[1.37] m-0">
              {title}
            </h2>
            {subtitle && (
              <p className="font-noto-sans font-medium text-white text-[1.25cqi] leading-[1.35] m-0">
                {subtitle}
              </p>
            )}
          </div>

          {/* Button */}
          {ctaHref ? (
            <a 
              href={ctaHref} 
              className="inline-flex items-center justify-center min-w-[14.5cqi] h-[3.5625cqi] px-[1.25cqi] bg-white border-none rounded-[1.5625cqi] cursor-pointer no-underline transition-all duration-150 ease-out hover:bg-[#F8F9FA] hover:shadow-[0_4px_6px_rgba(0,0,0,0.07)] hover:-translate-y-[1px] active:scale-[0.98]"
            >
              {buttonContent}
            </a>
          ) : (
            <button
              type="button"
              onClick={onCtaClick}
              className="inline-flex items-center justify-center min-w-[14.5cqi] h-[3.5625cqi] px-[1.25cqi] bg-white border-none rounded-[1.5625cqi] cursor-pointer transition-all duration-150 ease-out hover:bg-[#F8F9FA] hover:shadow-[0_4px_6px_rgba(0,0,0,0.07)] hover:-translate-y-[1px] active:scale-[0.98]"
            >
              {buttonContent}
            </button>
          )}
        </div>

        {/* Mascot area */}
        {mascotSrc && (
          <div className="absolute right-[5cqi] bottom-0 w-[32cqi] h-[32cqi] z-[3] pointer-events-none">
            <Image
              src={mascotSrc}
              alt="IELTS Prediction Mascot"
              className="absolute bottom-0 left-1/2 w-[30cqi] min-h-[400px] h-auto object-cover drop-shadow-[4px_0px_4px_rgba(0,0,0,0.25)] pointer-events-auto origin-bottom transition-transform duration-500 ease-out hover:scale-[1.2] hover:rotate-4 hover:drop-shadow-[6px_4px_8px_rgba(0,0,0,0.2)] -translate-x-1/2"
              width={450}
              height={380}
              unoptimized
            />
          </div>
        )}
      </div>
    </section>
  );
};
