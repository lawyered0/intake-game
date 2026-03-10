"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { getDifficultyLabel } from "@/lib/negotiation-game";
import {
  readScenarioCompletions,
  type ScenarioCompletion,
} from "@/lib/negotiation-progress";
import type { Difficulty } from "@/types/negotiation";

interface ScenarioPickerProps {
  scenarios: Array<{
    id: string;
    title: string;
    subtitle: string;
    dealType: string;
    difficulty: Difficulty;
    estimatedMinutes: number;
    playerRole: string;
  }>;
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  1: "text-[var(--accent-green)] border-[var(--accent-green)]/20 bg-[var(--accent-green-soft)]",
  2: "text-[var(--accent-gold)] border-[var(--accent-gold)]/20 bg-[var(--accent-gold-soft)]",
  3: "text-[var(--accent-red)] border-[var(--accent-red)]/20 bg-[var(--accent-red-soft)]",
};

export function ScenarioPicker({ scenarios }: ScenarioPickerProps) {
  const completionsSnapshot = useSyncExternalStore(
    subscribeToCompletions,
    () => JSON.stringify(readScenarioCompletions()),
    () => "{}",
  );
  const completions = useMemo(
    () =>
      JSON.parse(completionsSnapshot) as Record<string, ScenarioCompletion>,
    [completionsSnapshot],
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {scenarios.map((scenario) => {
        const completion = completions[scenario.id];

        return (
          <Link
            key={scenario.id}
            href={`/negotiate/${scenario.id}`}
            className="action-button card flex flex-col gap-3 rounded-xl px-5 py-5"
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] ${DIFFICULTY_COLORS[scenario.difficulty]}`}
              >
                {getDifficultyLabel(scenario.difficulty)}
              </span>
              {completion ? (
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent-gold)]">
                  Best: {completion.bestGrade}
                </span>
              ) : (
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  Open
                </span>
              )}
            </div>
            <div>
              <p className="font-display text-2xl uppercase">
                {scenario.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                {scenario.subtitle}
              </p>
            </div>
            <div className="mt-auto flex flex-wrap gap-2 text-[var(--text-secondary)]">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                {scenario.dealType}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                ~{scenario.estimatedMinutes} min
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function subscribeToCompletions(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener("storage", handleStorage);
  };
}
