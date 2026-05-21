import React, { StrictMode } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  ACHIEVEMENT_STORAGE_KEY,
  achievementRegistry,
} from "./achievementRegistry";
import { useAchievements } from "./useAchievements";

const firstAchievementId = achievementRegistry[0].id;
const secondAchievementId = achievementRegistry[1].id;

const strictModeWrapper = ({ children }) => <StrictMode>{children}</StrictMode>;

beforeEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("unlocks and persists once, repeated unlock keeps timestamp", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-21T02:03:04.000Z"));

  const { result } = renderHook(() => useAchievements());

  act(() => {
    result.current.unlockAchievement(firstAchievementId);
  });

  const firstTimestamp = result.current.unlockedMap[firstAchievementId];

  expect(firstTimestamp).toBe("2026-05-21T02:03:04.000Z");
  expect(result.current.latestUnlock).toEqual({
    achievement: achievementRegistry[0],
    unlockedAt: firstTimestamp,
  });
  expect(JSON.parse(localStorage.getItem(ACHIEVEMENT_STORAGE_KEY))).toEqual({
    version: 1,
    unlocked: {
      [firstAchievementId]: firstTimestamp,
    },
  });

  vi.setSystemTime(new Date("2026-05-22T02:03:04.000Z"));

  act(() => {
    result.current.clearLatestUnlock();
    result.current.unlockAchievement(firstAchievementId);
  });

  expect(result.current.unlockedMap[firstAchievementId]).toBe(firstTimestamp);
  expect(result.current.latestUnlock).toBeNull();
  expect(JSON.parse(localStorage.getItem(ACHIEVEMENT_STORAGE_KEY))).toEqual({
    version: 1,
    unlocked: {
      [firstAchievementId]: firstTimestamp,
    },
  });
});

test("keeps unlock idempotent under StrictMode updater checks", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-21T02:03:04.000Z"));
  const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

  const { result } = renderHook(() => useAchievements(), {
    wrapper: strictModeWrapper,
  });

  act(() => {
    result.current.unlockAchievement(firstAchievementId);
  });

  const firstTimestamp = result.current.unlockedMap[firstAchievementId];

  expect(firstTimestamp).toBe("2026-05-21T02:03:04.000Z");
  expect(setItemSpy).toHaveBeenCalledTimes(1);
  expect(result.current.latestUnlock).toEqual({
    achievement: achievementRegistry[0],
    unlockedAt: firstTimestamp,
  });

  vi.setSystemTime(new Date("2026-05-22T02:03:04.000Z"));

  act(() => {
    result.current.clearLatestUnlock();
    result.current.unlockAchievement(firstAchievementId);
  });

  expect(result.current.unlockedMap[firstAchievementId]).toBe(firstTimestamp);
  expect(result.current.latestUnlock).toBeNull();
  expect(setItemSpy).toHaveBeenCalledTimes(1);
});

test("ignores unknown achievement ids and localStorage stays null", () => {
  const { result } = renderHook(() => useAchievements());

  act(() => {
    result.current.unlockAchievement("not-a-real-achievement");
  });

  expect(result.current.unlockedMap).toEqual({});
  expect(result.current.unlockedIds).toEqual([]);
  expect(result.current.latestUnlock).toBeNull();
  expect(localStorage.getItem(ACHIEVEMENT_STORAGE_KEY)).toBeNull();
});

test("reset clears state and storage", () => {
  const { result } = renderHook(() => useAchievements());

  act(() => {
    result.current.unlockAchievement(firstAchievementId);
    result.current.unlockAchievement(secondAchievementId);
  });

  expect(result.current.unlockedIds).toEqual([
    firstAchievementId,
    secondAchievementId,
  ]);
  expect(localStorage.getItem(ACHIEVEMENT_STORAGE_KEY)).not.toBeNull();

  act(() => {
    result.current.resetAchievements();
  });

  expect(result.current.unlockedMap).toEqual({});
  expect(result.current.unlockedIds).toEqual([]);
  expect(result.current.latestUnlock).toBeNull();
  expect(localStorage.getItem(ACHIEVEMENT_STORAGE_KEY)).toBeNull();
});

test("malformed localStorage returns empty state and progress total equals registry length", () => {
  localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, "{bad-json");

  const { result } = renderHook(() => useAchievements());

  expect(result.current.unlockedMap).toEqual({});
  expect(result.current.unlockedIds).toEqual([]);
  expect(result.current.progress).toEqual({
    unlocked: 0,
    total: achievementRegistry.length,
    ratio: 0,
  });
});

test("reads valid storage, ignores unknown ids, and orders unlocked ids by registry", () => {
  localStorage.setItem(
    ACHIEVEMENT_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      unlocked: {
        [secondAchievementId]: "2026-05-22T02:03:04.000Z",
        "not-a-real-achievement": "2026-05-23T02:03:04.000Z",
        [firstAchievementId]: "2026-05-21T02:03:04.000Z",
      },
    }),
  );

  const { result } = renderHook(() => useAchievements());

  expect(result.current.unlockedIds).toEqual([
    firstAchievementId,
    secondAchievementId,
  ]);
  expect(result.current.isUnlocked(firstAchievementId)).toBe(true);
  expect(result.current.isUnlocked("not-a-real-achievement")).toBe(false);
  expect(result.current.progress).toEqual({
    unlocked: 2,
    total: achievementRegistry.length,
    ratio: 2 / achievementRegistry.length,
  });
});

test("fails quietly when localStorage operations throw and keeps in-memory state usable", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("storage read failed");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("storage write failed");
  });
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
    throw new Error("storage remove failed");
  });

  const { result } = renderHook(() => useAchievements());

  expect(result.current.unlockedMap).toEqual({});

  expect(() => {
    act(() => {
      result.current.unlockAchievement(firstAchievementId);
    });
  }).not.toThrow();

  expect(result.current.isUnlocked(firstAchievementId)).toBe(true);
  expect(result.current.unlockedIds).toEqual([firstAchievementId]);
  expect(result.current.latestUnlock).toEqual({
    achievement: achievementRegistry[0],
    unlockedAt: result.current.unlockedMap[firstAchievementId],
  });

  expect(() => {
    act(() => {
      result.current.resetAchievements();
    });
  }).not.toThrow();

  expect(result.current.unlockedMap).toEqual({});
  expect(result.current.unlockedIds).toEqual([]);
  expect(result.current.latestUnlock).toBeNull();
});
