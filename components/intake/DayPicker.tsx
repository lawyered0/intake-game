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
          className="action-button relative flex w-full flex-col gap-4 overflow-hidden rounded-[28px] border border-[var(--accent-gold)] bg-[linear-gradient(135deg,rgba(255,190,99,0.98),rgba(255,151,105,0.94))] px-5 py-5 text-[var(--ink)] shadow-[0_20px_44px_rgba(0,0,0,0.18)] sm:px-6 sm:py-6"
        >
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-36 bg-white/12 blur-2xl"
          />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-black/55">
                Start Here
              </p>
              <p className="mt-1 font-display text-3xl uppercase sm:text-4xl">
                {primaryDay.title.split(":")[0]}
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-black/55">
                {primaryDay.theme}
              </p>
            </div>
            <span className="rounded-full border border-black/15 bg-white/22 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-black/70">
              {getCompletionLabel(completions[primaryDay.id])}
            </span>
          </div>
          <p className="relative z-10 max-w-3xl text-sm leading-6 text-black/72 sm:text-base">
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
                className="action-button flex h-full flex-col justify-between gap-4 rounded-[24px] border border-[var(--line)] bg-white/4 px-5 py-4 text-[var(--paper-bright)]"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-display text-2xl uppercase">
                      {day.title.split(":")[0]}
                    </p>
                    <span className="rounded-full border border-current/20 bg-black/8 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.18em]">
                      {getCompletionLabel(completion)}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                    {day.theme}
                  </p>
                  <p className="text-sm leading-6 text-[var(--paper-bright)]">
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
