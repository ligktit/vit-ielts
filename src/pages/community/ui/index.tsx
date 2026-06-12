import { useState, useCallback, useRef } from "react";
import { AppShell } from "@/widgets/layouts";
import { createClient } from "~supabase/client";
import { joinClub, leaveClub, createPost } from "~services/community";
import type { Club, CommunityPost } from "~services/community";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PageCommunityProps {
  clubs: Club[];
  recentPosts: CommunityPost[];
  userId: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Stable color palette for club icon chips (cycled by index)
const CHIP_STYLES: Array<{ iconBg: string; iconColor: string }> = [
  { iconBg: "bg-[rgba(179,230,83,0.16)]", iconColor: "text-[#6db33f]" },
  { iconBg: "bg-[rgba(82,129,249,0.16)]", iconColor: "text-[#5281f9]" },
  { iconBg: "bg-[rgba(124,110,249,0.16)]", iconColor: "text-[#7c6ef9]" },
  { iconBg: "bg-[rgba(249,107,139,0.16)]", iconColor: "text-[#f96b8b]" },
];

// Cycled avatar background colours for post author chips
const AVATAR_COLORS = [
  "bg-[#5281f9]",
  "bg-[#7c6ef9]",
  "bg-[#b3e653]",
  "bg-[#f96b8b]",
  "bg-[#f9a84c]",
  "bg-[#4cc9f0]",
];

function avatarColor(seed: string): string {
  // Simple deterministic pick based on first char code of the post id
  const idx = seed.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function formatMemberCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k members`;
  return `${count} member${count === 1 ? "" : "s"}`;
}

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
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

interface PostRowProps {
  post: CommunityPost;
  isLast: boolean;
}

const PostRow = ({ post, isLast }: PostRowProps) => (
  <div
    className={`flex gap-[14px] items-center py-[14px] min-h-[72px] ${
      !isLast ? "border-b border-[rgba(25,29,36,0.1)]" : ""
    }`}
  >
    {/* Avatar */}
    <div
      className={`${avatarColor(post.id)} rounded-full size-[40px] flex items-center justify-center shrink-0`}
    >
      <span className="font-inter font-bold text-[14px] text-white">
        {post.author_initials}
      </span>
    </div>

    {/* Text */}
    <div className="flex flex-col gap-[2px] flex-1 min-w-0">
      <p className="font-inter font-semibold text-[15px] text-[#191d24] leading-normal truncate">
        {post.title}
      </p>
      <p className="font-inter font-normal text-[13px] text-[#6a7282] leading-normal">
        {post.club_name ? `${post.club_name} · ` : ""}{post.author_name}
      </p>
    </div>

    {/* Relative time */}
    <span className="font-inter font-semibold text-[13px] text-[#6a7282] shrink-0">
      {formatRelativeDate(post.created_at)}
    </span>
  </div>
);

// ---------------------------------------------------------------------------
// Compose box
// ---------------------------------------------------------------------------

interface ComposeBoxProps {
  onSubmit: (title: string, body: string) => Promise<void>;
  submitting: boolean;
}

const ComposeBox = ({ onSubmit, submitting }: ComposeBoxProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => titleRef.current?.focus(), 50);
  };

  const handleSubmit = async () => {
    const t = title.trim();
    const b = body.trim();
    if (!t || !b) return;
    await onSubmit(t, b);
    setTitle("");
    setBody("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="font-inter font-semibold text-[14px] text-[#9ad534] hover:text-[#b3e653] transition-colors"
      >
        New post
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-[10px] w-full" onKeyDown={handleKeyDown}>
      <input
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
        maxLength={200}
        className="w-full border border-[rgba(25,29,36,0.15)] rounded-[12px] px-[14px] py-[10px] font-inter font-semibold text-[14px] text-[#191d24] placeholder:text-[#9aa0ac] focus:outline-none focus:border-[#b3e653]"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
        maxLength={2000}
        className="w-full border border-[rgba(25,29,36,0.15)] rounded-[12px] px-[14px] py-[10px] font-inter font-normal text-[14px] text-[#191d24] placeholder:text-[#9aa0ac] resize-none focus:outline-none focus:border-[#b3e653]"
      />
      <div className="flex items-center gap-[10px] justify-end">
        <button
          onClick={() => setOpen(false)}
          disabled={submitting}
          className="font-inter font-semibold text-[13px] text-[#6a7282] hover:text-[#191d24] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !title.trim() || !body.trim()}
          className="bg-[#191d24] text-white font-inter font-bold text-[13px] rounded-full px-[20px] py-[8px] hover:bg-[#2d3142] transition-colors disabled:opacity-50"
        >
          {submitting ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

const EmptyDiscussions = () => (
  <div className="flex flex-col items-center gap-[8px] py-[32px]">
    <span className="material-symbols-rounded text-[40px] text-[#9aa0ac]">forum</span>
    <p className="font-inter font-normal text-[14px] text-[#6a7282]">
      No posts yet — be the first to start a discussion!
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export const PageCommunity = ({
  clubs: initialClubs,
  recentPosts: initialPosts,
  userId,
}: PageCommunityProps) => {
  // --- Clubs state (optimistic join/leave) ---
  const [clubs, setClubs] = useState<Club[]>(initialClubs);
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

  // --- Posts state (optimistic prepend) ---
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [submitting, setSubmitting] = useState(false);

  const handleCreatePost = useCallback(
    async (title: string, body: string) => {
      setSubmitting(true);
      try {
        const supabase = createClient();
        const newPost = await createPost(supabase, { userId, title, body });
        // Prepend optimistically — server already persisted it
        setPosts((prev) => [newPost, ...prev]);
      } catch {
        // Silent failure — compose box stays closed; post simply won't appear
        // until a page refresh. Consider a toast here in a future iteration.
      } finally {
        setSubmitting(false);
      }
    },
    [userId]
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

      {/* Recent discussions — real data from community_posts */}
      <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-[24px] pt-[24px] pb-[8px]">
          <h2 className="font-display font-bold text-[18px] text-[#191d24] leading-normal">
            Recent discussions
          </h2>
          <ComposeBox onSubmit={handleCreatePost} submitting={submitting} />
        </div>

        {/* Post rows */}
        <div className="px-[24px] pb-[10px]">
          {posts.length === 0 ? (
            <EmptyDiscussions />
          ) : (
            posts.map((post, i) => (
              <PostRow key={post.id} post={post} isLast={i === posts.length - 1} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

PageCommunity.Layout = AppShell;
