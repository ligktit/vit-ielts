import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { GetServerSidePropsContext } from "next";

export function createServerSupabase(context: GetServerSidePropsContext) {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return Object.entries(context.req.cookies).map(([name, value]) => ({
                        name,
                        value: value || "",
                    }));
                },
                setAll(
                    cookiesToSet: {
                        name: string;
                        value: string;
                        options?: CookieOptions;
                    }[]
                ) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        context.res.setHeader(
                            "Set-Cookie",
                            `${name}=${value}; Path=/; ${options?.maxAge ? `Max-Age=${options.maxAge}` : ""}`
                        );
                    });
                },
            },
        }
    );
}
