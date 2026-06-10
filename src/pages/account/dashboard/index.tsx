import { GetServerSideProps } from "next";
import { createServerSupabase } from "~supabase/server";
import { getMasterData } from "~supabase/getMasterData";
import { getClassroomsForUser, getStudentAssignments } from "~services/classroom";
import { getQuizzes } from "~services/quiz";
import { ROUTES } from "@/shared/routes";

export { PageDashboard } from "./ui";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerSupabase(context);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      redirect: { destination: ROUTES.LOGIN(context.resolvedUrl), statusCode: 302 },
    };
  }

  const [master, classrooms, assignments, recommended] = await Promise.all([
    getMasterData(context),
    getClassroomsForUser(supabase, user.id).catch(() => []),
    getStudentAssignments(supabase, user.id).catch(() => []),
    getQuizzes(supabase, { pageSize: 3 })
      .then((r) => r.data)
      .catch(() => []),
  ]);

  return {
    props: {
      ...master.props,
      classrooms,
      assignments,
      recommended,
    },
  };
};
