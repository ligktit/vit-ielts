import { GetServerSideProps } from "next";
import { createServerSupabase } from "~supabase/server";
import { getMasterData } from "~supabase/getMasterData";
import { getStudentAssignmentDetail } from "~services/classroom";
import { ROUTES } from "@/shared/routes";
import { isTeacherRole } from "~lib/parseRoles";

export { PageMyAssignmentDetail } from "./ui";

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

  const { data: profile } = await supabase
    .from("users")
    .select("roles")
    .eq("id", user.id)
    .maybeSingle();

  if (isTeacherRole(profile?.roles)) {
    return {
      redirect: { destination: ROUTES.CLASSROOM.LIST, statusCode: 302 },
    };
  }

  const assignmentId = context.params?.id as string;
  const [master, assignment] = await Promise.all([
    getMasterData(context),
    getStudentAssignmentDetail(supabase, user.id, assignmentId),
  ]);

  if (!assignment) {
    return { redirect: { destination: ROUTES.CLASSROOM.MY_ASSIGNMENTS, statusCode: 302 } };
  }

  return {
    props: {
      ...master.props,
      assignment,
    },
  };
};
