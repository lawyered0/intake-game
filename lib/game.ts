import type {
  ActionType,
  DecisionRecord,
  GameState,
  IntakeCase,
  IntakeDay,
  RiskTag,
  ScreeningStyle,
} from "@/types/intake";

export interface LawyeredGuidance {
  note: string;
  pressureTest: string;
  doNotAssume: string;
  lens: string;
}

interface GuidanceTemplateSet {
  note: string[];
  pressureTest: string[];
  doNotAssume: string[];
}

export const ACTION_LABELS: Record<ActionType, string> = {
  accept: "Accept",
  decline: "Decline",
  request_info: "Request More Info",
};

export const ACTION_ORDER: ActionType[] = ["accept", "request_info", "decline"];

export const ACTION_DETAILS = [
  {
    id: "accept",
    label: ACTION_LABELS.accept,
    description: "Open when the fit, record, and first step are clear.",
  },
  {
    id: "request_info",
    label: ACTION_LABELS.request_info,
    description: "Pause and get the missing facts, records, or process step.",
  },
  {
    id: "decline",
    label: ACTION_LABELS.decline,
    description: "Pass when the fit, conduct, or risk is wrong.",
  },
] satisfies { id: ActionType; label: string; description: string }[];

export const GRADE_THRESHOLDS = [
  { minimum: 24, grade: "A" },
  { minimum: 18, grade: "B" },
  { minimum: 12, grade: "C" },
  { minimum: 6, grade: "D" },
  { minimum: Number.NEGATIVE_INFINITY, grade: "F" },
] as const;

export const RISK_TAG_LABELS: Record<RiskTag, string> = {
  urgency: "Urgency pressure",
  fee_resistance: "Fee resistance",
  prior_counsel: "Prior lawyer churn",
  fact_instability: "Unstable facts",
  expectation_mismatch: "Expectation mismatch",
  scope_fit: "Poor scope fit",
  credibility: "Credibility gaps",
  conflict_adjacent: "Conflict-adjacent facts",
  abusive_behavior: "Abusive or manipulative conduct",
  revenge_motive: "Revenge-driven objective",
};

