import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import PlayDayPage, { generateStaticParams } from "@/app/play/[dayId]/page";

afterEach(() => {
  cleanup();
});

describe("dynamic play page", () => {
  it("generates static params for all authored days", () => {
    expect(generateStaticParams()).toEqual([
      { dayId: "day-1" },
      { dayId: "day-2" },
      { dayId: "day-3" },
    ]);
  });

  it("renders a playable day for a valid route", async () => {
    render(await PlayDayPage({ params: Promise.resolve({ dayId: "day-1" }) }));

    expect(
      screen.getByRole("button", { name: /open the first file/i }),
    ).toBeInTheDocument();
  });

  it("shows the fallback screen for an unknown route", async () => {
    render(await PlayDayPage({ params: Promise.resolve({ dayId: "day-99" }) }));

    expect(screen.getByText(/this intake day is unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/does not exist yet/i)).toBeInTheDocument();
  });
});
