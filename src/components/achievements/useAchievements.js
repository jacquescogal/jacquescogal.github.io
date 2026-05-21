import { useCallback, useMemo, useRef, useState } from "react";
import {
  ACHIEVEMENT_STORAGE_KEY,
  ACHIEVEMENT_STORAGE_VERSION,
  achievementRegistry,
  getAchievementById,
} from "./achievementRegistry";

const achievementIds = new Set(achievementRegistry.map(({ id }) => id));

const emptyUnlockedMap = () => ({});

const readStoredAchievements = () => {
  try {
    const rawValue = window.localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);

    if (!rawValue) {
      return emptyUnlockedMap();
    }

    const parsedValue = JSON.parse(rawValue);

    if (
      !parsedValue ||
      parsedValue.version !== ACHIEVEMENT_STORAGE_VERSION ||
      typeof parsedValue.unlocked !== "object" ||
      Array.isArray(parsedValue.unlocked)
    ) {
      return emptyUnlockedMap();
    }

    return Object.entries(parsedValue.unlocked).reduce(
      (validUnlocked, [id, timestamp]) => {
        if (achievementIds.has(id) && typeof timestamp === "string") {
          validUnlocked[id] = timestamp;
        }

        return validUnlocked;
      },
      {},
    );
  } catch {
    return emptyUnlockedMap();
  }
};

const persistUnlockedMap = (unlockedMap) => {
  try {
    window.localStorage.setItem(
      ACHIEVEMENT_STORAGE_KEY,
      JSON.stringify({
        version: ACHIEVEMENT_STORAGE_VERSION,
        unlocked: unlockedMap,
      }),
    );
  } catch {
    // Storage can be unavailable or full; keep the in-memory state useful.
  }
};

const removeStoredAchievements = () => {
  try {
    window.localStorage.removeItem(ACHIEVEMENT_STORAGE_KEY);
  } catch {
    // Storage can be unavailable; reset still clears the in-memory state.
  }
};

export const useAchievements = () => {
  const [unlockedMap, setUnlockedMap] = useState(readStoredAchievements);
  const unlockedMapRef = useRef(unlockedMap);
  const [latestUnlock, setLatestUnlock] = useState(null);

  const unlockedIds = useMemo(
    () =>
      achievementRegistry
        .map(({ id }) => id)
        .filter((id) => Boolean(unlockedMap[id])),
    [unlockedMap],
  );

  const progress = useMemo(() => {
    const total = achievementRegistry.length;
    const unlocked = unlockedIds.length;

    return {
      unlocked,
      total,
      ratio: total > 0 ? unlocked / total : 0,
    };
  }, [unlockedIds]);

  const isUnlocked = useCallback(
    (id) => Boolean(unlockedMap[id]),
    [unlockedMap],
  );

  const unlockAchievement = useCallback((id) => {
    const achievement = getAchievementById(id);

    if (!achievement) {
      return;
    }

    const currentUnlockedMap = unlockedMapRef.current;

    if (currentUnlockedMap[id]) {
      return;
    }

    const unlockedAt = new Date().toISOString();
    const nextUnlockedMap = {
      ...currentUnlockedMap,
      [id]: unlockedAt,
    };

    unlockedMapRef.current = nextUnlockedMap;
    persistUnlockedMap(nextUnlockedMap);
    setUnlockedMap(nextUnlockedMap);
    setLatestUnlock({
      achievement,
      unlockedAt,
    });
  }, []);

  const resetAchievements = useCallback(() => {
    const nextUnlockedMap = emptyUnlockedMap();

    removeStoredAchievements();
    unlockedMapRef.current = nextUnlockedMap;
    setUnlockedMap(nextUnlockedMap);
    setLatestUnlock(null);
  }, []);

  const clearLatestUnlock = useCallback(() => {
    setLatestUnlock(null);
  }, []);

  return {
    achievements: achievementRegistry,
    unlockedMap,
    unlockedIds,
    progress,
    latestUnlock,
    isUnlocked,
    unlockAchievement,
    resetAchievements,
    clearLatestUnlock,
  };
};
