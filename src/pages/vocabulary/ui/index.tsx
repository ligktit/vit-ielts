import { useCallback, useMemo, useState } from "react";
import { AppShell } from "@/widgets/layouts";
import { createClient } from "~supabase/client";
import { useAuth } from "@/appx/providers";
import { toast } from "react-toastify";
import {
  setWordStatus,
  reviewWord,
  addPersonalWord,
  updatePersonalWord,
  deletePersonalWord,
} from "~services/vocabulary";
import type {
  VocabularyOverview,
  VocabWordWithStatus,
  WordStatus,
  VocabProgress,
} from "~services/vocabulary";
import { Tabs } from "@/shared/ui/ds/molecules/tabs";
import { Input } from "@/shared/ui/ds/atoms/input";
import { Button } from "@/shared/ui/ds/atoms/button";
import {
  AddWordModal,
  pronounce,
  type WordFormValues,
} from "@/shared/ui/vocab-capture";
import { StudyMode } from "./study-mode";
import { ProgressPanel } from "./progress-panel";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PageVocabularyProps {
  vocabularyOverview: VocabularyOverview;
  vocabProgress: VocabProgress;
}

// ─── Topic colour map ─────────────────────────────────────────────────────────

type TopicStyle = {
  chipBg: string;
  chipText: string;
};

const TOPIC_STYLE: Record<string, TopicStyle> = {
  Environment: { chipBg: "rgba(252,148,89,0.16)", chipText: "#bd6f43" },
  Education: { chipBg: "rgba(124,110,249,0.16)", chipText: "#5d52bb" },
  Technology: { chipBg: "rgba(249,107,139,0.16)", chipText: "#bb5068" },
  Health: { chipBg: "rgba(22,155,134,0.16)", chipText: "#107464" },
  Society: { chipBg: "rgba(82,129,249,0.16)", chipText: "#3e61bb" },
};

const DEFAULT_TOPIC_STYLE: TopicStyle = {
  chipBg: "rgba(179,230,83,0.16)",
  chipText: "#86ad3e",
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

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "learning", label: "Learning" },
  { id: "learned", label: "Learned" },
];

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
  onEdit,
  onDelete,
}: {
  word: VocabWordWithStatus;
  onToggle: (wordId: string, current: WordStatus) => void;
  onEdit: (word: VocabWordWithStatus) => void;
  onDelete: (wordId: string) => void;
}) => {
  const ts = getTopicStyle(word.topic);
  const ss = STATUS_STYLE[word.userStatus];
  const isLearned = word.userStatus === "learned";

  return (
    <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] flex flex-col gap-[14px] p-[24px]">
      {/* Topic chip + row actions */}
      <div className="flex items-start justify-between gap-[8px]">
        <div className="flex items-center gap-[8px] min-w-0">
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
              className="font-inter font-medium text-[11px] leading-normal px-[10px] py-[4px] rounded-full truncate"
              style={{ backgroundColor: ts.chipBg, color: ts.chipText }}
            >
              {word.topic}
            </span>
          )}
        </div>
        <div className="flex items-center gap-[2px] shrink-0">
          <IconAction icon="edit" label="Edit word" onClick={() => onEdit(word)} />
          <IconAction
            icon="delete"
            label="Delete word"
            onClick={() => onDelete(word.id)}
          />
        </div>
      </div>

      {/* Word + pronounce + meaning */}
      <div className="flex flex-col gap-[4px] w-full">
        <div className="flex items-center gap-[8px]">
          <p className="font-display font-bold text-[18px] leading-normal text-[#191d24]">
            {word.word}
          </p>
          <button
            type="button"
            aria-label="Pronounce"
            onClick={() => pronounce(word.word, word.audio_url)}
            className="flex items-center justify-center size-[28px] rounded-full text-[#6a7282] hover:bg-[#f6f7f4] transition-colors"
          >
            <span className="material-symbols-rounded text-[18px]">volume_up</span>
          </button>
        </div>
        {word.ipa && (
          <p className="font-inter font-normal text-[12px] leading-normal text-[#9ca3af]">
            {word.ipa}
          </p>
        )}
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

const IconAction = ({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="flex items-center justify-center size-[30px] rounded-full text-[#9ca3af] hover:bg-[#f6f7f4] hover:text-[#6a7282] transition-colors"
  >
    <span className="material-symbols-rounded text-[18px]">{icon}</span>
  </button>
);

// ─── Empty states ─────────────────────────────────────────────────────────────

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <div className="flex flex-col items-center justify-center py-[60px] gap-[14px] bg-white border border-[rgba(25,29,36,0.08)] rounded-[24px]">
    <span className="material-symbols-rounded text-[48px] text-[#d1d5db]">
      menu_book
    </span>
    <p className="font-inter font-medium text-[15px] text-[#6a7282] text-center max-w-[340px]">
      Your vocabulary is empty. Add a word, or select any text around the site and
      click &ldquo;Add to Vocabulary&rdquo;.
    </p>
    <Button variant="primary" size="sm" onClick={onAdd}>
      Add your first word
    </Button>
  </div>
);

