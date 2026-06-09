// === PAGE: Study Plan ===
// Figma node 3495:178 "16 · Study Plan"
// Layout: plan summary banner, 7-day week grid, today's task list
import { AppShell } from "@/widgets/layouts";

// --- Types ---

interface DayEntry {
  abbr: string;
  date: number;
  tasks: string[];
  isToday?: boolean;
}

interface TaskEntry {
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;   // bg colour (rgba string)
  tagText: string;    // text colour
  done: boolean;
}

// --- Static data (no backend yet) ---

const WEEK_DAYS: DayEntry[] = [
  { abbr: "MON", date: 9,  tasks: ["Reading"] },
  { abbr: "TUE", date: 10, tasks: ["Listening"] },
  { abbr: "WED", date: 11, tasks: ["Writing", "Vocab"], isToday: true },
  { abbr: "THU", date: 12, tasks: ["Speaking"] },
  { abbr: "FRI", date: 13, tasks: ["Mock test"] },
  { abbr: "SAT", date: 14, tasks: ["Review"] },
  { abbr: "SUN", date: 15, tasks: [] },
];

const TODAY_TASKS: TaskEntry[] = [
  {
    title: "Writing Task 2 — opinion essay",
    subtitle: "Writing · 25 min",
    tag: "Writing",
    tagColor: "rgba(252,148,89,0.16)",
    tagText: "#b1683e",
    done: true,
  },
  {
    title: "Vocabulary set — academic verbs",
    subtitle: "Vocabulary · 15 min",
    tag: "Vocabulary",
    tagColor: "rgba(124,110,249,0.16)",
    tagText: "#574dae",
    done: true,
  },
  {
    title: "Reading practice — Passage 3",
    subtitle: "Reading · 20 min",
    tag: "Reading",
    tagColor: "rgba(179,230,83,0.16)",
    tagText: "#7da13a",
    done: false,
  },
];

// --- Sub-components ---

