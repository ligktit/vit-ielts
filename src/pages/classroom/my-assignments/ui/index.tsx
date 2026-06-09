import { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { AppShell } from "@/widgets/layouts";
import type { StudentAssignmentView } from "~services/types/classroom";
import { ROUTES } from "@/shared/routes";

// ─── Skill config: chip + skill tag (colour driven by quiz_skill) ─────────────
const SKILL_CONFIG: Record<string, { chipBg: string; icon: string; tagBg: string; tagText: string }> = {
  reading: { chipBg: "#eef3ff", icon: "menu_book", tagBg: "#eef3ff", tagText: "#5281f9" },
  listening: { chipBg: "#fff6df", icon: "headphones", tagBg: "#fff6df", tagText: "#b7791f" },
  writing: { chipBg: "#e6f9ec", icon: "edit_note", tagBg: "#e6f9ec", tagText: "#219653" },
  speaking: { chipBg: "#f3e8ff", icon: "record_voice_over", tagBg: "#f3e8ff", tagText: "#7c3aed" },
};

// ─── Badge config: colour driven by derived display-status ────────────────────
const STATUS_BADGE: Record<string, { bg: string; dot: string; text: string; label: string }> = {
  new: { bg: "#eef3ff", dot: "#5281f9", text: "#5281f9", label: "New" },
  in_progress: { bg: "#fef4e2", dot: "#fc945a", text: "#fc945a", label: "In progress" },
  submitted: { bg: "#e6f9ec", dot: "#219653", text: "#219653", label: "Submitted" },
  overdue: { bg: "#fdecee", dot: "#e54552", text: "#e54552", label: "Overdue" },
};

type DisplayStatus = "new" | "in_progress" | "submitted" | "overdue";

function resolveDisplayStatus(a: StudentAssignmentView): DisplayStatus {
  if (a.status === "overdue") return "overdue";
  if (a.status === "submitted" || a.status === "late") return "submitted";
  if (a.in_progress) return "in_progress";
  return "new";
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────
type FilterKey = "all" | "open" | "submitted" | "overdue";

const TABS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "submitted", label: "Submitted" },
  { key: "overdue", label: "Overdue" },
];

function applyFilter(assignments: StudentAssignmentView[], tab: FilterKey): StudentAssignmentView[] {
  if (tab === "all") return assignments;
  if (tab === "open") return assignments.filter((a) => a.status === "pending");
  if (tab === "submitted") return assignments.filter((a) => a.status === "submitted" || a.status === "late");
  return assignments.filter((a) => a.status === "overdue");
}

