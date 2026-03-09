import { describe, expect, it } from "vitest";
import rawDayOne from "@/data/intake/day-1.json";
import rawDayTwo from "@/data/intake/day-2.json";
import rawDayThree from "@/data/intake/day-3.json";
import { parseIntakeDay } from "@/lib/intake-schema";

describe("intake schema", () => {
  it("parses the authored intake days", () => {
    expect(() => parseIntakeDay(rawDayOne)).not.toThrow();
    expect(() => parseIntakeDay(rawDayTwo)).not.toThrow();
    expect(() => parseIntakeDay(rawDayThree)).not.toThrow();
  });

  it("rejects duplicate case ids", () => {
    const invalidDay = structuredClone(rawDayOne);
    invalidDay.cases[1].id = invalidDay.cases[0].id;

    expect(() => parseIntakeDay(invalidDay)).toThrow(/Duplicate case id/);
  });

  it("rejects invalid risk tags", () => {
    const invalidDay = structuredClone(rawDayOne) as typeof rawDayOne & {
      cases: Array<(typeof rawDayOne.cases)[number] & { hiddenRiskTags: string[] }>;
    };
    invalidDay.cases[0].hiddenRiskTags = ["not_a_real_tag"];

    expect(() => parseIntakeDay(invalidDay)).toThrow();
  });

  it("rejects cases without a unique best action", () => {
    const invalidDay = structuredClone(rawDayOne);
    invalidDay.cases[0].outcomes.accept.scoreDelta = 3;
    invalidDay.cases[0].outcomes.request_info.scoreDelta = 3;

    expect(() => parseIntakeDay(invalidDay)).toThrow(/exactly one best action/i);
  });

  it("rejects request-more-info outcomes without a follow-up question", () => {
    const invalidDay = structuredClone(rawDayOne);
    delete invalidDay.cases[0].outcomes.request_info.followUpQuestion;

    expect(() => parseIntakeDay(invalidDay)).toThrow(/follow-up question/i);
  });
});
