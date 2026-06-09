
/**
 * FilterDropdown — multi-select checkbox filter chip + dropdown panel
 *
 * @figma VIT IELTS — Blog "Filter · Category" 3521:116 + "Dropdown · Category" 3521:130
 *
 * Chip (trigger):
 *   - rounded-full white, Inter SemiBold 14px ink
 *   - active (has selection): border 1.5px #9AD534 + green count badge (18px)
 *   - idle: border 1px rgba(25,29,36,.1)
 * Panel:
 *   - white, rounded-[16px], border rgba(25,29,36,.1), shadow 0 12px 28px rgba(0,0,0,.16)
 *   - eyebrow heading (Inter Bold 12px, #6A7282, +0.72px)
 *   - options: 20px box (checked #B3E653 + ✓ ink / idle white border 1.5px)
 *   - footer: "Clear all" (left) + "Apply" green pill (right)
 */

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export type FilterOption = { value: string; label: string };

export type FilterDropdownProps = {
  label: string;
  options: FilterOption[];
  /** Committed selection (controlled). */
  selected: string[];
  /** Called when the user presses Apply. */
  onChange?: (selected: string[]) => void;
  /** Dropdown heading; defaults to the uppercased label. */
  heading?: string;
  className?: string;
};

export const FilterDropdown = ({
  label,
  options,
  selected,
  onChange,
  heading,
  className,
}: FilterDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(selected);
  const rootRef = useRef<HTMLDivElement>(null);

  // Sync draft with committed selection whenever the panel (re)opens.
  useEffect(() => {
    if (open) setDraft(selected);
  }, [open, selected]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const count = selected.length;
  const active = count > 0;

  const toggle = (value: string) =>
    setDraft(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));

  const apply = () => {
    onChange?.(draft);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={twMerge('relative inline-block', className)}>
      {/* ── Chip (trigger) ── */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={twMerge(
          'inline-flex items-center gap-2 bg-white rounded-full pl-4 pr-[14px] py-[10px]',
          'font-inter font-semibold text-[14px] text-[#191d24] transition-colors',
          active ? 'border-[1.5px] border-[#9ad534]' : 'border border-[rgba(25,29,36,0.1)]',
        )}
      >
        <span className="whitespace-nowrap">{label}</span>
        {active && (
          <span className="inline-flex items-center justify-center size-[18px] rounded-full bg-[#b3e653] text-[11px] font-bold text-[#191d24]">
            {count}
          </span>
        )}
        <img
          src="/assets/icons/CaretDown.svg"
          width={16}
          height={16}
          alt=""
          className={twMerge('transition-transform duration-150', open && 'rotate-180')}
        />
      </button>

      {/* ── Panel ── */}
      {open && (
        <div
          role="listbox"
          aria-multiselectable
          className={twMerge(
            'absolute left-0 top-[calc(100%+8px)] z-20 min-w-[240px]',
            'flex flex-col gap-1 bg-white rounded-[16px] px-[14px] py-3',
            'border border-[rgba(25,29,36,0.1)] shadow-[0px_12px_28px_0px_rgba(0,0,0,0.16)]',
          )}
        >
          <p className="font-inter font-bold text-[12px] tracking-[0.72px] text-[#6a7282] whitespace-nowrap">
            {(heading ?? label).toUpperCase()}
          </p>

          <div className="flex flex-col gap-0.5 w-full">
            {options.map(opt => {
              const checked = draft.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={checked}
                  onClick={() => toggle(opt.value)}
                  className="flex items-center gap-3 py-[7px] w-full text-left"
                >
                  <span
                    className={twMerge(
                      'inline-flex items-center justify-center size-5 rounded-[6px] shrink-0 transition-colors',
                      checked
                        ? 'bg-[#b3e653]'
                        : 'bg-white border-[1.5px] border-[rgba(25,29,36,0.1)]',
                    )}
                  >
                    {checked && (
                      <span className="text-[#191d24] text-[12px] font-bold leading-none select-none">✓</span>
                    )}
                  </span>
                  <span className="font-inter font-normal text-[14px] text-[#191d24] whitespace-nowrap">
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 w-full">
            <button
              type="button"
              onClick={() => setDraft([])}
              className="font-inter font-semibold text-[14px] text-[#6a7282] hover:text-[#191d24] transition-colors"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={apply}
              className="inline-flex items-center justify-center bg-[#b3e653] hover:bg-[#9ad534] rounded-full px-[18px] py-[9px] font-inter font-bold text-[13px] text-[#191d24] transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
