import { describe, expect, it } from "vitest";
import { allDays } from "@/lib/intake-data";
import { getBestAction, getLawyeredGuidance } from "@/lib/game";

const REQUEST_INFO_POSITIVE_PHRASES = [
  "prudent",
  "reasonable",
  "defensible",
  "disciplined",
  "right move",
  "right call",
  "kept",
  "strong intake move",
  "sound intake",
  "measured pause",
];
const MIXED_OUTCOME_PHRASES = ["but", "still", "yet", "even so", "understandable"];
const BANNED_ADVICE_PATTERNS = [
  /\bguarantee(?:d|s)?\b/i,
  /\bautomatic (?:decline|rejection|yes|no|pass)\b/i,
  /\bauto-?decline\b/i,
  /\balways reject\b/i,
  /\bskip(?:ping)? (?:the )?conflict/i,
  /\bweapon(?:ize|s|ized)?\b/i,
  /\bgullible\b/i,
  /\bcrazy\b/i,
  /\bidiot\b/i,
  /\bslam dunk\b/i,
];
const VAGUE_FOLLOW_UP_PATTERNS = [
  /tell me more/i,
  /anything else/i,
  /what happened\?/i,
  /can you explain\?/i,
];
const LOADED_WORDS = ["gullible", "crazy", "idiot", "weapon", "poison"];

describe("intake content rules", () => {
  it("ships with three authored days and thirty playable scenarios", () => {
    const totalCases = allDays.reduce((sum, day) => sum + day.cases.length, 0);

    expect(allDays).toHaveLength(3);
    expect(totalCases).toBeGreaterThanOrEqual(30);
  });

  it("keeps the planned action distribution on each authored day", () => {
    allDays.forEach((day) => {
      const bestActionCounts = day.cases.reduce<Record<string, number>>((counts, intakeCase) => {
        const bestAction = getBestAction(intakeCase);
        counts[bestAction] = (counts[bestAction] ?? 0) + 1;
        return counts;
      }, {});

      expect(day.cases).toHaveLength(10);
      expect(bestActionCounts.accept).toBe(3);
      expect(bestActionCounts.request_info).toBe(4);
      expect(bestActionCounts.decline).toBe(3);
    });
  });

  it("keeps every case id unique across all authored days", () => {
    const caseIds = allDays.flatMap((day) => day.cases.map((intakeCase) => intakeCase.id));

    expect(new Set(caseIds).size).toBe(caseIds.length);
  });

  it("ensures every case has exactly one best action", () => {
    allDays.forEach((day) => {
      day.cases.forEach((intakeCase) => {
        const outcomeScores = Object.values(intakeCase.outcomes).map((outcome) => outcome.scoreDelta);
        const bestScore = Math.max(...outcomeScores);

        expect(outcomeScores.filter((score) => score === bestScore)).toHaveLength(1);
      });
    });
  });

  it("does not treat urgency as an automatic decline signal", () => {
    allDays.forEach((day) => {
      const urgentNonDeclines = day.cases.filter(
        (intakeCase) =>
          intakeCase.hiddenRiskTags.includes("urgency") && getBestAction(intakeCase) !== "decline",
      );

      expect(urgentNonDeclines.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("never punishes request-more-info as a bad intake instinct", () => {
    const requestOutcomes = allDays.flatMap((day) =>
      day.cases.map((intakeCase) => intakeCase.outcomes.request_info),
    );

    expect(requestOutcomes.every((outcome) => outcome.scoreDelta > 0)).toBe(true);
    expect(requestOutcomes.every((outcome) => outcome.verdict !== "poor")).toBe(true);
    expect(requestOutcomes.every((outcome) => Boolean(outcome.followUpQuestion))).toBe(true);
  });

  it("avoids repeating the same best action more than twice in a row", () => {
    allDays.forEach((day) => {
      const bestActions = day.cases.map(getBestAction);
      let runLength = 1;

      for (let index = 1; index < bestActions.length; index += 1) {
        runLength = bestActions[index] === bestActions[index - 1] ? runLength + 1 : 1;
        expect(runLength).toBeLessThanOrEqual(2);
      }
    });
  });

  it("frames positive request-more-info outcomes as prudent intake moves", () => {
    allDays.forEach((day) => {
      day.cases.forEach((intakeCase) => {
        const explanation = intakeCase.outcomes.request_info.explanation.toLowerCase();

        expect(
          REQUEST_INFO_POSITIVE_PHRASES.some((phrase) => explanation.includes(phrase)),
        ).toBe(true);
      });
    });
  });

  it("keeps advice copy free of guarantees, process-skipping, and loaded phrasing", () => {
    allDays.forEach((day) => {
      day.cases.forEach((intakeCase) => {
        Object.values(intakeCase.outcomes).forEach((outcome) => {
          const adviceText = [
            outcome.explanation,
            outcome.whyItMatters,
            outcome.followUpQuestion ?? "",
          ].join(" ");

          BANNED_ADVICE_PATTERNS.forEach((pattern) => {
            expect(adviceText).not.toMatch(pattern);
          });
        });
      });
    });
  });

  it("gives every positive request-more-info outcome a concrete follow-up question", () => {
    allDays.forEach((day) => {
      day.cases.forEach((intakeCase) => {
        const outcome = intakeCase.outcomes.request_info;

        expect(outcome.followUpQuestion?.length ?? 0).toBeGreaterThan(25);
        VAGUE_FOLLOW_UP_PATTERNS.forEach((pattern) => {
          expect(outcome.followUpQuestion ?? "").not.toMatch(pattern);
        });
      });
    });
  });

  it("keeps Lawyered guidance varied within each day", () => {
    allDays.forEach((day) => {
      const combinedGuidance = day.cases.map((intakeCase) => {
        const guidance = getLawyeredGuidance(intakeCase);
        return [guidance.note, guidance.pressureTest, guidance.doNotAssume].join(" | ");
      });

      expect(new Set(combinedGuidance).size).toBe(day.cases.length);
    });
  });

  it("keeps Lawyered guidance in a firm-safe tone", () => {
    allDays.forEach((day) => {
      day.cases.forEach((intakeCase) => {
        const guidance = getLawyeredGuidance(intakeCase);
        const text = [guidance.note, guidance.pressureTest, guidance.doNotAssume, guidance.lens]
          .join(" ")
          .toLowerCase();

        LOADED_WORDS.forEach((word) => {
          expect(text).not.toContain(word);
        });
      });
    });
  });

  it("treats mixed accept or decline outcomes as incomplete rather than flatly wrong", () => {
    allDays.forEach((day) => {
      day.cases.forEach((intakeCase) => {
        ["accept", "decline"].forEach((action) => {
          const outcome = intakeCase.outcomes[action as "accept" | "decline"];

          if (outcome.verdict === "mixed") {
            expect(
              MIXED_OUTCOME_PHRASES.some((phrase) =>
                outcome.explanation.toLowerCase().includes(phrase),
              ),
            ).toBe(true);
          }
        });
      });
    });
  });
});