// ─── Assignment card ──────────────────────────────────────────────────────────
const AssignmentCard = ({ a }: { a: StudentAssignmentView }) => {
  const skill = a.quiz_skill?.toLowerCase() ?? "reading";
  const sc = SKILL_CONFIG[skill] ?? SKILL_CONFIG.reading;
  const ds = resolveDisplayStatus(a);
  const bc = STATUS_BADGE[ds];

  const dateText = (() => {
    if (ds === "submitted") {
      return a.submitted_at ? `Submitted ${dayjs(a.submitted_at).format("DD/MM/YYYY")}` : "Submitted";
    }
    if (!a.due_at) return "No deadline";
    const due = dayjs(a.due_at);
    const now = dayjs();
    if (ds === "overdue") {
      const n = now.diff(due, "day");
      return `Due ${due.format("DD/MM/YYYY")} · Overdue ${n} day${n !== 1 ? "s" : ""}`;
    }
    const n = due.diff(now, "day");
    return `Due ${due.format("DD/MM/YYYY")} · ${n} day${n !== 1 ? "s" : ""} left`;
  })();

  const href = ROUTES.CLASSROOM.MY_ASSIGNMENT(a.assignment_id);

  return (
    <div className="bg-white border border-[#e7e9e4] rounded-[16px] px-[20px] py-[18px] flex items-center gap-[16px] drop-shadow-[0px_2px_4px_rgba(0,0,0,0.04)]">
      {/* Skill chip */}
      <div
        className="size-[48px] rounded-[14px] flex items-center justify-center shrink-0"
        style={{ background: sc.chipBg }}
      >
        <span className="material-symbols-rounded text-[22px] leading-none" style={{ color: sc.tagText }}>
          {sc.icon}
        </span>
      </div>

      {/* Middle */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[8px] flex-wrap">
          <span className="font-bold text-[15px] leading-[1.3] text-[#191d24] truncate min-w-0">
            {a.quiz_title}
          </span>
          <span
            className="shrink-0 text-[12px] font-semibold px-[8px] py-[3px] rounded-[8px] capitalize"
            style={{ background: sc.tagBg, color: sc.tagText }}
          >
            {a.quiz_skill}
          </span>
        </div>
        <div className="flex items-center gap-[5px] mt-[5px]">
          <span className="material-symbols-rounded text-[14px] leading-none text-[#6a7282]">calendar_today</span>
          <span className="text-[13px] text-[#6a7282]">{dateText}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-[8px] shrink-0">
        {/* Status badge */}
        <div
          className="inline-flex items-center gap-[5px] px-[10px] py-[4px] rounded-[100px] text-[12px] font-semibold"
          style={{ background: bc.bg, color: bc.text }}
        >
          <span className="size-[6px] rounded-full shrink-0" style={{ background: bc.dot }} />
          {bc.label}
        </div>

        {/* Action */}
        {ds === "submitted" ? (
          <div className="flex flex-col items-end gap-[3px]">
            {a.score != null && (
              <span className="text-[13px] font-bold text-[#219653]">Band {a.score}</span>
            )}
            {a.test_result_id ? (
              <Link
                href={ROUTES.TEST_RESULT(a.test_result_id)}
                className="text-[13px] font-semibold text-[#191d24] border border-[#e7e9e4] rounded-[100px] px-[12px] py-[4px] hover:bg-[#f6f7f4] transition-colors whitespace-nowrap"
              >
                View result
              </Link>
            ) : null}
          </div>
        ) : ds === "overdue" ? (
          <Link
            href={href}
            className="text-[13px] font-semibold border border-[#e54552] text-[#e54552] rounded-[100px] px-[12px] py-[5px] hover:bg-[#fdecee] transition-colors whitespace-nowrap"
          >
            Submit late
          </Link>
        ) : (
          <Link
            href={href}
            className="text-[13px] font-bold text-[#191d24] bg-[#b3e653] hover:bg-[#9ad534] rounded-[100px] px-[12px] py-[5px] transition-colors whitespace-nowrap"
          >
            {ds === "in_progress" ? "Continue" : "Start"}
          </Link>
        )}
      </div>
    </div>
  );
};

// ─── Page ──────────────────────────────────────────────────────────────────────
type Props = { assignments: StudentAssignmentView[] };

export const PageMyAssignments = ({ assignments }: Props) => {
  const [activeTab, setActiveTab] = useState<FilterKey>("all");
  const visible = applyFilter(assignments, activeTab);

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Heading */}
      <div>
        <h1 className="font-display font-bold text-[28px] sm:text-[32px] leading-[1.1] tracking-[-0.5px] text-[#191d24]">
          My assignments
        </h1>
        <p className="text-[14px] text-[#6a7282] mt-[4px]">
          {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Section header + filter tabs */}
      <div className="flex items-center justify-between gap-[12px] flex-wrap">
        <span className="font-bold text-[16px] text-[#191d24]">Assignment list</span>
        <div className="flex items-center gap-[8px] flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={[
                "px-[14px] py-[6px] rounded-[100px] text-[13px] font-semibold transition-colors whitespace-nowrap",
                activeTab === tab.key
                  ? "bg-[#b3e653] text-[#191d24]"
                  : "bg-white border border-[#e7e9e4] text-[#6a7282] hover:bg-[#f6f7f4]",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-[14px]">
        {visible.length === 0 ? (
          <div className="bg-white border border-[#e7e9e4] rounded-[16px] px-[20px] py-[40px] text-center text-[14px] text-[#6a7282]">
            No assignments found.
          </div>
        ) : (
          visible.map((a) => <AssignmentCard key={a.assignment_id} a={a} />)
        )}
      </div>
    </div>
  );
};

PageMyAssignments.Layout = AppShell;
