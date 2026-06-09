import { AppShell } from "@/widgets/layouts";

// ---------------------------------------------------------------------------
// Static data — no backend services exist yet for Community
// ---------------------------------------------------------------------------

interface Club {
  name: string;
  tagline: string;
  members: string;
  level: string;
  iconBg: string;
  iconColor: string;
}

const CLUBS: Club[] = [
  {
    name: "Daily Speaking Club",
    tagline: "Open practice every evening",
    members: "2.4k members",
    level: "All levels",
    iconBg: "bg-[rgba(179,230,83,0.16)]",
    iconColor: "text-[#6db33f]",
  },
  {
    name: "Band 7+ Circle",
    tagline: "Advanced fluency & ideas",
    members: "860 members",
    level: "Advanced",
    iconBg: "bg-[rgba(82,129,249,0.16)]",
    iconColor: "text-[#5281f9]",
  },
  {
    name: "Pronunciation Lab",
    tagline: "Sounds, stress & intonation",
    members: "1.1k members",
    level: "Intermediate",
    iconBg: "bg-[rgba(124,110,249,0.16)]",
    iconColor: "text-[#7c6ef9]",
  },
];

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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const ClubCard = ({ club }: { club: Club }) => (
  <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] p-[24px] flex flex-col gap-[14px] flex-1 min-w-0">
    {/* Icon chip */}
    <div
      className={`${club.iconBg} rounded-[14px] size-[48px] flex items-center justify-center shrink-0`}
    >
      <span className={`material-symbols-rounded text-[24px] ${club.iconColor}`}>
        mic
      </span>
    </div>

    {/* Name + tagline */}
    <div className="flex flex-col gap-[4px]">
      <p className="font-display font-bold text-[18px] text-[#191d24] leading-normal">
        {club.name}
      </p>
      <p className="font-inter font-normal text-[13px] text-[#6a7282] leading-normal">
        {club.tagline}
      </p>
    </div>

    {/* Meta row */}
    <div className="flex items-center gap-[10px]">
      <span className="font-inter font-semibold text-[13px] text-[#6a7282]">
        {club.members}
      </span>
      <span className="bg-[#f6f7f4] font-inter font-bold text-[12px] text-[#191d24] px-[12px] py-[6px] rounded-full">
        {club.level}
      </span>
    </div>

    {/* Join button */}
    <button className="bg-[#191d24] text-white font-inter font-bold text-[13px] rounded-full py-[10px] w-full hover:bg-[#2d3142] transition-colors">
      Join club
    </button>
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

export const PageCommunity = () => {
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

      {/* Live Session banner */}
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

      {/* Clubs grid */}
      <div className="flex gap-[20px] items-stretch">
        {CLUBS.map((club) => (
          <ClubCard key={club.name} club={club} />
        ))}
      </div>

      {/* Recent discussions */}
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
