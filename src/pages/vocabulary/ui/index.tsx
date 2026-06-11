import { useCallback, useState } from "react";
import { AppShell } from "@/widgets/layouts";
import { createClient } from "~supabase/client";
import { useAuth } from "@/appx/providers";
import { setWordStatus } from "~services/vocabulary";
import type { VocabularyOverview, VocabWordWithStatus, WordStatus } from "~services/vocabulary";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PageVocabularyProps {
  vocabularyOverview: VocabularyOverview;
}

// ─── Topic colour map ─────────────────────────────────────────────────────────

type TopicStyle = {
  chipBg: string;
  chipText: string;
  progressColor: string;
};

const TOPIC_STYLE: Record<string, TopicStyle> = {
  Environment: {
    chipBg: "rgba(252,148,89,0.16)",
    chipText: "#bd6f43",
    progressColor: "#fc945a",
  },
  Education: {
    chipBg: "rgba(124,110,249,0.16)",
    chipText: "#5d52bb",
    progressColor: "#7c6ef9",
  },
  Technology: {
    chipBg: "rgba(249,107,139,0.16)",
    chipText: "#bb5068",
    progressColor: "#f96b8b",
  },
  Health: {
    chipBg: "rgba(22,155,134,0.16)",
    chipText: "#107464",
    progressColor: "#169b86",
  },
  Society: {
    chipBg: "rgba(82,129,249,0.16)",
    chipText: "#3e61bb",
    progressColor: "#5281f9",
  },
};

const DEFAULT_TOPIC_STYLE: TopicStyle = {
  chipBg: "rgba(179,230,83,0.16)",
  chipText: "#86ad3e",
  progressColor: "#b3e653",
};

function getTopicStyle(topic: string | null): TopicStyle {
  return (topic && TOPIC_STYLE[topic]) || DEFAULT_TOPIC_STYLE;
}

// ─── Status badge colour ──────────────────────────────────────────────────────

const STATUS_STYLE: Record<
  WordStatus,
  { bg: string; text: string; label: string }
