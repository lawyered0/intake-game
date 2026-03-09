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
      <div className="dossier-shell paper-panel rounded-[32px] border px-6 py-6 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="paper-sheet rounded-[26px] px-5 py-5">
            <div className="paper-fold" />
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent-red)]">
              Result
            </p>
            <div className="mt-4 flex items-end gap-4">
              <div className="score-plaque rounded-[24px] px-5 py-4">
                <p className="font-title text-6xl leading-none text-[var(--ink)] sm:text-7xl">
                  {grade}
                </p>
              </div>
              <div className="pb-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-black/45">
                  Final score
                </p>
                <p className="text-3xl font-semibold text-black/80">{state.score}</p>
              </div>
            </div>
            {isNewBest ? (
              <p className="mt-4 inline-flex rounded-full border border-black/10 bg-black/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.24em] text-black/55">
                New best
              </p>
            ) : null}
            <p className="mt-4 text-base leading-7 text-black/75">{style.description}</p>
            {completion ? (
              <p className="mt-3 text-sm leading-6 text-black/65">
                Best: {completion.bestGrade} ({completion.bestScore}) after{" "}
                {completion.attempts} run{completion.attempts === 1 ? "" : "s"}.
              </p>
            ) : null}
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-black/75">
              <StatCard label="Correct calls" value={state.correctCalls} />
              <StatCard label="Risky accepts" value={state.falseAccepts} />
              <StatCard label="Bad declines" value={state.falseDeclines} />
              <StatCard label="Good escalations" value={state.goodEscalations} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="paper-note rounded-[24px] px-5 py-5">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                Screening style
              </p>
              <p className="font-display mt-3 text-3xl uppercase">{style.label}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--paper-bright)]">
                {style.description}
              </p>
            </article>

            <article className="paper-note rounded-[24px] px-5 py-5">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                Action pattern
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--paper-bright)]">
                {actionBiasInsight}
              </p>
            </article>

            <article className="paper-note rounded-[24px] px-5 py-5">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                Most-missed risks
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--paper-bright)]">
                {missedTags.length ? (
                  missedTags.map((tag) => (
                    <li key={tag.tag} className="flex items-center justify-between gap-3">
                      <span>{tag.label}</span>
                      <span className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                        {tag.count}
                      </span>
                    </li>
                  ))
                ) : (
                  <li>You stayed ahead of the main risk patterns.</li>
                )}
              </ul>
            </article>

            <article className="paper-note rounded-[24px] px-5 py-5">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                Blind spot
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--paper-bright)]">
                {riskPatternInsight}
              </p>
            </article>

            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
              <button
                type="button"
                onClick={onReplay}
                className="action-button inline-flex items-center justify-center rounded-full border border-[var(--accent-gold)] bg-[var(--accent-gold)] px-5 py-3 font-display text-lg uppercase tracking-[0.08em] text-[var(--ink)]"
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
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
                {shareStatus}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="dossier-shell paper-panel rounded-[32px] border px-6 py-6 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="folder-tab folder-tab-muted">Run Log</span>
        </div>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Decision log
        </p>
        <div className="mt-5 grid gap-3">
          {state.decisionHistory.map((record, index) => {
            const caseData = day.cases.find((intakeCase) => intakeCase.id === record.caseId);

            return (
              <article
                key={record.caseId}
                className="paper-note rounded-[22px] px-4 py-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-display text-2xl uppercase">
                      {index + 1}. {record.clientName}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--paper-bright)]">
                      {caseData?.headline}
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm text-[var(--paper-bright)] sm:grid-cols-2">
                    <p>
                      <span className="font-mono mr-2 text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
                        You chose
                      </span>
                      {ACTION_LABELS[record.action]}
                    </p>
                    <p>
                      <span className="font-mono mr-2 text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
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
    <div className="rounded-[18px] border border-black/10 bg-black/4 px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-black/45">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-black/80">{value}</p>
    </div>
  );
}
