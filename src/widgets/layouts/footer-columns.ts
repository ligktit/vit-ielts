import { ROUTES } from "@/shared/routes";
import type { FooterColumn } from "@/shared/ui/ds/organisms/footer";

/** Shared footer link columns — used by every site layout's DS Footer. */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Learn",
    links: [
      { label: "Listening", href: ROUTES.PRACTICE.ARCHIVE_LISTENING },
      { label: "Reading", href: ROUTES.PRACTICE.ARCHIVE_READING },
      { label: "Mock tests", href: ROUTES.EXAM.ARCHIVE },
      { label: "Prediction", href: ROUTES.PREDICTION.ARCHIVE },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: ROUTES.BLOG.ARCHIVE },
      { label: "Subscription", href: ROUTES.SUBSCRIPTION },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "My Dashboard", href: ROUTES.ACCOUNT.DASHBOARD },
      { label: "My Classes", href: ROUTES.CLASSROOM.LIST },
    ],
  },
];
