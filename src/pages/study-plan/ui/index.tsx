// === PAGE: Study Plan ===
// Figma node 3495:178 "16 · Study Plan"
// Layout: plan summary banner, 7-day week grid, today's task list
import { useState, useCallback } from "react";
import { AppShell } from "@/widgets/layouts";
import { createClient } from "~supabase/client";
import {
  toggleStudyTask,
  generateWeekPlan,
} from "../../../../services/study-plan";
import type { StudyTask, StudyWeek } from "../../../../services/study-plan";

// ── skill tag colours ────────────────────────────────────────────────────────

const SKILL_COLORS: Record<string, { bg: string; text: string }> = {
  Writing:    { bg: "rgba(252,148,89,0.16)",  text: "#b1683e" },
  Listening:  { bg: "rgba(89,196,252,0.16)",  text: "#2a7fa6" },
  Reading:    { bg: "rgba(179,230,83,0.16)",  text: "#7da13a" },
  Speaking:   { bg: "rgba(249,110,180,0.16)", text: "#ae4d87" },
  Vocabulary: { bg: "rgba(124,110,249,0.16)", text: "#574dae" },
  Grammar:    { bg: "rgba(252,220,89,0.16)",  text: "#a67c27" },
};

const DEFAULT_TAG_COLOR = { bg: "rgba(106,114,130,0.16)", text: "#6a7282" };

function skillTag(skill: string | null): { bg: string; text: string } {
  if (!skill) return DEFAULT_TAG_COLOR;
  return SKILL_COLORS[skill] ?? DEFAULT_TAG_COLOR;
}

// ── week-grid helpers ────────────────────────────────────────────────────────

const DAY_ABBRS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

interface WeekDay {
  abbr: string;
  isoDate: string; // YYYY-MM-DD
  dateNum: number;
  isToday: boolean;
}

function buildWeekDays(weekStartISO: string): WeekDay[] {
  const start = new Date(weekStartISO);
  const today = new Date().toISOString().slice(0, 10);
  return DAY_ABBRS.map((abbr, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    return { abbr, isoDate: iso, dateNum: d.getDate(), isToday: iso === today };
  });
}

// ── sub-components ───────────────────────────────────────────────────────────

function DayCard({
  day,
  tasks,
}: {
  day: WeekDay;
  tasks: StudyTask[];
}) {
  const isToday = day.isToday;
  const outer = isToday
    ? "bg-[#b3e653]"
    : "bg-white border border-[rgba(25,29,36,0.1)]";
  const abbr = isToday ? "text-[#191d24]" : "text-[#6a7282]";
  const pill = isToday ? "bg-white" : "bg-[#f6f7f4]";

  return (
    <div
      className={`${outer} flex-1 min-w-0 flex flex-col gap-[10px] items-start px-[14px] py-[16px] rounded-[18px] self-stretch overflow-hidden`}
    >
      <p className={`font-inter font-bold ${abbr} text-[11px] leading-normal whitespace-nowrap`}>
        {day.abbr}
      </p>
      <p className="font-display font-bold text-[#191d24] text-[20px] leading-normal whitespace-nowrap">
        {day.dateNum}
      </p>
      {tasks.map((t) => (
        <div
          key={t.id}
          className={`${pill} flex items-center overflow-hidden px-[8px] py-[5px] rounded-[8px] w-full`}
        >
          <p className="font-inter font-semibold text-[#191d24] text-[11px] leading-normal whitespace-nowrap truncate">
            {t.skill ?? t.title}
          </p>
        </div>
      ))}
    </div>
  );
}

