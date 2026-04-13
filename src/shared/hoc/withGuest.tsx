import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ROUTES } from "@/shared/routes";
import { createServerSupabase } from "~supabase/server";
import { isAdminRole } from "~lib/parseRoles";

/**
 * SSR guard — redirects authenticated users away from guest-only pages (login/register).
 *
 * @param context - Next.js SSR context
 * @param redirect - Optional explicit redirect destination
 * @param adminPage - Set true when guarding admin login page.
 *   - adminPage=false (default, user login/register): always redirect to home, even if admin
 *   - adminPage=true (admin login): redirect admins to /admin, regular users to home
 */
export async function withGuest(
  context: GetServerSidePropsContext,
  redirect?: string,
  adminPage = false
): ReturnType<GetServerSideProps> {
  const supabase = createServerSupabase(context);
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    let destination = redirect || ROUTES.HOME;

    if (!redirect) {
      if (adminPage) {
        // Admin login page: redirect admins to /admin, non-admins to home
        const { data: profile } = await supabase
          .from("users")
          .select("roles")
          .eq("id", user.id)
          .single();

        if (isAdminRole(profile?.roles)) {
          destination = "/admin";
        }
      }
      // User login/register page: always redirect to home regardless of role
    }

    return {
      redirect: {
        destination,
        statusCode: 302,
      },
    };
  }

  return {
    props: {},
  };
}

