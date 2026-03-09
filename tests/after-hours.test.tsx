import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AfterHoursGame } from "@/components/minigame/AfterHoursGame";
import {
  START_SAFE_WINDOW_MS,
  WARNING_WINDOW_MS,
  createInitialMiniGameRuntime,
  getCurrentGlareState,
  getMiniGameLevel,
} from "@/lib/minigame";

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "requestAnimationFrame",
    ((callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(Date.now()), 16)) as typeof requestAnimationFrame,
  );
  vi.stubGlobal(
    "cancelAnimationFrame",
    ((handle: number) => window.clearTimeout(handle)) as typeof cancelAnimationFrame,
  );
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("after hours minigame", () => {
  it("shows score, file, and dash stats in the HUD", () => {
    render(<AfterHoursGame />);

    expect(readStat("Score")).toBe("0");
    expect(readStat("Files")).toBe("0/3");
    expect(readStat("Dash")).toBe("Ready");
  });

  it("lets you switch to level two from the level picker", () => {
    render(<AfterHoursGame />);

    expect(screen.getByRole("button", { name: /level 1 office floor/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /level 2 archive row/i }));

    expect(screen.getAllByText(/archive row/i).length).toBeGreaterThan(0);
    expect(readStat("Files")).toBe("0/3");
  });

  it("shows the dash button and updates dash cooldown after use", async () => {
    render(<AfterHoursGame />);

    fireEvent.click(screen.getByRole("button", { name: /start hiding/i }));
    fireEvent.pointerDown(screen.getByRole("button", { name: /^dash$/i }));

    await act(async () => {
      vi.advanceTimersByTime(32);
    });

    expect(readStat("Dash")).not.toBe("Ready");
  });

  it("offers a next-level button after clearing level one", async () => {
    const level = getMiniGameLevel("level-1");
    const finalPickup = level.pickups[2];

    render(
      <AfterHoursGame
        initialRuntimeFactory={() => {
          const runtime = createInitialMiniGameRuntime("level-1", {
            x: finalPickup.x,
            y: finalPickup.y,
          });

          return {
            ...runtime,
            mode: "playing",
            elapsedMs: 4_800,
            score: 200,
            collectedPickupIds: level.pickups.slice(0, 2).map((pickup) => pickup.id),
          };
        }}
      />,
    );

    await act(async () => {
      vi.advanceTimersByTime(32);
    });

    expect(screen.getByRole("button", { name: /play level 2/i })).toBeInTheDocument();
  });

  it("distinguishes timeout losses", async () => {
    const level = getMiniGameLevel("level-1");

    render(
      <AfterHoursGame
        initialRuntimeFactory={() => ({
          ...createInitialMiniGameRuntime("level-1"),
          mode: "playing",
          elapsedMs: level.durationMs - 24,
        })}
      />,
    );

    await act(async () => {
      vi.advanceTimersByTime(48);
    });

    expect(screen.getByText(/time ran out/i)).toBeInTheDocument();
  });

  it("distinguishes spotted losses", async () => {
    const glareState = getCurrentGlareState(
      START_SAFE_WINDOW_MS + WARNING_WINDOW_MS + 16,
      "level-1",
    );

    if (glareState.phase !== "active" || !glareState.beam) {
      throw new Error("Expected an active glare beam.");
    }

    const beam = glareState.beam;
    const x = (beam.sourceX + beam.targetX) / 2 - 4;
    const y = (beam.sourceY + beam.targetY) / 2 - 5;

    render(
      <AfterHoursGame
        initialRuntimeFactory={() => {
          const runtime = createInitialMiniGameRuntime("level-1", {
            x,
            y,
          });

          return {
            ...runtime,
            mode: "playing",
            elapsedMs: START_SAFE_WINDOW_MS + WARNING_WINDOW_MS,
            hits: 2,
            exposureMs: 210,
            hideMsRemaining: 0,
            player: {
              ...runtime.player,
              x,
              y,
              isInCover: false,
            },
          };
        }}
      />,
    );

    await act(async () => {
      vi.advanceTimersByTime(48);
    });

    expect(screen.getByText(/the client saw you/i)).toBeInTheDocument();
  });
});

function readStat(label: string) {
  const labelNode = screen.getAllByText(label).find((node) =>
    node.parentElement?.className.includes("pixel-stat"),
  );

  if (!labelNode) {
    throw new Error(`Missing stat label for ${label}.`);
  }

  const container = labelNode.parentElement;

  if (!container) {
    throw new Error(`Missing stat container for ${label}.`);
  }

  return within(container).getAllByText(/.+/)[1]?.textContent ?? "";
}
