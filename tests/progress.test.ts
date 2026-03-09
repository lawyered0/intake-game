import { afterEach, describe, expect, it } from "vitest";
import {
  DAY_COMPLETIONS_KEY,
  getDayCompletion,
  readDayCompletions,
  saveDayCompletion,
} from "@/lib/progress";

afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe("progress storage", () => {
  it("stores day completions in local storage", () => {
    saveDayCompletion("day-1", { grade: "A", score: 30, completedAt: 100 });

    expect(getDayCompletion("day-1")).toMatchObject({
      bestGrade: "A",
      bestScore: 30,
      lastGrade: "A",
      lastScore: 30,
      attempts: 1,
      completedAt: 100,
      lastPlayedAt: 100,
    });
  });

  it("migrates legacy session progress into local storage once", () => {
    window.sessionStorage.setItem(
      DAY_COMPLETIONS_KEY,
      JSON.stringify({
        "day-1": {
          grade: "B",
          score: 18,
          completedAt: 50,
        },
      }),
    );

    const completions = readDayCompletions();

    expect(completions["day-1"]).toMatchObject({
      bestGrade: "B",
      bestScore: 18,
      attempts: 1,
    });
    expect(window.localStorage.getItem(DAY_COMPLETIONS_KEY)).toContain('"bestGrade":"B"');
  });

  it("keeps the best score when a later run is worse", () => {
    saveDayCompletion("day-1", { grade: "A", score: 30, completedAt: 100 });
    const result = saveDayCompletion("day-1", {
      grade: "C",
      score: 12,
      completedAt: 200,
    });

    expect(result.isNewBest).toBe(false);
    expect(getDayCompletion("day-1")).toMatchObject({
      bestGrade: "A",
      bestScore: 30,
      lastGrade: "C",
      lastScore: 12,
      attempts: 2,
      completedAt: 100,
      lastPlayedAt: 200,
    });
  });
});
