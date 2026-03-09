import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Home from "@/app/page";
import { DAY_COMPLETIONS_KEY } from "@/lib/progress";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe("home page", () => {
  it("links to all playable days from the registry", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: /play after hours/i })).toHaveAttribute(
      "href",
      "/after-hours",
    );
    expect(screen.getByRole("link", { name: /^day 1$/i })).toHaveAttribute(
      "href",
      "/play/day-1",
    );
    expect(screen.getByRole("link", { name: /^day 2$/i })).toHaveAttribute(
      "href",
      "/play/day-2",
    );
    expect(screen.getByRole("link", { name: /^day 3$/i })).toHaveAttribute(
      "href",
      "/play/day-3",
    );
  });

  it("shows stored best progress from local storage", async () => {
    window.localStorage.setItem(
      DAY_COMPLETIONS_KEY,
      JSON.stringify({
        "day-1": {
          bestGrade: "A",
          bestScore: 30,
          lastGrade: "B",
          lastScore: 18,
          attempts: 2,
          completedAt: Date.now(),
          lastPlayedAt: Date.now(),
        },
      }),
    );

    render(<Home />);

    expect(await screen.findByText(/best: a/i)).toBeInTheDocument();
  });
});
