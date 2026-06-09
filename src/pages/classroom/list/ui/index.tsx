import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { twMerge } from "tailwind-merge";
import { Dropdown, Modal, message } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { createClient } from "~supabase/client";
import { useAuth } from "@/appx/providers";
import { AppShell } from "@/widgets/layouts";
import { ClassroomQrScanner } from "../../qr-scanner";
import { createClassroom, joinClassroomByCode } from "~services/classroom";
import type {
  ClassroomSummary,
  TeacherDashboardStats,
  StudentDashboardStats,
} from "~services/types/classroom";
import { ROUTES } from "@/shared/routes";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  isTeacher: boolean;
  classrooms: ClassroomSummary[];
  stats: TeacherDashboardStats | null;
  studentStats: StudentDashboardStats | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TINTS = ["#D94A56", "#2563EB", "#7C3AED", "#0EA5E9", "#16A34A", "#EA580C"];
const tintFor = (k: string) =>
  TINTS[[...k].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];
const avatarInitials = (name: string) =>
  name.trim().toUpperCase().split(/\s+/).slice(0, 2).map((w) => w[0]).join("") || "LC";

// Pastel background from a hex tint: e.g. #D94A56 → "#D94A561A"
const pastelBg = (tint: string) => `${tint}26`;

const fieldBase =
  "w-full rounded-[11px] border px-4 py-3 text-[15px] text-[#191D24] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#b3e653]";
const labelCls = "mb-2 block text-[15px] font-bold text-[#191D24]";

// ─── Teacher-only stat card (kept from original) ─────────────────────────────

const StatCard = ({
  icon,
  label,
  value,
  tint,
}: {
  icon: string;
  label: string;
  value: number | string;
  tint: string;
}) => (
  <div className="flex items-center gap-[14px] rounded-[13px] border border-[#e7e9e4] bg-white px-5 py-[18px] shadow-[0_2px_4px_0_rgba(0,0,0,0.04)]">
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px]"
      style={{ background: `${tint}1A` }}
    >
      <span className="material-symbols-rounded text-[22px] leading-none" style={{ color: tint }}>
        {icon}
      </span>
    </span>
    <div className="flex flex-col gap-1">
      <span className="text-[13px] font-medium text-[#6a7282]">{label}</span>
      <span className="text-[28px] font-bold leading-none text-[#191d24]">{value}</span>
    </div>
  </div>
);

// ─── Modal header (kept from original) ───────────────────────────────────────

const ModalHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <div className="flex items-start justify-between">
    <h3 className="text-[22px] font-bold text-[#191D24]">{title}</h3>
    <button
      onClick={onClose}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6A7282] transition hover:bg-[#E5E7EB]"
      aria-label="Đóng"
    >
      <CloseOutlined />
    </button>
  </div>
);

// ─── Figma-style class card ───────────────────────────────────────────────────
// Matches Figma node 3733:936 "class" card — bg-white, rounded-[20px], p-[20px],
// avatar initials, class name, description/subtitle, assignment count, status badge, Open →

