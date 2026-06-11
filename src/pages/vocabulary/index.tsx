import { GetServerSideProps } from "next";
import { createServerSupabase } from "~supabase/server";
import { getMasterData } from "~supabase/getMasterData";
import { getVocabularyOverview } from "~services/vocabulary";
import { ROUTES } from "@/shared/routes";

export { PageVocabulary } from "./ui";

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

  const [master, vocabularyOverview] = await Promise.all([
    getMasterData(context),
    getVocabularyOverview(supabase, user.id),
  ]);

  return {
    props: {
      ...master.props,
      vocabularyOverview,
    },
  };
};
