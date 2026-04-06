import { useEffect, useState, useMemo } from "react";
import { createClient } from "~supabase/client";
import { useAuth } from "@/appx/providers";
import dayjs from "dayjs";
import { Spin } from "antd";
import { calculateScore } from "@/shared/lib";
import { IPracticeSingle } from "../api";

export function PracticeHistoryWidget({ post }: { post: IPracticeSingle }) {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("test_results")
          .select("id, score, created_at, started_at, submitted_at, answers, test_part")
          .eq("quiz_id", post.id)
          .eq("user_id", currentUser.id)
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(5);

        if (data) {
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to fetch practice history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser?.id, post.id]);

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Spin size="small" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-6 text-[#6A7282] text-sm">
        Bạn chưa làm bài test này. Hãy bắt đầu ngay!
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-[#E5E5E5]/40 rounded-[12px] p-4">
      {history.map((item) => {
        const dateToCheck = item.submitted_at || item.created_at;
        const dateDisplay = dayjs(dateToCheck).format("DD/MM/YYYY - HH:mm");
        
        let correct = 0;
        let total = 0;
        try {
          const parsedAnswers = Array.isArray(item.answers) ? item.answers : (item.answers?.answers || []);
          const scoreResult = calculateScore(parsedAnswers, post, item.test_part || []);
          correct = scoreResult?.correctAns ?? 0;
          total = (scoreResult?.correctAns ?? 0) + (scoreResult?.incorrect ?? 0) + (scoreResult?.missed ?? 0);
        } catch(e) {
           console.error("Score parse error", e);
        }
        
        const scoreOutOf10 = total > 0 ? (correct / total) * 10 : 0;
        const displayScore = Number.isInteger(scoreOutOf10) ? scoreOutOf10.toString() : scoreOutOf10.toFixed(1);
        const isPass = scoreOutOf10 >= 5;

        return (
          <div
            key={item.id}
            className="flex justify-between items-center bg-white rounded-lg p-4 shadow-sm border border-[rgba(0,0,0,0.02)]"
          >
            <span className="text-sm text-[#6A7282]">{dateDisplay}</span>
            <span className={`text-sm font-bold ${isPass ? "text-[#1B8C40]" : "text-primary-500"}`}>
              {displayScore}/10
            </span>
          </div>
        );
      })}
    </div>
  );
}
