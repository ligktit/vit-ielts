import type { ExamLibraryHeroConfig } from "../types";

interface ExamLibraryHeroBannerProps {
  config: ExamLibraryHeroConfig;
  /** Total exam count for the dynamic subtitle count. */
  total?: number;
}

/**
 * Compact page header matching Figma node 3410:221.
 * Replaces the old full-bleed hero banner with a lightweight title + subtitle row.
 * The `config` prop signature is kept intact so the parent import/usage is unchanged.
 */
export const ExamLibraryHeroBanner = ({
  config,
  total,
}: ExamLibraryHeroBannerProps) => {
  const countLabel =
    typeof total === "number" && total > 0 ? `${total}+` : "920+";

  return (
    <div className="flex flex-col gap-1">
      {/* H1 title — Figma: bold, Ink/900 */}
      <h1 className="font-display text-heading-1 font-bold text-ink-900 leading-tight tracking-tight">
        {config.title}
      </h1>
      {/* Subtitle — Figma: Ink/Muted, body-s */}
      <p className="text-body-s text-ink-muted">
        Full, exam-style tests with instant scoring. {countLabel} available.
      </p>
    </div>
  );
};
