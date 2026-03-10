import { describe, expect, it } from "vitest";
import { getScenario } from "@/lib/negotiation-data";
import {
  advanceAfterFeedback,
  applyChoice,
  calculateGrade,
  calculateWeightedScore,
  createInitialNegotiationState,
  getCurrentNode,
  getKeyMoments,
  getNegotiationStyle,
  getOutcomeNarrative,
  startNegotiation,
} from "@/lib/negotiation-game";
import type { ChoiceRecord, Meters } from "@/types/negotiation";

const startup = getScenario("startup-acquisition");
const lease = getScenario("commercial-lease");
const settlement = getScenario("settlement-conference");

describe("negotiation game engine", () => {
  it("creates an initial state in briefing screen", () => {
    const state = createInitialNegotiationState(startup);

    expect(state.screen).toBe("briefing");
    expect(state.scenarioId).toBe(startup.id);
    expect(state.currentNodeId).toBe(startup.startNodeId);
    expect(state.meters).toEqual(startup.initialMeters);
    expect(state.choiceHistory).toHaveLength(0);
    expect(state.currentRound).toBe(1);
  });

  it("transitions from briefing to round", () => {
    const initial = createInitialNegotiationState(startup);
    const started = startNegotiation(initial);

    expect(started.screen).toBe("round");
    expect(started.currentNodeId).toBe(initial.currentNodeId);
  });

  it("resolves the current node from scenario", () => {
    const state = startNegotiation(createInitialNegotiationState(startup));
    const node = getCurrentNode(startup, state);

    expect(node).toBeTruthy();
    expect(node!.id).toBe(startup.startNodeId);
    expect(node!.options.length).toBeGreaterThanOrEqual(2);
  });

  it("applies a choice and transitions to feedback", () => {
    let state = startNegotiation(createInitialNegotiationState(startup));
    const node = getCurrentNode(startup, state)!;
    const firstOption = node.options[0];

    state = applyChoice(startup, state, firstOption.id);

    expect(state.screen).toBe("feedback");
    expect(state.choiceHistory).toHaveLength(1);
    expect(state.choiceHistory[0].optionId).toBe(firstOption.id);
    expect(state.choiceHistory[0].optionLabel).toBe(firstOption.label);
    expect(state.choiceHistory[0].nodeId).toBe(node.id);
  });

  it("clamps meters between 0 and 100", () => {
    const meters: Meters = {
      dealValue: 95,
      riskExposure: 5,
      relationship: 50,
      clientSatisfaction: 50,
    };

    // Simulate extreme effects
    const state = startNegotiation(
      createInitialNegotiationState({
        ...startup,
        initialMeters: meters,
      }),
    );

    // Pick an option — regardless of effects, values should be clamped
    const node = getCurrentNode(startup, state)!;
    const afterChoice = applyChoice(startup, state, node.options[0].id);

    for (const key of ["dealValue", "riskExposure", "relationship", "clientSatisfaction"] as const) {
      expect(afterChoice.meters[key]).toBeGreaterThanOrEqual(0);
      expect(afterChoice.meters[key]).toBeLessThanOrEqual(100);
    }
  });

  it("advances from feedback to the next round", () => {
    let state = startNegotiation(createInitialNegotiationState(startup));
    const node = getCurrentNode(startup, state)!;
    state = applyChoice(startup, state, node.options[0].id);
    state = advanceAfterFeedback(startup, state);

    expect(["round", "scorecard"]).toContain(state.screen);
    if (state.screen === "round") {
      expect(state.currentNodeId).not.toBe(startup.startNodeId);
    }
  });

  it("plays through startup scenario to the scorecard", () => {
    let state = startNegotiation(createInitialNegotiationState(startup));

    for (let i = 0; i < 20; i++) {
      if (state.screen === "scorecard") break;

      const node = getCurrentNode(startup, state);
      if (!node || node.isTerminal) break;

      state = applyChoice(startup, state, node.options[0].id);
      state = advanceAfterFeedback(startup, state);
    }

    expect(state.screen).toBe("scorecard");
    expect(state.choiceHistory.length).toBeGreaterThanOrEqual(3);
  });

  it("plays through all three scenarios to completion", () => {
    for (const scenario of [startup, lease, settlement]) {
      let state = startNegotiation(createInitialNegotiationState(scenario));

      for (let i = 0; i < 30; i++) {
        if (state.screen === "scorecard") break;
        const node = getCurrentNode(scenario, state);
        if (!node || node.isTerminal) break;
        state = applyChoice(scenario, state, node.options[0].id);
        state = advanceAfterFeedback(scenario, state);
      }

      expect(state.screen).toBe("scorecard");
    }
  });

  it("throws when applying a choice with an invalid option id", () => {
    const state = startNegotiation(createInitialNegotiationState(startup));
    expect(() => applyChoice(startup, state, "fake-option")).toThrow(/not found/);
  });
});

