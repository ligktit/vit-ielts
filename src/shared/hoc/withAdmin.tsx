import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { createAdminServerSupabase } from "~supabase/server";
import { isAdminRole } from "~lib/parseRoles";

/**
 * SSR guard — redirects non-admin users.
 * Checks Supabase auth session + roles column in users table.
 *
 * Usage:
 *   export const getServerSideProps = withAdmin;
 *
 * Or with extra logic:
 *   export const getServerSideProps: GetServerSideProps = async (ctx) => {
 *     const guard = await withAdmin(ctx);
 *     if ("redirect" in guard) return guard;
 *     // ... extra logic
 *     return { props: { ...guard.props, extraData } };
 *   };
 */
export const withAdmin: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const supabase = createAdminServerSupabase(context);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → redirect to login
  if (!user) {
    return {
      redirect: {
        destination: `/admin/login?redirect=${encodeURIComponent(context.resolvedUrl)}`,
        statusCode: 302,
      },
    };
  }

  // Check admin role via users table (use session-based client to avoid service role key dependency)
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("roles")
    .eq("id", user.id)
    .maybeSingle();

  console.log("[withAdmin] user.id:", user.id);
  console.log("[withAdmin] profile:", JSON.stringify(profile));
  console.log("[withAdmin] profileError:", profileError);
  console.log("[withAdmin] isAdminRole:", isAdminRole(profile?.roles));

  if (!isAdminRole(profile?.roles)) {
    return {
      redirect: {
        destination: "/",
        statusCode: 302,
      },
    };
  }

  return { props: {} };
};

/**
 * Enhanced SSR guard with data pre-fetching.
 * Runs withAdmin auth check, then calls `fetchData` callback to load page data
 * in the same SSR request — avoiding a redundant client-side API call + auth.
 *
 * Usage:
 *   export const getServerSideProps = withAdminData(async (ctx) => {
 *     const data = await fetchSomething(ctx.params.id);
 *     return { myProp: data };
 *   });
 */
export function withAdminData(
  fetchData: (context: GetServerSidePropsContext) => Promise<Record<string, unknown>>
): GetServerSideProps {
  return async (context: GetServerSidePropsContext) => {
    const guard = await withAdmin(context);
    if (!("props" in guard)) return guard; // redirect or notFound

    try {
      const extraProps = await fetchData(context);
      return { props: { ...guard.props, ...extraProps } };
    } catch (error) {
      console.error("[withAdminData] Error fetching data:", error);
      return { props: { ...guard.props } };
    }
  };
}
