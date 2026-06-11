import { GetServerSideProps } from "next";
import { createServerSupabase } from "~supabase/server";
import { getMasterData } from "~supabase/getMasterData";
import { getClubs } from "~services/community";
import { ROUTES } from "@/shared/routes";
import type { Club } from "~services/community";

export { PageCommunity } from "./ui";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerSupabase(context);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      redirect: {
        destination: ROUTES.LOGIN(context.resolvedUrl),
        statusCode: 302,
      },
    };
  }

  const [master, clubs] = await Promise.all([
    getMasterData(context),
    getClubs(supabase, user.id),
  ]);

  return {
    props: {
      ...master.props,
      clubs,
      userId: user.id,
    },
  };
};

export type { Club };
