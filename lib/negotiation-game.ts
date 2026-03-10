import type {
  ChoiceRecord,
  Meters,
  MeterEffects,
  NegotiationGameState,
  NegotiationStyle,
  Scenario,
  ScenarioNode,
} from "@/types/negotiation";

// ── Constants ─────────────────────────────────

export const METER_LABELS: Record<keyof Meters, string> = {
  dealValue: "Deal Value",
  riskExposure: "Risk Exposure",
  relationship: "Relationship",
  clientSatisfaction: "Client Satisfaction",
};

export const METER_KEYS: (keyof Meters)[] = [
  "dealValue",
  "riskExposure",
  "relationship",
  "clientSatisfaction",
];

export const GRADE_THRESHOLDS = [
  { minimum: 90, grade: "A+" },
  { minimum: 85, grade: "A" },
  { minimum: 80, grade: "A-" },
  { minimum: 75, grade: "B+" },
  { minimum: 70, grade: "B" },
  { minimum: 65, grade: "B-" },
  { minimum: 60, grade: "C+" },
  { minimum: 55, grade: "C" },
  { minimum: 50, grade: "C-" },
  { minimum: 40, grade: "D" },
  { minimum: Number.NEGATIVE_INFINITY, grade: "F" },
] as const;

const DIFFICULTY_LABELS: Record<1 | 2 | 3, string> = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
};

const STYLE_DESCRIPTIONS: Record<NegotiationStyle, string> = {
  Competitive:
    "You pressed hard for maximum value. Effective when you have leverage, but watch the relationship cost.",
  Collaborative:
    "You looked for mutual gains and creative solutions. Strong when the deal has long-term implications.",
  Compromising:
    "You split differences and made balanced concessions. Practical, but sometimes leaves value unclaimed.",
  Analytical:
    "You gathered information before committing. Smart preparation, though it can slow momentum.",
  Avoidant:
    "You sidestepped direct confrontation. Sometimes strategic, but can signal weakness if overused.",
};

// ── Utility ───────────────────────────────────

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function applyMeterEffects(current: Meters, effects: MeterEffects): Meters {
  return {
    dealValue: clamp(current.dealValue + effects.dealValue),
    riskExposure: clamp(current.riskExposure + effects.riskExposure),
    relationship: clamp(current.relationship + effects.relationship),
    clientSatisfaction: clamp(
      current.clientSatisfaction + effects.clientSatisfaction,
    ),
  };
}

// ── State machine ─────────────────────────────

export function createInitialNegotiationState(
  scenario: Scenario,
): NegotiationGameState {
  return {
    scenarioId: scenario.id,
    screen: "briefing",
    currentNodeId: scenario.startNodeId,
    meters: { ...scenario.initialMeters },
    choiceHistory: [],
    currentRound: 1,
  };
}

export function startNegotiation(
  state: NegotiationGameState,
): NegotiationGameState {
  return { ...state, screen: "round" };
}

export function getCurrentNode(
  scenario: Scenario,
  state: NegotiationGameState,
): ScenarioNode | null {
  return scenario.nodes[state.currentNodeId] ?? null;
}

export function applyChoice(
  scenario: Scenario,
  state: NegotiationGameState,
  optionId: string,
): NegotiationGameState {
  const node = getCurrentNode(scenario, state);
  if (!node) {
    throw new Error(`Node "${state.currentNodeId}" not found in scenario.`);
  }

  const option = node.options.find((o) => o.id === optionId);
  if (!option) {
    throw new Error(`Option "${optionId}" not found in node "${node.id}".`);
  }

  const newMeters = applyMeterEffects(state.meters, option.meterEffects);

  const record: ChoiceRecord = {
    nodeId: node.id,
    optionId: option.id,
    optionLabel: option.label,
    round: node.round,
    meterEffects: option.meterEffects,
    metersAfter: newMeters,
    feedback: option.feedback,
    tags: option.tags ?? [],
  };

  return {
    ...state,
    screen: "feedback",
    meters: newMeters,
    choiceHistory: [...state.choiceHistory, record],
    currentRound: node.round,
  };
}

export function advanceAfterFeedback(
  scenario: Scenario,
  state: NegotiationGameState,
): NegotiationGameState {
  const lastChoice = state.choiceHistory.at(-1);
  if (!lastChoice) {
    throw new Error("No choice history to advance from.");
  }

  const previousNode = scenario.nodes[lastChoice.nodeId];
  const selectedOption = previousNode?.options.find(
    (o) => o.id === lastChoice.optionId,
  );
  if (!selectedOption) {
    throw new Error("Cannot find the selected option.");
  }

  const nextNode = scenario.nodes[selectedOption.nextNodeId];
  if (!nextNode) {
    throw new Error(
      `Next node "${selectedOption.nextNodeId}" not found.`,
    );
  }

  if (nextNode.isTerminal) {
    return {
      ...state,
      screen: "scorecard",
      currentNodeId: nextNode.id,
      currentRound: nextNode.round,
    };
  }

  return {
    ...state,
    screen: "round",
    currentNodeId: nextNode.id,
    currentRound: nextNode.round,
  };
}

// ── Scoring ───────────────────────────────────

export function calculateWeightedScore(meters: Meters): number {
  return Math.round(
    meters.dealValue * 0.35 +
      (100 - meters.riskExposure) * 0.25 +
      meters.relationship * 0.15 +
      meters.clientSatisfaction * 0.25,
  );
}

export function calculateGrade(meters: Meters): string {
  const weighted = calculateWeightedScore(meters);
  return GRADE_THRESHOLDS.find((t) => weighted >= t.minimum)?.grade ?? "F";
}

// ── Analysis ──────────────────────────────────

export function getNegotiationStyle(
  choiceHistory: ChoiceRecord[],
): NegotiationStyle {
  const tagCounts: Record<string, number> = {};
  for (const record of choiceHistory) {
    for (const tag of record.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }

  const styleMap: Record<string, NegotiationStyle> = {
    aggressive: "Competitive",
    competitive: "Competitive",
    anchoring: "Competitive",
    collaborative: "Collaborative",
    creative: "Collaborative",
    logrolling: "Collaborative",
    compromising: "Compromising",
    concession: "Compromising",
    analytical: "Analytical",
    cautious: "Analytical",
    information: "Analytical",
    avoidant: "Avoidant",
    defensive: "Avoidant",
    delay: "Avoidant",
  };

  let dominantStyle: NegotiationStyle = "Compromising";
  let maxCount = 0;

  for (const [tag, count] of Object.entries(tagCounts)) {
    const style = styleMap[tag];
    if (style && count > maxCount) {
      maxCount = count;
      dominantStyle = style;
    }
  }

  return dominantStyle;
}

export function getStyleDescription(style: NegotiationStyle): string {
  return STYLE_DESCRIPTIONS[style];
}

export function getKeyMoments(choiceHistory: ChoiceRecord[]): ChoiceRecord[] {
  return choiceHistory.filter((record) => {
    const totalAbsEffect =
      Math.abs(record.meterEffects.dealValue) +
      Math.abs(record.meterEffects.riskExposure) +
      Math.abs(record.meterEffects.relationship) +
      Math.abs(record.meterEffects.clientSatisfaction);
    return totalAbsEffect >= 25;
  });
}

export function getOutcomeNarrative(
  scenario: Scenario,
  state: NegotiationGameState,
): string {
  const terminalNode = scenario.nodes[state.currentNodeId];
  return terminalNode?.outcomeNarrative ?? "The negotiation has concluded.";
}

export function getDifficultyLabel(difficulty: 1 | 2 | 3): string {
  return DIFFICULTY_LABELS[difficulty];
}
