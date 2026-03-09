import { z } from "zod";
import type { IntakeDay } from "@/types/intake";

export const actionTypeSchema = z.enum(["accept", "decline", "request_info"]);
export const riskTagSchema = z.enum([
  "urgency",
  "fee_resistance",
  "prior_counsel",
  "fact_instability",
  "expectation_mismatch",
  "scope_fit",
  "credibility",
  "conflict_adjacent",
  "abusive_behavior",
  "revenge_motive",
]);

const outcomeVerdictSchema = z.enum(["strong", "mixed", "poor"]);

const caseOutcomeSchema = z
  .object({
    scoreDelta: z.union([z.literal(-2), z.literal(1), z.literal(3)]),
    verdict: outcomeVerdictSchema,
    headline: z.string().min(1),
    explanation: z.string().min(1),
    whyItMatters: z.string().min(1),
    signalsCaught: z.array(z.string()),
    signalsMissed: z.array(z.string()),
    followUpQuestion: z.string().optional(),
    styleTag: z.string().min(1),
  })
  .superRefine((value, ctx) => {
    const expectedVerdict =
      value.scoreDelta === 3 ? "strong" : value.scoreDelta === 1 ? "mixed" : "poor";

    if (value.verdict !== expectedVerdict) {
      ctx.addIssue({
        code: "custom",
        message: `Outcome verdict must match scoreDelta ${value.scoreDelta}.`,
      });
    }
  });

const intakeCaseSchema = z
  .object({
    id: z.string().min(1),
    order: z.number().int().positive(),
    clientName: z.string().min(1),
    matterType: z.string().min(1),
    headline: z.string().min(1),
    sourceChannel: z.string().min(1),
    summary: z.string().min(1),
    requestedOutcome: z.string().min(1),
    facts: z.array(z.string().min(1)).min(2),
    documents: z
      .array(
        z.object({
          type: z.string().min(1),
          label: z.string().min(1),
          body: z.string().min(1),
        }),
      )
      .min(1),
    visibleSignals: z.array(z.string().min(1)).min(2),
    hiddenRiskTags: z.array(riskTagSchema).min(1),
    outcomes: z.object({
      accept: caseOutcomeSchema,
      decline: caseOutcomeSchema,
      request_info: caseOutcomeSchema,
    }),
  })
  .superRefine((value, ctx) => {
    const outcomes = Object.entries(value.outcomes);
    const bestScore = Math.max(...outcomes.map(([, outcome]) => outcome.scoreDelta));
    const bestActions = outcomes.filter(([, outcome]) => outcome.scoreDelta === bestScore);

    if (bestActions.length !== 1) {
      ctx.addIssue({
        code: "custom",
        message: "Each intake case must have exactly one best action.",
        path: ["outcomes"],
      });
    }

    if (value.outcomes.request_info.scoreDelta <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Request More Info must stay a positive outcome.",
        path: ["outcomes", "request_info", "scoreDelta"],
      });
    }

    if (!value.outcomes.request_info.followUpQuestion) {
      ctx.addIssue({
        code: "custom",
        message: "Request More Info must include a follow-up question.",
        path: ["outcomes", "request_info", "followUpQuestion"],
      });
    }
  });

export const intakeDaySchema = z
  .object({
    id: z.string().min(1),
    order: z.number().int().positive(),
    title: z.string().min(1),
    theme: z.string().min(1),
    teaser: z.string().min(1),
    briefing: z.object({
      role: z.string().min(1),
      overview: z.string().min(1),
      goals: z.array(z.string().min(1)).min(2),
      reminder: z.string().min(1),
    }),
    scoringGuide: z
      .array(
        z.object({
          label: z.string().min(1),
          detail: z.string().min(1),
        }),
      )
      .min(3),
    cases: z.array(intakeCaseSchema).min(1),
  })
  .superRefine((value, ctx) => {
    const seenIds = new Set<string>();
    const seenOrders = new Set<number>();

    value.cases.forEach((intakeCase, index) => {
      if (seenIds.has(intakeCase.id)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate case id "${intakeCase.id}".`,
          path: ["cases", index, "id"],
        });
      }
      seenIds.add(intakeCase.id);

      if (seenOrders.has(intakeCase.order)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate case order "${intakeCase.order}".`,
          path: ["cases", index, "order"],
        });
      }
      seenOrders.add(intakeCase.order);
    });
  });

export function parseIntakeDay(input: unknown): IntakeDay {
  return intakeDaySchema.parse(input);
}