> = {
  new: { bg: "rgba(25,29,36,0.06)", text: "#6a7282", label: "New" },
  learning: { bg: "rgba(252,148,89,0.16)", text: "#bd6f43", label: "Learning" },
  learned: { bg: "rgba(179,230,83,0.16)", text: "#86ad3e", label: "Learned" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCardItem = ({
  value,
  label,
  accentColor,
}: {
  value: string | number;
  label: string;
  accentColor: string;
}) => (
  <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] flex-1 min-w-0 flex flex-col gap-[4px] p-[22px]">
    <p className="font-display font-bold text-[26px] leading-normal text-[#191d24] whitespace-nowrap">
      {value}
    </p>
    <p className="font-inter font-normal text-[13px] leading-normal text-[#6a7282] whitespace-nowrap">
      {label}
    </p>
    <div
      className="h-[4px] w-[36px] rounded-[3px] mt-[2px]"
      style={{ backgroundColor: accentColor }}
    />
  </div>
);

const WordCard = ({
  word,
  onToggle,
}: {
  word: VocabWordWithStatus;
  onToggle: (wordId: string, current: WordStatus) => void;
}) => {
  const ts = getTopicStyle(word.topic);
  const ss = STATUS_STYLE[word.userStatus];
  const isLearned = word.userStatus === "learned";

  return (
    <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] flex flex-col gap-[14px] p-[24px]">
      {/* Topic chip */}
      <div className="flex items-center gap-[8px]">
        <div
          className="flex items-center justify-center rounded-[12px] size-[44px] shrink-0"
          style={{ backgroundColor: ts.chipBg }}
        >
          <span
            className="font-inter font-bold text-[16px] leading-normal"
            style={{ color: ts.chipText }}
          >
            Aa
          </span>
        </div>
        {word.topic && (
          <span
            className="font-inter font-medium text-[11px] leading-normal px-[10px] py-[4px] rounded-full"
            style={{ backgroundColor: ts.chipBg, color: ts.chipText }}
          >
            {word.topic}
          </span>
        )}
      </div>

      {/* Word + meaning */}
      <div className="flex flex-col gap-[4px] w-full">
        <p className="font-display font-bold text-[18px] leading-normal text-[#191d24]">
          {word.word}
        </p>
        <p className="font-inter font-normal text-[13px] leading-normal text-[#6a7282]">
          {word.meaning}
        </p>
        {word.example && (
          <p className="font-inter font-normal italic text-[12px] leading-normal text-[#9ca3af] mt-[2px]">
            &ldquo;{word.example}&rdquo;
          </p>
        )}
      </div>

      {/* Status badge + toggle */}
      <div className="flex items-center justify-between gap-[8px] mt-auto">
        <span
          className="font-inter font-medium text-[11px] leading-normal px-[10px] py-[4px] rounded-full"
          style={{ backgroundColor: ss.bg, color: ss.text }}
        >
          {ss.label}
        </span>
        <button
          className="border-[1.5px] border-[rgba(25,29,36,0.1)] rounded-full bg-white px-[18px] py-[9px] font-inter font-bold text-[12px] leading-normal text-[#191d24] hover:bg-[#f6f7f4] transition-colors whitespace-nowrap"
          onClick={() => onToggle(word.id, word.userStatus)}
        >
          {isLearned ? "Unmark" : "Mark learned"}
        </button>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-[60px] gap-[12px]">
    <span className="material-symbols-rounded text-[48px] text-[#d1d5db]">
      menu_book
    </span>
    <p className="font-inter font-medium text-[15px] text-[#6a7282]">
      No vocabulary words yet. Check back soon!
    </p>
  </div>
);

// ─── Page component ───────────────────────────────────────────────────────────

export const PageVocabulary = ({ vocabularyOverview }: PageVocabularyProps) => {
  const { currentUser } = useAuth();
  const supabase = createClient();

  // Optimistic local state — initialised from SSR props
  const [words, setWords] = useState<VocabWordWithStatus[]>(
    vocabularyOverview?.words ?? []
  );

  const stats = {
    total: words.length,
    learned: words.filter((w) => w.userStatus === "learned").length,
    learning: words.filter((w) => w.userStatus === "learning").length,
  };

  const handleToggle = useCallback(
    async (wordId: string, current: WordStatus) => {
      if (!currentUser?.id) return;

      const nextStatus: WordStatus =
        current === "learned" ? "new" : "learned";

      // Optimistic update
      setWords((prev) =>
        prev.map((w) =>
          w.id === wordId ? { ...w, userStatus: nextStatus } : w
        )
      );

      try {
        await setWordStatus(supabase, {
          userId: currentUser.id,
          wordId,
          status: nextStatus === "new" ? null : nextStatus,
        });
      } catch (err) {
        console.error("[vocabulary] toggle failed, reverting:", err);
        // Revert on failure
        setWords((prev) =>
          prev.map((w) =>
            w.id === wordId ? { ...w, userStatus: current } : w
          )
        );
      }
    },
    [currentUser?.id, supabase]
  );

  // Split words into rows of 3 for grid display
  const rows: VocabWordWithStatus[][] = [];
  for (let i = 0; i < words.length; i += 3) {
    rows.push(words.slice(i, i + 3));
  }

  return (
    <div className="flex flex-col gap-[28px]">
      {/* Page heading */}
      <div className="flex flex-col gap-[6px]">
        <h1 className="font-display font-bold text-[26px] leading-normal text-[#191d24]">
          Vocabulary
        </h1>
        <p className="font-inter font-normal text-[15px] leading-normal text-[#6a7282]">
          Build the academic word power examiners reward.
        </p>
      </div>

      {/* Stat cards */}
      <div className="flex gap-[20px]">
        <StatCardItem
          value={stats.learned}
          label="Words learned"
          accentColor="#b3e653"
        />
        <StatCardItem
          value={stats.learning}
          label="In progress"
          accentColor="#5281f9"
        />
        <StatCardItem
          value={stats.total - stats.learned - stats.learning}
          label="New words"
          accentColor="#fc945a"
        />
        <StatCardItem
          value={stats.total}
          label="Total words"
          accentColor="#7c6ef9"
        />
      </div>

      {/* CTA banner — shown when there are learned words */}
      {stats.learned > 0 && (
        <div className="bg-[#b3e653] rounded-[24px] flex items-center justify-between gap-[24px] px-[32px] py-[24px]">
          <div className="flex flex-col gap-[4px] flex-1 min-w-0">
            <p className="font-display font-bold text-[20px] leading-normal text-[#191d24]">
              {stats.learned} word{stats.learned !== 1 ? "s" : ""} learned
            </p>
            <p className="font-inter font-medium text-[14px] leading-normal text-[#33421a]">
              Keep going — consistency builds lasting vocabulary.
            </p>
          </div>
          <button className="shrink-0 bg-[#191d24] text-white font-inter font-bold text-[14px] leading-normal rounded-full px-[24px] py-[14px] hover:bg-[#2d3142] transition-colors whitespace-nowrap">
            Keep studying
          </button>
        </div>
      )}

      {/* Words section */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-[18px] leading-normal text-[#191d24]">
          IELTS word bank
        </h2>
        <span className="font-inter font-normal text-[13px] leading-normal text-[#6a7282]">
          {stats.total} words
        </span>
      </div>

      {words.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-[20px]">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-[20px]">
              {row.map((word) => (
                <WordCard key={word.id} word={word} onToggle={handleToggle} />
              ))}
              {/* Fill empty slots so flex items maintain consistent width */}
              {row.length < 3 &&
                Array.from({ length: 3 - row.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex-1 min-w-0" />
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

PageVocabulary.Layout = AppShell;
