import { afterEach, describe, expect, it } from "vitest";
import {
  SCENARIO_COMPLETIONS_KEY,
  getScenarioCompletion,
  readScenarioCompletions,
  saveScenarioCompletion,
} from "@/lib/negotiation-progress";

afterEach(() => {
  window.localStorage.clear();
});

describe("negotiation progress storage", () => {
  it("stores a scenario completion in localStorage", () => {
    saveScenarioCompletion("startup-acquisition", {
      grade: "B+",
      score: 76,
      completedAt: 1000,
    });

    expect(getScenarioCompletion("startup-acquisition")).toMatchObject({
      bestGrade: "B+",
      bestScore: 76,
      lastGrade: "B+",
      lastScore: 76,
      attempts: 1,
      completedAt: 1000,
      lastPlayedAt: 1000,
    });
  });

  it("keeps the best score when a later run is worse", () => {
    saveScenarioCompletion("startup-acquisition", {
      grade: "A",
      score: 85,
      completedAt: 100,
    });
    const { isNewBest } = saveScenarioCompletion("startup-acquisition", {
      grade: "C",
      score: 55,
      completedAt: 200,
    });

    expect(isNewBest).toBe(false);
    expect(getScenarioCompletion("startup-acquisition")).toMatchObject({
      bestGrade: "A",
      bestScore: 85,
      lastGrade: "C",
      lastScore: 55,
      attempts: 2,
      completedAt: 100,
      lastPlayedAt: 200,
    });
  });

  it("updates best score when a later run is better", () => {
    saveScenarioCompletion("startup-acquisition", {
      grade: "C",
      score: 55,
      completedAt: 100,
    });
    const { isNewBest } = saveScenarioCompletion("startup-acquisition", {
      grade: "A",
      score: 88,
      completedAt: 200,
    });

    expect(isNewBest).toBe(true);
    expect(getScenarioCompletion("startup-acquisition")).toMatchObject({
      bestGrade: "A",
      bestScore: 88,
      lastGrade: "A",
      lastScore: 88,
      attempts: 2,
      completedAt: 200,
      lastPlayedAt: 200,
    });
  });

  it("tracks multiple scenarios independently", () => {
    saveScenarioCompletion("startup-acquisition", { grade: "A", score: 90, completedAt: 100 });
    saveScenarioCompletion("commercial-lease", { grade: "B", score: 72, completedAt: 200 });

    const completions = readScenarioCompletions();
    expect(Object.keys(completions)).toHaveLength(2);
    expect(completions["startup-acquisition"]?.bestScore).toBe(90);
    expect(completions["commercial-lease"]?.bestScore).toBe(72);
  });

  it("returns null for a scenario that has never been completed", () => {
    expect(getScenarioCompletion("never-played")).toBeNull();
  });

  it("handles corrupted localStorage gracefully", () => {
    window.localStorage.setItem(SCENARIO_COMPLETIONS_KEY, "not valid json{{{");
    expect(readScenarioCompletions()).toEqual({});
  });
});
