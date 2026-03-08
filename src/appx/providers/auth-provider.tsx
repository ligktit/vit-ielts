import { createClient } from "~supabase/client";
import { useAppContext } from "@/appx/providers";
import { useRouter } from "next/router";
import { ROUTES } from "@/shared/routes";

type SignUpParams = {
  name: string;
  email: string;
  password: string;
  date_of_birth: string; // ISO format or "DD/MM/YYYY"
  gender: "male" | "female";
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
    router.push("/");
    return data;
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
        data: { name, date_of_birth, gender },
      },
    });
    if (error) throw error;

    // Insert into users table
    if (data.user) {
      await supabase.from("users").insert({
        id: data.user.id,
        email,
        name,
        gender,
        date_of_birth,
      });
    }

    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push(ROUTES.LOGIN(router.asPath));
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