const LAWYERED_GUIDANCE_MAP: Record<RiskTag, GuidanceTemplateSet> = {
  urgency: {
    note: [
      "In this {matter} file, urgency changes tempo, not standards. Open only if {record} already supports a responsible first step.",
      "A short fuse on a {matter} matter can justify speed, but it still does not excuse guessing past {record}.",
      "Treat the deadline in this {matter} file as a process issue. The real question is whether {record} is already strong enough to move.",
    ],
    pressureTest: [
      "Confirm what expires first, what paper controls, and whether {record} is complete enough for the immediate assignment.",
      "Pin down the real deadline, the narrow first task, and which part of {record} still needs to be on the desk today.",
      "Ask what must happen now, what can wait, and whether {record} supports a fast but disciplined first step.",
    ],
    doNotAssume: [
      "Do not assume a fast-moving {matter} file is either unsafe or ready just because the clock is loud.",
      "Do not let time pressure answer the intake question for you. The answer still turns on fit and {record}.",
      "Do not confuse deadline pressure with proof that the file should open immediately.",
    ],
  },
  fee_resistance: {
    note: [
      "Before opening this {matter} file, make sure the scope, payer, and economics of the first step are clear.",
      "A promising {matter} dispute still needs a workable fee conversation. Intake should know who is paying and for what.",
      "Do not let the client turn a {matter} intake into unfunded urgency. The desk needs fee clarity before it needs posture.",
    ],
    pressureTest: [
      "Ask who will fund the work, whether a retainer is expected, and what task the client is actually trying to buy first.",
      "Confirm the payer, the initial budget, and whether the client is requesting a real first assignment or just borrowed leverage.",
      "Test whether the client can support the opening work and whether the requested first step matches a realistic engagement.",
    ],
    doNotAssume: [
      "Do not let a large claimed recovery or a dramatic story stand in for fee clarity.",
      "Do not assume the economics can be solved later if the client is already resisting them now.",
      "Do not treat future upside as a substitute for a workable intake budget.",
    ],
  },
  prior_counsel: {
    note: [
      "Lawyer churn in a {matter} file calls for a reasoned pause. Find out why earlier representation ended before you trust the current framing.",
      "When a {matter} prospect has already cycled through counsel, intake should slow down enough to understand the break points.",
      "Prior representation history matters in a {matter} file because it can expose missing records, unmanaged expectations, or both.",
    ],
    pressureTest: [
      "Ask whether prior counsel lacked key records, hit a strategy limit, or disengaged because the relationship stopped working.",
      "Find out how many firms were involved, why each one stopped, and whether any disengagement letters or file transfers exist.",
      "Test whether the earlier lawyers were missing the record, declining the objective, or struggling with the client relationship itself.",
    ],
    doNotAssume: [
      "Do not assume the earlier lawyers were the problem or that this desk will avoid the same issue.",
      "Do not let a polished retelling erase the significance of repeated lawyer turnover.",
      "Do not treat prior counsel history as background noise. It can be central to fit and expectations.",
    ],
  },
  fact_instability: {
    note: [
      "If the story outruns {record}, pause. Competent intake on a {matter} file starts with the source record, not confidence.",
      "A {matter} packet can sound coherent and still be too thin. The desk should test {record} before treating the story as settled.",
      "When the narrative in a {matter} file gets ahead of {record}, the right answer is usually to pause and tighten the record.",
    ],
    pressureTest: [
      "Identify the one document or source record that would confirm or materially change the file.",
      "Ask which missing piece of {record} would most likely move this {matter} file from plausible to ready.",
      "Pinpoint the record gap that actually matters. If filling it would change the intake call, name it now.",
    ],
    doNotAssume: [
      "Do not treat summaries, screenshots, or confidence as a substitute for the controlling paper.",
      "Do not assume the missing record is secondary when it may be the file's center of gravity.",
      "Do not let a clean chronology replace the actual source material.",
    ],
  },
  expectation_mismatch: {
    note: [
      "Set the first assignment and its limits before you open a {matter} file. Intake should surface goals the firm can actually deliver.",
      "A {matter} prospect may have a real grievance and the wrong expectation. Clarify the immediate objective before you say yes.",
      "Expectation control starts at intake. In a {matter} file, the desk should define the first legal task, not inherit a mood.",
    ],
    pressureTest: [
      "Make the client define the immediate business objective, not just the frustration behind it.",
      "Ask what result the client wants from the first assignment and how they will know it was useful.",
      "Test whether the client is asking for a lawful, bounded first step or for the firm to validate an emotion.",
    ],
    doNotAssume: [
      "Do not assume the client shares your view of what the first step or likely outcome will be.",
      "Do not let a real complaint hide the fact that the client may want something the firm should not promise.",
      "Do not mistake strong emotion for a clear objective.",
    ],
  },
  scope_fit: {
    note: [
      "A viable {matter} problem can still be the wrong file for this desk. Fit matters as much as sympathy.",
      "The intake question is not only whether the client has a problem. It is whether this desk should own the {matter} work.",
      "Some {matter} files should pause or leave the desk because competence and timing matter more than interest in the story.",
    ],
    pressureTest: [
      "Check subject-matter fit, timing, and whether a referral would serve the client better than stretching the desk.",
      "Ask whether this firm can competently handle the first step, whether the timing is realistic, and whether referral is the better service.",
      "Test the practice fit before the merits. A real problem still belongs with the right lawyer and the right timeline.",
    ],
    doNotAssume: [
      "Do not force fit because the story sounds important or urgent.",
      "Do not assume goodwill toward the caller solves a competence or scope problem.",
      "Do not let sympathy turn into a file the desk should not own.",
    ],
  },
  credibility: {
    note: [
      "Presentation is not proof. In this {matter} file, intake should look for the source record that supports the account.",
      "A polished {matter} prospect can still have a weak record. Reliability should come from {record}, not delivery style.",
      "Credibility in a {matter} file is tested by the paper trail and third-party anchors, not by how smoothly the story is told.",
    ],
    pressureTest: [
      "Ask what contemporaneous document, third-party record, or objective event backs the client's version.",
      "Identify the outside record that would either support or weaken the client's account before the file opens.",
      "Test whether the file has an anchor outside the client's narration, especially where {record} is incomplete.",
    ],
    doNotAssume: [
      "Do not confuse polish with reliability or stress with dishonesty.",
      "Do not assume a sophisticated presentation means the proof is already there.",
      "Do not read confidence as corroboration.",
    ],
  },
  conflict_adjacent: {
    note: [
      "Run conflict discipline before strategy on this {matter} file. Intake should identify parties, affiliates, and referral relationships early.",
      "A warm introduction can still sit next to a conflict problem. The desk should clear parties and relationships before moving this {matter} file.",
      "Process comes first when a {matter} intake may affect other clients or related entities. Strategy can wait until conflicts are clean.",
    ],
    pressureTest: [
      "Check who is involved, who is related, and whether the firm learned anything disqualifying during intake.",
      "Identify every entity, affiliate, accountant, investor, or referral relationship that could complicate a conflict screen.",
      "Test whether the firm has enough party and relationship detail to clear conflicts before any strategic advice is given.",
    ],
    doNotAssume: [
      "Do not let a warm introduction make conflicts feel safer than they are.",
      "Do not treat familiarity with the referral source as a substitute for a full conflict screen.",
      "Do not assume the relationship map is simple just because the request sounds narrow.",
    ],
  },
  abusive_behavior: {
    note: [
      "You are screening for a workable lawyer-client relationship, not just a colorable {matter} claim.",
      "Day-one conduct matters. A {matter} file can be legally plausible and still be the wrong intake because the relationship will not work.",
      "Intake is allowed to screen for judgment, collections, and process risk when the client's conduct already points that way.",
    ],
    pressureTest: [
      "Ask whether day-one conduct is likely to impair judgment, collections, or basic process if the file opens.",
      "Test whether the client's tone, demands, or tactics are already making a normal engagement harder to manage.",
      "Check whether the conduct problem is incidental or whether it is likely to define the relationship from the start.",
    ],
    doNotAssume: [
      "Do not assume bad conduct will disappear after engagement.",
      "Do not expect the desk to fix a relationship pattern the client is already showing.",
      "Do not treat early disrespect or manipulation as a temporary intake mood.",
    ],
  },
  revenge_motive: {
    note: [
      "Separate a legal objective from a desire to punish. The firm should not be retained as an escalation tool in a {matter} file.",
      "A real grievance does not automatically produce a sound intake objective. In this {matter} file, motive still matters.",
      "When a {matter} prospect is driven by payback, intake should test whether any lawful business objective remains once the heat is removed.",
    ],
    pressureTest: [
      "Ask what lawful business result the client wants besides embarrassment, leverage, or payback.",
      "Test whether the client can name an objective the firm can pursue without becoming part of the feud.",
      "Find out what practical result would satisfy the client if public pressure or humiliation were off the table.",
    ],
    doNotAssume: [
      "Do not confuse a real grievance with a sound intake objective.",
      "Do not assume anger and legal value are moving in the same direction.",
      "Do not treat retaliation as a substitute for a lawful first step.",
    ],
  },
};

