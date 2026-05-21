import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { achievementRegistry } from "./achievementRegistry";
import { AchievementCenter } from "./AchievementCenter";
import { useAchievements } from "./useAchievements";

const unlockedProgress = { unlocked: 0, total: achievementRegistry.length, ratio: 0 };

function renderAchievementCenter(props = {}) {
  const defaultProps = {
    achievements: achievementRegistry,
    progress: unlockedProgress,
    latestUnlock: null,
    isUnlocked: () => false,
    resetAchievements: vi.fn(),
    clearLatestUnlock: vi.fn(),
  };

  return render(<AchievementCenter {...defaultProps} {...props} />);
}

function AchievementCenterHarness() {
  const achievementsState = useAchievements();

  return (
    <>
      <button type="button" onClick={() => achievementsState.unlockAchievement("first-contact")}>
        Unlock first
      </button>
      <AchievementCenter {...achievementsState} />
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

test("progress button and hidden clues render", async () => {
  renderAchievementCenter();

  const trigger = screen.getByRole("button", { name: "Achievements 0/9" });
  expect(trigger).toHaveTextContent("0/9");
  expect(trigger.querySelector("[data-achievement-progress-line]")).toHaveClass("bg-emerald-500");

  await userEvent.click(trigger);

  const dialog = await screen.findByRole("dialog", { name: "Achievements" });
  expect(within(dialog).getByText("First Contact")).toBeInTheDocument();
  expect(within(dialog).getByText("Send a message to Jacques AI.")).toBeInTheDocument();
  expect(within(dialog).getAllByText("Hidden")).toHaveLength(2);
  expect(
    within(dialog).getByText("Let the assistant point to a specific part of a project."),
  ).toBeInTheDocument();
  expect(within(dialog).getByText("Find something outside the code.")).toBeInTheDocument();
});

test("locked hidden achievement real name is not shown before unlock", async () => {
  renderAchievementCenter();

  await userEvent.click(screen.getByRole("button", { name: "Achievements 0/9" }));

  const dialog = await screen.findByRole("dialog", { name: "Achievements" });
  expect(within(dialog).queryByText("Deep Link")).not.toBeInTheDocument();
  expect(within(dialog).queryByText("Outside the Code")).not.toBeInTheDocument();
});

test("toast appears after unlocking and reset works", async () => {
  vi.useFakeTimers();

  render(<AchievementCenterHarness />);

  await userEvent.click(screen.getByRole("button", { name: "Unlock first" }));

  const toast = await screen.findByRole("status");
  expect(toast).toHaveTextContent("Achievement unlocked");
  expect(toast).toHaveTextContent("First Contact");
  expect(toast).toHaveTextContent("Sent a message to Jacques AI.");
  expect(screen.getByRole("button", { name: "Achievements 1/9" })).toBeInTheDocument();

  await act(async () => {
    vi.advanceTimersByTime(3200);
  });

  expect(screen.queryByRole("status")).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: "Achievements 1/9" }));
  await userEvent.click(await screen.findByRole("button", { name: "Reset progress" }));

  expect(screen.getByRole("button", { name: "Achievements 0/9" })).toBeInTheDocument();
});
