import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Edge Middleware
 *
 * Two responsibilities:
 *  1. Refresh the Supabase auth session on every page request. With
 *     @supabase/ssr the access token has a short TTL (default 1h) and the
 *     ONLY safe place to refresh it on the Pages Router is middleware.
 *     Without this, a student opens a test, works for an hour, then gets
 *     bounced to the login screen on the next navigation — which is exactly
 *     the bug we are fixing here.
 *  2. Track affiliate `?ref=XXX` cookies (last-click-wins, 30 days).
 */

const AFFILIATE_COOKIE_NAME = "affiliate_ref";
const COOKIE_MAX_AGE_DAYS = 30;

export async function middleware(request: NextRequest) {
  // Build the response we will eventually return. Both the affiliate logic
  // and the Supabase session refresh write Set-Cookie headers onto it.
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // ─── 1. Refresh Supabase session ───────────────────────────────────────
  // Calling getUser() forces @supabase/ssr to validate the access token
  // and, if expired, swap in a fresh pair using the refresh token. The new
  // cookies are written via setAll below.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Errors here (e.g. user signed out elsewhere) are non-fatal — we just
  // pass through and let downstream auth checks redirect if needed.
  await supabase.auth.getUser().catch(() => undefined);

  // ─── 2. Affiliate tracking ─────────────────────────────────────────────
  const ref = request.nextUrl.searchParams.get("ref");
  if (!ref) {
    return response;
  }

  // Validate ref format (alphanumeric, hyphens, underscores, max 100 chars)
  const isValid = /^[a-zA-Z0-9_-]{1,100}$/.test(ref);
  if (!isValid) {
    return response;
  }

  // Skip if same ref already set
  const existing = request.cookies.get(AFFILIATE_COOKIE_NAME);
  if (existing?.value === ref) {
    return response;
  }

  // Strip ?ref= and redirect to the clean URL, carrying the refreshed
  // Supabase Set-Cookie headers along with the new affiliate cookie.
  const cleanUrl = new URL(request.nextUrl);
  cleanUrl.searchParams.delete("ref");
  const redirect = NextResponse.redirect(cleanUrl, { status: 302 });
  response.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie.name, cookie.value, cookie);
  });
  redirect.cookies.set(AFFILIATE_COOKIE_NAME, ref, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60,
    path: "/",
  });
  return redirect;
}

export const config = {
  matcher: [
    /*
     * Run on every page request EXCEPT:
     * - api routes (they refresh their own session via createApiSupabase)
     * - _next internals
     * - static assets
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)",
  ],
};
