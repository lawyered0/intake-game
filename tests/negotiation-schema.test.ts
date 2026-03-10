import { describe, expect, it } from "vitest";
import rawStartup from "@/data/scenarios/startup-acquisition.json";
import rawLease from "@/data/scenarios/commercial-lease.json";
import rawSettlement from "@/data/scenarios/settlement-conference.json";
import { parseScenario, scenarioSchema } from "@/lib/negotiation-schema";

describe("negotiation schema", () => {
  it("parses all three authored scenarios", () => {
    expect(() => parseScenario(rawStartup)).not.toThrow();
    expect(() => parseScenario(rawLease)).not.toThrow();
    expect(() => parseScenario(rawSettlement)).not.toThrow();
  });

  it("rejects a scenario with a missing startNodeId", () => {
    const broken = structuredClone(rawStartup);
    broken.startNodeId = "does-not-exist";

    const result = scenarioSchema.safeParse(broken);
    expect(result.success).toBe(false);
  });

  it("rejects a terminal node without outcomeNarrative", () => {
    const broken = structuredClone(rawStartup);
    const terminalId = Object.keys(broken.nodes).find(
      (key) => (broken.nodes as Record<string, { isTerminal?: boolean }>)[key].isTerminal,
    );
    if (terminalId) {
      delete (broken.nodes as Record<string, { outcomeNarrative?: string }>)[terminalId]
        .outcomeNarrative;
    }

    const result = scenarioSchema.safeParse(broken);
    expect(result.success).toBe(false);
  });

  it("rejects a terminal node that still has options", () => {
    const broken = structuredClone(rawStartup);
    const terminalId = Object.keys(broken.nodes).find(
      (key) => (broken.nodes as Record<string, { isTerminal?: boolean }>)[key].isTerminal,
    );
    if (terminalId) {
      const node = (broken.nodes as Record<string, { options: unknown[] }>)[terminalId];
      node.options = [
        {
          id: "fake",
          label: "Fake",
          description: "Fake option",
          meterEffects: { dealValue: 0, riskExposure: 0, relationship: 0, clientSatisfaction: 0 },
          nextNodeId: broken.startNodeId,
        },
      ];
    }

    const result = scenarioSchema.safeParse(broken);
    expect(result.success).toBe(false);
  });

  it("rejects a non-terminal node with fewer than 2 options", () => {
    const broken = structuredClone(rawStartup);
    const nonTerminalId = Object.keys(broken.nodes).find(
      (key) => !(broken.nodes as Record<string, { isTerminal?: boolean }>)[key].isTerminal,
    );
    if (nonTerminalId) {
      const node = (broken.nodes as Record<string, { options: unknown[] }>)[nonTerminalId];
      node.options = node.options.slice(0, 1);
    }

    const result = scenarioSchema.safeParse(broken);
    expect(result.success).toBe(false);
  });

  it("rejects a dangling nextNodeId reference", () => {
    const broken = structuredClone(rawStartup);
    const nonTerminalId = Object.keys(broken.nodes).find(
      (key) => !(broken.nodes as Record<string, { isTerminal?: boolean }>)[key].isTerminal,
    );
    if (nonTerminalId) {
      const node = (broken.nodes as Record<string, { options: Array<{ nextNodeId: string }> }>)[
        nonTerminalId
      ];
      node.options[0].nextNodeId = "ghost-node";
    }

    const result = scenarioSchema.safeParse(broken);
    expect(result.success).toBe(false);
  });

  it("rejects a node whose key doesn't match node.id", () => {
    const broken = structuredClone(rawStartup);
    const firstKey = Object.keys(broken.nodes)[0];
    const nodeMap = broken.nodes as Record<string, { id: string }>;
    nodeMap[firstKey].id = "wrong-id";

    const result = scenarioSchema.safeParse(broken);
    expect(result.success).toBe(false);
  });
});
