"use client";

import { useState } from "react";
import {
  advanceAfterFeedback,
  applyChoice,
  calculateGrade,
  calculateWeightedScore,
  createInitialNegotiationState,
  getCurrentNode,
  startNegotiation,
} from "@/lib/negotiation-game";
import {
  saveScenarioCompletion,
  type ScenarioCompletion,
} from "@/lib/negotiation-progress";
import type { Meters, Scenario } from "@/types/negotiation";
import { NegotiationBriefing } from "./NegotiationBriefing";
import { RoundScreen } from "./RoundScreen";
import { FeedbackOverlay } from "./FeedbackOverlay";
import { NegotiationScorecard } from "./NegotiationScorecard";

interface NegotiationGameProps {
  scenario: Scenario;
}

export function NegotiationGame({ scenario }: NegotiationGameProps) {
  const [state, setState] = useState(() =>
    createInitialNegotiationState(scenario),
  );
  const [previousMeters, setPreviousMeters] = useState<Meters | undefined>(
    undefined,
  );
  const [savedCompletion, setSavedCompletion] =
    useState<ScenarioCompletion | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);

  const handleStart = () => {
    setState(startNegotiation(state));
  };

  const handleSelectOption = (optionId: string) => {
    setPreviousMeters({ ...state.meters });
    setState(applyChoice(scenario, state, optionId));
  };

  const handleContinue = () => {
    const nextState = advanceAfterFeedback(scenario, state);

    // Save progress when reaching scorecard
    if (nextState.screen === "scorecard") {
      const grade = calculateGrade(nextState.meters);
      const score = calculateWeightedScore(nextState.meters);
      const { completion, isNewBest: newBest } = saveScenarioCompletion(
        scenario.id,
        { grade, score },
      );
      setSavedCompletion(completion);
      setIsNewBest(newBest);
    }

    setState(nextState);
  };

  const handleReplay = () => {
    setState(createInitialNegotiationState(scenario));
    setPreviousMeters(undefined);
    setSavedCompletion(null);
    setIsNewBest(false);
  };

  const currentNode = getCurrentNode(scenario, state);
  const completedRounds =
    state.choiceHistory.length > 0
      ? state.choiceHistory[state.choiceHistory.length - 1].round
      : 0;

  return (
    <main className="negotiate-stage min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="rpg-panel mb-4 flex items-center justify-between px-4 py-2">
          <a
            href="/"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors"
          >
            Exit
          </a>
          <span className="font-display text-lg uppercase text-[var(--text-primary)]">
            {scenario.title.split(":")[0] || scenario.title}
          </span>
          {state.screen === "round" || state.screen === "feedback" ? (
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent-gold)]">
              Turn {state.currentRound}/{scenario.totalRounds}
            </p>
          ) : <div />}
        </div>

        {/* Screens */}
        {state.screen === "briefing" ? (
          <NegotiationBriefing scenario={scenario} onStart={handleStart} />
        ) : null}

        {state.screen === "round" && currentNode ? (
          <RoundScreen
            node={currentNode}
            meters={state.meters}
            previousMeters={previousMeters}
            totalRounds={scenario.totalRounds}
            completedRounds={completedRounds}
            counterpartyRole={scenario.counterpartyRole}
            onSelectOption={handleSelectOption}
          />
        ) : null}

        {state.screen === "feedback" && state.choiceHistory.length > 0 ? (
          <FeedbackOverlay
            record={state.choiceHistory[state.choiceHistory.length - 1]}
            meters={state.meters}
            previousMeters={previousMeters ?? scenario.initialMeters}
            onContinue={handleContinue}
          />
        ) : null}

        {state.screen === "scorecard" ? (
          <NegotiationScorecard
            scenario={scenario}
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
