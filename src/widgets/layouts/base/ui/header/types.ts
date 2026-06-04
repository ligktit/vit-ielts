/** A single scrolling item in the announcement bar ticker. */
export interface AnnouncementBarItem {
  /** Text shown in the ticker. */
  text: string;
  /** Optional link; when set the item becomes clickable. */
  url?: string;
}

/**
 * Config for the red scrolling announcement bar rendered above the header.
 * Section name in `cms_configs`: "header/announcement-bar".
 */
export interface AnnouncementBarConfig {
  /** Master on/off switch. When false the bar is not rendered at all. */
  enabled: boolean;
  /** Bar background color (CSS color). */
  backgroundColor: string;
  /** Text/link color (CSS color). */
  textColor: string;
  /** Seconds for one full scroll loop — lower = faster. */
  speedSeconds: number;
  /** Items that scroll horizontally on the left. */
  items: AnnouncementBarItem[];
  /** Fixed (non-scrolling) link on the right, e.g. the Zalo group. */
  rightLink: {
    enabled: boolean;
    /** Small badge text, e.g. "ZALO". */
    badge: string;
    /** Link label, e.g. "Nhóm Dự Đoán". */
    label: string;
    url: string;
  };
  /** Optional gear/settings icon on the far right. */
  settingsIcon: {
    enabled: boolean;
    url: string;
  };
}

/** Default content for the announcement bar (fallback + admin initial values). */
export const DEFAULT_ANNOUNCEMENT_BAR: AnnouncementBarConfig = {
  enabled: false,
  backgroundColor: "#D94A56",
  textColor: "#ffffff",
  speedSeconds: 30,
  items: [
    { text: "Nhật", url: "" },
    { text: "FOCUS 1.6 - 8.6 Đã Cập Nhật", url: "" },
    { text: "8.6 Đã Cập Nhật", url: "" },
  ],
  rightLink: {
    enabled: true,
    badge: "ZALO",
    label: "Nhóm Dự Đoán",
    url: "https://zalo.me/",
  },
  settingsIcon: {
    enabled: false,
    url: "",
  },
};