const LAWYERED_FALLBACK: LawyeredGuidance = {
  note:
    "Start with competence, fit, and the first assignment. A good intake call matches the file to the work the firm can responsibly do now.",
  pressureTest:
    "Check the controlling document, the practical next step, and whether the client can support the opening work.",
  doNotAssume:
    "Do not answer the merits before intake process is complete.",
  lens: "Intake lens: competence, communication, scope, fees, conflicts, and prospective-client duties.",
};

const MATTER_RECORD_HINTS = [
  {
    pattern: /trademark|mark|clearance|brand/,
    record: "the clearance history and prior advice",
  },
  {
    pattern: /defamation|statement|influencer|reputation/,
    record: "the exact statements and proof of measurable harm",
  },
  {
    pattern: /custody|family/,
    record: "the emergency facts and the right referral path",
  },
  {
    pattern: /founder|equity|ownership|startup|practice acquisition|business ownership/,
    record: "the governing ownership and deal record",
  },
  {
    pattern: /employment|wage|commission|executive|noncompete|restrictive covenant/,
    record: "the signed employment and compensation record",
  },
  {
    pattern: /construction/,
    record: "the signed change orders, completion record, and invoices",
  },
  {
    pattern: /lease|guaranty|receivables|collection|collections|supply|commercial|vendor|franchise|demand/,
    record: "the signed agreement chain and payment record",
  },
  {
    pattern: /consumer fraud|supplement|product|injury/,
    record: "the purchase, medical, and causation record",
  },
];

export function createInitialGameState(day: IntakeDay): GameState {
  return {
    dayId: day.id,
    currentCaseIndex: 0,
    screen: "briefing",
    score: 0,
    decisionHistory: [],
    tagTallies: {},
    correctCalls: 0,
    falseAccepts: 0,
    falseDeclines: 0,
    goodEscalations: 0,
  };
}

export function startDay(state: GameState): GameState {
  return {
    ...state,
    screen: "case",
  };
}

export function getCurrentCase(day: IntakeDay, state: GameState): IntakeCase | null {
  return day.cases[state.currentCaseIndex] ?? null;
}

