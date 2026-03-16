import { createClient } from "~supabase/client";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { isAdminRole } from "~lib/parseRoles";

/**
 * Auth callback page for Google OAuth redirect.
 * Supabase handles the token exchange automatically;
 * we listen for the SIGNED_IN event, ensure a public.users profile exists,
 * then redirect the user.
 */
export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" && session?.user) {
                const user = session.user;

                // Ensure public.users profile exists (fallback for Google OAuth)
                const { data: existingProfile } = await supabase
                    .from("users")
                    .select("id")
                    .eq("id", user.id)
                    .single();

                if (!existingProfile) {
                    // Create profile from Google user metadata
                    const meta = user.user_metadata || {};
                    await supabase.from("users").insert({
                        id: user.id,
                        email: user.email || "",
                        name:
                            meta.full_name ||
                            meta.name ||
                            (user.email ? user.email.split("@")[0] : ""),
                        avatar_url: meta.avatar_url || meta.picture || null,
                    });
                }

                // Check admin role for smart redirect
                const { data: profile } = await supabase
                    .from("users")
                    .select("roles")
                    .eq("id", user.id)
                    .single();

                const isAdmin = isAdminRole(profile?.roles);

                // Determine redirect destination
                const params = new URLSearchParams(window.location.search);
                const explicitRedirect = params.get("redirect") || "/";

                if (isAdmin) {
                    window.location.href =
                        explicitRedirect.startsWith("/admin")
                            ? explicitRedirect
                            : "/admin";
                } else {
                    window.location.href = explicitRedirect;
                }
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                fontFamily: "inherit, sans-serif",
                fontSize: "16px",
                color: "#666",
            }}
        >
            Đang xử lý đăng nhập...
        </div>
    );
}
