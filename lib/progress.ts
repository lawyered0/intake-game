export interface DayCompletion {
  bestGrade: string;
  bestScore: number;
  lastGrade: string;
  lastScore: number;
  attempts: number;
  completedAt: number;
  lastPlayedAt: number;
}

interface LegacyDayCompletion {
  grade: string;
  score: number;
  completedAt: number;
}

export const DAY_COMPLETIONS_KEY = "lawyered-intake-day-completions";

function isDayCompletion(value: unknown): value is DayCompletion {
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

function isLegacyDayCompletion(value: unknown): value is LegacyDayCompletion {
  return Boolean(
    value &&
      typeof value === "object" &&
      "grade" in value &&
      "score" in value &&
      "completedAt" in value,
  );
}

function normalizeDayCompletion(value: unknown): DayCompletion | null {
  if (isDayCompletion(value)) {
    return value;
  }

  if (isLegacyDayCompletion(value)) {
    return {
      bestGrade: value.grade,
      bestScore: value.score,
      lastGrade: value.grade,
      lastScore: value.score,
      attempts: 1,
      completedAt: value.completedAt,
      lastPlayedAt: value.completedAt,
    };
  }

  return null;
}

function parseCompletions(raw: string | null): Record<string, DayCompletion> {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return Object.entries(parsed).reduce<Record<string, DayCompletion>>(
      (completions, [dayId, value]) => {
        const normalized = normalizeDayCompletion(value);

        if (normalized) {
          completions[dayId] = normalized;
        }

        return completions;
      },
      {},
    );
  } catch {
    return {};
  }
}

function migrateLegacySessionCompletions() {
  if (typeof window === "undefined") {
    return {};
  }

  const localRaw = window.localStorage.getItem(DAY_COMPLETIONS_KEY);
  const localCompletions = parseCompletions(localRaw);

  if (Object.keys(localCompletions).length) {
    return localCompletions;
  }

  const sessionCompletions = parseCompletions(
    window.sessionStorage.getItem(DAY_COMPLETIONS_KEY),
  );

  if (Object.keys(sessionCompletions).length) {
    window.localStorage.setItem(
      DAY_COMPLETIONS_KEY,
      JSON.stringify(sessionCompletions),
    );
    return sessionCompletions;
  }

  if (localRaw) {
    window.localStorage.removeItem(DAY_COMPLETIONS_KEY);
  }

  return {};
}

export function readDayCompletions(): Record<string, DayCompletion> {
  if (typeof window === "undefined") {
    return {};
  }

  return migrateLegacySessionCompletions();
}

export function getDayCompletion(dayId: string): DayCompletion | null {
  return readDayCompletions()[dayId] ?? null;
}

export function saveDayCompletion(dayId: string, result: {
  grade: string;
  score: number;
  completedAt?: number;
}) {
  if (typeof window === "undefined") {
    return {
      completion: null,
      isNewBest: false,
    };
  }

  const current = readDayCompletions();
  const existing = current[dayId];
  const timestamp = result.completedAt ?? Date.now();
  const isNewBest = !existing || result.score > existing.bestScore;
  const completion: DayCompletion = {
    bestGrade: isNewBest ? result.grade : existing?.bestGrade ?? result.grade,
    bestScore: isNewBest ? result.score : existing?.bestScore ?? result.score,
    lastGrade: result.grade,
    lastScore: result.score,
    attempts: (existing?.attempts ?? 0) + 1,
    completedAt: isNewBest ? timestamp : existing?.completedAt ?? timestamp,
    lastPlayedAt: timestamp,
  };

  current[dayId] = completion;
  window.localStorage.setItem(DAY_COMPLETIONS_KEY, JSON.stringify(current));

  return {
    completion,
    isNewBest,
  };
}
