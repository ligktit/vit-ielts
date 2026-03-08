export interface HeroBannerConfig {
  trustpilot: {
    image: string;
    rating: string;
  };
  headline: {
    line1: string;
    line2: string;
    line3: string;
    line4: string;
  };
  description: {
    text: string;
    highlightText: string;
  };
  buttons: {
    primary: {
      text: string;
      link: string;
    };
    secondary?: {
      text: string;
      link: string;
    };
  };
  backgroundImage: string;
  bannerImage: string;
  featureCards: Array<{
    icon: string;
    title?: string;
    value?: string;
    subtitle: string;
    avatars?: string[];
  }>;
  decorativeShape: {
    image: string;
  };
}

