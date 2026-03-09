"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import {
  readDayCompletions,
  type DayCompletion,
} from "@/lib/progress";

interface DayPickerProps {
  days: Array<{
    id: string;
    title: string;
    theme: string;
    teaser: string;
  }>;
}

export function DayPicker({ days }: DayPickerProps) {
  const completionsSnapshot = useSyncExternalStore(
    subscribeToDayCompletions,
    () => JSON.stringify(readDayCompletions()),
    () => "{}",
  );
  const completions = useMemo(
    () => JSON.parse(completionsSnapshot) as Record<string, DayCompletion>,
    [completionsSnapshot],
  );
  const [primaryDay, ...otherDays] = days;

  return (
    <div className="w-full max-w-4xl space-y-3">
      {primaryDay ? (
        <Link
          href={`/play/${primaryDay.id}`}
          aria-label={primaryDay.title.split(":")[0]}
          className="action-button card-accent relative flex w-full flex-col gap-4 overflow-hidden rounded-xl px-5 py-5 sm:px-6 sm:py-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                Start Here
              </p>
              <p className="mt-1 font-display text-3xl uppercase sm:text-4xl">
                {primaryDay.title.split(":")[0]}
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                {primaryDay.theme}
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {getCompletionLabel(completions[primaryDay.id])}
            </span>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
            {primaryDay.teaser}
          </p>
        </Link>
      ) : null}

      {otherDays.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {otherDays.map((day) => {
            const completion = completions[day.id];

            return (
              <Link
                key={day.id}
                href={`/play/${day.id}`}
                aria-label={day.title.split(":")[0]}
                className="action-button card flex h-full flex-col justify-between gap-4 rounded-xl px-5 py-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-display text-2xl uppercase">
                      {day.title.split(":")[0]}
                    </p>
                    <span className="rounded-full border border-white/10 bg-white/6 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      {getCompletionLabel(completion)}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                    {day.theme}
                  </p>
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">
                    {day.teaser}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function getCompletionLabel(completion?: DayCompletion) {
  if (!completion) {
    return "Open";
  }

  return `Best: ${completion.bestGrade}`;
}

function subscribeToDayCompletions(onStoreChange: () => void) {
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
