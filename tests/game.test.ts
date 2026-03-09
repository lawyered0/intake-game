import { describe, expect, it } from "vitest";
import { getIntakeDay } from "@/lib/intake-data";
import {
  ACTION_LABELS,
  applyDecision,
  calculateGrade,
  createInitialGameState,
  getActionBiasInsight,
  getBestAction,
  getLawyeredGuidance,
  getRiskPatternInsight,
  getScreeningStyle,
  startDay,
} from "@/lib/game";

const loadedDayOne = getIntakeDay("day-1");
const loadedDayTwo = getIntakeDay("day-2");
const loadedDayThree = getIntakeDay("day-3");

describe("game engine", () => {
  it("calculates grades from score thresholds", () => {
    expect(calculateGrade(30)).toBe("A");
    expect(calculateGrade(18)).toBe("B");
    expect(calculateGrade(12)).toBe("C");
    expect(calculateGrade(6)).toBe("D");
    expect(calculateGrade(5)).toBe("F");
  });

  it("applies a decision and updates the core counters", () => {
    let state = createInitialGameState(loadedDayOne);
    state = startDay(state);
    state = applyDecision(loadedDayOne, state, "accept");

    expect(state.screen).toBe("reveal");
    expect(state.score).toBe(3);
    expect(state.correctCalls).toBe(1);
    expect(state.decisionHistory).toHaveLength(1);
    expect(state.decisionHistory[0]?.bestAction).toBe("accept");
    expect(state.decisionHistory[0]?.scoreAfter).toBe(3);
  });

  it("classifies a trusting playstyle when risky accepts dominate", () => {
    let state = createInitialGameState(loadedDayOne);
    state = startDay(state);

    const acceptingState = loadedDayOne.cases.reduce((currentState) => {
      const decided = applyDecision(loadedDayOne, currentState, "accept");
      return {
        ...decided,
        currentCaseIndex: currentState.currentCaseIndex + 1,
        screen: "case" as const,
      };
    }, state);

    expect(getScreeningStyle(acceptingState).label).toBe("Too Trusting");
    expect(getActionBiasInsight(acceptingState)).toMatch(/leaned accept/i);
    expect(getRiskPatternInsight(acceptingState)).toMatch(/missed/i);
  });

  it("exposes a unique best action for every authored case", () => {
    const bestActions = loadedDayOne.cases.map(getBestAction);

    expect(bestActions).toContain("accept");
    expect(bestActions).toContain("decline");
    expect(bestActions).toContain("request_info");
    expect(
      loadedDayOne.cases.every((intakeCase) =>
        Object.keys(intakeCase.outcomes).every((action) => action in ACTION_LABELS),
      ),
    ).toBe(true);
  });

  it("generates case-specific Lawyered coaching in professional language", () => {
    const firstGuidance = getLawyeredGuidance(loadedDayOne.cases[0]);
    const secondGuidance = getLawyeredGuidance(loadedDayTwo.cases[5]);
    const thirdGuidance = getLawyeredGuidance(loadedDayThree.cases[7]);

    expect(firstGuidance.note).not.toBe(secondGuidance.note);
    expect(secondGuidance.note).not.toBe(thirdGuidance.note);
    expect(firstGuidance.note.toLowerCase()).not.toContain("gullible");
    expect(secondGuidance.doNotAssume.toLowerCase()).not.toContain("weapon");
    expect(thirdGuidance.pressureTest.toLowerCase()).toMatch(/record|advice|history/);
    expect(firstGuidance.lens).toMatch(/timing|readiness|step/i);
    expect(secondGuidance.lens).toMatch(/client objective|conduct|relationship/i);
    expect(thirdGuidance.lens).toMatch(/source record|missing/i);
  });

  it("keeps guidance distinct for multiple cases sharing the same risk tag", () => {
    const marisolGuidance = getLawyeredGuidance(loadedDayOne.cases[0]);
    const niaGuidance = getLawyeredGuidance(loadedDayOne.cases[2]);
    const ericaGuidance = getLawyeredGuidance(loadedDayTwo.cases[0]);

    expect(marisolGuidance.note).not.toBe(niaGuidance.note);
    expect(niaGuidance.note).not.toBe(ericaGuidance.note);
    expect(new Set([marisolGuidance.pressureTest, niaGuidance.pressureTest, ericaGuidance.pressureTest]).size).toBe(3);
  });
});
