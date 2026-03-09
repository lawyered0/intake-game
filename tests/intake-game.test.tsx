import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { IntakeGame } from "@/components/intake/IntakeGame";
import { getIntakeDay, getNextIntakeDay } from "@/lib/intake-data";
import { DAY_COMPLETIONS_KEY } from "@/lib/progress";
import { ACTION_LABELS, getBestAction } from "@/lib/game";
import type { ActionType } from "@/types/intake";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

const loadedDayOne = getIntakeDay("day-1");

const bestActionRun = loadedDayOne.cases.map(getBestAction);
const alwaysAcceptRun = loadedDayOne.cases.map(() => "accept" satisfies ActionType);
const alwaysDeclineRun = loadedDayOne.cases.map(() => "decline" satisfies ActionType);
const alwaysRequestRun = loadedDayOne.cases.map(() => "request_info" satisfies ActionType);
const mixedRun: ActionType[] = [
  "accept",
  "request_info",
  "accept",
  "request_info",
  "request_info",
  "accept",
  "decline",
  "request_info",
  "decline",
  "request_info",
];

describe("intake game flow", () => {
  it("supports a full playthrough with all best decisions", async () => {
    await completeRun(bestActionRun);

    expect(screen.getByText(/^A$/)).toBeInTheDocument();
    expectFinalScore("30");
    expect(screen.getByText("Pragmatic")).toBeInTheDocument();
  });

  it("supports a full playthrough that always accepts", async () => {
    await completeRun(alwaysAcceptRun);

    expect(screen.getByText(/^F$/)).toBeInTheDocument();
    expectFinalScore("-2");
    expect(screen.getByText("Too Trusting")).toBeInTheDocument();
  });

  it("supports a full playthrough that always declines", async () => {
    await completeRun(alwaysDeclineRun);

    expect(screen.getByText(/^F$/)).toBeInTheDocument();
    expectFinalScore("4");
    expect(screen.getByText("Overcautious")).toBeInTheDocument();
  });

  it("supports a full playthrough that always requests more information", async () => {
    await completeRun(alwaysRequestRun);

    expect(screen.getByText(/^B$/)).toBeInTheDocument();
    expectFinalScore("18");
    expect(screen.getByText("Disciplined")).toBeInTheDocument();
  });

  it("supports a mixed plausible run", async () => {
    await completeRun(mixedRun);

    expect(screen.getByText(/^A$/)).toBeInTheDocument();
    expectFinalScore("28");
    expect(screen.getByText("Pragmatic")).toBeInTheDocument();
    expect(screen.getByText("Decision log")).toBeInTheDocument();
  });

  it("shows a new-best badge, next-day CTA, and saved best score", async () => {
    window.localStorage.setItem(
      DAY_COMPLETIONS_KEY,
      JSON.stringify({
        "day-1": {
          bestGrade: "C",
          bestScore: 12,
          lastGrade: "C",
          lastScore: 12,
          attempts: 1,
          completedAt: 10,
          lastPlayedAt: 10,
        },
      }),
    );

    await completeRun(bestActionRun);

    expect(await screen.findByText(/new best/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /next: day 2/i })).toHaveAttribute(
      "href",
      "/play/day-2",
    );
    expect(screen.getByText(/best: a \(30\) after 2 runs\./i)).toBeInTheDocument();
  });
});

async function completeRun(actions: ActionType[]) {
  const user = userEvent.setup();
  render(<IntakeGame day={loadedDayOne} nextDay={getNextIntakeDay(loadedDayOne.id)} />);

  await user.click(screen.getByRole("button", { name: /open the first file/i }));

  for (let index = 0; index < actions.length; index += 1) {
    await user.click(
      screen.getByRole("button", { name: new RegExp(`^${ACTION_LABELS[actions[index]]}`, "i") }),
    );

    const continueName = index === actions.length - 1 ? /view scorecard/i : /continue to next file/i;
    const continueButton = await screen.findByRole("button", { name: continueName });
    await user.click(continueButton);
  }
}

function expectFinalScore(score: string) {
  const finalScoreLabel = screen.getByText("Final score");
  const finalScoreContainer = finalScoreLabel.parentElement;

  expect(finalScoreContainer).not.toBeNull();

  if (!finalScoreContainer) {
    throw new Error("Final score container missing.");
  }

  expect(within(finalScoreContainer).getByText(score)).toBeInTheDocument();
}
