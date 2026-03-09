export type ActionType = "accept" | "decline" | "request_info";

export type RiskTag =
  | "urgency"
  | "fee_resistance"
  | "prior_counsel"
  | "fact_instability"
  | "expectation_mismatch"
  | "scope_fit"
  | "credibility"
  | "conflict_adjacent"
  | "abusive_behavior"
  | "revenge_motive";

export type OutcomeVerdict = "strong" | "mixed" | "poor";

export type ScreenState = "briefing" | "case" | "reveal" | "scorecard";

export interface BriefingContent {
  role: string;
  overview: string;
  goals: string[];
  reminder: string;
}

export interface ScoringGuideEntry {
  label: string;
  detail: string;
}

export interface IntakeDocument {
  type: string;
  label: string;
  body: string;
}

export interface CaseOutcome {
  scoreDelta: -2 | 1 | 3;
  verdict: OutcomeVerdict;
  headline: string;
  explanation: string;
  whyItMatters: string;
  signalsCaught: string[];
  signalsMissed: string[];
  followUpQuestion?: string;
  styleTag: string;
}

export interface IntakeCase {
  id: string;
  order: number;
  clientName: string;
  matterType: string;
  headline: string;
  sourceChannel: string;
  summary: string;
  requestedOutcome: string;
  facts: string[];
  documents: IntakeDocument[];
  visibleSignals: string[];
  hiddenRiskTags: RiskTag[];
  outcomes: Record<ActionType, CaseOutcome>;
}

export interface IntakeDay {
  id: string;
  order: number;
  title: string;
  theme: string;
  teaser: string;
  briefing: BriefingContent;
  scoringGuide: ScoringGuideEntry[];
  cases: IntakeCase[];
}

export interface DecisionRecord {
  caseId: string;
  clientName: string;
  action: ActionType;
  bestAction: ActionType;
  outcome: CaseOutcome;
  hiddenRiskTags: RiskTag[];
  scoreAfter: number;
  wasBest: boolean;
}

export interface GameState {
  dayId: string;
  currentCaseIndex: number;
  screen: ScreenState;
  score: number;
  decisionHistory: DecisionRecord[];
  tagTallies: Record<string, number>;
  correctCalls: number;
  falseAccepts: number;
  falseDeclines: number;
  goodEscalations: number;
}

export interface ScreeningStyle {
  label: "Pragmatic" | "Disciplined" | "Too Trusting" | "Overcautious";
  description: string;
}
