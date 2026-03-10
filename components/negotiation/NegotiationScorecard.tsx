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
import { METER_ABBREV, STAT_CSS_VAR } from "@/lib/meter-theme";
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

  const isImpasse =
    outcomeNarrative.toLowerCase().includes("impasse") ||
    outcomeNarrative.toLowerCase().includes("walk");

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
    <section className="screen-enter space-y-4">
      {/* Victory / defeat banner */}
      <div className="rpg-panel text-center px-6 py-8">
        <p
          className={`font-display text-2xl uppercase tracking-[0.12em] ${
            isImpasse ? "text-[var(--accent-red)]" : "text-[var(--accent-gold)]"
          }`}
        >
          {isImpasse ? "Negotiation Failed" : "Negotiation Complete"}
        </p>
        <div className="grade-stamp mx-auto mt-4">
          <p className="font-display text-7xl leading-none text-[var(--accent-gold)] title-glow sm:text-8xl">
            {grade}
          </p>
        </div>
        <p className="mt-4 font-mono text-sm uppercase tracking-[0.22em] text-[var(--text-secondary)]">
          Score: {weightedScore}
        </p>
        {isNewBest ? (
          <p className="mt-2 inline-flex rounded-lg border border-[var(--accent-gold)]/20 bg-[var(--accent-gold-soft)] px-4 py-1.5 font-mono text-xs uppercase tracking-[0.24em] text-[var(--accent-gold)]">
            New Personal Best
          </p>
        ) : null}
        {completion ? (
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Best: {completion.bestGrade} ({completion.bestScore}) after{" "}
            {completion.attempts} run{completion.attempts === 1 ? "" : "s"}.
          </p>
        ) : null}
      </div>

      {/* Outcome + style side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Outcome narrative */}
        <div className="rpg-panel">
          <div className="rpg-panel-header">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent-gold)]">
              Outcome
            </p>
          </div>
          <div className="p-5">
            <p className="text-base leading-8">{outcomeNarrative}</p>
          </div>
        </div>

        {/* Negotiation style as RPG class */}
        <div className="rpg-panel">
          <div className="rpg-panel-header">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
              Style
            </p>
          </div>
          <div className="p-5">
            <p className="font-display text-3xl uppercase text-[var(--accent-gold)]">
              {style}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {styleDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Final stats */}
      <MeterDisplay meters={state.meters} />

      {/* Key moments — combat log */}
      {keyMoments.length > 0 ? (
        <div className="rpg-panel">
          <div className="rpg-panel-header">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent-gold)]">
              Key Moments
            </p>
          </div>
          <div className="p-4 space-y-2">
            {keyMoments.map((moment) => (
              <div
                key={moment.nodeId}
                className="flex items-center gap-3 text-sm font-mono"
              >
                <span className="text-[var(--accent-gold)] text-[10px] uppercase w-12 shrink-0">
                  Turn {moment.round}
                </span>
                <span className="flex-1 text-[var(--text-primary)] truncate">
                  {moment.optionLabel}
                </span>
                <div className="flex gap-2 shrink-0">
                  {METER_KEYS.filter(
                    (key) => moment.meterEffects[key] !== 0,
                  ).map((key) => {
                    const delta = moment.meterEffects[key];
                    const isGood =
                      key === "riskExposure" ? delta < 0 : delta > 0;
                    return (
                      <span
                        key={key}
                        className={`text-[10px] tabular-nums ${
                          isGood
                            ? "text-[var(--accent-green)]"
                            : "text-[var(--accent-red)]"
                        }`}
                      >
                        {delta > 0 ? "+" : ""}
                        {delta} {METER_ABBREV[key]}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReplay}
          className="action-button inline-flex items-center justify-center rounded-lg border border-[var(--accent-gold)] bg-[var(--accent-gold)] px-5 py-3 font-display text-lg uppercase tracking-[0.08em] text-[var(--night)]"
        >
          Play Again
        </button>
        <Link
          href="/"
          className="action-button inline-flex items-center justify-center rounded-lg border border-[var(--line)] px-5 py-3 font-display text-lg uppercase tracking-[0.08em]"
        >
          Home
        </Link>
        <button
          type="button"
          onClick={handleShare}
          className="action-button inline-flex items-center justify-center rounded-lg border border-[var(--line)] px-5 py-3 font-display text-lg uppercase tracking-[0.08em]"
        >
          Share Result
        </button>
      </div>
      {shareStatus ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
          {shareStatus}
        </p>
      ) : null}

      {/* Decision log */}
      <div className="rpg-panel">
        <div className="rpg-panel-header">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
            Round Log
          </p>
        </div>
        <div className="p-4 grid gap-2">
          {state.choiceHistory.map((record) => (
            <div
              key={record.nodeId}
              className="flex items-center gap-3 text-sm font-mono py-2 border-b border-white/4 last:border-b-0"
            >
              <span className="text-[var(--text-secondary)] text-[10px] uppercase w-12 shrink-0">
                Turn {record.round}
              </span>
              <span className="flex-1 text-[var(--text-primary)] font-display text-base uppercase truncate">
                {record.optionLabel}
              </span>
              <div className="flex flex-wrap gap-2 shrink-0">
                {METER_KEYS.filter(
                  (key) => record.meterEffects[key] !== 0,
                ).map((key) => {
                  const delta = record.meterEffects[key];
                  const isGood =
                    key === "riskExposure" ? delta < 0 : delta > 0;
                  return (
                    <span
                      key={key}
                      className={`text-[10px] tabular-nums ${
                        isGood
                          ? "text-[var(--accent-green)]"
                          : "text-[var(--accent-red)]"
                      }`}
                    >
                      {delta > 0 ? "+" : ""}
                      {delta} {METER_ABBREV[key]}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
