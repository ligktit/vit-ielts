import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import {
  type AnnouncementBarConfig,
  type AnnouncementBarItem,
  DEFAULT_ANNOUNCEMENT_BAR,
} from "../types";

/**
 * Red scrolling announcement bar shown above the site header.
 *
 * Content is editable in admin → CMS → Header → "Thanh thông báo (chạy)"
 * (section `header/announcement-bar`). Config is fetched client-side from the
 * same public GET endpoint pattern the existing top-bar uses.
 *
 * Styling is Tailwind + a `announcement-marquee` keyframe defined in
 * globals.css (NOT styled-jsx — Turbopack didn't inject the scoped styles).
 * The item list is rendered twice and the track is translated by -50% for a
 * seamless infinite loop; hovering the scroller pauses it.
 */
function TickerItem({ item }: { item: AnnouncementBarItem }) {
  const text = (item.text || "").trim();
  if (!text) return null;
  if (item.url) {
    return (
      <Link
        href={item.url}
        className="inline-block py-2.5 font-semibold whitespace-nowrap text-inherit hover:underline"
      >
        {text}
      </Link>
    );
  }
  return (
    <span className="inline-block py-2.5 font-semibold whitespace-nowrap">
      {text}
    </span>
  );
}

function TickerSequence({
  items,
  ariaHidden,
}: {
  items: AnnouncementBarItem[];
  ariaHidden?: boolean;
}) {
  return (
    <div className="flex flex-nowrap items-center" aria-hidden={ariaHidden}>
      {items.map((item, i) => (
        <span
          key={i}
          className="inline-flex items-center whitespace-nowrap"
        >
          {/* Divider BEFORE each item so no trailing "|" dangles at the end of
              a loop; the leading divider of the next sequence separates loops. */}
          <span className="select-none px-[18px] opacity-[0.55]" aria-hidden>
            |
          </span>
          <TickerItem item={item} />
        </span>
      ))}
    </div>
  );
}

export const AnnouncementBar = () => {
  const [config, setConfig] = useState<AnnouncementBarConfig | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/header/announcement-bar");
        if (res.ok) {
          const data = (await res.json()) as AnnouncementBarConfig | null;
          if (active && data) setConfig(data);
        }
      } catch {
        // Network/parse failure → leave the bar hidden rather than guess.
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const items = (config?.items ?? []).filter((it) => (it.text || "").trim());

  // Render nothing until we have an enabled config with at least one item.
  if (!config || !config.enabled || items.length === 0) return null;

  const speed =
    Number.isFinite(config.speedSeconds) && config.speedSeconds > 0
      ? config.speedSeconds
      : DEFAULT_ANNOUNCEMENT_BAR.speedSeconds;
  const bg = config.backgroundColor || DEFAULT_ANNOUNCEMENT_BAR.backgroundColor;
  const fg = config.textColor || DEFAULT_ANNOUNCEMENT_BAR.textColor;
  const right = config.rightLink;
  const gear = config.settingsIcon;

  // One "half" of the marquee track: repeat the items enough times to comfortably
  // overfill the left half (50vw) on any screen, so it never shows a gap.
  const half = Array.from({ length: 4 }).flatMap(() => items);

  return (
    <div
      data-section="header-announcement-bar"
      className="relative z-50 flex w-full items-stretch overflow-hidden text-[13px] leading-none"
      style={{
        backgroundColor: bg,
        color: fg,
        // Full-bleed background + ticker on the left, but inset the right side
        // by the container gutter so the Zalo block lines up with the site
        // container's right edge (max-width 1360, centered) instead of the
        // viewport edge.
        paddingRight: "max(1rem, calc((100% - 1360px) / 2))",
      }}
      translate="no"
    >
      {/* The scrolling area only covers the LEFT HALF of the screen (left edge
          → centre); inside it a seamless marquee keeps the left half filled
          with repeating items, scrolling right→left. The right half is left
          empty (the spacer below). */}
      <div className="announcement-scroller w-[50vw] shrink-0 items-center overflow-hidden">
        <div
          className="announcement-marquee flex w-max flex-nowrap items-center"
          style={{ "--marquee-duration": `${speed}s` } as CSSProperties}
        >
          {/* Two identical halves (each repeats the items enough to overfill
              the left half); animating -50% loops seamlessly. */}
          <TickerSequence items={half} />
          <TickerSequence items={half} ariaHidden />
        </div>
      </div>
      {/* Empty right half. */}
      <div className="flex-1" />

      {(right?.enabled || gear?.enabled) && (
        <div className="z-[1] flex flex-none items-center gap-3.5 pl-4">
          {right?.enabled && (right.label || right.badge) && (
            <Link
              href={right.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-inherit"
            >
              {right.badge && (
                <span className="inline-flex items-center rounded-[3px] bg-white/90 px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-[#1d4ed8]">
                  {right.badge}
                </span>
              )}
              {right.label && (
                <span className="whitespace-nowrap font-semibold underline">
                  {right.label}
                </span>
              )}
            </Link>
          )}
          {gear?.enabled &&
            (gear.url ? (
              <Link
                href={gear.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-inherit opacity-[0.85]"
                aria-label="Settings"
              >
                <span className="material-symbols-rounded text-[18px]!">
                  settings
                </span>
              </Link>
            ) : (
              <span
                className="inline-flex items-center text-inherit opacity-[0.85]"
                aria-hidden
              >
                <span className="material-symbols-rounded text-[18px]!">
                  settings
                </span>
              </span>
            ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementBar;
