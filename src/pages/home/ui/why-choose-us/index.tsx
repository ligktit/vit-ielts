import { ScrollFadeIn } from "@/shared/lib/use-scroll-fade-in";
import type { WhyChooseUsConfig } from "./types";

// ─── Default Data ─────────────────────────────────────────────────────────────

type FeatureItem = {
  iconName: string;
  title: string;
  description: string;
};

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    iconName: "edit_note",
    title: "Real exam format",
    description: "Tests mirror the official IELTS structure, timing and difficulty exactly.",
  },
  {
    iconName: "bar_chart",
    title: "Instant scoring",
    description: "Band scores and analytics the moment you finish a test.",
  },
  {
    iconName: "record_voice_over",
    title: "Expert feedback",
    description: "Teachers grade your writing and speaking with actionable notes.",
  },
  {
    iconName: "calendar_today",
    title: "Study plans",
    description: "A personalised roadmap that adapts to your target band and date.",
  },
  {
    iconName: "smartphone",
    title: "Practice anytime",
    description: "Mobile-ready lessons so you can study in any spare 10 minutes.",
  },
  {
    iconName: "groups",
    title: "Community",
    description: "Join speaking clubs and study groups to stay motivated together.",
  },
];

const DEFAULTS: WhyChooseUsConfig = {
  badge: "WHY VIT IELTS",
  title: "Everything you need in one place",
  description:
    "A complete prep ecosystem built around how students actually improve.",
  stats: [],
};

// ─── FeatureCard ──────────────────────────────────────────────────────────────

const FeatureCard = ({ iconName, title, description }: FeatureItem) => (
  <div className="bg-[#374151] border border-[rgba(25,29,36,0.1)] rounded-[24px] p-[26px] flex flex-col items-start flex-1 min-w-0">
    {/* Brand icon container */}
    <div className="bg-[#b3e653] flex items-center justify-center rounded-[14px] w-12 h-12 shrink-0 mb-4">
      <span className="material-symbols-rounded text-[#191d24] text-[28px]">{iconName}</span>
    </div>

    <p className="font-display font-bold text-[19px] leading-[1.3] text-white mb-2">
      {title}
    </p>
    <p className="font-inter font-normal text-[14px] leading-[1.4] text-white/60">
      {description}
    </p>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

interface WhyChooseUsProps {
  config?: WhyChooseUsConfig;
}

export const WhyChooseUs = ({ config: _config }: WhyChooseUsProps) => {
  // Figma redesign: section uses fixed feature cards — CMS stats config is not used.
  return (
    <ScrollFadeIn
      data-section="why-choose-us"
      className="w-full bg-[#f6f7f4] px-4 sm:px-6 py-6"
    >
      <div className="max-w-[1312px] mx-auto bg-[#242938] rounded-[40px] px-8 sm:px-12 lg:px-16 py-12 lg:py-14">

        {/* Header */}
        <div className="mb-8">
          <p className="font-inter font-bold text-[12px] leading-[1.2] tracking-[8px] uppercase text-[#b3e653] mb-4">
            WHY VIT IELTS
          </p>
          <h2 className="font-display font-bold text-[32px] sm:text-[38px] leading-[1.1] tracking-[-0.95px] text-white max-w-[560px] mb-3">
            Everything you need in one place
          </h2>
          <p className="font-inter font-normal text-[18px] leading-[1.5] text-white/60 max-w-[560px]">
            A complete prep ecosystem built around how students actually improve.
          </p>
        </div>

        {/* Feature cards: 2 rows × 3 cols */}
        <div className="flex flex-col gap-[22px]">
          {/* Row 1 */}
          <div className="flex flex-col sm:flex-row gap-[22px]">
            {DEFAULT_FEATURES.slice(0, 3).map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
          {/* Row 2 */}
          <div className="flex flex-col sm:flex-row gap-[22px]">
            {DEFAULT_FEATURES.slice(3, 6).map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>

      </div>
    </ScrollFadeIn>
  );
};
