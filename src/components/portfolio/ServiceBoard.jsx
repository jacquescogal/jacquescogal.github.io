import React from "react";
import { cn } from "@/lib/utils";

/**
 * The console readout. Amber phosphor behind filter glass at a real scanline
 * pitch. Used on the console's mission-progress strip and inside the assistant,
 * where the board reports its own processing stages.
 */

const STATUS_LAMP = {
  good: "bg-amber",
  delayed: "bg-amber-dim animate-lamp-pulse",
  suspended: "bg-blood animate-lamp-pulse",
  idle: "bg-bone-faint",
};

export const BoardShell = ({ title, meta, children, className, bodyClassName }) => (
  <div className={cn("overflow-hidden rounded-unit border border-amber/20", className)}>
    <div className="flex items-baseline justify-between gap-3 border-b border-amber/15 bg-panel-3 px-3 py-1.5">
      <span className="con-label-wide text-legend text-bone-soft">{title}</span>
      {meta && <span className="font-console text-legend text-bone-faint">{meta}</span>}
    </div>
    <div className={cn("crt px-3 py-2.5", bodyClassName)}>{children}</div>
  </div>
);

export const BoardRow = ({ label, value, status = "idle", emphasis = false, lampProps }) => (
  <div className="flex items-center gap-2.5 py-[3px]">
    {/* Explicit h-/w- rather than size-, so a utility of equal specificity
        cannot silently win over the lamp's dimensions. */}
    <span
      aria-hidden="true"
      className={cn("h-2 w-2 shrink-0", STATUS_LAMP[status] || STATUS_LAMP.idle)}
      {...lampProps}
    />
    <span
      className={cn(
        "phosphor min-w-0 flex-1 truncate text-label uppercase tracking-console",
        emphasis ? "font-semibold" : "font-normal opacity-85"
      )}
    >
      {label}
    </span>
    {value !== undefined && value !== null && (
      <span className="phosphor tabular shrink-0 text-label font-semibold">{value}</span>
    )}
  </div>
);

/**
 * Mission progress, on one line at the console's foot.
 *
 * One lit cell per achievement, in registry order, so the count and the shape
 * of what is left both read at a glance. This replaced a row of backend feed
 * counts: the record totals were true but inert — a visitor learns nothing
 * from "source archive 6" that the projects grid does not already show. What
 * belongs on the console's own readout is the visitor's state in the room.
 *
 * Nothing here is asserted: cells come straight from the unlock map, so an
 * untouched visit reads honestly as zero.
 */
export const MissionProgress = ({ unlocked, total, className }) => {
  const safeTotal = Math.max(total, 0);
  const safeUnlocked = Math.min(Math.max(unlocked, 0), safeTotal);

  return (
    <div
      role="status"
      aria-label={`Mission progress: ${safeUnlocked} of ${safeTotal} logged`}
      className={cn(
        "crt flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-amber/20 px-4 py-2.5 sm:px-8",
        className
      )}
    >
      <span className="phosphor text-legend uppercase tracking-console-wide opacity-80">
        Mission progress
      </span>

      {/* The cells come up to power left to right, 40ms apart, once. A meter
          that simply appears reads as a static graphic; one that strikes reads
          as an instrument being switched on. */}
      <span aria-hidden="true" className="flex items-center gap-[3px]">
        {Array.from({ length: safeTotal }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-2.5 w-3 shrink-0 origin-bottom animate-cell-strike border",
              index < safeUnlocked
                ? "border-amber bg-amber"
                : "border-amber/25 bg-transparent"
            )}
            style={{ animationDelay: `${index * 40}ms` }}
          />
        ))}
      </span>

      <span className="phosphor tabular text-legend font-semibold uppercase tracking-console">
        {safeUnlocked}/{safeTotal}
      </span>
    </div>
  );
};
