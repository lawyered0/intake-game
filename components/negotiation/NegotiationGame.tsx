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
    <main className="desk-stage min-h-screen px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="card mb-6 flex items-center justify-between rounded-xl px-5 py-3">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="folder-tab action-button"
            >
              Home
            </a>
            <span className="folder-tab folder-tab-muted">
              {scenario.title.split(":")[0] || scenario.title}
            </span>
          </div>
          {state.screen === "round" || state.screen === "feedback" ? (
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">
              Round {state.currentRound}/{scenario.totalRounds}
            </p>
          ) : null}
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
