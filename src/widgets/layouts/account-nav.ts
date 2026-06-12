import { ROUTES } from "@/shared/routes";

export type AccountNavItem = {
  label?: string;
  icon?: string;
  link?: string;
  /** active when router.pathname starts with this prefix (for sub-routes) */
  match?: string;
  /** suppress active state when pathname starts with this prefix (more specific sibling wins) */
  notMatch?: string;
  /** hide this item for users with the teacher role */
  studentOnly?: boolean;
  /** small label shown next to the item (e.g. "Beta") */
  badge?: string;
  type?: string;
  danger?: boolean;
};

/**
 * Shared left-sidebar navigation for the account area (My Profile layout) and
 * the classroom layout — keeps the menu identical across both, matching Figma.
 */
export const ACCOUNT_NAVIGATION: AccountNavItem[] = [
  { label: "Tài Khoản Của Tôi", icon: "person", link: ROUTES.ACCOUNT.MY_PROFILE },
  { label: "Bảng điều khiển", icon: "home", link: ROUTES.ACCOUNT.DASHBOARD, studentOnly: true },
  {
    label: "Lớp học",
    icon: "class",
    link: ROUTES.CLASSROOM.LIST,
    match: "/classroom",
    badge: "Beta",
  },
  { label: "Lịch sử đơn hàng", icon: "shopping_cart", link: ROUTES.ACCOUNT.ORDER_HISTORY, studentOnly: true },
  { label: "Cộng tác viên", icon: "link", link: ROUTES.ACCOUNT.AFFILIATE },
  { label: "Thanh toán", icon: "payment", link: ROUTES.CHECKOUT, studentOnly: true },
  { type: "divider" },
  { label: "Đăng xuất", icon: "logout", link: "#", danger: true },
];
