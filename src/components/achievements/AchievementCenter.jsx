import React, { useEffect } from "react";
import { toast } from "sonner";
import {
  IconCircleCheck,
  IconLock,
  IconTrophy,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const toastDurationMs = 3200;

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
      toast.dismiss(toastId);
    };
  }, [clearLatestUnlock, latestUnlock]);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={progressLabel}
            className="relative h-8 overflow-hidden border-slate-300 bg-white/95 px-2.5 text-slate-800 shadow-sm"
          >
            <IconTrophy className="size-4 text-emerald-600" aria-hidden="true" />
            <span className="text-xs font-semibold">{unlockedCount}/{totalCount}</span>
            <span
              data-achievement-progress-line
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-emerald-500 transition-transform"
              style={{ transform: `scaleX(${progressRatio})` }}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          role="dialog"
          aria-label="Achievements"
          className="w-[min(calc(100vw-1rem),22rem)] overflow-hidden rounded-lg border-slate-300 bg-white shadow-xl"
        >
          <div className="border-b border-slate-200 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-slate-950">Achievements</h2>
                <p className="text-xs text-slate-500">{unlockedCount} of {totalCount} unlocked</p>
              </div>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width]"
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
    </>
  );
}

function AchievementToastContent({ latestUnlock }) {
  return (
    <div
      role="status"
      className="w-[min(calc(100vw-2rem),20rem)] rounded-lg border border-emerald-200 bg-white p-3 text-slate-900 shadow-xl"
    >
      <div className="flex gap-2">
        <IconCircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-emerald-700">
            Achievement unlocked
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-950">
            {latestUnlock.achievement.name}
          </p>
          <p className="mt-0.5 text-xs leading-5 text-slate-600">
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
        "flex gap-2 rounded-md border p-2",
        unlocked
          ? "border-emerald-200 bg-emerald-50/70"
          : "border-slate-200 bg-slate-50/80",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
          unlocked ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500",
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-5 text-slate-950">
          {title}
        </span>
        <span className="block text-xs leading-5 text-slate-600">
          {detail}
        </span>
      </span>
    </li>
  );
}
