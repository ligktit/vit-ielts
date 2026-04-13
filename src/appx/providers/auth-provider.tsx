import { createClient } from "~supabase/client";
import { useAppContext } from "@/appx/providers";
import { useRouter } from "next/router";
import { ROUTES } from "@/shared/routes";
import { isAdminRole } from "~lib/parseRoles";

type SignUpParams = {
  name: string;
  email: string;
  password: string;
  date_of_birth?: string; // ISO format or "DD/MM/YYYY"
  gender?: "male" | "female" | string;
};

export const useAuth = () => {
  const supabase = createClient();
  const router = useRouter();

  const { masterData } = useAppContext();

  // Safe access with default values for SSR/prerender
  const viewer = masterData?.viewer;
  const isSignedIn = Boolean(viewer);

  const signIn = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // Check role — admin accounts must NOT log in via user login page
    if (data.user) {
      const { data: profile } = await supabase
        .from("users")
        .select("roles")
        .eq("id", data.user.id)
        .single();

      if (isAdminRole(profile?.roles)) {
        // Sign out immediately and block access
        await supabase.auth.signOut();
        throw new Error("Tài khoản quản trị viên phải đăng nhập tại trang /admin/login.");
      }
    }

    // Regular user: redirect to ?redirect param or home
    const explicitRedirect = router.query.redirect as string | undefined;
    window.location.href = explicitRedirect || "/";

    return data;
  };

  const signInWithGoogle = async () => {
    // Pass redirect param through to the OAuth callback
    const redirectParam = (router.query.redirect as string) || "/";
    const callbackUrl = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectParam)}`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
      },
    });
    if (error) throw error;
    return data;
  };

  const signUp = async ({
    name,
    email,
    password,
    date_of_birth,
    gender,
  }: SignUpParams) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, date_of_birth: date_of_birth || null, gender: gender || null },
      },
    });
    if (error) throw error;

    // Insert into users table
    if (data.user) {
      await supabase.from("users").insert({
        id: data.user.id,
        email,
        name,
        gender: gender || null,
        date_of_birth: date_of_birth || null,
      });
    }

    return data;
  };

  const signOut = async () => {
    const isOnAdminPage = window.location.pathname.startsWith("/admin");
    await supabase.auth.signOut();
    window.location.href = isOnAdminPage ? "/admin/login" : "/account/login";
  };

  return {
    isSignedIn,
    currentUser: viewer,
    signIn,
    signInWithGoogle,
    signOut,
    signUp,
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
