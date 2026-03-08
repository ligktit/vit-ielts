import { createClient } from "~supabase/client";
import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Auth callback page for Google OAuth redirect.
 * Supabase handles the token exchange automatically;
 * we just listen for the SIGNED_IN event and redirect.
 */
export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_IN") {
                router.push("/");
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