export function getBestAction(intakeCase: IntakeCase): ActionType {
  const entries = Object.entries(intakeCase.outcomes) as [
    ActionType,
    IntakeCase["outcomes"][ActionType],
  ][];

  const [bestAction] = entries.reduce((best, current) => {
    if (current[1].scoreDelta > best[1].scoreDelta) {
      return current;
    }

    return best;
  });

  return bestAction;
}

export function applyDecision(
  day: IntakeDay,
  state: GameState,
  action: ActionType,
): GameState {
  const intakeCase = getCurrentCase(day, state);

  if (!intakeCase) {
    throw new Error("No active intake case.");
  }

  const outcome = intakeCase.outcomes[action];
  const bestAction = getBestAction(intakeCase);
  const record: DecisionRecord = {
    caseId: intakeCase.id,
    clientName: intakeCase.clientName,
    action,
    bestAction,
    outcome,
    hiddenRiskTags: intakeCase.hiddenRiskTags,
    scoreAfter: state.score + outcome.scoreDelta,
    wasBest: action === bestAction,
  };

  return {
    ...state,
    screen: "reveal",
    score: state.score + outcome.scoreDelta,
    decisionHistory: [...state.decisionHistory, record],
    tagTallies: {
      ...state.tagTallies,
      [outcome.styleTag]: (state.tagTallies[outcome.styleTag] ?? 0) + 1,
    },
    correctCalls: state.correctCalls + (record.wasBest ? 1 : 0),
    falseAccepts:
      state.falseAccepts + (action === "accept" && outcome.scoreDelta < 0 ? 1 : 0),
    falseDeclines:
      state.falseDeclines + (action === "decline" && outcome.scoreDelta < 0 ? 1 : 0),
    goodEscalations:
      state.goodEscalations +
      (action === "request_info" && outcome.scoreDelta > 0 ? 1 : 0),
  };
}

export function advanceAfterReveal(day: IntakeDay, state: GameState): GameState {
  const nextIndex = state.currentCaseIndex + 1;

  return {
    ...state,
    currentCaseIndex: nextIndex,
    screen: nextIndex >= day.cases.length ? "scorecard" : "case",
  };
}

export function calculateGrade(score: number): string {
  return GRADE_THRESHOLDS.find((threshold) => score >= threshold.minimum)?.grade ?? "F";
}

export function getScreeningStyle(state: GameState): ScreeningStyle {
  if (state.falseAccepts >= 3 && state.falseAccepts > state.falseDeclines) {
    return {
      label: "Too Trusting",
      description:
        "You let in too much risk. Slow down when facts, money, and expectations do not line up.",
    };
  }

  if (state.falseDeclines >= 3 && state.falseDeclines >= state.falseAccepts) {
    return {
      label: "Overcautious",
      description:
        "You protected the desk, but passed on too many workable matters.",
    };
  }

  if (state.score >= 24 && state.falseAccepts <= 1 && state.falseDeclines <= 1) {
    return {
      label: "Pragmatic",
      description:
        "You matched the response to the file and kept good guardrails.",
    };
  }

  if (state.goodEscalations >= 3 && state.falseAccepts <= 1) {
    return {
      label: "Disciplined",
      description:
        "You used follow-up questions well and did not force quick answers.",
    };
  }

  return {
    label: "Pragmatic",
    description:
      "You matched the response to the file and kept good guardrails.",
  };
}

export function getTopMissedRiskTags(
  history: DecisionRecord[],
  limit = 3,
): { tag: RiskTag; label: string; count: number }[] {
  const counts = new Map<RiskTag, number>();

  history
    .filter((record) => !record.wasBest)
    .forEach((record) => {
      record.hiddenRiskTags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      });
    });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([tag, count]) => ({
      tag,
      label: RISK_TAG_LABELS[tag],
      count,
    }));
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function pickVariant(variants: string[], seed: string) {
  if (variants.length === 0) {
    return "";
  }

  return variants[hashString(seed) % variants.length] ?? variants[0];
}

function getMatterLabel(intakeCase: IntakeCase) {
  return intakeCase.matterType.toLowerCase();
}

function getCoreRecordLabel(intakeCase: IntakeCase) {
  const haystack = [
    intakeCase.matterType,
    intakeCase.headline,
    intakeCase.requestedOutcome,
    ...intakeCase.documents.map((document) => `${document.type} ${document.label}`),
  ]
    .join(" ")
    .toLowerCase();

  return (
    MATTER_RECORD_HINTS.find((entry) => entry.pattern.test(haystack))?.record ??
    "the controlling documents and timeline"
  );
}

