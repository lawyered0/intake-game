"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ACTION_LABELS,
  calculateGrade,
  getActionBiasInsight,
  getRiskPatternInsight,
  getScreeningStyle,
  getTopMissedRiskTags,
} from "@/lib/game";
import type { DayCompletion } from "@/lib/progress";
import type { GameState, IntakeDay } from "@/types/intake";

interface ScorecardProps {
  day: IntakeDay;
  nextDay?: IntakeDay | null;
  state: GameState;
  completion: DayCompletion | null;
  isNewBest: boolean;
  onReplay: () => void;
}

export function Scorecard({
  day,
  nextDay = null,
  state,
  completion,
  isNewBest,
  onReplay,
}: ScorecardProps) {
  const grade = calculateGrade(state.score);
  const style = getScreeningStyle(state);
  const missedTags = getTopMissedRiskTags(state.decisionHistory);
  const actionBiasInsight = getActionBiasInsight(state);
  const riskPatternInsight = getRiskPatternInsight(state);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const handleShare = async () => {
    const shareText = `I scored ${grade} on ${day.title.split(":")[0]} at Intake-Game.`;
    const shareUrl = typeof window === "undefined" ? "" : window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Intake-Game",
          text: shareText,
          url: shareUrl,
        });
        setShareStatus("Shared");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`.trim());
        setShareStatus("Copied");
        return;
      }

      setShareStatus("Share unavailable");
    } catch {
      setShareStatus("Share cancelled");
    }
  };

  return (
    <section className="space-y-6">
      <div className="card rounded-xl px-6 py-6 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card rounded-xl px-5 py-5">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent-red)]">
              Result
            </p>
            <div className="mt-4 flex items-end gap-4">
              <div className="card-accent rounded-xl px-5 py-4">
                <p className="font-display text-6xl leading-none text-[var(--accent-gold)] sm:text-7xl">
                  {grade}
                </p>
              </div>
              <div className="pb-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                  Final score
                </p>
                <p className="text-3xl font-semibold">{state.score}</p>
              </div>
            </div>
            {isNewBest ? (
              <p className="mt-4 inline-flex rounded-full border border-[var(--accent-gold)]/20 bg-[var(--accent-gold-soft)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--accent-gold)]">
                New best
              </p>
            ) : null}
            <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">{style.description}</p>
            {completion ? (
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                Best: {completion.bestGrade} ({completion.bestScore}) after{" "}
                {completion.attempts} run{completion.attempts === 1 ? "" : "s"}.
              </p>
            ) : null}
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <StatCard label="Correct calls" value={state.correctCalls} />
              <StatCard label="Risky accepts" value={state.falseAccepts} />
              <StatCard label="Bad declines" value={state.falseDeclines} />
              <StatCard label="Good escalations" value={state.goodEscalations} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="card rounded-xl px-5 py-5">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                Screening style
              </p>
              <p className="font-display mt-3 text-3xl uppercase">{style.label}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                {style.description}
              </p>
            </article>

            <article className="card rounded-xl px-5 py-5">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                Action pattern
              </p>
              <p className="mt-3 text-sm leading-6">
                {actionBiasInsight}
              </p>
            </article>

            <article className="card rounded-xl px-5 py-5">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                Most-missed risks
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6">
                {missedTags.length ? (
                  missedTags.map((tag) => (
                    <li key={tag.tag} className="flex items-center justify-between gap-3">
                      <span>{tag.label}</span>
                      <span className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                        {tag.count}
                      </span>
                    </li>
                  ))
                ) : (
                  <li>You stayed ahead of the main risk patterns.</li>
                )}
              </ul>
            </article>

            <article className="card rounded-xl px-5 py-5">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                Blind spot
              </p>
              <p className="mt-3 text-sm leading-6">
                {riskPatternInsight}
              </p>
            </article>

            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
              <button
                type="button"
                onClick={onReplay}
                className="action-button inline-flex items-center justify-center rounded-full border border-[var(--accent-gold)] bg-[var(--accent-gold)] px-5 py-3 font-display text-lg uppercase tracking-[0.08em] text-[var(--night)]"
              >
                Play Again
              </button>
              <Link
                href="/"
                className="action-button inline-flex items-center justify-center rounded-full border border-[var(--line)] px-5 py-3 font-display text-lg uppercase tracking-[0.08em]"
              >
                Home
              </Link>
              {nextDay ? (
                <Link
                  href={`/play/${nextDay.id}`}
                  className="action-button inline-flex items-center justify-center rounded-full border border-[var(--line)] px-5 py-3 font-display text-lg uppercase tracking-[0.08em]"
                >
                  Next: {nextDay.title.split(":")[0]}
                </Link>
              ) : null}
              <button
                type="button"
                onClick={handleShare}
                className="action-button inline-flex items-center justify-center rounded-full border border-[var(--line)] px-5 py-3 font-display text-lg uppercase tracking-[0.08em]"
              >
                Share Result
              </button>
            </div>
            {shareStatus ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                {shareStatus}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="card rounded-xl px-6 py-6 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="folder-tab folder-tab-muted">Run Log</span>
        </div>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
          Decision log
        </p>
        <div className="mt-5 grid gap-3">
          {state.decisionHistory.map((record, index) => {
            const caseData = day.cases.find((intakeCase) => intakeCase.id === record.caseId);

            return (
              <article
                key={record.caseId}
                className="card rounded-xl px-4 py-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-display text-2xl uppercase">
                      {index + 1}. {record.clientName}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                      {caseData?.headline}
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <p>
                      <span className="font-mono mr-2 text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                        You chose
                      </span>
                      {ACTION_LABELS[record.action]}
                    </p>
                    <p>
                      <span className="font-mono mr-2 text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                        Best move
                      </span>
                      {ACTION_LABELS[record.bestAction]}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card rounded-xl px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