describe("scoring and grading", () => {
  it("calculates the weighted score formula correctly", () => {
    const meters: Meters = {
      dealValue: 80,
      riskExposure: 20,
      relationship: 70,
      clientSatisfaction: 60,
    };
    // 80*0.35 + (100-20)*0.25 + 70*0.15 + 60*0.25
    // = 28 + 20 + 10.5 + 15 = 73.5 → 74
    expect(calculateWeightedScore(meters)).toBe(74);
  });

  it("assigns correct grade thresholds", () => {
    const make = (dealValue: number): Meters => ({
      dealValue,
      riskExposure: 0,
      relationship: 100,
      clientSatisfaction: 100,
    });

    // Perfect meters: 100*0.35 + 100*0.25 + 100*0.15 + 100*0.25 = 100 → A+
    expect(calculateGrade(make(100))).toBe("A+");

    // Low everything
    const low: Meters = {
      dealValue: 10,
      riskExposure: 90,
      relationship: 10,
      clientSatisfaction: 10,
    };
    // 10*0.35 + 10*0.25 + 10*0.15 + 10*0.25 = 10 → F
    expect(calculateGrade(low)).toBe("F");
  });
});

describe("analysis helpers", () => {
  it("detects Competitive style from aggressive tags", () => {
    const history: ChoiceRecord[] = [
      makeMockRecord(["aggressive", "anchoring"]),
      makeMockRecord(["competitive"]),
      makeMockRecord(["collaborative"]),
    ];
    expect(getNegotiationStyle(history)).toBe("Competitive");
  });

  it("detects Collaborative style from collaborative tags", () => {
    const history: ChoiceRecord[] = [
      makeMockRecord(["collaborative"]),
      makeMockRecord(["creative", "logrolling"]),
    ];
    expect(getNegotiationStyle(history)).toBe("Collaborative");
  });

  it("defaults to Compromising when no tags present", () => {
    expect(getNegotiationStyle([])).toBe("Compromising");
  });

  it("identifies key moments with large meter effects", () => {
    const small = makeMockRecord([], {
      dealValue: 5,
      riskExposure: 0,
      relationship: 5,
      clientSatisfaction: 0,
    });
    const big = makeMockRecord([], {
      dealValue: 15,
      riskExposure: -10,
      relationship: 5,
      clientSatisfaction: -5,
    });

    const moments = getKeyMoments([small, big]);
    expect(moments).toHaveLength(1);
    expect(moments[0]).toBe(big);
  });

  it("returns the outcome narrative from the terminal node", () => {
    let state = startNegotiation(createInitialNegotiationState(startup));

    for (let i = 0; i < 20; i++) {
      if (state.screen === "scorecard") break;
      const node = getCurrentNode(startup, state);
      if (!node || node.isTerminal) break;
      state = applyChoice(startup, state, node.options[0].id);
      state = advanceAfterFeedback(startup, state);
    }

    const narrative = getOutcomeNarrative(startup, state);
    expect(narrative.length).toBeGreaterThan(10);
  });
});

// ── Helpers ─────────────────────────────────────

function makeMockRecord(
  tags: string[],
  effects?: Partial<Meters>,
): ChoiceRecord {
  return {
    nodeId: "test-node",
    optionId: "test-option",
    optionLabel: "Test",
    round: 1,
    meterEffects: {
      dealValue: effects?.dealValue ?? 0,
      riskExposure: effects?.riskExposure ?? 0,
      relationship: effects?.relationship ?? 0,
      clientSatisfaction: effects?.clientSatisfaction ?? 0,
    },
    metersAfter: { dealValue: 50, riskExposure: 30, relationship: 60, clientSatisfaction: 50 },
    tags,
  };
}