function fillGuidanceTemplate(template: string, intakeCase: IntakeCase) {
  return template
    .replaceAll("{matter}", getMatterLabel(intakeCase))
    .replaceAll("{record}", getCoreRecordLabel(intakeCase));
}

function getLens(uniqueTags: RiskTag[]) {
  if (uniqueTags.includes("conflict_adjacent")) {
    return "Intake lens: conflicts first, then fit, scope, and the source record.";
  }

  if (uniqueTags.includes("scope_fit")) {
    return "Intake lens: competence, scope, timing, and referral judgment.";
  }

  if (uniqueTags.includes("fee_resistance")) {
    return "Intake lens: scope, economics, and a defined first assignment.";
  }

  if (uniqueTags.includes("abusive_behavior") || uniqueTags.includes("revenge_motive")) {
    return "Intake lens: client objective, conduct, and whether the relationship can work.";
  }

  if (uniqueTags.includes("fact_instability") || uniqueTags.includes("credibility")) {
    return "Intake lens: source record, reliability, and what is still missing.";
  }

  if (uniqueTags.includes("urgency")) {
    return "Intake lens: timing pressure, readiness, and a narrow first step.";
  }

  return LAWYERED_FALLBACK.lens;
}

export function getLawyeredGuidance(intakeCase: IntakeCase): LawyeredGuidance {
  const uniqueTags = [...new Set(intakeCase.hiddenRiskTags)];
  const primaryTag = uniqueTags[0];
  const secondaryTag = uniqueTags[1] ?? primaryTag;
  const primaryGuidance = primaryTag ? LAWYERED_GUIDANCE_MAP[primaryTag] : null;
  const secondaryGuidance = secondaryTag ? LAWYERED_GUIDANCE_MAP[secondaryTag] : null;

  return {
    note: primaryGuidance
      ? fillGuidanceTemplate(
          pickVariant(primaryGuidance.note, `${intakeCase.id}:note:${primaryTag}`),
          intakeCase,
        )
      : LAWYERED_FALLBACK.note,
    pressureTest:
      secondaryGuidance
        ? fillGuidanceTemplate(
            pickVariant(
              secondaryGuidance.pressureTest,
              `${intakeCase.id}:pressure:${secondaryTag}`,
            ),
            intakeCase,
          )
        : primaryGuidance
          ? fillGuidanceTemplate(
              pickVariant(
                primaryGuidance.pressureTest,
                `${intakeCase.id}:pressure:${primaryTag}`,
              ),
              intakeCase,
            )
          : LAWYERED_FALLBACK.pressureTest,
    doNotAssume:
      secondaryGuidance
        ? fillGuidanceTemplate(
            pickVariant(
              secondaryGuidance.doNotAssume,
              `${intakeCase.id}:assume:${secondaryTag}`,
            ),
            intakeCase,
          )
        : primaryGuidance
          ? fillGuidanceTemplate(
              pickVariant(
                primaryGuidance.doNotAssume,
                `${intakeCase.id}:assume:${primaryTag}`,
              ),
              intakeCase,
            )
          : LAWYERED_FALLBACK.doNotAssume,
    lens: getLens(uniqueTags),
  };
}

export function getActionBiasInsight(state: GameState): string {
  const actionCounts = state.decisionHistory.reduce<Record<ActionType, number>>(
    (counts, record) => {
      counts[record.action] += 1;
      return counts;
    },
    {
      accept: 0,
      decline: 0,
      request_info: 0,
    },
  );

  if (actionCounts.request_info >= 5 && state.score < 24) {
    return "You leaned on Request More Info. Good instinct, but a few ready files could have opened sooner.";
  }

  if (actionCounts.decline >= 4 && state.falseDeclines >= state.falseAccepts) {
    return "You leaned decline. Watch for files that already have the fit and paper to open.";
  }

  if (actionCounts.accept >= 4 && state.falseAccepts > state.falseDeclines) {
    return "You leaned accept. Slow down when records, fit, or client behavior are still unsettled.";
  }

  return "Your action mix stayed balanced. You generally matched opens, pauses, and declines to the file.";
}

export function getRiskPatternInsight(state: GameState): string {
  const topTag = getTopMissedRiskTags(state.decisionHistory, 1)[0];

  if (!topTag || topTag.count < 2) {
    return "No repeat blind spot dominated this run.";
  }

  return `You repeatedly missed ${topTag.label.toLowerCase()}. Slow down when that pattern shows up again.`;
}