const ClassCard = ({ c }: { c: ClassroomSummary }) => {
  const tint = tintFor(c.id);
  const bg = pastelBg(tint);
  const inits = avatarInitials(c.name);
  const href = ROUTES.CLASSROOM.DETAIL(c.id);

  const isActive = c.status === "active";

  return (
    <div className="bg-white border border-[#e7e9e4] rounded-[20px] p-[20px] flex flex-col gap-[14px] shadow-[0_2px_4px_0_rgba(0,0,0,0.04)] w-full sm:w-[350px] shrink-0">
      {/* Header: avatar + name + subtitle */}
      <div className="flex gap-[12px] items-center h-[44px]">
        {c.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.image_url}
            alt=""
            className="h-[44px] w-[44px] rounded-[12px] object-cover shrink-0"
          />
        ) : (
          <div
            className="h-[44px] w-[44px] rounded-[12px] flex items-center justify-center shrink-0"
            style={{ background: bg }}
          >
            <span
              className="font-inter font-bold text-[15px] leading-none"
              style={{ color: tint }}
            >
              {inits}
            </span>
          </div>
        )}
        <div className="flex flex-col gap-[2px] min-w-0">
          <p className="font-inter font-bold text-[15px] text-[#191d24] leading-normal truncate">
            {c.name}
          </p>
          <p className="font-inter font-normal text-[12px] text-[#6a7282] leading-normal truncate">
            {c.description || `Mã: ${c.invite_code}`}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[rgba(25,29,36,0.06)] w-full" />

      {/* Stats row: student count + assignment count */}
      <div className="flex items-center gap-[16px]">
        <div className="flex items-center gap-[5px]">
          <span className="material-symbols-rounded text-[15px] text-[#6a7282]">person</span>
          <span className="font-inter font-medium text-[12px] text-[#6a7282]">
            {c.student_count} học sinh
          </span>
        </div>
        <div className="flex items-center gap-[5px]">
          <span className="material-symbols-rounded text-[15px] text-[#6a7282]">assignment</span>
          <span className="font-inter font-medium text-[12px] text-[#6a7282]">
            {c.assignment_count} bài giao
          </span>
        </div>
      </div>

      {/* Footer: status badge + Open → */}
      <div className="flex items-center justify-between">
        {isActive ? (
          <div className="flex gap-[6px] items-center justify-center px-[10px] py-[5px] rounded-[100px] bg-[#f2fadd]">
            <div className="w-[6px] h-[6px] rounded-full bg-[#219653] shrink-0" />
            <span className="font-inter font-bold text-[12px] text-[#219653] whitespace-nowrap">
              Đang hoạt động
            </span>
          </div>
        ) : (
          <div className="flex gap-[6px] items-center justify-center px-[10px] py-[5px] rounded-[100px] bg-[rgba(25,29,36,0.06)]">
            <div className="w-[6px] h-[6px] rounded-full bg-[#6a7282] shrink-0" />
            <span className="font-inter font-bold text-[12px] text-[#6a7282] whitespace-nowrap">
              Đã đóng
            </span>
          </div>
        )}
        <Link
          href={href}
          className="font-inter font-bold text-[13px] text-[#5b8a00] hover:text-[#9ad534] whitespace-nowrap transition-colors"
        >
          Open →
        </Link>
      </div>
    </div>
  );
};

// ─── Teacher-only row (kept for teacher management view) ─────────────────────

const ROW_GRID = "grid grid-cols-[1fr_120px_110px_180px_150px] items-center gap-2";

