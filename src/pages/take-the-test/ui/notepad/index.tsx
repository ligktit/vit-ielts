import { useExamContext } from "../../context";
import { useTextSelectionContext } from "@/shared/ui";
import { useState, useEffect, useCallback } from "react";

function Notepad() {
  const { setIsNotesViewOpen, part } = useExamContext();
  const ctx = useTextSelectionContext();
  
  if (!ctx) return null;
  
  const { notes, handleNoteSubmit, removeUnderline } = ctx;

  // Track which notes have hidden highlights
  const [hiddenHighlights, setHiddenHighlights] = useState<Set<string>>(new Set());
  // Track local note values for editing
  const [noteValues, setNoteValues] = useState<Record<string, string>>({});
  // Track which note is currently focused/active
  const [focusedNoteId, setFocusedNoteId] = useState<string | null>(null);

  // Sync noteValues with notes
  useEffect(() => {
    const newValues: Record<string, string> = {};
    notes.forEach((note) => {
      newValues[note.nodeId] = noteValues[note.nodeId] ?? note.nodeContent ?? "";
    });
    setNoteValues(newValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  const toggleHighlightVisibility = useCallback((nodeId: string) => {
    const spans = document.querySelectorAll(`span[data-node-id="${nodeId}"]`);
    setHiddenHighlights((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        // Show the highlight
        next.delete(nodeId);
        spans.forEach((span) => {
          const el = span as HTMLElement;
          el.style.backgroundColor = el.dataset.color || "#48a7f6";
          el.style.color = "#fff";
        });
      } else {
        // Hide the highlight
        next.add(nodeId);
        spans.forEach((span) => {
          const el = span as HTMLElement;
          el.style.backgroundColor = "transparent";
          el.style.color = "inherit";
        });
      }
      return next;
    });
  }, []);

  const handleDelete = useCallback((nodeId: string) => {
    removeUnderline(nodeId);
    setHiddenHighlights((prev) => {
      const next = new Set(prev);
      next.delete(nodeId);
      return next;
    });
  }, [removeUnderline]);

  const handleSave = useCallback((noteId: string) => {
    const value = noteValues[noteId] || "";
    const existingNote = notes.find((n) => n.nodeId === noteId);
    if (existingNote) {
      handleNoteSubmit(value, existingNote);
    }
  }, [noteValues, notes, handleNoteSubmit]);

  const partNumber = part.current + 1;

  return (
    <div className="notepad-sidebar flex flex-col w-full h-full bg-surface-card md:border-l md:border-border-hairline">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border-hairline flex-shrink-0">
        <span className="text-[15px] font-bold text-ink-900 tracking-wide">NOTE</span>
        <div className="flex items-center gap-2">
          {/* Global eye toggle - toggle all highlights */}
          <button
            type="button"
            onClick={() => {
              const allHidden = notes.length > 0 && notes.every(n => hiddenHighlights.has(n.nodeId));
              if (allHidden) {
                // Show all
                notes.forEach(n => {
                  const spans = document.querySelectorAll(`span[data-node-id="${n.nodeId}"]`);
                  spans.forEach((span) => {
                    const el = span as HTMLElement;
                    el.style.backgroundColor = el.dataset.color || "#48a7f6";
                    el.style.color = "#fff";
                  });
                });
                setHiddenHighlights(new Set());
              } else {
                // Hide all
                notes.forEach(n => {
                  const spans = document.querySelectorAll(`span[data-node-id="${n.nodeId}"]`);
                  spans.forEach((span) => {
                    const el = span as HTMLElement;
                    el.style.backgroundColor = "transparent";
                    el.style.color = "inherit";
                  });
                });
                setHiddenHighlights(new Set(notes.map(n => n.nodeId)));
              }
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-brand-surface transition-colors cursor-pointer"
            title="Toggle all highlights"
          >
            <span className="material-symbols-rounded text-[20px] text-ink-900" style={{ fontVariationSettings: "'wght' 700" }}>
              {notes.length > 0 && notes.every(n => hiddenHighlights.has(n.nodeId)) ? "visibility_off" : "visibility"}
            </span>
          </button>
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsNotesViewOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-brand-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-rounded text-[20px] text-ink-900" style={{ fontVariationSettings: "'wght' 700" }}>close</span>
          </button>
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 && (
          <div className="flex items-center justify-center h-full text-ink-muted text-sm">
            Select text and click Note to add notes
          </div>
        )}
        {notes.map((note, index) => {
          const isLastNote = index === notes.length - 1;
          const isActive = focusedNoteId ? focusedNoteId === note.nodeId : isLastNote;
          return (
          <div key={note.nodeId} className={`border-b border-border-hairline p-4 transition-colors ${isActive ? 'bg-brand-surface' : 'bg-surface-card'}`}>
            {/* Part label + highlighted text */}
            <div className="flex items-center gap-1 mb-2 min-w-0">
              <span className="text-body-m font-bold text-ink-900 whitespace-nowrap">
                Part {partNumber}
              </span>
              <span className="text-body-m text-ink-muted truncate">
                {note.text}
              </span>
            </div>
            
            {/* Editable textarea */}
            <textarea
              value={noteValues[note.nodeId] ?? note.nodeContent ?? ""}
              onChange={(e) => {
                setNoteValues((prev) => ({
                  ...prev,
                  [note.nodeId]: e.target.value,
                }));
              }}
              onFocus={() => setFocusedNoteId(note.nodeId)}
              onBlur={() => {
                setFocusedNoteId(null);
                handleSave(note.nodeId);
              }}
              placeholder="Record ideas"
              className="w-full border border-border-hairline bg-surface-card rounded px-3 py-2 text-body-m text-ink-body resize-none focus:outline-none focus:border-accent-blue transition-colors h-[60px]"
            />

            {/* Delete button */}
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={() => handleDelete(note.nodeId)}
                className="text-body-m font-semibold text-accent-blue hover:text-ink-700 cursor-pointer tracking-wide"
              >
                DELETE
              </button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

export default Notepad;
