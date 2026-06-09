import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  SidebarStudent,
  SidebarTopActions,
  type SidebarNavEntry,
} from "@/shared/ui/ds/organisms/sidebar";
import { Footer } from "@/shared/ui/ds/organisms/footer";
import { Button } from "@/shared/ui/ds/atoms/button";
import { useAuth } from "@/appx/providers";
import { ROUTES } from "@/shared/routes";

/**
 * AppShell — logged-in app layout (Figma "Student Dashboard" shell).
 *
 * Left sidebar (SidebarStudent) + main column (sticky Top Actions bar + page
 * content + dark Footer) on the Surface/App background (#f6f7f4). Reads the
 * signed-in viewer via useAuth and the active nav item from the route.
 *
 * Pages opt in with `Page.Layout = AppShell`.
 */

// Nav groups — hrefs only where a real route exists; others are visual-only (#)
// pending dedicated routes (Study Plan / My Progress / Vocabulary / Community /
// Settings / Help & Support). See ui-rebuild-status memory.
const STUDENT_MENU: SidebarNavEntry[] = [
  { id: "home", icon: "home", label: "Home", href: ROUTES.ACCOUNT.DASHBOARD },
  { id: "mock-tests", icon: "quiz", label: "Mock Tests", href: ROUTES.EXAM.ARCHIVE },
  { id: "study-plan", icon: "calendar_today", label: "Study Plan", href: ROUTES.STUDY_PLAN },
  { id: "progress", icon: "emoji_events", label: "My Progress", href: ROUTES.MY_PROGRESS },
  { id: "vocabulary", icon: "menu_book", label: "Vocabulary", href: ROUTES.VOCABULARY },
  { id: "my-classes", icon: "school", label: "My Classes", href: ROUTES.CLASSROOM.LIST },
  { id: "assignments", icon: "assignment", label: "My Assignments", href: ROUTES.CLASSROOM.MY_ASSIGNMENTS },
];

const STUDENT_COMMUNITY: SidebarNavEntry[] = [
  { id: "community", icon: "forum", label: "Community", href: ROUTES.COMMUNITY },
  { id: "blog", icon: "book", label: "Blog", href: ROUTES.BLOG.ARCHIVE },
];

const FOOTER_COLUMNS = [
  { title: "Learn", links: [
    { label: "Listening", href: ROUTES.PRACTICE.ARCHIVE_LISTENING },
    { label: "Reading", href: ROUTES.PRACTICE.ARCHIVE_READING },
    { label: "Mock tests", href: ROUTES.EXAM.ARCHIVE },
    { label: "Prediction", href: ROUTES.PREDICTION.ARCHIVE },
  ] },
  { title: "Resources", links: [
    { label: "Blog", href: ROUTES.BLOG.ARCHIVE },
    { label: "Subscription", href: ROUTES.SUBSCRIPTION },
  ] },
  { title: "Company", links: [
    { label: "My Dashboard", href: ROUTES.ACCOUNT.DASHBOARD },
    { label: "My Classes", href: ROUTES.CLASSROOM.LIST },
  ] },
];

const activeFromPath = (pathname: string): string => {
  if (pathname.startsWith("/account/dashboard")) return "home";
  if (pathname.startsWith("/classroom/my-assignments")) return "assignments";
  if (pathname.startsWith("/classroom")) return "my-classes";
  if (pathname.startsWith(ROUTES.STUDY_PLAN)) return "study-plan";
  if (pathname.startsWith(ROUTES.MY_PROGRESS)) return "progress";
  if (pathname.startsWith(ROUTES.VOCABULARY)) return "vocabulary";
  if (pathname.startsWith(ROUTES.COMMUNITY)) return "community";
  if (pathname.startsWith("/blog")) return "blog";
  if (
    pathname.startsWith("/ielts-exam-library") ||
    pathname.startsWith("/take-the-test") ||
    pathname.startsWith("/test-result")
  )
    return "mock-tests";
  return "";
};

const initialsFromName = (name?: string | null): string => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "U";
};

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { currentUser, isSignedIn } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const name = currentUser?.name ?? "Học viên";
  const initials = initialsFromName(currentUser?.name);
  const activeItem = activeFromPath(router.pathname);

  return (
    <div className="flex min-h-dvh bg-[#f6f7f4]">
      <SidebarStudent
        state={collapsed ? "collapsed" : "expanded"}
        activeItem={activeItem}
        user={{ name, role: "Student", initials }}
        menu={STUDENT_MENU}
        community={STUDENT_COMMUNITY}
        onCollapse={() => setCollapsed((c) => !c)}
        className="hidden lg:flex sticky top-0 h-dvh self-start"
      />

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center justify-end gap-4 px-6 lg:px-10 pt-6 pb-2 shrink-0">
          {isSignedIn ? (
            <SidebarTopActions userInitials={initials} />
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="outlined" size="sm" href={ROUTES.LOGIN()}>
                Log in
              </Button>
              <Button variant="primary" size="sm" href={ROUTES.REGISTER}>
                Sign up
              </Button>
            </div>
          )}
        </header>

        <main className="flex-1 min-w-0 px-6 lg:px-10 pb-12">{children}</main>

        <Footer columns={FOOTER_COLUMNS} showCopyright />
      </div>
    </div>
  );
};
