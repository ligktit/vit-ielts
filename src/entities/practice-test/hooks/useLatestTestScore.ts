import { useEffect, useState } from "react";
import { createClient } from "~supabase/client";
import { useAuth } from "@/appx/providers";

export const useLatestTestScore = (quizId?: string) => {
  const { currentUser } = useAuth();
  const [score, setScore] = useState<number | string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !quizId) {
      setScore(undefined);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchScore = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("test_results")
          .select("score")
          .eq("quiz_id", quizId)
          .eq("user_id", currentUser.id)
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (isMounted) {
          if (!error && data !== null && data.score !== undefined && data.score !== null) {
            setScore(Number.isInteger(data.score) ? `${data.score}` : `${data.score}`.replace('.', ','));
          } else {
            setScore(undefined);
          }
        }
      } catch (err) {
        console.error("Failed to fetch score", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchScore();

    return () => {
      isMounted = false;
    };
  }, [currentUser, quizId]);

  return { score, loading };
};
