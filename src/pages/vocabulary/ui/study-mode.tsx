/**
 * StudyMode — full-screen flashcard deck (spaced-repetition study).
 *
 * Cycles a list of words one card at a time: front shows the word (+ pronounce),
 * tap/click flips to reveal meaning / example / IPA, then Remembered / Forgot
 * schedules the next review and advances. Pure UI — scheduling is delegated to
 * the `onReview` callback (wraps services/vocabulary.reviewWord).
 */
import { useEffect, useState } from "react";
import type { VocabWordWithStatus } from "~services/vocabulary";
import { Button } from "@/shared/ui/ds/atoms/button";
import { pronounce } from "@/shared/ui/vocab-capture";

export type StudyModeProps = {
  words: VocabWordWithStatus[];
  onReview: (wordId: string, remembered: boolean) => void;
  onClose: () => void;
};

export const StudyMode = ({ words, onReview, onClose }: StudyModeProps) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const current = words[index];
  const done = index >= words.length;

  // Esc closes the overlay.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleAnswer = (remembered: boolean) => {
    if (!current) return;
    onReview(current.id, remembered);
    setReviewed((n) => n + 1);
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-[rgba(25,29,36,0.72)] px-[20px]">
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close study mode"
        className="absolute top-[24px] right-[24px] flex items-center justify-center size-[44px] rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <span className="material-symbols-rounded text-[24px]">close</span>
      </button>

      <div className="w-full max-w-[520px] flex flex-col items-center gap-[20px]">
        {/* Progress */}
        <p className="font-inter font-medium text-[13px] leading-normal text-white/80">
          {done ? "Session complete" : `Card ${index + 1} of ${words.length}`}
        </p>

        {done ? (
          <div className="w-full bg-white rounded-[24px] flex flex-col items-center gap-[12px] px-[32px] py-[48px]">
            <span className="material-symbols-rounded text-[48px] text-[#b3e653]">
              celebration
            </span>
            <p className="font-display font-bold text-[20px] text-[#191d24]">
              {reviewed} card{reviewed !== 1 ? "s" : ""} reviewed
            </p>
            <p className="font-inter text-[14px] text-[#6a7282] text-center">
              Spaced repetition has scheduled your next reviews.
            </p>
            <Button variant="primary" size="md" onClick={onClose} className="mt-[8px]">
              Done
            </Button>
          </div>
        ) : (
          <>
            {/* Card */}
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="w-full min-h-[300px] bg-white rounded-[24px] flex flex-col items-center justify-center gap-[14px] px-[32px] py-[40px] text-center cursor-pointer select-none"
            >
              {!flipped ? (
                <>
                  <p className="font-display font-bold text-[32px] leading-tight text-[#191d24]">
                    {current.word}
                  </p>
                  {current.ipa && (
                    <p className="font-inter text-[15px] text-[#6a7282]">
                      {current.ipa}
                    </p>
                  )}
                  <span className="font-inter text-[12px] text-[#9ca3af] mt-[6px]">
                    Tap to reveal
                  </span>
                </>
              ) : (
                <>
                  <p className="font-inter font-semibold text-[18px] leading-snug text-[#191d24]">
                    {current.meaning}
                  </p>
                  {current.example && (
                    <p className="font-inter italic text-[14px] text-[#6a7282] mt-[4px]">
                      &ldquo;{current.example}&rdquo;
                    </p>
                  )}
                </>
              )}
            </button>

            {/* Pronounce */}
            <Button
              variant="white"
              size="sm"
              leftIcon={
                <span className="material-symbols-rounded text-[18px]">volume_up</span>
              }
              onClick={() => pronounce(current.word, current.audio_url)}
            >
              Pronounce
            </Button>

            {/* Answer buttons (only after flip) */}
            {flipped ? (
              <div className="flex items-center gap-[12px] w-full">
                <Button
                  variant="outlined"
                  size="md"
                  fullWidth
                  onClick={() => handleAnswer(false)}
                >
                  Forgot
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => handleAnswer(true)}
                >
                  Remembered
                </Button>
              </div>
            ) : (
              <Button
                variant="dark"
                size="md"
                fullWidth
                onClick={() => setFlipped(true)}
              >
                Show answer
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
