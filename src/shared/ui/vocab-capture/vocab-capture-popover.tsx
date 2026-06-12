/**
 * VocabCapturePopover — global "Add to Vocabulary" affordance.
 *
 * Mounted once at the app root. When the user selects a short span of text on
 * any page, a floating "➕ Add to Vocabulary" button appears near the selection.
 * Clicking it opens the AddWordModal (auto-enriched) for signed-in users, or a
 * "log in to save" prompt otherwise. Suppressed on /admin and /take-the-test
 * (the test flow has its own highlight/note selection UI).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { createClient } from "~supabase/client";
import { useAuth } from "@/appx/providers";
import { ROUTES } from "@/shared/routes";
import { addPersonalWord } from "~services/vocabulary";
import { AddWordModal, type WordFormValues } from "./add-word-modal";

const MAX_SELECTION_LEN = 60;
const SUPPRESSED_PREFIXES = ["/admin", "/take-the-test"];

type Anchor = { x: number; y: number };

/** True when the selection sits inside an editable field — skip those. */
function isInEditable(node: Node | null): boolean {
  let el: HTMLElement | null =
    node instanceof HTMLElement ? node : node?.parentElement ?? null;
  while (el) {
    const tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable) return true;
    el = el.parentElement;
  }
  return false;
}

export const VocabCapturePopover = () => {
  const router = useRouter();
  const { isSignedIn, currentUser } = useAuth();

  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const suppressed = SUPPRESSED_PREFIXES.some((p) =>
    router.pathname.startsWith(p)
  );

  const clear = useCallback(() => {
    setAnchor(null);
    setSelectedText("");
    setShowLoginPrompt(false);
  }, []);

  useEffect(() => {
    if (suppressed) return;

    const onMouseUp = () => {
      // Defer so the selection is finalized.
      window.setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
          if (!modalOpen) clear();
          return;
        }
        const text = sel.toString().trim();
        if (
          !text ||
          text.length > MAX_SELECTION_LEN ||
          /\n/.test(text) ||
          isInEditable(sel.anchorNode)
        ) {
          if (!modalOpen) clear();
          return;
        }
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;
        setSelectedText(text);
        setAnchor({ x: rect.left + rect.width / 2, y: rect.top });
        setShowLoginPrompt(false);
      }, 0);
    };

    const onMouseDown = (e: MouseEvent) => {
      // Keep the bar open when interacting with it.
      if (barRef.current?.contains(e.target as Node)) return;
      clear();
    };

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [suppressed, modalOpen, clear]);

  if (suppressed) return null;

  const handleAddClick = () => {
    if (!isSignedIn) {
      setShowLoginPrompt(true);
      return;
    }
    setModalOpen(true);
    setAnchor(null);
  };

  const handleSubmit = async (values: WordFormValues): Promise<boolean> => {
    if (!currentUser?.id) return false;
    const created = await addPersonalWord(createClient(), {
      userId: currentUser.id,
      word: values.word,
      meaning: values.meaning,
      example: values.example,
      ipa: values.ipa,
      audioUrl: values.audioUrl,
      topic: values.topic,
    });
    if (!created) {
      toast.error("Couldn't save the word. Please try again.");
      return false;
    }
    toast.success(`"${created.word}" added to your vocabulary`);
    window.getSelection()?.removeAllRanges();
    return true;
  };

  const loginHref = ROUTES.LOGIN(
    typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : undefined
  );

  return (
    <>
      {anchor && (
        <div
          ref={barRef}
          className="fixed z-[1200] -translate-x-1/2 -translate-y-full pb-[8px]"
          style={{ left: anchor.x, top: anchor.y }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {showLoginPrompt ? (
            <div className="flex items-center gap-[10px] bg-[#191d24] text-white rounded-[12px] px-[14px] py-[10px] shadow-[0_8px_24px_rgba(25,29,36,0.28)]">
              <span className="font-inter text-[13px] leading-normal">
                Log in to save words
              </span>
              <a
                href={loginHref}
                className="font-inter font-bold text-[13px] leading-normal text-[#b3e653] hover:underline"
              >
                Log in
              </a>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddClick}
              className="flex items-center gap-[6px] bg-[#191d24] text-white rounded-full pl-[12px] pr-[16px] py-[8px] shadow-[0_8px_24px_rgba(25,29,36,0.28)] hover:bg-[#31384d] transition-colors"
            >
              <span className="material-symbols-rounded text-[18px] text-[#b3e653]">
                add_circle
              </span>
              <span className="font-inter font-bold text-[13px] leading-normal whitespace-nowrap">
                Add to Vocabulary
              </span>
            </button>
          )}
        </div>
      )}

      <AddWordModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          clear();
        }}
        mode="add"
        autoEnrichWord={selectedText}
        onSubmit={handleSubmit}
      />
    </>
  );
};