const ClassRow = ({ c, showRoleBadge }: { c: ClassroomSummary; showRoleBadge: boolean }) => {
  const tint = tintFor(c.id);
  const primaryHref = ROUTES.CLASSROOM.DETAIL(c.id);
  return (
    <div className={`${ROW_GRID} border-b border-[#F3F4F6] px-2 py-4 last:border-0`}>
      <div className="flex min-w-0 items-center gap-3">
        {c.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.image_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold"
            style={{ background: `${tint}1A`, color: tint }}
          >
            {c.name.trim().charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link href={primaryHref} className="truncate font-bold text-[#191D24] hover:text-[#b3e653]">
              {c.name}
            </Link>
            {showRoleBadge && c.viewer_role === "student" ? (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">
                Học sinh
              </span>
            ) : null}
          </div>
          <div className="truncate text-[13px] text-[#6A7282]">
            {c.description || `Mã ${c.invite_code}`}
          </div>
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#191D24]">
        <span className="material-symbols-rounded text-[18px] text-[#6A7282]">person</span>
        {c.student_count}
      </span>
      <span className="text-[15px] font-semibold text-[#191D24]">{c.assignment_count}</span>
      <span>
        {c.status === "active" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f2fadd] px-3 py-1 text-[13px] font-medium text-[#219653]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#219653]" />
            Đang hoạt động
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[13px] font-medium text-[#6A7282]">
            Đã đóng
          </span>
        )}
      </span>
      <div className="flex items-center justify-end gap-1">
        <Link
          href={primaryHref}
          className="rounded-[8px] bg-[#f6f7f4] px-4 py-2 text-[14px] font-semibold text-[#374151] hover:bg-[#e8ebe2]"
        >
          Quản lý
        </Link>
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              { key: "manage", label: <Link href={ROUTES.CLASSROOM.DETAIL(c.id)}>Quản lý lớp</Link> },
              {
                key: "assign",
                label: (
                  <Link href={`${ROUTES.CLASSROOM.DETAIL(c.id)}?tab=assignments`}>Giao bài</Link>
                ),
              },
              { key: "report", label: <Link href={ROUTES.CLASSROOM.TRACKING(c.id)}>Báo cáo</Link> },
            ],
          }}
        >
          <button className="flex h-9 w-9 items-center justify-center rounded-[8px] text-[#6A7282] hover:bg-gray-100">
            <span className="material-symbols-rounded text-[20px]">more_vert</span>
          </button>
        </Dropdown>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export const PageClassroomList = ({ isTeacher, classrooms, stats, studentStats }: Props) => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createErr, setCreateErr] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinErr, setJoinErr] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  const counts = useMemo(() => {
    const managed = classrooms.filter((c) => c.viewer_role === "teacher");
    const joined = classrooms.filter((c) => c.viewer_role === "student");
    return { managed: managed.length, joined: joined.length, total: classrooms.length };
  }, [classrooms]);

  useEffect(() => {
    if (router.query.join_error) {
      message.error("Mã mời không hợp lệ hoặc lớp đã đóng.");
      router.replace(ROUTES.CLASSROOM.LIST, undefined, { shallow: true });
    } else if (router.query.join_pending) {
      message.success("Đã gửi yêu cầu vào lớp. Vui lòng chờ giáo viên duyệt.");
      router.replace(ROUTES.CLASSROOM.LIST, undefined, { shallow: true });
    }
  }, [router.query.join_error, router.query.join_pending, router]);

  const closeCreate = () => {
    if (submitting) return;
    setCreateOpen(false);
    setCreateName("");
    setCreateDesc("");
    setCreateErr(false);
  };
  const closeJoin = () => {
    if (submitting) return;
    setJoinOpen(false);
    setJoinCode("");
    setJoinErr(false);
  };

  const handleCreate = async () => {
    if (!createName.trim()) {
      setCreateErr(true);
      return;
    }
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Bạn cần đăng nhập.");
      const classroom = await createClassroom(supabase, {
        name: createName.trim(),
        description: createDesc.trim() || null,
        ownerId: user.id,
      });
      message.success("Đã tạo lớp thành công!");
      router.push(ROUTES.CLASSROOM.DETAIL(classroom.id));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      message.error(
        msg.includes("CLASS_LIMIT_REACHED")
          ? "Bạn đã đạt giới hạn 10 lớp học."
          : "Không tạo được lớp."
      );
      setSubmitting(false);
    }
  };

  const joinWithCode = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      const code = trimmed.includes("/join/")
        ? trimmed.split("/join/")[1].split(/[?/]/)[0]
        : trimmed;
      const role: "teacher" | "student" = /[?&]role=teacher\b/i.test(trimmed)
        ? "teacher"
        : "student";
      if (!code) {
        setJoinErr(true);
        return;
      }
      setSubmitting(true);
      try {
        const result = await joinClassroomByCode(supabase, code, role);
        if (result.status === "pending") {
          message.success(
            `Đã gửi yêu cầu vào lớp ${result.name}. Vui lòng chờ giáo viên duyệt.`
          );
          setSubmitting(false);
          setJoinOpen(false);
          setJoinCode("");
          setScanOpen(false);
          return;
        }
        message.success(`Đã tham gia lớp ${result.name}!`);
        router.push(ROUTES.CLASSROOM.DETAIL(result.id));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        message.error(
          msg.includes("CLASS_NOT_FOUND")
            ? "Mã mời không hợp lệ hoặc lớp đã đóng."
            : "Không tham gia được lớp."
        );
        setSubmitting(false);
      }
    },
    [supabase, router]
  );

  const handleJoin = () => {
    if (!joinCode.trim()) {
      setJoinErr(true);
      return;
    }
    void joinWithCode(joinCode);
  };

  const closeScan = useCallback(() => setScanOpen(false), []);
  const handleScan = useCallback(
    (text: string) => {
      setScanOpen(false);
      setJoinOpen(false);
      void joinWithCode(text);
    },
    [joinWithCode]
  );

  // ── Split classrooms by role ─────────────────────────────────────────────
  const studentClasses = classrooms.filter((c) => c.viewer_role === "student");
  const teacherClasses = classrooms.filter((c) => c.viewer_role === "teacher");

  // Subtitle line: how many classes the user is enrolled/managing
  const subtitle = isTeacher
    ? `You're managing ${counts.managed} class${counts.managed !== 1 ? "es" : ""}.`
    : `You're enrolled in ${counts.joined} class${counts.joined !== 1 ? "es" : ""}.`;

  return (
    <div className="space-y-[28px]">

      {/* ── Top bar: heading + subtitle ── */}
      {/* Figma 3733:630 "Top Bar" */}
      <div data-section="classroom-top-bar">
        <h1 className="font-display font-bold text-[26px] tracking-[-0.52px] text-[#191d24] leading-none">
          My classes
        </h1>
        <p className="mt-[6px] font-inter font-normal text-[15px] text-[#6a7282]">
          {subtitle}
        </p>
      </div>

      {/* ── Teacher stats (unchanged, only shown for teachers) ── */}
      {isTeacher && stats ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon="menu_book" label="Số lớp quản lý" value={counts.managed} tint="#D94A56" />
          <StatCard icon="school" label="Số lớp tham gia" value={counts.joined} tint="#2563EB" />
          <StatCard icon="group" label="Tổng số học sinh" value={stats.total_students} tint="#16A34A" />
          <StatCard icon="podcasts" label="Tổng số lớp" value={counts.total} tint="#EA580C" />
        </div>
      ) : !isTeacher && studentStats ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon="school" label="Số lớp tham gia" value={studentStats.joined_class_count} tint="#2563EB" />
          <StatCard icon="assignment" label="Bài tập cần làm" value={studentStats.pending_count} tint="#D94A56" />
          <StatCard icon="task_alt" label="Đã hoàn thành" value={studentStats.submitted_count} tint="#16A34A" />
          <StatCard
            icon="grade"
            label="Điểm trung bình"
            value={studentStats.avg_band != null ? studentStats.avg_band : "—"}
            tint="#EA580C"
          />
        </div>
      ) : null}

      {/* ── Action buttons ── */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[#b3e653] px-[22px] py-[11px] text-[14px] font-bold font-inter text-[#191d24] hover:bg-[#9ad534] transition-colors"
        >
          <span className="material-symbols-rounded text-[18px]">add</span>
          Tạo lớp mới
        </button>
        <button
          onClick={() => setJoinOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[rgba(25,29,36,0.1)] bg-white px-[22px] py-[11px] text-[14px] font-bold font-inter text-[#191d24] hover:bg-[#f6f7f4] transition-colors"
        >
          <span className="material-symbols-rounded text-[18px]">link</span>
          Tham gia bằng mã / link mời
        </button>
      </div>

      {/* ── Student class cards — Figma node 3733:932 "Classes" ── */}
      {!isTeacher && (
        <section data-section="student-classes">
          <div className="flex items-center justify-between mb-[16px]">
            <p className="font-display font-bold text-[20px] text-[#191d24] leading-normal whitespace-nowrap">
              Your classes
            </p>
          </div>

          {studentClasses.length === 0 ? (
            <div className="bg-white border border-[#e7e9e4] rounded-[20px] p-[40px] flex flex-col items-center text-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f6f7f4]">
                <span className="material-symbols-rounded text-[32px] text-[#6a7282]">school</span>
              </span>
              <p className="font-display font-bold text-[18px] text-[#191d24]">
                Chưa có lớp học nào
              </p>
              <p className="font-inter font-normal text-[14px] text-[#6a7282] max-w-[360px]">
                Tham gia lớp bằng mã mời hoặc link từ giáo viên để bắt đầu.
              </p>
              <button
                onClick={() => setJoinOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[rgba(25,29,36,0.1)] bg-white px-[22px] py-[11px] text-[14px] font-bold font-inter text-[#191d24] hover:bg-[#f6f7f4] transition-colors"
              >
                <span className="material-symbols-rounded text-[18px]">link</span>
                Tham gia lớp
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-[20px] items-start">
              {studentClasses.map((c) => (
                <ClassCard key={c.id} c={c} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Teacher class table — kept from original ── */}
      {isTeacher && (
        <section data-section="teacher-classes">
          <div className="rounded-[20px] border border-[#e7e9e4] bg-white p-5 shadow-[0_2px_4px_0_rgba(0,0,0,0.04)]">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <h3 className="font-display font-bold text-[18px] text-[#191d24]">
                  Danh sách lớp học
                </h3>
                <span className="rounded-full bg-[#f6f7f4] px-2.5 py-0.5 text-[12px] font-medium text-[#6a7282]">
                  {classrooms.length} lớp
                </span>
              </div>
            </div>

            {classrooms.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f6f7f4]">
                  <span className="material-symbols-rounded text-[40px] leading-none text-[#6a7282]">
                    school
                  </span>
                </span>
                <p className="mt-5 font-display font-bold text-[18px] text-[#191d24]">
                  Chưa có lớp học nào
                </p>
                <p className="mt-1 text-[14px] text-[#6A7282]">
                  Tạo lớp mới để bắt đầu quản lý học sinh.
                </p>
                <button
                  onClick={() => setCreateOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#b3e653] px-[22px] py-[11px] text-[14px] font-bold font-inter text-[#191d24] hover:bg-[#9ad534] transition-colors"
                >
                  Tạo lớp ngay
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  <div
                    className={`${ROW_GRID} border-b border-[#e7e9e4] px-2 pb-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#9CA3AF]`}
                  >
                    <span>Tên lớp</span>
                    <span>Học sinh</span>
                    <span>Bài giao</span>
                    <span>Trạng thái</span>
                    <span />
                  </div>
                  {classrooms.map((c) => (
                    <ClassRow key={c.id} c={c} showRoleBadge={isTeacher} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Teacher also sees their student classes as cards ── */}
      {isTeacher && studentClasses.length > 0 && (
        <section data-section="teacher-student-classes">
          <p className="font-display font-bold text-[20px] text-[#191d24] leading-normal mb-[16px]">
            Lớp bạn đang học
          </p>
          <div className="flex flex-wrap gap-[20px] items-start">
            {studentClasses.map((c) => (
              <ClassCard key={c.id} c={c} />
            ))}
          </div>
        </section>
      )}

      {/* ── Create class modal ── */}
      <Modal
        open={createOpen}
        onCancel={closeCreate}
        footer={null}
        closable={false}
        width={520}
        centered
        styles={{ content: { borderRadius: 16, padding: 32 } }}
        destroyOnClose
      >
        <ModalHeader title="Tạo lớp học mới" onClose={closeCreate} />
        <div className="mt-6 space-y-5">
          <div>
            <label className={labelCls}>
              Tên lớp học <span className="text-[#D94A56]">*</span>
            </label>
            <input
              value={createName}
              maxLength={120}
              onChange={(e) => {
                setCreateName(e.target.value);
                if (createErr) setCreateErr(false);
              }}
              placeholder="VD: IELTS Academic 7.5+ – Lớp tối thứ 3, 5"
              className={twMerge(fieldBase, createErr ? "border-[#D94A56]" : "border-[#E5E7EB]")}
            />
            {createErr ? (
              <p className="mt-1 text-[13px] text-[#D94A56]">Vui lòng nhập tên lớp.</p>
            ) : null}
          </div>
          <div>
            <label className={labelCls}>Mô tả lớp</label>
            <textarea
              value={createDesc}
              maxLength={200}
              rows={4}
              onChange={(e) => setCreateDesc(e.target.value)}
              placeholder="Mô tả ngắn về mục tiêu, lịch học, đối tượng…"
              className={twMerge(fieldBase, "resize-none border-[#E5E7EB]")}
            />
            <p className="mt-2 text-[13px] text-[#6A7282]">Tối đa 200 ký tự</p>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={closeCreate}
            className="rounded-full border border-[#e7e9e4] bg-white px-6 py-2.5 text-[14px] font-bold text-[#374151] hover:bg-[#f6f7f4]"
          >
            Huỷ
          </button>
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="rounded-full bg-[#b3e653] px-7 py-2.5 text-[14px] font-bold text-[#191d24] hover:bg-[#9ad534] disabled:opacity-60 transition-colors"
          >
            {submitting ? "Đang tạo…" : "Tạo lớp"}
          </button>
        </div>
      </Modal>

      {/* ── Join class modal ── */}
      <Modal
        open={joinOpen}
        onCancel={closeJoin}
        footer={null}
        closable={false}
        width={520}
        centered
        styles={{ content: { borderRadius: 16, padding: 32 } }}
        destroyOnClose
      >
        <ModalHeader title="Tham gia lớp" onClose={closeJoin} />
        <p className="mt-3 text-[15px] text-[#6A7282]">
          Nhập mã mời hoặc dán link mời bạn nhận được từ giáo viên.
        </p>
        <div className="mt-5">
          <label className={labelCls}>Mã mời hoặc link</label>
          <input
            value={joinCode}
            onChange={(e) => {
              setJoinCode(e.target.value);
              if (joinErr) setJoinErr(false);
            }}
            placeholder="VD: ABC123 hoặc https://…"
            className={twMerge(fieldBase, joinErr ? "border-[#D94A56]" : "border-[#E5E7EB]")}
          />
          {joinErr ? (
            <p className="mt-1 text-[13px] text-[#D94A56]">Vui lòng nhập mã mời.</p>
          ) : null}
        </div>

        <div className="my-5 flex items-center gap-4">
          <span className="h-px flex-1 bg-[#e7e9e4]" />
          <span className="text-[14px] text-[#6A7282]">hoặc</span>
          <span className="h-px flex-1 bg-[#e7e9e4]" />
        </div>

        <button
          onClick={() => setScanOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#f6f7f4] py-3.5 text-[14px] font-bold font-inter text-[#191d24] hover:bg-[#e8ebe2] transition-colors"
        >
          <span className="material-symbols-rounded text-[20px]">qr_code_2</span>
          Quét QR code mời
        </button>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={closeJoin}
            className="rounded-full border border-[#e7e9e4] bg-white px-6 py-2.5 text-[14px] font-bold text-[#374151] hover:bg-[#f6f7f4]"
          >
            Huỷ
          </button>
          <button
            onClick={handleJoin}
            disabled={submitting}
            className="rounded-full bg-[#b3e653] px-7 py-2.5 text-[14px] font-bold text-[#191d24] hover:bg-[#9ad534] disabled:opacity-60 transition-colors"
          >
            {submitting ? "Đang tham gia…" : "Tham gia"}
          </button>
        </div>
      </Modal>

      <ClassroomQrScanner open={scanOpen} onClose={closeScan} onResult={handleScan} />
    </div>
  );
};

PageClassroomList.Layout = AppShell;
