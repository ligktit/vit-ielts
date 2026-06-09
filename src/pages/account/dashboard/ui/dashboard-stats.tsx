// === SECTION: Dashboard Stats Cards ===
// Figma node 3346:166 "Stat Cards" — 4 cards: Current band, Tests taken, Study streak, Hours practised
// Card anatomy: white bg, 1px border rgba(25,29,36,0.1), rounded-[24px], shadow-[0px_6px_18px_0px_rgba(0,0,0,0.05)]
// Left: tinted icon-slot (44px, rounded-[12px]) + label below; Right: value (Be Vietnam Pro Bold 24px #191d24) + trend (Inter SemiBold 12px #9ad534)
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/appx/providers";
import { createClient } from "~supabase/client";

type StatCardConfig = {
  iconSrc: string;
  iconTint: string; // rgba background for icon slot
  label: string;
  value: string;
  trend?: string;
};

type Props = {
  /** Current IELTS band score — passed in by parent from TargetScore context */
  currentBand?: string | null;
  /** Study streak days — passed in by parent from StudyStreak hook */
  studyStreakDays?: number | null;
};

export const DashboardStats = ({ currentBand, studyStreakDays }: Props = {}) => {
  const { currentUser } = useAuth();
  const [totalTests, setTotalTests] = useState<number | null>(null);
  const [weekTests, setWeekTests] = useState<number>(0);
  const [totalHours, setTotalHours] = useState<string>("—");

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser?.id) return;
      try {
        const supabase = createClient();
        const { data: results } = await supabase
          .from("test_results")
          .select("quiz_id, time_left, score, created_at")
          .eq("user_id", currentUser.id)
          .eq("status", "published");

        if (!results || results.length === 0) {
          setTotalTests(0);
          setTotalHours("0h");
          return;
        }

        const quizIds = [...new Set(results.map((r: { quiz_id: string }) => r.quiz_id))].filter(Boolean);
        let quizMap = new Map<string, number>();

        if (quizIds.length > 0) {
          const { data: quizzes } = await supabase
            .from("quizzes")
            .select("id, time_minutes")
            .in("id", quizIds);
          quizMap = new Map((quizzes || []).map((q: { id: string; time_minutes: number | null }) => [q.id, q.time_minutes || 60]));
        }

        let totalTimeMin = 0;
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        let weekCount = 0;

        results.forEach((r: { quiz_id: string; time_left: string | null; score: number | null; created_at: string | null }) => {
          const timeLimit = quizMap.get(r.quiz_id) || 60;
          let leftMin = 0;
          if (r.time_left && typeof r.time_left === "string") {
            const [m, s] = r.time_left.split(":");
            leftMin = Number(m) + (Number(s) || 0) / 60;
          }
          const spent = timeLimit - leftMin;
          if (spent > 0) totalTimeMin += spent;

          if (r.created_at && new Date(r.created_at).getTime() >= oneWeekAgo) {
            weekCount++;
          }
        });

        const hours = Math.floor(totalTimeMin / 60);

        setTotalTests(results.length);
        setWeekTests(weekCount);
        setTotalHours(`${hours}h`);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    };

    fetchStats();
  }, [currentUser?.id]);

  const bandDisplay = currentBand ?? "—";
  const testsDisplay = totalTests !== null ? String(totalTests) : "—";
  const streakDisplay = studyStreakDays !== null && studyStreakDays !== undefined
    ? `${studyStreakDays} days`
    : "—";

  const stats: StatCardConfig[] = [
    {
      iconSrc: "/assets/figma/icons/Goal.svg",
      iconTint: "rgba(179,230,83,0.16)",
      label: "Current band",
      value: bandDisplay,
      trend: undefined,
    },
    {
      iconSrc: "/assets/figma/icons/Note.svg",
      iconTint: "rgba(82,129,249,0.16)",
      label: "Tests taken",
      value: testsDisplay,
      trend: weekTests > 0 ? `${weekTests} this week` : undefined,
    },
    {
      iconSrc: "/assets/figma/icons/count.svg",
      iconTint: "rgba(252,148,89,0.16)",
      label: "Study streak",
      value: streakDisplay,
      trend: undefined,
    },
    {
      iconSrc: "/assets/figma/icons/Aim.svg",
      iconTint: "rgba(140,115,242,0.16)",
      label: "Hours practised",
      value: totalHours,
      trend: undefined,
    },
  ];

  return (
    <div
      data-section="dashboard-stats"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[19px]"
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] shadow-[0px_6px_18px_0px_rgba(0,0,0,0.05)] p-[22px] flex items-end justify-between min-w-0 overflow-hidden"
        >
          {/* Left: icon + label */}
          <div className="flex flex-col gap-[10px] items-start shrink-0">
            {/* Icon slot */}
            <div
              className="flex items-center justify-center rounded-[12px] size-[44px] shrink-0 overflow-hidden"
              style={{ backgroundColor: stat.iconTint }}
            >
              <Image
                src={stat.iconSrc}
                alt={stat.label}
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            {/* Label */}
            <p className="font-inter font-medium text-[13px] text-[#6a7282] leading-normal">
              {stat.label}
            </p>
          </div>

          {/* Right: value + trend */}
          <div className="flex flex-col gap-[4px] items-end shrink-0 text-right">
            <p className="font-display font-bold text-[24px] tracking-[-0.48px] text-[#191d24] leading-normal">
              {stat.value}
            </p>
            {stat.trend && (
              <p className="font-inter font-semibold text-[12px] text-[#9ad534] leading-normal">
                {stat.trend}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
