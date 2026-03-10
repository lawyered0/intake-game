// ── Types ──────────────────────────────────────

export interface ScenarioCompletion {
  bestGrade: string;
  bestScore: number; // weighted score (0-100)
  lastGrade: string;
  lastScore: number;
  attempts: number;
  completedAt: number;
  lastPlayedAt: number;
}

// ── Storage key ────────────────────────────────

export const SCENARIO_COMPLETIONS_KEY = "lawyered-negotiation-completions";

// ── Helpers ────────────────────────────────────

function isScenarioCompletion(value: unknown): value is ScenarioCompletion {
  return Boolean(
    value &&
      typeof value === "object" &&
      "bestGrade" in value &&
      "bestScore" in value &&
      "lastGrade" in value &&
      "lastScore" in value &&
      "attempts" in value &&
      "completedAt" in value &&
      "lastPlayedAt" in value,
  );
}

function parseCompletions(
  raw: string | null,
): Record<string, ScenarioCompletion> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return Object.entries(parsed).reduce<Record<string, ScenarioCompletion>>(
      (completions, [scenarioId, value]) => {
        if (isScenarioCompletion(value)) {
          completions[scenarioId] = value;
        }
        return completions;
      },
      {},
    );
  } catch {
    return {};
  }
}

// ── Public API ─────────────────────────────────

export function readScenarioCompletions(): Record<
  string,
  ScenarioCompletion
> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(SCENARIO_COMPLETIONS_KEY);
  return parseCompletions(raw);
}

export function getScenarioCompletion(
  scenarioId: string,
): ScenarioCompletion | null {
  return readScenarioCompletions()[scenarioId] ?? null;
}

export function saveScenarioCompletion(
  scenarioId: string,
  result: { grade: string; score: number; completedAt?: number },
) {
  if (typeof window === "undefined") {
    return { completion: null, isNewBest: false };
  }

  const current = readScenarioCompletions();
  const existing = current[scenarioId];
  const timestamp = result.completedAt ?? Date.now();
  const isNewBest = !existing || result.score > existing.bestScore;

  const completion: ScenarioCompletion = {
    bestGrade: isNewBest
      ? result.grade
      : (existing?.bestGrade ?? result.grade),
    bestScore: isNewBest
      ? result.score
      : (existing?.bestScore ?? result.score),
    lastGrade: result.grade,
    lastScore: result.score,
    attempts: (existing?.attempts ?? 0) + 1,
    completedAt: isNewBest
      ? timestamp
      : (existing?.completedAt ?? timestamp),
    lastPlayedAt: timestamp,
  };

  current[scenarioId] = completion;
  window.localStorage.setItem(
    SCENARIO_COMPLETIONS_KEY,
    JSON.stringify(current),
  );
  return { completion, isNewBest };
}
