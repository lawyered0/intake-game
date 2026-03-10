import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Home from "@/app/page";

afterEach(() => {
  cleanup();
});

describe("splash page", () => {
  it("renders the Lawyered heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: /lawyered/i }),
    ).toBeInTheDocument();
  });

  it("links to the Closing Table negotiation hub", () => {
    render(<Home />);

    expect(
      screen.getByRole("link", { name: /closing table/i }),
    ).toHaveAttribute("href", "/negotiate");
  });

  it("links to the Intake Training hub", () => {
    render(<Home />);

    expect(
      screen.getByRole("link", { name: /intake training/i }),
    ).toHaveAttribute("href", "/play");
  });

  it("links to the After Hours minigame", () => {
    render(<Home />);

    expect(
      screen.getByRole("link", { name: /after hours/i }),
    ).toHaveAttribute("href", "/after-hours");
  });

  it("links to the external LSAT game in a new tab", () => {
    render(<Home />);

    const lsatLink = screen.getByRole("link", { name: /lsat fun time/i });
    expect(lsatLink).toHaveAttribute(
      "href",
      "https://lawyereds-lsat-game.vercel.app/",
    );
    expect(lsatLink).toHaveAttribute("target", "_blank");
  });
});