function TaskRow({
  task,
  isLast,
  onToggle,
}: {
  task: StudyTask;
  isLast: boolean;
  onToggle: (id: string, done: boolean) => void;
}) {
  const { bg, text } = skillTag(task.skill);
  const tag = task.skill ?? "Task";

  return (
    <div
      className={`flex gap-[14px] items-center py-[14px] w-full overflow-hidden ${
        !isLast ? "border-b border-[rgba(25,29,36,0.1)]" : ""
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        aria-label={task.done ? "Mark as not done" : "Mark as done"}
        onClick={() => onToggle(task.id, !task.done)}
        className="shrink-0 focus:outline-none"
      >
        {task.done ? (
          <div className="bg-[#b3e653] flex items-center justify-center rounded-[7px] size-[24px]">
            <span className="font-inter font-bold text-[#191d24] text-[13px] leading-none">✓</span>
          </div>
        ) : (
          <div className="bg-white border-[1.5px] border-[rgba(25,29,36,0.1)] rounded-[7px] size-[24px]" />
        )}
      </button>

      {/* Text */}
      <div className="flex flex-1 min-w-0 flex-col gap-[2px] items-start overflow-hidden">
        <p
          className={`font-inter font-semibold text-[15px] leading-normal truncate ${
            task.done ? "line-through text-[#6a7282]" : "text-[#191d24]"
          }`}
        >
          {task.title}
        </p>
        {task.skill && (
          <p className="font-inter font-normal text-[#6a7282] text-[13px] leading-normal whitespace-nowrap">
            {task.skill}
          </p>
        )}
      </div>

      {/* Tag */}
      <div
        className="flex items-center justify-center overflow-hidden px-[12px] py-[6px] rounded-full shrink-0"
        style={{ backgroundColor: bg }}
      >
        <p
          className="font-inter font-bold text-[12px] leading-normal whitespace-nowrap"
          style={{ color: text }}
        >
          {tag}
        </p>
      </div>
    </div>
  );
}

// ── empty states ─────────────────────────────────────────────────────────────

function EmptyWeek({
  onGenerate,
  generating,
}: {
  onGenerate: () => void;
  generating: boolean;
}) {
  return (
    <div className="flex flex-col gap-[12px] items-center justify-center py-[32px] w-full">
      <p className="font-inter font-semibold text-[#6a7282] text-[15px] leading-normal">
        No tasks scheduled this week.
      </p>
      <button
        type="button"
        onClick={onGenerate}
        disabled={generating}
        className="bg-[#b3e653] flex items-center justify-center overflow-hidden px-[22px] py-[11px] rounded-full hover:bg-[#9ad534] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className="font-inter font-bold text-[#191d24] text-[14px] leading-normal whitespace-nowrap">
          {generating ? "Generating…" : "Generate this week's plan"}
        </span>
      </button>
    </div>
  );
}

function EmptyToday() {
  return (
    <p className="font-inter font-normal text-[#6a7282] text-[14px] leading-normal py-[20px]">
      No tasks for today. Enjoy the rest day!
    </p>
  );
}

// ── props ────────────────────────────────────────────────────────────────────

export interface PageStudyPlanProps {
  studyWeek: StudyWeek;
  weekStartISO: string;
  userId: string;
}

// ── main page ────────────────────────────────────────────────────────────────

export const PageStudyPlan = ({
  studyWeek: initialStudyWeek,
  weekStartISO,
  userId,
}: PageStudyPlanProps) => {
  // Client-side optimistic state — initialise from SSR props.
  const [studyWeek, setStudyWeek] = useState<StudyWeek>(initialStudyWeek ?? {});
  const [generating, setGenerating] = useState(false);

  const weekDays = buildWeekDays(weekStartISO ?? new Date().toISOString().slice(0, 10));
  const todayISO = new Date().toISOString().slice(0, 10);
  const todayTasks = studyWeek[todayISO] ?? [];

  // Weekly progress stats (across the whole week).
  const allWeekTasks = weekDays.flatMap((d) => studyWeek[d.isoDate] ?? []);
  const doneCount = allWeekTasks.filter((t) => t.done).length;
  const totalCount = allWeekTasks.length;
  const progressFraction = totalCount > 0 ? doneCount / totalCount : 0;

  const doneTodayCount = todayTasks.filter((t) => t.done).length;

  // Day-name for the "Today" header (e.g. "Wednesday").
  const todayDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // ── toggle handler ──────────────────────────────────────────────────────────
  const handleToggle = useCallback(
    async (taskId: string, newDone: boolean) => {
      // Optimistic update.
      setStudyWeek((prev) => {
        const next: StudyWeek = {};
        for (const [day, tasks] of Object.entries(prev)) {
          next[day] = tasks.map((t) =>
            t.id === taskId ? { ...t, done: newDone } : t,
          );
        }
        return next;
      });

      // Persist to Supabase (browser client — RLS enforces ownership).
      const supabase = createClient();
      const updated = await toggleStudyTask(supabase, taskId, newDone);

      // Rollback if the server call failed.
      if (!updated) {
        setStudyWeek((prev) => {
          const next: StudyWeek = {};
          for (const [day, tasks] of Object.entries(prev)) {
            next[day] = tasks.map((t) =>
              t.id === taskId ? { ...t, done: !newDone } : t,
            );
          }
          return next;
        });
      }
    },
    [],
  );

  // ── generate handler ────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const supabase = createClient();
      const generated = await generateWeekPlan(supabase, userId, weekStartISO);
      if (Object.keys(generated).length > 0) {
        setStudyWeek(generated);
      }
    } finally {
      setGenerating(false);
    }
  }, [generating, userId, weekStartISO]);

  const hasAnyTasks = allWeekTasks.length > 0;

  return (
    <div className="min-h-screen bg-[#f6f7f4]">
      <div className="max-w-[1280px] mx-auto px-[32px] pb-[48px] pt-[40px] flex flex-col gap-[28px]">
        {/* Page heading */}
        <div className="flex flex-col gap-[6px]">
          <h1 className="font-display font-bold text-[#191d24] text-[26px] leading-normal">
            Study Plan
          </h1>
          <p className="font-inter font-normal text-[#6a7282] text-[15px] leading-normal">
            Your personalised roadmap to Band 8.0.
          </p>
        </div>

        {/* Plan Summary banner */}
        <div className="bg-[#191d24] flex items-center justify-between overflow-hidden px-[32px] py-[28px] rounded-[24px] w-full">
          <div className="flex flex-1 min-w-0 flex-col gap-[10px] items-start overflow-hidden">
            <p className="font-inter font-bold text-[#b3e653] text-[12px] leading-normal tracking-[0.06em] whitespace-nowrap">
              TARGET · BAND 8.0
            </p>
            {hasAnyTasks ? (
              <p className="font-display font-bold text-white text-[22px] leading-normal whitespace-nowrap">
                {doneCount} of {totalCount} tasks done this week
              </p>
            ) : (
              <p className="font-display font-bold text-white text-[22px] leading-normal whitespace-nowrap">
                No tasks scheduled yet
              </p>
            )}
            {/* Progress bar */}
            <div className="bg-[rgba(255,255,255,0.16)] flex h-[10px] items-center overflow-hidden rounded-[6px] w-[400px] max-w-full">
              {hasAnyTasks && progressFraction > 0 && (
                <div
                  className="bg-[#b3e653] h-full rounded-[6px]"
                  style={{ width: `${progressFraction * 100}%` }}
                />
              )}
            </div>
          </div>
          {!hasAnyTasks && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="bg-[#b3e653] flex items-center justify-center overflow-hidden px-[22px] py-[13px] rounded-full shrink-0 hover:bg-[#9ad534] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="font-inter font-bold text-[#191d24] text-[14px] leading-normal whitespace-nowrap">
                {generating ? "Generating…" : "Generate plan"}
              </span>
            </button>
          )}
        </div>

        {/* This Week section */}
        <div className="flex flex-col gap-[16px] items-start w-full">
          <h2 className="font-display font-bold text-[#191d24] text-[18px] leading-normal whitespace-nowrap">
            This week
          </h2>
          {hasAnyTasks ? (
            <div className="flex gap-[14px] items-start w-full">
              {weekDays.map((day) => (
                <DayCard
                  key={day.isoDate}
                  day={day}
                  tasks={studyWeek[day.isoDate] ?? []}
                />
              ))}
            </div>
          ) : (
            <EmptyWeek onGenerate={handleGenerate} generating={generating} />
          )}
        </div>

        {/* Today's Tasks card */}
        <div className="bg-white border border-[rgba(25,29,36,0.1)] flex flex-col items-start overflow-hidden p-[26px] rounded-[24px] w-full">
          {/* Header */}
          <div className="flex items-center justify-between pb-[8px] w-full">
            <h2 className="font-display font-bold text-[#191d24] text-[18px] leading-normal whitespace-nowrap">
              Today · {todayDayName}
            </h2>
            {todayTasks.length > 0 && (
              <span className="font-inter font-semibold text-[#9ad534] text-[14px] leading-normal whitespace-nowrap">
                {doneTodayCount} of {todayTasks.length} done
              </span>
            )}
          </div>

          {/* Task list */}
          {todayTasks.length > 0 ? (
            todayTasks.map((task, i) => (
              <TaskRow
                key={task.id}
                task={task}
                isLast={i === todayTasks.length - 1}
                onToggle={handleToggle}
              />
            ))
          ) : (
            <EmptyToday />
          )}
        </div>
      </div>
    </div>
  );
};

PageStudyPlan.Layout = AppShell;
