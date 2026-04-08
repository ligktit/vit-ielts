import { withMasterData, withMultipleWrapper } from "@/shared/hoc";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { createServerSupabase } from "~supabase/server";
import { readConfig } from "~services/cms-config";
import type { ContactPageConfig } from "@/shared/types/admin-config";

export { PageContact } from "./ui";

export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withMasterData,
  async (context: GetServerSidePropsContext) => {
    const supabase = createServerSupabase(context);
    const config = await readConfig<ContactPageConfig>(supabase, "contact").catch(() => null);

    return {
      props: {
        config: config ?? null,
      },
    };
  }
);
