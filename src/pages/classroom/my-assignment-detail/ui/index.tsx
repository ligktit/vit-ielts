import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal } from "antd";
import dayjs from "dayjs";
import { AppShell } from "@/widgets/layouts";
import type { StudentAssignmentDetail } from "~services/types/classroom";
import { ROUTES } from "@/shared/routes";

type Props = { assignment: StudentAssignmentDetail };

// ─── Design tokens ────────────────────────────────────────────────────────────

const SKILL_TAG: Record<string, { bg: string; text: string }> = {
  reading: { bg: "#eef3ff", text: "#5281f9" },
  listening: { bg: "#fff6df", text: "#b7791f" },
  writing: { bg: "#e6f9ec", text: "#219653" },
  speaking: { bg: "#f3e8ff", text: "#7c3aed" },
};

const STATUS_BADGE: Record<string, { bg: string; dot: string; text: string; label: string }> = {
  new: { bg: "#eef3ff", dot: "#5281f9", text: "#5281f9", label: "New" },
  in_progress: { bg: "#fef4e2", dot: "#fc945a", text: "#fc945a", label: "In progress" },
  submitted: { bg: "#e6f9ec", dot: "#219653", text: "#219653", label: "Submitted" },
  overdue: { bg: "#fdecee", dot: "#e54552", text: "#e54552", label: "Overdue" },
};

