import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ROUTES } from "@/shared/routes";
import { createServerSupabase } from "~supabase/server";

/**
 * SSR guard — redirects authenticated users away from guest-only pages (login/register).
 * Uses Supabase session instead of legacy cookie-based auth.
 */
export async function withGuest(
  context: GetServerSidePropsContext,
  redirect = ROUTES.HOME
): ReturnType<GetServerSideProps> {
  const supabase = createServerSupabase(context);
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return {
      redirect: {
        destination: redirect,
        statusCode: 302,
      },
    };
  }

  return {
    props: {},
  };
}
