import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ROUTES } from "@/shared/routes";
import { createServerSupabase } from "~supabase/server";

/**
 * SSR guard — redirects unauthenticated users to login.
 * Uses Supabase session instead of legacy cookie-based auth.
 */
export async function withAuth(
  context: GetServerSidePropsContext,
  redirect = ROUTES.LOGIN(context.resolvedUrl)
): ReturnType<GetServerSideProps> {
  const supabase = createServerSupabase(context);
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return {
      props: {},
    };
  }

  return {
    redirect: {
      destination: `${redirect}?redirect=${encodeURIComponent(
        context.resolvedUrl
      )}`,
      statusCode: 302,
    },
  };
}