const INSTRUCTIONS = [
  "The test auto-advances through pages; you can navigate back below.",
  "Your answers are auto-saved — no worries if your connection drops.",
  "When you finish, click Submit to see your result.",
  "Reading & Listening are graded automatically right after you submit.",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ─── Info chip ────────────────────────────────────────────────────────────────

const InfoChip = ({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
}) => (
  <div className="bg-[#f5f6f3] flex flex-1 gap-[10px] items-center pl-[14px] pr-[16px] py-[12px] rounded-[12px] min-w-0">
    <div className="bg-white flex items-center justify-center rounded-[8px] size-[32px] shrink-0">
      <span
        className="material-symbols-rounded text-[16px] leading-none"
        style={{ color: iconColor }}
      >
        {icon}
      </span>
    </div>
    <div className="flex flex-col gap-[1px]">
      <span className="font-inter font-medium text-[11px] text-[#8b9099] leading-normal">
        {label}
      </span>
      <span className="font-inter font-bold text-[14px] text-[#191d24] leading-normal whitespace-nowrap">
        {value}
      </span>
    </div>
  </div>
);

// ─── Countdown ────────────────────────────────────────────────────────────────

const useCountdown = (target: string | null) => {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    if (!target) {
      setText("No deadline");
      return;
    }
    const tick = () => {
      const diff = dayjs(target).diff(dayjs());
      if (diff <= 0) {
        setText("Overdue");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (d > 0) setText(`${d} day${d !== 1 ? "s" : ""} ${h} hr ${m} min`);
      else {
        const s = Math.floor((diff % 60000) / 1000);
        setText(h > 0 ? `${h} hr ${m} min ${s} sec` : `${m} min ${s} sec`);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return text;
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export const PageMyAssignmentDetail = ({ assignment: a }: Props) => {
  const submitted = a.status === "submitted" || a.status === "late";
  const overdue = a.status === "overdue";
  const countdown = useCountdown(submitted ? null : a.due_at);
  const locked = a.requires_pro && !a.has_access;
  const [proOpen, setProOpen] = useState(false);

  const skill = a.quiz_skill?.toLowerCase() ?? "reading";
  const skillTag = SKILL_TAG[skill] ?? SKILL_TAG.reading;

  const displayStatus = overdue
    ? "overdue"
    : submitted
    ? "submitted"
    : a.in_progress
    ? "in_progress"
    : "new";
  const badge = STATUS_BADGE[displayStatus];

  // "Reading Test" / "Reading Practice" secondary tag
  const typeTag = a.quiz_type
    ? `${capitalize(skill)} ${a.quiz_type === "practice" ? "Practice" : "Test"}`
    : null;

  return (
    <div className="flex flex-col gap-[20px]">
      {/* ── Page heading + breadcrumb ── */}
      <div>
        <h1 className="font-display font-bold text-[26px] leading-[1.1] tracking-[-0.52px] text-[#191d24]">
          Do assignment
        </h1>
        <p className="text-[15px] text-[#6a7282] mt-[6px]">
          <Link
            href={ROUTES.CLASSROOM.MY_ASSIGNMENTS}
            className="hover:text-[#191d24] transition-colors"
          >
            My assignments
          </Link>
          {" › "}
          <span>{a.quiz_title}</span>
        </p>
      </div>

      {/* ── Back link ── */}
      <Link
        href={ROUTES.CLASSROOM.MY_ASSIGNMENTS}
        className="inline-flex items-center gap-[8px] text-[14px] font-medium text-[#6a7282] hover:text-[#191d24] transition-colors w-fit"
      >
        <span className="material-symbols-rounded text-[16px] leading-none">arrow_back</span>
        Back to assignment list
      </Link>

      {/* ── Main card ── */}
      <div className="bg-white border border-[#e7e9e4] rounded-[24px] px-[28px] py-[26px] flex flex-col gap-[20px] drop-shadow-[0px_2px_5px_rgba(0,0,0,0.04)]">

        {/* Top row: skill/type tags + status badge */}
        <div className="flex items-center justify-between gap-[12px]">
          <div className="flex gap-[8px] items-center flex-wrap">
            <span
              className="px-[9px] py-[4px] rounded-[8px] text-[11px] font-bold capitalize"
              style={{ background: skillTag.bg, color: skillTag.text }}
            >
              {a.quiz_skill}
            </span>
            {typeTag && (
              <span className="bg-[#f5f6f3] text-[#6a7282] px-[9px] py-[4px] rounded-[8px] text-[11px] font-bold">
                {typeTag}
              </span>
            )}
          </div>
          <div
            className="inline-flex items-center gap-[6px] px-[10px] py-[5px] rounded-[100px] text-[12px] font-bold shrink-0"
            style={{ background: badge.bg, color: badge.text }}
          >
            <span className="size-[6px] rounded-full shrink-0" style={{ background: badge.dot }} />
            {badge.label}
          </div>
        </div>

        {/* Title + class/teacher subtitle */}
        <div className="flex flex-col gap-[6px]">
          <h2 className="font-display font-bold text-[24px] text-[#191d24] leading-[1.2]">
            {a.quiz_title}
          </h2>
          <p className="text-[14px] text-[#6a7282]">
            Class: {a.classroom_name}
            {a.teacher_name ? ` · Teacher: ${a.teacher_name}` : ""}
          </p>
        </div>

        {/* Info chips */}
        <div className="flex gap-[12px] items-stretch flex-wrap sm:flex-nowrap">
          <InfoChip
            icon="calendar_month"
            iconColor="#D94A56"
            label="Due"
            value={a.due_at ? dayjs(a.due_at).format("DD/MM/YYYY HH:mm") : "No deadline"}
          />
          <InfoChip
            icon="schedule"
            iconColor="#5281f9"
            label="Time"
            value={a.quiz_time_minutes != null ? `${a.quiz_time_minutes} minutes` : "—"}
          />
          <InfoChip
            icon="format_list_bulleted"
            iconColor="#6a7282"
            label="Questions"
            value={
              a.question_count != null && a.question_count > 0 ? String(a.question_count) : "—"
            }
          />
        </div>

        {/* Teacher note */}
        {a.note ? (
          <div className="bg-[#fff7ee] flex gap-[10px] items-start px-[16px] py-[14px] rounded-[12px]">
            <span className="material-symbols-rounded text-[18px] leading-none text-[#f59e0b] mt-[1px] shrink-0">
              warning
            </span>
            <div className="flex flex-col gap-[3px] flex-1 min-w-0">
              <span className="text-[13px] font-bold text-[#9a6a1c]">Teacher note</span>
              <p className="text-[13px] text-[#6a7282] whitespace-pre-line">{a.note}</p>
            </div>
          </div>
        ) : null}

        {/* Instructions */}
        <div className="flex flex-col gap-[10px]">
          <span className="text-[15px] font-semibold text-[#191d24]">Instructions</span>
          <ul className="flex flex-col gap-[10px]">
            {INSTRUCTIONS.map((text, i) => (
              <li key={i} className="flex gap-[10px] items-start">
                <span className="mt-[5px] size-[7px] rounded-full bg-[#b3e653] shrink-0" />
                <span className="text-[14px] text-[#6a7282] leading-[1.45]">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="bg-[#e7e9e4] h-px" />

        {/* Bottom row */}
        {submitted ? (
          <div className="flex items-center justify-between gap-[12px] flex-wrap">
            <div className="flex flex-col gap-[2px]">
              <span className="text-[12px] font-medium text-[#8b9099]">Submitted on</span>
              <span className="text-[15px] font-bold text-[#219653]">
                {a.submitted_at ? dayjs(a.submitted_at).format("DD/MM/YYYY HH:mm") : "Submitted"}
                {a.score != null ? ` · Band ${a.score}` : ""}
              </span>
            </div>
            {a.test_result_id ? (
              <Link
                href={ROUTES.TEST_RESULT(a.test_result_id)}
                className="inline-flex items-center gap-[8px] bg-[#e6f9ec] text-[#219653] font-bold text-[15px] px-[26px] py-[14px] rounded-[100px] hover:bg-[#d0f4dc] transition-colors whitespace-nowrap"
              >
                <span className="material-symbols-rounded text-[20px] leading-none">visibility</span>
                View result
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-[12px] flex-wrap">
            {/* Time remaining */}
            <div className="flex flex-col gap-[2px]">
              <span className="text-[12px] font-medium text-[#8b9099]">Time remaining</span>
              <span
                className={`text-[15px] font-bold ${overdue ? "text-[#e54552]" : "text-[#191d24]"}`}
              >
                {countdown ?? "…"}
              </span>
            </div>

            {/* CTA button */}
            {locked ? (
              <button
                onClick={() => setProOpen(true)}
                className="inline-flex items-center gap-[8px] bg-[#f59e0b] text-white font-bold text-[15px] px-[26px] py-[14px] rounded-[100px] hover:bg-[#e08e08] transition-colors whitespace-nowrap shadow-[0_4px_12px_0_rgba(245,158,11,0.25)]"
              >
                <span className="material-symbols-rounded text-[20px] leading-none">lock</span>
                Upgrade to continue
              </button>
            ) : overdue ? (
              <a
                href={ROUTES.TAKE_THE_TEST(a.quiz_slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-[8px] border border-[#e54552] text-[#e54552] font-bold text-[15px] px-[26px] py-[14px] rounded-[100px] hover:bg-[#fdecee] transition-colors whitespace-nowrap"
              >
                <span className="material-symbols-rounded text-[20px] leading-none">play_circle</span>
                Submit late
              </a>
            ) : (
              <a
                href={ROUTES.TAKE_THE_TEST(a.quiz_slug)}
                target="_blank"
                rel="noopener noreferrer"
                translate="no"
                className="inline-flex items-center gap-[8px] bg-[#b3e653] hover:bg-[#9ad534] text-[#191d24] font-bold text-[15px] px-[26px] py-[14px] rounded-[100px] transition-colors whitespace-nowrap"
              >
                <span className="material-symbols-rounded text-[20px] leading-none">play_circle</span>
                {a.in_progress ? "Continue" : "Start now"}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Pro upgrade modal */}
      <Modal
        open={proOpen}
        onCancel={() => setProOpen(false)}
        footer={null}
        closable={false}
        width={440}
        centered
        styles={{ content: { borderRadius: 16, padding: 28 } }}
      >
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF4E2]">
            <span className="material-symbols-rounded !text-[34px] leading-none text-[#F59E0B]">
              workspace_premium
            </span>
          </span>
          <h3 className="mt-4 text-[20px] font-bold text-[#191D24]">Pro content</h3>
          <p className="mt-2 text-[14px] text-[#6A7282]">
            <span className="font-semibold text-[#191D24]">{a.quiz_title}</span> is a Pro
            assignment. Upgrade to submit and see results.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href={ROUTES.SUBSCRIPTION}
              className="inline-flex items-center justify-center gap-[6px] rounded-[10px] bg-[#D94A56] px-6 py-3 text-[15px] font-bold text-white hover:bg-[#c8404b] shadow-[0_4px_12px_0_rgba(217,74,87,0.25)]"
            >
              <span className="material-symbols-rounded text-[20px]">workspace_premium</span>
              Upgrade now
            </Link>
            <button
              onClick={() => setProOpen(false)}
              className="rounded-[10px] px-6 py-2.5 text-[14px] font-semibold text-[#6A7282] hover:bg-gray-50"
            >
              Later
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

PageMyAssignmentDetail.Layout = AppShell;
