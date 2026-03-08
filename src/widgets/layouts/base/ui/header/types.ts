export interface TopBarConfig {
  facebookFollowers: string;
  phoneNumber: string;
  promotionalBanner: {
    buttonText: string;
    emoji: string;
    text: string;
  };
  socialLinks: {
    enabled: boolean;
    customLinks: Array<{
      name: string;
      url: string;
      icon: string;
    }>;
  };
}

