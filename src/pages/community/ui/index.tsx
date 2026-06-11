import { useState, useCallback } from "react";
import { AppShell } from "@/widgets/layouts";
import { createClient } from "~supabase/client";
import { joinClub, leaveClub } from "~services/community";
import type { Club } from "~services/community";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PageCommunityProps {
  clubs: Club[];
  userId: string;
}

// ---------------------------------------------------------------------------
// Static visual data for sections that are not yet backed by the database
// ---------------------------------------------------------------------------

// VISUAL-ONLY: Recent discussions — no posts/comments backend yet
interface Discussion {
  initials: string;
  avatarBg: string;
  title: string;
  category: string;
  author: string;
  replies: number;
}

const DISCUSSIONS: Discussion[] = [
  {
    initials: "MA",
    avatarBg: "bg-[#5281f9]",
    title: "How do you paraphrase the question fast?",
    category: "Writing",
    author: "Minh A.",
    replies: 12,
  },
  {
    initials: "TL",
    avatarBg: "bg-[#7c6ef9]",
    title: "Best resources for Part 3 ideas?",
    category: "Speaking",
    author: "Thu L.",
    replies: 8,
  },
  {
    initials: "KP",
    avatarBg: "bg-[#b3e653]",
    title: "Got 8.0 — here's my 30-day routine",
    category: "Success stories",
    author: "Khoa P.",
    replies: 41,
  },
  {
    initials: "HN",
    avatarBg: "bg-[#f96b8b]",
    title: "Listening Section 4 always trips me up",
    category: "Listening",
    author: "Ha N.",
    replies: 19,
  },
];

// Stable color palette for club icon chips (cycled by index)
const CHIP_STYLES: Array<{ iconBg: string; iconColor: string }> = [
  { iconBg: "bg-[rgba(179,230,83,0.16)]", iconColor: "text-[#6db33f]" },
  { iconBg: "bg-[rgba(82,129,249,0.16)]", iconColor: "text-[#5281f9]" },
  { iconBg: "bg-[rgba(124,110,249,0.16)]", iconColor: "text-[#7c6ef9]" },
  { iconBg: "bg-[rgba(249,107,139,0.16)]", iconColor: "text-[#f96b8b]" },
];

function formatMemberCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k members`;
  return `${count} member${count === 1 ? "" : "s"}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface ClubCardProps {
  club: Club;
  chipStyle: { iconBg: string; iconColor: string };
  onJoin: (clubId: string) => void;
  onLeave: (clubId: string) => void;
  loading: boolean;
}

const ClubCard = ({ club, chipStyle, onJoin, onLeave, loading }: ClubCardProps) => (
  <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] p-[24px] flex flex-col gap-[14px] flex-1 min-w-0">
    {/* Icon chip */}
    <div
      className={`${chipStyle.iconBg} rounded-[14px] size-[48px] flex items-center justify-center shrink-0`}
    >
      <span className={`material-symbols-rounded text-[24px] ${chipStyle.iconColor}`}>
        mic
      </span>
    </div>

    {/* Name + tagline */}
    <div className="flex flex-col gap-[4px]">
      <p className="font-display font-bold text-[18px] text-[#191d24] leading-normal">
        {club.name}
      </p>
      <p className="font-inter font-normal text-[13px] text-[#6a7282] leading-normal">
        {club.tagline ?? ""}
      </p>
    </div>

    {/* Meta row */}
    <div className="flex items-center gap-[10px]">
      <span className="font-inter font-semibold text-[13px] text-[#6a7282]">
        {formatMemberCount(club.member_count)}
      </span>
      <span className="bg-[#f6f7f4] font-inter font-bold text-[12px] text-[#191d24] px-[12px] py-[6px] rounded-full">
        {club.level}
      </span>
    </div>

    {/* Join / Leave button */}
    {club.joined ? (
      <button
        onClick={() => onLeave(club.id)}
        disabled={loading}
        className="bg-[#f6f7f4] text-[#191d24] font-inter font-bold text-[13px] rounded-full py-[10px] w-full hover:bg-[#e8e9e4] transition-colors disabled:opacity-50"
      >
        Leave club
      </button>
    ) : (
      <button
        onClick={() => onJoin(club.id)}
        disabled={loading}
        className="bg-[#191d24] text-white font-inter font-bold text-[13px] rounded-full py-[10px] w-full hover:bg-[#2d3142] transition-colors disabled:opacity-50"
      >
        Join club
      </button>
    )}
  </div>
);

