"use client";

import Link from "next/link";
import { useState } from "react";
import {
  calculateGrade,
  calculateWeightedScore,
  getKeyMoments,
  getNegotiationStyle,
  getOutcomeNarrative,
  getStyleDescription,
  METER_KEYS,
  METER_LABELS,
} from "@/lib/negotiation-game";
import type { ScenarioCompletion } from "@/lib/negotiation-progress";
import type { NegotiationGameState, Scenario } from "@/types/negotiation";
import { MeterDisplay } from "./MeterDisplay";

interface NegotiationScorecardProps {
  scenario: Scenario;
  state: NegotiationGameState;
  completion: ScenarioCompletion | null;
  isNewBest: boolean;
  onReplay: () => void;
}

export function NegotiationScorecard({
  scenario,
  state,
  completion,
  isNewBest,
  onReplay,
}: NegotiationScorecardProps) {
  const grade = calculateGrade(state.meters);
  const weightedScore = calculateWeightedScore(state.meters);
  const style = getNegotiationStyle(state.choiceHistory);
  const styleDescription = getStyleDescription(style);
  const keyMoments = getKeyMoments(state.choiceHistory);
  const outcomeNarrative = getOutcomeNarrative(scenario, state);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const handleShare = async () => {
    const shareText = `I scored ${grade} on "${scenario.title}" at Lawyered Games.`;
    const shareUrl = typeof window === "undefined" ? "" : window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Lawyered Games — Closing Table",
          text: shareText,
          url: shareUrl,
        });
        setShareStatus("Shared");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(
          `${shareText} ${shareUrl}`.trim(),
        );
        setShareStatus("Copied");
        return;
      }

      setShareStatus("Share unavailable");
    } catch {
      setShareStatus("Share cancelled");
    }
  };

  return (
    <section className="screen-enter space-y-6">
      <div className="card rounded-xl px-6 py-6 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left: grade + outcome */}
          <div className="space-y-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent-gold)]">
                Deal closed
              </p>
              <div className="mt-4 flex items-end gap-4">
                <div className="card-accent rounded-xl px-6 py-5">
                  <p className="font-display text-7xl leading-none text-[var(--accent-gold)] title-glow sm:text-8xl">
                    {grade}
                  </p>
                </div>
                <div className="pb-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                    Weighted score
                  </p>
                  <p className="text-3xl font-semibold">{weightedScore}</p>
                </div>
              </div>
              {isNewBest ? (
                <p className="mt-3 inline-flex rounded-full border border-[var(--accent-gold)]/20 bg-[var(--accent-gold-soft)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--accent-gold)]">
                  New best
                </p>
              ) : null}
              {completion ? (
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Best: {completion.bestGrade} ({completion.bestScore}) after{" "}
                  {completion.attempts} run
                  {completion.attempts === 1 ? "" : "s"}.
                </p>
              ) : null}
            </div>

            <div className="card rounded-xl px-5 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                Outcome
              </p>
              <p className="mt-2 text-base leading-7">{outcomeNarrative}</p>
            </div>

            <MeterDisplay meters={state.meters} />
          </div>

          {/* Right: style + key moments + actions */}
          <div className="space-y-4">
            <div className="card rounded-xl px-5 py-5">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                Negotiation style
              </p>
              <p className="font-display mt-2 text-3xl uppercase">
                {style}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {styleDescription}
              </p>
            </div>

            {keyMoments.length > 0 ? (
              <div className="card rounded-xl px-5 py-5">
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                  Key moments
                </p>
                <div className="mt-3 space-y-3">
                  {keyMoments.map((moment) => (
                    <div
                      key={moment.nodeId}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/6 font-mono text-[10px] text-[var(--text-secondary)]">
                        {moment.round}
                      </span>
                      <div>
                        <p className="font-medium">{moment.optionLabel}</p>
                        {moment.feedback ? (
                          <p className="mt-1 text-[var(--text-secondary)]">
                            {moment.feedback}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="card rounded-xl px-5 py-5">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                Final meters
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                {METER_KEYS.map((key) => (
                  <div key={key} className="card rounded-xl px-3 py-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                      {METER_LABELS[key]}
                    </p>
                    <p className="mt-1 text-xl font-semibold tabular-nums">
                      {state.meters[key]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
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

      {/* Decision log */}
      <div className="card rounded-xl px-6 py-6 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="folder-tab folder-tab-muted">Round Log</span>
        </div>
        <div className="mt-5 grid gap-3">
          {state.choiceHistory.map((record) => (
            <article key={record.nodeId} className="card rounded-xl px-4 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                    Round {record.round}
                  </p>
                  <p className="font-display text-xl uppercase">
                    {record.optionLabel}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {METER_KEYS.filter(
                    (key) => record.meterEffects[key] !== 0,
                  ).map((key) => {
                    const delta = record.meterEffects[key];
                    const isGood =
                      key === "riskExposure" ? delta < 0 : delta > 0;
                    return (
                      <span
                        key={key}
                        className={`font-mono text-[10px] uppercase tracking-[0.18em] ${isGood ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}`}
                      >
                        {METER_LABELS[key]} {delta > 0 ? "+" : ""}
                        {delta}
                      </span>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
