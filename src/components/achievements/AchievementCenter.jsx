import React, { useEffect } from "react";
import { toast } from "sonner";
import { IconLock } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const toastDurationMs = 3200;

/**
 * The evidence log. Entries are logged as the visitor actually turns things
 * up; unlogged ones sit as empty dashed slots on the console.
 */
export function AchievementCenter({
  achievements,
  progress,
  latestUnlock,
  isUnlocked,
  clearLatestUnlock,
}) {
  const unlockedCount = progress?.unlocked ?? 0;
  const totalCount = progress?.total ?? achievements.length;
  const progressRatio = Math.max(0, Math.min(progress?.ratio ?? 0, 1));
  // The accessible name keeps the product's own term; "journey record" is the
  // world's visible wording, not a rename of the feature.
  const progressLabel = `Achievements ${unlockedCount}/${totalCount}`;

  useEffect(() => {
    if (!latestUnlock) {
      return undefined;
    }

    const toastId = `achievement-${latestUnlock.achievement.id}-${latestUnlock.unlockedAt}`;

    toast.custom(
      () => <AchievementToastContent latestUnlock={latestUnlock} />,
      {
        id: toastId,
        duration: toastDurationMs,
      },
    );

    const timeoutId = window.setTimeout(() => {
      clearLatestUnlock();
    }, toastDurationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [clearLatestUnlock, latestUnlock]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={progressLabel}
          className="relative overflow-hidden"
        >
          <span
            aria-hidden="true"
            className="flex h-3 w-3 items-center justify-center border-2 border-current"
          />
          <span className="font-console text-label font-semibold tabular tracking-normal">
            {unlockedCount}/{totalCount}
          </span>
          <span
            data-achievement-progress-line
            className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-amber transition-transform duration-500"
            style={{ transform: `scaleX(${progressRatio})` }}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        role="dialog"
        aria-label="Achievements"
        className="w-[min(calc(100vw-1rem),23rem)] overflow-hidden"
      >
        <div className="border-b border-amber/20 bg-panel-3 px-3.5 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-console text-data font-bold uppercase tracking-console text-bone">
              Evidence log
            </h2>
            <span className="font-console text-legend tabular uppercase tracking-console text-bone-faint">
              {unlockedCount}/{totalCount} logged
            </span>
          </div>
          <div className="mt-2.5 h-[4px] overflow-hidden bg-void-deep">
            <div
              className="h-full bg-amber transition-[width] duration-500"
              style={{ width: `${progressRatio * 100}%` }}
            />
          </div>
        </div>

        <div className="max-h-[min(70vh,27rem)] overflow-y-auto p-2">
          <ul className="space-y-1.5">
            {achievements.map((achievement) => (
              <AchievementRow
                key={achievement.id}
                achievement={achievement}
                unlocked={isUnlocked(achievement.id)}
              />
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AchievementToastContent({ latestUnlock }) {
  return (
    <div
      role="status"
      className="w-[min(calc(100vw-2rem),21rem)] overflow-hidden rounded-unit border border-amber/30 bg-panel-2 shadow-lift"
    >
      <div className="flex items-center justify-between gap-2 border-b border-amber/20 bg-panel-3 px-3 py-1.5">
        {/* The live region still announces plainly what happened; the stamp is
            the world's way of showing it, not a replacement for saying it. */}
        <span className="font-console text-micro font-bold uppercase tracking-console-wide text-bone-soft">
          Achievement unlocked
        </span>
        <span className="seal animate-reticle-snap px-1.5 text-micro font-bold text-amber">
          Logged
        </span>
      </div>
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-7 shrink-0 items-center justify-center border border-amber/40 bg-amber/15 text-amber"
        >
          <latestUnlock.achievement.icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="font-console text-caption font-bold uppercase tracking-console text-bone">
            {latestUnlock.achievement.name}
          </p>
          <p className="mt-1.5 font-read text-body leading-5 text-bone-soft">
            {latestUnlock.achievement.flavourText}
          </p>
        </div>
      </div>
    </div>
  );
}

function AchievementRow({ achievement, unlocked }) {
  const hiddenLocked = achievement.hidden && !unlocked;
  const Icon = hiddenLocked ? IconLock : achievement.icon;
  const title = hiddenLocked ? "Hidden" : achievement.name;
  const detail = unlocked ? achievement.flavourText : achievement.lockedHint;

  return (
    <li
      className={cn(
        "flex gap-2.5 rounded-unit border p-2.5",
        unlocked
          ? "border-amber/50 bg-amber/10"
          : "border-dashed border-bone-faint/40 bg-transparent",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center border",
          unlocked
            ? "border-amber/40 bg-amber/15 text-amber"
            : "border-bone-faint/30 bg-void-deep text-bone-faint",
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block font-console text-label font-bold uppercase tracking-console",
            unlocked ? "text-bone" : "text-bone-soft",
          )}
        >
          {title}
        </span>
        <span className="mt-1 block font-read text-caption leading-5 text-bone-faint">
          {detail}
        </span>
      </span>
      {unlocked && (
        <span
          aria-hidden="true"
          className="mt-1 shrink-0 self-start font-console text-micro font-bold uppercase tracking-console-wide text-amber"
        >
          ✓
        </span>
      )}
    </li>
  );
}