const DiscussionRow = ({
  discussion,
  isLast,
}: {
  discussion: Discussion;
  isLast: boolean;
}) => (
  <div
    className={`flex gap-[14px] items-center py-[14px] h-[72px] ${
      !isLast ? "border-b border-[rgba(25,29,36,0.1)]" : ""
    }`}
  >
    {/* Avatar */}
    <div
      className={`${discussion.avatarBg} rounded-full size-[40px] flex items-center justify-center shrink-0`}
    >
      <span className="font-inter font-bold text-[14px] text-white">
        {discussion.initials}
      </span>
    </div>

    {/* Text */}
    <div className="flex flex-col gap-[2px] flex-1 min-w-0">
      <p className="font-inter font-semibold text-[15px] text-[#191d24] leading-normal truncate">
        {discussion.title}
      </p>
      <p className="font-inter font-normal text-[13px] text-[#6a7282] leading-normal">
        {discussion.category} · {discussion.author}
      </p>
    </div>

    {/* Reply count */}
    <span className="font-inter font-semibold text-[13px] text-[#6a7282] shrink-0">
      {discussion.replies} replies
    </span>
  </div>
);

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export const PageCommunity = ({ clubs: initialClubs, userId }: PageCommunityProps) => {
  // Optimistic local state — mirrors the server-rendered list
  const [clubs, setClubs] = useState<Club[]>(initialClubs);
  // Tracks which club IDs have an in-flight mutation
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const setLoading = useCallback((clubId: string, on: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      on ? next.add(clubId) : next.delete(clubId);
      return next;
    });
  }, []);

  const handleJoin = useCallback(
    async (clubId: string) => {
      // Optimistic update
      setClubs((prev) =>
        prev.map((c) =>
          c.id === clubId ? { ...c, joined: true, member_count: c.member_count + 1 } : c
        )
      );
      setLoading(clubId, true);
      try {
        const supabase = createClient();
        await joinClub(supabase, { clubId, userId });
      } catch {
        // Revert on failure
        setClubs((prev) =>
          prev.map((c) =>
            c.id === clubId ? { ...c, joined: false, member_count: c.member_count - 1 } : c
          )
        );
      } finally {
        setLoading(clubId, false);
      }
    },
    [userId, setLoading]
  );

  const handleLeave = useCallback(
    async (clubId: string) => {
      // Optimistic update
      setClubs((prev) =>
        prev.map((c) =>
          c.id === clubId
            ? { ...c, joined: false, member_count: Math.max(0, c.member_count - 1) }
            : c
        )
      );
      setLoading(clubId, true);
      try {
        const supabase = createClient();
        await leaveClub(supabase, { clubId, userId });
      } catch {
        // Revert on failure
        setClubs((prev) =>
          prev.map((c) =>
            c.id === clubId ? { ...c, joined: true, member_count: c.member_count + 1 } : c
          )
        );
      } finally {
        setLoading(clubId, false);
      }
    },
    [userId, setLoading]
  );

  return (
    <div className="flex flex-col gap-[28px]">
      {/* Page heading */}
      <div className="flex flex-col gap-[6px]">
        <h1 className="font-display font-bold text-[26px] text-[#191d24] leading-normal">
          Community
        </h1>
        <p className="font-inter font-normal text-[15px] text-[#6a7282] leading-normal">
          Practice live, join study groups and stay motivated together.
        </p>
      </div>

      {/* VISUAL-ONLY: Live session banner — no live-session backend yet */}
      <div className="bg-[#191d24] rounded-[24px] px-[32px] py-[28px] flex items-center justify-between gap-[24px]">
        <div className="flex flex-col gap-[10px] flex-1 min-w-0">
          {/* LIVE pill */}
          <div className="bg-[#b3e653] rounded-full px-[12px] py-[6px] self-start">
            <span className="font-inter font-bold text-[12px] text-[#191d24]">
              ● LIVE · TODAY 7:00 PM
            </span>
          </div>

          <p className="font-display font-bold text-[22px] text-white leading-normal whitespace-nowrap">
            Speaking Club — Travel &amp; Holidays
          </p>
          <p className="font-inter font-normal text-[14px] text-[#b2bdcc] leading-normal">
            Practise Part 2 cue cards with a teacher and 11 other students.
          </p>
        </div>

        <button className="bg-[#b3e653] text-[#191d24] font-inter font-bold text-[14px] rounded-full px-[24px] py-[14px] shrink-0 hover:bg-[#9ad534] transition-colors">
          Join session
        </button>
      </div>

      {/* Speaking clubs section heading */}
      <h2 className="font-display font-bold text-[18px] text-[#191d24] leading-normal">
        Speaking clubs
      </h2>

      {/* Clubs grid — real data */}
      <div className="flex gap-[20px] items-stretch">
        {clubs.map((club, i) => (
          <ClubCard
            key={club.id}
            club={club}
            chipStyle={CHIP_STYLES[i % CHIP_STYLES.length]}
            onJoin={handleJoin}
            onLeave={handleLeave}
            loading={pendingIds.has(club.id)}
          />
        ))}
      </div>

      {/* VISUAL-ONLY: Recent discussions — posts/comments not in scope yet */}
      <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-[24px] pt-[24px] pb-[8px]">
          <h2 className="font-display font-bold text-[18px] text-[#191d24] leading-normal">
            Recent discussions
          </h2>
          <button className="font-inter font-semibold text-[14px] text-[#9ad534] hover:text-[#b3e653] transition-colors">
            New post
          </button>
        </div>

        {/* Discussion rows */}
        <div className="px-[24px] pb-[10px]">
          {DISCUSSIONS.map((discussion, i) => (
            <DiscussionRow
              key={discussion.initials + i}
              discussion={discussion}
              isLast={i === DISCUSSIONS.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

PageCommunity.Layout = AppShell;
