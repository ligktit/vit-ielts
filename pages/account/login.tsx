import { withGuest, withMasterData, withMultipleWrapper } from "@/shared/hoc";
import type { GetServerSideProps, GetServerSidePropsContext } from "next";
import type { LoginPageConfig } from "@/shared/types/admin-config";
import { createServerSupabase } from "~supabase/server";
import { readConfig } from "~services/cms-config";

export { PageLogin as default } from "@/pages/account/login";

// Wrapper function để đọc login page config từ Supabase
const withLoginConfig = async (
  context: GetServerSidePropsContext
) => {
  const supabase = createServerSupabase(context);

  let loginConfig: LoginPageConfig;

  try {
    const config = await readConfig<LoginPageConfig>(supabase, "account/login");
    loginConfig = config ?? {
      backgroundColor: "linear-gradient(rgb(255, 255, 255) 0%, rgb(239, 241, 255) 100%)",
    };
  } catch {
    loginConfig = {
      backgroundColor: "linear-gradient(rgb(255, 255, 255) 0%, rgb(239, 241, 255) 100%)",
    };
  }

  return {
    props: {
      loginConfig,
    },
  };
};

export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withMasterData,
  withGuest,
  withLoginConfig
);
