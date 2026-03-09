"use client";

import Image from "next/image";
import { useState } from "react";
import { ActionTray } from "@/components/intake/ActionTray";
import { BriefingScreen } from "@/components/intake/BriefingScreen";
import { CaseFile } from "@/components/intake/CaseFile";
import { DeskHeader } from "@/components/intake/DeskHeader";
import { RevealPanel } from "@/components/intake/RevealPanel";
import { Scorecard } from "@/components/intake/Scorecard";
import {
  advanceAfterReveal,
  applyDecision,
  calculateGrade,
  createInitialGameState,
  getCurrentCase,
  getLawyeredGuidance,
  startDay,
} from "@/lib/game";
import {
  saveDayCompletion,
  type DayCompletion,
} from "@/lib/progress";
import type { ActionType, IntakeDay } from "@/types/intake";

interface IntakeGameProps {
  day: IntakeDay;
  nextDay?: IntakeDay | null;
}

export function IntakeGame({ day, nextDay = null }: IntakeGameProps) {
  const [state, setState] = useState(() => createInitialGameState(day));
  const [savedCompletion, setSavedCompletion] = useState<DayCompletion | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const currentCase = getCurrentCase(day, state);
  const lawyeredGuidance = currentCase ? getLawyeredGuidance(currentCase) : null;
  const latestRecord = state.decisionHistory.at(-1);
  const currentCaseNumber =
    state.screen === "briefing"
      ? 0
      : Math.min(state.currentCaseIndex + 1, day.cases.length);
  const remainingCases =
    state.screen === "briefing"
      ? day.cases.length
      : Math.max(
          day.cases.length -
            state.currentCaseIndex -
            (state.screen === "scorecard" ? 0 : 1),
          0,
        );

  const handleSelect = (action: ActionType) => {
    setState((currentState) => applyDecision(day, currentState, action));
  };

  const handleContinue = () => {
    if (state.screen === "reveal" && state.currentCaseIndex === day.cases.length - 1) {
      const result = saveDayCompletion(day.id, {
        grade: calculateGrade(state.score),
        score: state.score,
        completedAt: Date.now(),
      });
      setSavedCompletion(result.completion);
      setIsNewBest(result.isNewBest);
    }

    setState((currentState) => advanceAfterReveal(day, currentState));
  };

  const handleReplay = () => {
    setState(createInitialGameState(day));
    setSavedCompletion(null);
    setIsNewBest(false);
  };

  return (
    <main className="desk-stage desk-grid min-h-screen px-5 py-8 sm:px-8">
      <div
        aria-hidden="true"
        className="desk-orb left-[-2rem] top-32 h-36 w-36 bg-[var(--accent-red-soft)]"
      />
      <div
        aria-hidden="true"
        className="desk-orb bottom-16 right-[-2rem] h-48 w-48 bg-[var(--accent-green-soft)]"
      />
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DeskHeader
          day={day}
          currentCaseNumber={currentCaseNumber}
          remainingCases={remainingCases}
          score={state.score}
        />

        {state.screen === "briefing" ? (
          <BriefingScreen
            day={day}
            onStart={() => setState((currentState) => startDay(currentState))}
          />
        ) : null}

        {state.screen === "case" && currentCase ? (
          <div className="grid gap-6 xl:grid-cols-[1.28fr_0.72fr]">
            <CaseFile intakeCase={currentCase} />
            <div className="order-first flex flex-col gap-5 xl:order-none xl:sticky xl:top-8 xl:self-start">
              <ActionTray onSelect={handleSelect} />
              <section className="dossier-shell paper-panel rounded-[30px] border px-5 py-5 sm:px-6">
                <div className="grid gap-4 md:grid-cols-[112px_1fr] md:items-center">
                  <div className="mascot-mini paper-sheet rounded-[22px] p-3">
                    <div aria-hidden="true" className="mascot-mini-glow" />
                    <Image
                      src="/lawyered.png"
                      alt="Lawyered sitting back behind a desk."
                      width={1024}
                      height={1024}
                      className="relative z-10 mx-auto h-auto w-full max-w-[92px]"
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="folder-tab">Lawyered View</span>
                      <span className="folder-tab folder-tab-muted">Intake</span>
                    </div>
                    <p className="mt-3 font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                      Intake note
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[var(--paper-bright)] sm:text-base">
                      {lawyeredGuidance?.note}
                    </p>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                      {lawyeredGuidance?.lens}
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="paper-note rounded-[20px] px-4 py-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                      Pressure test
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--paper-bright)]">
                      {lawyeredGuidance?.pressureTest}
                    </p>
                  </div>
                  <div className="paper-note rounded-[20px] px-4 py-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                      Do not assume
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--paper-bright)]">
                      {lawyeredGuidance?.doNotAssume}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : null}

        {state.screen === "reveal" && latestRecord ? (
          <RevealPanel
            record={latestRecord}
            onContinue={handleContinue}
            isLastCase={state.currentCaseIndex === day.cases.length - 1}
          />
        ) : null}

        {state.screen === "scorecard" ? (
          <Scorecard
            day={day}
            nextDay={nextDay}
            state={state}
            completion={savedCompletion}
            isNewBest={isNewBest}
            onReplay={handleReplay}
          />
        ) : null}
      </div>
    </main>
  );
}
