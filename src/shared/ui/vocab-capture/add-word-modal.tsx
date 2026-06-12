/**
 * AddWordModal — reusable add / edit dialog for a personal vocabulary word.
 *
 * Used by both the global "Add to Vocabulary" capture popover and the
 * Vocabulary page. Pure presentational + form state: persistence is delegated
 * to the `onSubmit` callback (returns true on success). In add mode it can
 * auto-enrich from the dictionary API via `autoEnrichWord`.
 */
import { useEffect, useState } from "react";
import { Modal, Input } from "antd";
import { Button } from "@/shared/ui/ds/atoms/button";
import { pronounce } from "./pronounce";
import { fetchEnrichment } from "./enrich";

export type WordFormValues = {
  word: string;
  meaning: string;
  example: string;
  ipa: string;
  topic: string;
  /** Carried through from enrichment so we can persist the audio file URL. */
  audioUrl: string | null;
};

export type AddWordModalProps = {
  open: boolean;
  onClose: () => void;
  mode?: "add" | "edit";
  /** Pre-fill values (edit mode, or a known starting point in add mode). */
  initial?: Partial<WordFormValues>;
  /** Add mode: word to auto-look-up on open (from a text selection). */
  autoEnrichWord?: string;
  /** Persist the values; return true on success. */
  onSubmit: (values: WordFormValues) => Promise<boolean>;
};

const EMPTY: WordFormValues = {
  word: "",
  meaning: "",
  example: "",
  ipa: "",
  topic: "",
  audioUrl: null,
};

export const AddWordModal = ({
  open,
  onClose,
  mode = "add",
  initial,
  autoEnrichWord,
  onSubmit,
}: AddWordModalProps) => {
  const [values, setValues] = useState<WordFormValues>(EMPTY);
  const [enriching, setEnriching] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset + (optionally) auto-enrich whenever the modal opens.
  useEffect(() => {
    if (!open) return;

    const base: WordFormValues = {
      ...EMPTY,
      ...initial,
      word: (autoEnrichWord ?? initial?.word ?? "").trim(),
    };
    setValues(base);
    setSaving(false);

    if (mode === "add" && autoEnrichWord && autoEnrichWord.trim()) {
      setEnriching(true);
      fetchEnrichment(autoEnrichWord.trim())
        .then((enr) => {
          if (!enr) return;
          setValues((prev) => ({
            ...prev,
            // Don't clobber anything the user may have typed in the brief gap.
            meaning: prev.meaning || enr.meaning,
            example: prev.example || enr.example || "",
            ipa: prev.ipa || enr.ipa || "",
            audioUrl: enr.audioUrl ?? prev.audioUrl,
          }));
        })
        .finally(() => setEnriching(false));
    } else {
      setEnriching(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = <K extends keyof WordFormValues>(key: K, v: WordFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const canSave = values.word.trim() !== "" && values.meaning.trim() !== "";

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    const ok = await onSubmit({
      ...values,
      word: values.word.trim(),
      meaning: values.meaning.trim(),
    });
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      title={mode === "edit" ? "Edit word" : "Add to Vocabulary"}
      width={460}
    >
      <div className="flex flex-col gap-[14px] pt-[8px]">
        {/* Word + pronounce */}
        <Field label="Word">
          <div className="flex items-center gap-[8px]">
            <Input
              value={values.word}
              onChange={(e) => set("word", e.target.value)}
              placeholder="e.g. ubiquitous"
              size="large"
            />
            <Button
              variant="icon-circle"
              size="sm"
              aria-label="Pronounce"
              onClick={() => values.word && pronounce(values.word, values.audioUrl)}
              icon={<span className="material-symbols-rounded text-[18px]">volume_up</span>}
            />
          </div>
        </Field>

        <div className="flex gap-[12px]">
          <Field label="IPA" className="flex-1">
            <Input
              value={values.ipa}
              onChange={(e) => set("ipa", e.target.value)}
              placeholder={enriching ? "Looking up…" : "/juːˈbɪkwɪtəs/"}
              size="large"
            />
          </Field>
          <Field label="Topic" className="flex-1">
            <Input
              value={values.topic}
              onChange={(e) => set("topic", e.target.value)}
              placeholder="e.g. Technology"
              size="large"
            />
          </Field>
        </div>

        <Field label="Meaning">
          <Input.TextArea
            value={values.meaning}
            onChange={(e) => set("meaning", e.target.value)}
            placeholder={enriching ? "Looking up…" : "Definition"}
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </Field>

        <Field label="Example">
          <Input.TextArea
            value={values.example}
            onChange={(e) => set("example", e.target.value)}
            placeholder="Example sentence (optional)"
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </Field>

        <div className="flex items-center justify-end gap-[10px] pt-[4px]">
          <Button variant="outlined" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!canSave}
            loading={saving}
          >
            {mode === "edit" ? "Save changes" : "Add word"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const Field = ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <label className={`flex flex-col gap-[6px] ${className}`}>
    <span className="font-inter font-semibold text-[12px] leading-normal text-[#6a7282]">
      {label}
    </span>
    {children}
  </label>
);
