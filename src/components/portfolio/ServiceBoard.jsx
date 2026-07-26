import React from "react";
import { cn } from "@/lib/utils";

/**
 * The console readout. Amber phosphor behind filter glass at a real scanline
 * pitch. Used twice in the system: once on the console reporting feed
 * diagnostics, once inside the assistant reporting its own processing stages.
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
      <span className="con-label-wide text-[0.55rem] text-bone-soft">{title}</span>
      {meta && <span className="font-console text-[0.55rem] text-bone-faint">{meta}</span>}
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
        "phosphor min-w-0 flex-1 truncate text-[0.6rem] uppercase tracking-console",
        emphasis ? "font-semibold" : "font-normal opacity-85"
      )}
    >
      {label}
    </span>
    {value !== undefined && value !== null && (
      <span className="phosphor tabular shrink-0 text-[0.6rem] font-semibold">{value}</span>
    )}
  </div>
);

/**
 * Feed diagnostics. Every row reports something the frontend actually knows:
 * whether a backend feed answered, and how much it returned. A cold start is
 * degraded; a failed feed is offline. Nothing is invented, and nothing hides
 * behind a spinner.
 */
const ServiceBoard = ({ feeds, className }) => {
  const allGood = feeds.every((feed) => feed.status === "good");
  const anyDown = feeds.some((feed) => feed.status === "suspended");

  const summary = anyDown
    ? "Feed offline"
    : allGood
      ? "All feeds nominal"
      : "Acquiring";

  return (
    <BoardShell title="Feed diagnostics" meta={summary} className={className}>
      <div role="status" aria-label={`Feed diagnostics: ${summary}`}>
        {feeds.map((feed) => (
          <BoardRow
            key={feed.label}
            label={feed.label}
            value={feed.value}
            status={feed.status}
            emphasis={feed.status !== "good"}
          />
        ))}
      </div>
    </BoardShell>
  );
};

export default ServiceBoard;
