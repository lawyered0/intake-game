// ── Deal & difficulty taxonomy ─────────────────

export type DealType =
  | "M&A"
  | "Lease"
  | "Settlement"
  | "TermSheet"
  | "Employment"
  | "IPLicense";

export type Difficulty = 1 | 2 | 3;

// ── Screen flow ───────────────────────────────

export type NegotiationScreenState =
  | "briefing"
  | "round"
  | "feedback"
  | "scorecard";

// ── Negotiation style (scorecard analysis) ────

export type NegotiationStyle =
  | "Competitive"
  | "Collaborative"
  | "Compromising"
  | "Analytical"
  | "Avoidant";

// ── Meters ────────────────────────────────────

export interface Meters {
  dealValue: number; // 0-100
  riskExposure: number; // 0-100 (lower is better)
  relationship: number; // 0-100
  clientSatisfaction: number; // 0-100
}

export interface MeterEffects {
  dealValue: number; // delta
  riskExposure: number;
  relationship: number;
  clientSatisfaction: number;
}

// ── Scenario graph ────────────────────────────

export interface NodeOption {
  id: string;
  label: string;
  description: string;
  meterEffects: MeterEffects;
  nextNodeId: string;
  feedback?: string;
  tags?: string[];
}

export interface ScenarioNode {
  id: string;
  round: number;
  narration: string;
  speakerName?: string;
  options: NodeOption[];
  isTerminal?: boolean;
  outcomeNarrative?: string; // required on terminal nodes
}

export interface ScenarioBriefing {
  situation: string;
  clientGoals: string[];
  batna: string;
  constraints: string[];
  intelOnOtherSide: string[];
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  dealType: DealType;
  difficulty: Difficulty;
  estimatedMinutes: number;
  playerRole: string;
  counterpartyRole: string;
  briefing: ScenarioBriefing;
  initialMeters: Meters;
  nodes: Record<string, ScenarioNode>;
  startNodeId: string;
  totalRounds: number; // max round number, for progress display
}

// ── Game state ────────────────────────────────

export interface ChoiceRecord {
  nodeId: string;
  optionId: string;
  optionLabel: string;
  round: number;
  meterEffects: MeterEffects;
  metersAfter: Meters;
  feedback?: string;
  tags: string[];
}

export interface NegotiationGameState {
  scenarioId: string;
  screen: NegotiationScreenState;
  currentNodeId: string;
  meters: Meters;
  choiceHistory: ChoiceRecord[];
  currentRound: number;
}
