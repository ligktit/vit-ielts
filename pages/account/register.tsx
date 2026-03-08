import { withGuest, withMasterData, withMultipleWrapper } from "@/shared/hoc";
import type { GetServerSideProps, GetServerSidePropsContext } from "next";
import type { RegisterPageConfig } from "@/shared/types/admin-config";
import { createServerSupabase } from "~supabase/server";
import { readConfig } from "~services/cms-config";

export { PageRegister as default } from "@/pages/account/register";

// Wrapper function để đọc register page config từ Supabase
const withRegisterConfig = async (
  context: GetServerSidePropsContext
) => {
  const supabase = createServerSupabase(context);

  let registerConfig: RegisterPageConfig;

  try {
    const config = await readConfig<RegisterPageConfig>(supabase, "account/register");
    registerConfig = {
      backgroundColor: config?.backgroundColor || "linear-gradient(rgb(255, 255, 255) 0%, rgb(239, 241, 255) 100%)",
    };
  } catch {
    registerConfig = {
      backgroundColor: "linear-gradient(rgb(255, 255, 255) 0%, rgb(239, 241, 255) 100%)",
    };
  }

  return {
    props: {
      registerConfig,
    },
  };
};

export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withMasterData,
  withGuest,
  withRegisterConfig
);
