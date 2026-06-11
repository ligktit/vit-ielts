import { withAuth, withMasterData, withMultipleWrapper } from "@/shared/hoc";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { createServerSupabase } from "~supabase/server";
import type { UserSettings } from "~services/types/database";

export { PageSettings } from "./ui";

/**
 * Fetches the authenticated user's persisted settings from users.settings.
 * Returns an empty object as the default when the column is absent or null
 * (e.g. before the migration runs in environments where it hasn't been applied).
 */
async function withUserSettings(
  context: GetServerSidePropsContext,
): ReturnType<GetServerSideProps> {
  const supabase = createServerSupabase(context);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // withAuth will handle the redirect; return empty props here
    return { props: {} };
  }

  const { data } = await supabase
    .from("users")
    .select("settings")
    .eq("id", user.id)
    .single();

  const settings: UserSettings = (data?.settings as UserSettings) ?? {};

  return { props: { initialSettings: settings } };
}

export const getServerSideProps: GetServerSideProps = withMultipleWrapper(
  withAuth,
  withMasterData,
  withUserSettings,
);
