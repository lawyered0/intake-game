import { z } from "zod";

// ── Primitives ────────────────────────────────

export const dealTypeSchema = z.enum([
  "M&A",
  "Lease",
  "Settlement",
  "TermSheet",
  "Employment",
  "IPLicense",
]);

export const difficultySchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

const meterEffectsSchema = z.object({
  dealValue: z.number(),
  riskExposure: z.number(),
  relationship: z.number(),
  clientSatisfaction: z.number(),
});

const metersSchema = z.object({
  dealValue: z.number().min(0).max(100),
  riskExposure: z.number().min(0).max(100),
  relationship: z.number().min(0).max(100),
  clientSatisfaction: z.number().min(0).max(100),
});

// ── Node & option schemas ─────────────────────

const nodeOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  meterEffects: meterEffectsSchema,
  nextNodeId: z.string().min(1),
  feedback: z.string().optional(),
  tags: z.array(z.string().min(1)).optional(),
});

const scenarioNodeSchema = z.object({
  id: z.string().min(1),
  round: z.number().int().positive(),
  narration: z.string().min(1),
  speakerName: z.string().optional(),
  options: z.array(nodeOptionSchema),
  isTerminal: z.boolean().optional(),
  outcomeNarrative: z.string().optional(),
});

// ── Briefing schema ───────────────────────────

const scenarioBriefingSchema = z.object({
  situation: z.string().min(1),
  clientGoals: z.array(z.string().min(1)).min(1),
  batna: z.string().min(1),
  constraints: z.array(z.string().min(1)).min(1),
  intelOnOtherSide: z.array(z.string().min(1)).min(1),
});

// ── Full scenario schema ──────────────────────

export const scenarioSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().min(1),
    dealType: dealTypeSchema,
    difficulty: difficultySchema,
    estimatedMinutes: z.number().positive(),
    playerRole: z.string().min(1),
    counterpartyRole: z.string().min(1),
    briefing: scenarioBriefingSchema,
    initialMeters: metersSchema,
    nodes: z.record(z.string(), scenarioNodeSchema),
    startNodeId: z.string().min(1),
    totalRounds: z.number().int().positive(),
  })
  .superRefine((value, ctx) => {
    // startNodeId must exist in nodes
    if (!(value.startNodeId in value.nodes)) {
      ctx.addIssue({
        code: "custom",
        message: `startNodeId "${value.startNodeId}" not found in nodes.`,
        path: ["startNodeId"],
      });
    }

    for (const [nodeId, node] of Object.entries(value.nodes)) {
      // Node key must match node.id
      if (nodeId !== node.id) {
        ctx.addIssue({
          code: "custom",
          message: `Node key "${nodeId}" does not match node id "${node.id}".`,
          path: ["nodes", nodeId, "id"],
        });
      }

      // Terminal nodes: no options, must have outcomeNarrative
      if (node.isTerminal) {
        if (node.options.length > 0) {
          ctx.addIssue({
            code: "custom",
            message: `Terminal node "${nodeId}" must not have options.`,
            path: ["nodes", nodeId],
          });
        }
        if (!node.outcomeNarrative) {
          ctx.addIssue({
            code: "custom",
            message: `Terminal node "${nodeId}" must have an outcomeNarrative.`,
            path: ["nodes", nodeId],
          });
        }
      }

      // Non-terminal nodes: at least 2 options
      if (!node.isTerminal && node.options.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: `Non-terminal node "${nodeId}" must have at least 2 options.`,
          path: ["nodes", nodeId],
        });
      }

      // Every nextNodeId must exist in nodes
      for (const option of node.options) {
        if (!(option.nextNodeId in value.nodes)) {
          ctx.addIssue({
            code: "custom",
            message: `Option "${option.id}" in node "${nodeId}" references missing node "${option.nextNodeId}".`,
            path: ["nodes", nodeId, "options"],
          });
        }
      }
    }
  });

export function parseScenario(input: unknown) {
  return scenarioSchema.parse(input);
}