function DayCard({ day }: { day: DayEntry }) {
  if (day.isToday) {
    return (
      <div className="bg-[#b3e653] flex-1 min-w-0 flex flex-col gap-[10px] items-start px-[14px] py-[16px] rounded-[18px] self-stretch overflow-hidden">
        <p className="font-inter font-bold text-[#191d24] text-[11px] leading-normal whitespace-nowrap">
          {day.abbr}
        </p>
        <p className="font-display font-bold text-[#191d24] text-[20px] leading-normal whitespace-nowrap">
          {day.date}
        </p>
        {day.tasks.map((task) => (
          <div
            key={task}
            className="bg-white flex items-center overflow-hidden px-[8px] py-[5px] rounded-[8px] w-full"
          >
            <p className="font-inter font-semibold text-[#191d24] text-[11px] leading-normal whitespace-nowrap">
              {task}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[rgba(25,29,36,0.1)] flex-1 min-w-0 flex flex-col gap-[10px] items-start px-[14px] py-[16px] rounded-[18px] self-stretch overflow-hidden">
      <p className="font-inter font-bold text-[#6a7282] text-[11px] leading-normal whitespace-nowrap">
        {day.abbr}
      </p>
      <p className="font-display font-bold text-[#191d24] text-[20px] leading-normal whitespace-nowrap">
        {day.date}
      </p>
      {day.tasks.map((task) => (
        <div
          key={task}
          className="bg-[#f6f7f4] flex items-center overflow-hidden px-[8px] py-[5px] rounded-[8px] w-full"
        >
          <p className="font-inter font-semibold text-[#191d24] text-[11px] leading-normal whitespace-nowrap">
            {task}
          </p>
        </div>
      ))}
    </div>
  );
}

function TaskRow({ task, isLast }: { task: TaskEntry; isLast: boolean }) {
  return (
    <div
      className={`flex gap-[14px] items-center py-[14px] w-full overflow-hidden ${
        !isLast ? "border-b border-[rgba(25,29,36,0.1)]" : ""
      }`}
    >
      {/* Checkbox */}
      {task.done ? (
        <div className="bg-[#b3e653] flex items-center justify-center rounded-[7px] shrink-0 size-[24px]">
          <span className="font-inter font-bold text-[#191d24] text-[13px] leading-none">✓</span>
        </div>
      ) : (
        <div className="bg-white border-[1.5px] border-[rgba(25,29,36,0.1)] rounded-[7px] shrink-0 size-[24px]" />
      )}

      {/* Text */}
      <div className="flex flex-1 min-w-0 flex-col gap-[2px] items-start overflow-hidden">
        <p
          className={`font-inter font-semibold text-[15px] leading-normal whitespace-nowrap ${
            task.done ? "line-through text-[#6a7282]" : "text-[#191d24]"
          }`}
        >
          {task.title}
        </p>
        <p className="font-inter font-normal text-[#6a7282] text-[13px] leading-normal whitespace-nowrap">
          {task.subtitle}
        </p>
      </div>

      {/* Tag */}
      <div
        className="flex items-center justify-center overflow-hidden px-[12px] py-[6px] rounded-full shrink-0"
        style={{ backgroundColor: task.tagColor }}
      >
        <p
          className="font-inter font-bold text-[12px] leading-normal whitespace-nowrap"
          style={{ color: task.tagText }}
        >
          {task.tag}
        </p>
      </div>
    </div>
  );
}

// --- Main page ---

export const PageStudyPlan = () => {
  const doneTasks = TODAY_TASKS.filter((t) => t.done).length;
  const totalTasks = TODAY_TASKS.length;

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
              TARGET · BAND 8.0 BY 15 AUG 2026
            </p>
            <p className="font-display font-bold text-white text-[22px] leading-normal whitespace-nowrap">
              4 of 5 tasks done this week
            </p>
            {/* Progress bar */}
            <div className="bg-[rgba(255,255,255,0.16)] flex h-[10px] items-center overflow-hidden rounded-[6px] w-[400px] max-w-full">
              <div className="bg-[#b3e653] h-full" style={{ flex: "4 0 0" }} />
              <div className="h-full" style={{ flex: "1 0 0" }} />
            </div>
          </div>
          <button className="bg-[#b3e653] flex items-center justify-center overflow-hidden px-[22px] py-[13px] rounded-full shrink-0 hover:bg-[#9ad534] transition-colors">
            <span className="font-inter font-bold text-[#191d24] text-[14px] leading-normal whitespace-nowrap">
              Adjust plan
            </span>
          </button>
        </div>

        {/* This Week section */}
        <div className="flex flex-col gap-[16px] items-start w-full">
          <h2 className="font-display font-bold text-[#191d24] text-[18px] leading-normal whitespace-nowrap">
            This week
          </h2>
          <div className="flex gap-[14px] items-start w-full">
            {WEEK_DAYS.map((day) => (
              <DayCard key={day.abbr} day={day} />
            ))}
          </div>
        </div>

        {/* Today's Tasks card */}
        <div className="bg-white border border-[rgba(25,29,36,0.1)] flex flex-col items-start overflow-hidden p-[26px] rounded-[24px] w-full">
          {/* Header */}
          <div className="flex items-center justify-between pb-[8px] w-full">
            <h2 className="font-display font-bold text-[#191d24] text-[18px] leading-normal whitespace-nowrap">
              Today · Wednesday
            </h2>
            <span className="font-inter font-semibold text-[#9ad534] text-[14px] leading-normal whitespace-nowrap">
              {doneTasks} of {totalTasks} done
            </span>
          </div>

          {/* Task list */}
          {TODAY_TASKS.map((task, i) => (
            <TaskRow key={task.title} task={task} isLast={i === TODAY_TASKS.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
};

PageStudyPlan.Layout = AppShell;
