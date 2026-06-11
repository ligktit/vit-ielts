import { withAuth, withMasterData, withMultipleWrapper } from "@/shared/hoc";
import type { GetServerSideProps, GetServerSidePropsContext } from "next";
import { createServerSupabase } from "~supabase/server";
import { getStudyWeek } from "../../services/study-plan";
import type { StudyWeek } from "../../services/study-plan";

export { PageStudyPlan as default } from "@/pages/study-plan/ui";

// ── helpers ─────────────────────────────────────────────────────────────────

/** ISO date string for the Monday of the week that contains `date`. */
function getMondayISO(date: Date): string {
  const d = new Date(date);
  // getDay(): 0 = Sun, 1 = Mon … 6 = Sat
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

// ── study-plan data fetcher ──────────────────────────────────────────────────

async function withStudyPlan(
  context: GetServerSidePropsContext,
): Promise<{ props: { studyWeek: StudyWeek; weekStartISO: string } }> {
  try {
    const supabase = createServerSupabase(context);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // withAuth (composed below) handles the redirect; return empty defaults so
      // the merge still produces a valid props shape.
      return { props: { studyWeek: {}, weekStartISO: getMondayISO(new Date()) } };
    }

    const weekStartISO = getMondayISO(new Date());
    const studyWeek = await getStudyWeek(supabase, user.id, weekStartISO);

    return { props: { studyWeek, weekStartISO } };
  } catch {
    return { props: { studyWeek: {}, weekStartISO: getMondayISO(new Date()) } };
  }
}

// ── composed getServerSideProps ──────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withAuth,
  withMasterData,
  withStudyPlan,
);