const NoResults = () => (
  <div className="flex flex-col items-center justify-center py-[48px] gap-[10px]">
    <span className="material-symbols-rounded text-[40px] text-[#d1d5db]">
      search_off
    </span>
    <p className="font-inter font-medium text-[14px] text-[#6a7282]">
      No words match your filter.
    </p>
  </div>
);

// ─── Page component ───────────────────────────────────────────────────────────

export const PageVocabulary = ({
  vocabularyOverview,
  vocabProgress,
}: PageVocabularyProps) => {
  const { currentUser } = useAuth();
  const supabase = createClient();

  const [words, setWords] = useState<VocabWordWithStatus[]>(
    vocabularyOverview?.words ?? []
  );
  const [dueWords, setDueWords] = useState<VocabWordWithStatus[]>(
    vocabularyOverview?.dueWords ?? []
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal: add / edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<VocabWordWithStatus | null>(null);

  // Study mode
  const [studyWords, setStudyWords] = useState<VocabWordWithStatus[] | null>(null);

  const stats = {
    total: words.length,
    learned: words.filter((w) => w.userStatus === "learned").length,
    learning: words.filter((w) => w.userStatus === "learning").length,
    dueCount: dueWords.length,
  };

  // ── Filtering ───────────────────────────────────────────────────────────────

  const filteredWords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return words.filter((w) => {
      if (statusFilter !== "all" && w.userStatus !== statusFilter) return false;
      if (!q) return true;
      return (
        w.word.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q) ||
        (w.topic?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [words, search, statusFilter]);

  // ── Toggle learned/new ──────────────────────────────────────────────────────

  const handleToggle = useCallback(
    async (wordId: string, current: WordStatus) => {
      if (!currentUser?.id) return;
      const nextStatus: WordStatus = current === "learned" ? "new" : "learned";

      setWords((prev) =>
        prev.map((w) => (w.id === wordId ? { ...w, userStatus: nextStatus } : w))
      );

      try {
        await setWordStatus(supabase, {
          userId: currentUser.id,
          wordId,
          status: nextStatus === "new" ? null : nextStatus,
        });
      } catch (err) {
        console.error("[vocabulary] toggle failed, reverting:", err);
        setWords((prev) =>
          prev.map((w) => (w.id === wordId ? { ...w, userStatus: current } : w))
        );
      }
    },
    [currentUser?.id, supabase]
  );

  // ── SRS review ──────────────────────────────────────────────────────────────

  const handleReview = useCallback(
    async (wordId: string, remembered: boolean) => {
      if (!currentUser?.id) return;
      setDueWords((prev) => prev.filter((w) => w.id !== wordId));
      setWords((prev) =>
        prev.map((w) =>
          w.id === wordId && w.userStatus === "new"
            ? { ...w, userStatus: "learning" }
            : w
        )
      );
      await reviewWord(supabase, { userId: currentUser.id, wordId, remembered });
    },
    [currentUser?.id, supabase]
  );

  // ── Add / edit / delete ───────────────────────────────────────────────────--

  const openAdd = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((word: VocabWordWithStatus) => {
    setEditing(word);
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (values: WordFormValues): Promise<boolean> => {
      if (!currentUser?.id) return false;

      // Edit
      if (editing) {
        const ok = await updatePersonalWord(supabase, {
          userId: currentUser.id,
          wordId: editing.id,
          word: values.word,
          meaning: values.meaning,
          example: values.example,
          ipa: values.ipa,
          topic: values.topic,
        });
        if (!ok) {
          toast.error("Couldn't update the word.");
          return false;
        }
        setWords((prev) =>
          prev.map((w) =>
            w.id === editing.id
              ? {
                  ...w,
                  word: values.word,
                  meaning: values.meaning,
                  example: values.example || null,
                  ipa: values.ipa || null,
                  topic: values.topic || null,
                }
              : w
          )
        );
        toast.success("Word updated");
        return true;
      }

      // Add
      const created = await addPersonalWord(supabase, {
        userId: currentUser.id,
        word: values.word,
        meaning: values.meaning,
        example: values.example,
        ipa: values.ipa,
        audioUrl: values.audioUrl,
        topic: values.topic,
      });
      if (!created) {
        toast.error("Couldn't add the word. It may already be in your list.");
        return false;
      }
      setWords((prev) => [created, ...prev]);
      toast.success(`"${created.word}" added`);
      return true;
    },
    [currentUser?.id, editing, supabase]
  );

  const handleDelete = useCallback(
    async (wordId: string) => {
      if (!currentUser?.id) return;
      const snapshot = words;
      setWords((prev) => prev.filter((w) => w.id !== wordId));
      setDueWords((prev) => prev.filter((w) => w.id !== wordId));
      const ok = await deletePersonalWord(supabase, {
        userId: currentUser.id,
        wordId,
      });
      if (!ok) {
        toast.error("Couldn't delete the word.");
        setWords(snapshot);
      }
    },
    [currentUser?.id, supabase, words]
  );

  // ── Study deck launchers ──────────────────────────────────────────────────--

  const startStudy = (deck: VocabWordWithStatus[]) => {
    if (deck.length === 0) return;
    setStudyWords(deck);
  };

  // Split filtered words into rows of 3 for grid display
  const rows: VocabWordWithStatus[][] = [];
  for (let i = 0; i < filteredWords.length; i += 3) {
    rows.push(filteredWords.slice(i, i + 3));
  }

  const editInitial: Partial<WordFormValues> | undefined = editing
    ? {
        word: editing.word,
        meaning: editing.meaning,
        example: editing.example ?? "",
        ipa: editing.ipa ?? "",
        topic: editing.topic ?? "",
        audioUrl: editing.audio_url,
      }
    : undefined;

  return (
    <div className="flex flex-col gap-[28px]">
      {/* Page heading */}
      <div className="flex items-start justify-between gap-[16px] flex-wrap">
        <div className="flex flex-col gap-[6px]">
          <h1 className="font-display font-bold text-[26px] leading-normal text-[#191d24]">
            Vocabulary
          </h1>
          <p className="font-inter font-normal text-[15px] leading-normal text-[#6a7282]">
            Build your personal word bank — add words from anywhere on the site.
          </p>
        </div>
        <div className="flex items-center gap-[10px]">
          {dueWords.length > 0 && (
            <Button
              variant="dark"
              size="sm"
              leftIcon={
                <span className="material-symbols-rounded text-[18px]">
                  style
                </span>
              }
              onClick={() => startStudy(dueWords)}
            >
              Review {dueWords.length} due
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            leftIcon={
              <span className="material-symbols-rounded text-[18px]">add</span>
            }
            onClick={openAdd}
          >
            Add word
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="flex gap-[20px] flex-wrap md:flex-nowrap">
        <StatCardItem value={stats.learned} label="Words learned" accentColor="#b3e653" />
        <StatCardItem value={stats.learning} label="In progress" accentColor="#5281f9" />
        <StatCardItem
          value={stats.total - stats.learned - stats.learning}
          label="New words"
          accentColor="#fc945a"
        />
        <StatCardItem value={stats.dueCount} label="Due for review" accentColor="#f96b8b" />
      </div>

      {/* Progress analytics */}
      <ProgressPanel progress={vocabProgress} />

      {/* ── Word bank ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-[16px] flex-wrap">
        <h2 className="font-display font-bold text-[18px] leading-normal text-[#191d24]">
          My word bank
        </h2>
        <div className="flex items-center gap-[12px]">
          {filteredWords.length > 0 && (
            <Button
              variant="outlined"
              size="sm"
              leftIcon={
                <span className="material-symbols-rounded text-[18px]">style</span>
              }
              onClick={() => startStudy(filteredWords)}
            >
              Study these
            </Button>
          )}
          <div className="w-[220px]">
            <Input
              type="search"
              placeholder="Search words…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              leftIcon={
                <span className="material-symbols-rounded text-[18px]">search</span>
              }
            />
          </div>
        </div>
      </div>

      {words.length === 0 ? (
        <EmptyState onAdd={openAdd} />
      ) : (
        <>
          <Tabs
            tabs={STATUS_TABS}
            activeId={statusFilter}
            onChange={setStatusFilter}
            className="self-start"
          />
          {filteredWords.length === 0 ? (
            <NoResults />
          ) : (
            <div className="flex flex-col gap-[20px]">
              {rows.map((row, rowIdx) => (
                <div key={rowIdx} className="flex gap-[20px] flex-col md:flex-row">
                  {row.map((word) => (
                    <div key={word.id} className="flex-1 min-w-0">
                      <WordCard
                        word={word}
                        onToggle={handleToggle}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}
                  {row.length < 3 &&
                    Array.from({ length: 3 - row.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex-1 min-w-0 hidden md:block" />
                    ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add / edit modal */}
      <AddWordModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editing ? "edit" : "add"}
        initial={editInitial}
        onSubmit={handleSubmit}
      />

      {/* Study mode overlay */}
      {studyWords && (
        <StudyMode
          words={studyWords}
          onReview={handleReview}
          onClose={() => setStudyWords(null)}
        />
      )}
    </div>
  );
};

PageVocabulary.Layout = AppShell;
