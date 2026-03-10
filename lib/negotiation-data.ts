import startupAcquisitionRaw from "@/data/scenarios/startup-acquisition.json";
import commercialLeaseRaw from "@/data/scenarios/commercial-lease.json";
import settlementConferenceRaw from "@/data/scenarios/settlement-conference.json";
import { scenarioSchema } from "@/lib/negotiation-schema";
import type { Scenario } from "@/types/negotiation";

// ── Types ──────────────────────────────────────

export interface ScenarioRecord {
  authoredId: string;
  scenarioId: string;
  scenario: Scenario | null;
  error: string | null;
}

// ── Raw inputs ─────────────────────────────────

const AUTHORED_SCENARIO_INPUTS = [
  { authoredId: "startup-acquisition", input: startupAcquisitionRaw },
  { authoredId: "commercial-lease", input: commercialLeaseRaw },
  { authoredId: "settlement-conference", input: settlementConferenceRaw },
] as const;

// ── Loader ─────────────────────────────────────

function formatSchemaError(error: { issues: Array<{ message: string }> }) {
  return error.issues
    .slice(0, 3)
    .map((issue) => issue.message)
    .join(" ");
}

function loadScenario(
  authoredId: string,
  input: unknown,
): ScenarioRecord {
  const result = scenarioSchema.safeParse(input);
  if (result.success) {
    return {
      authoredId,
      scenarioId: result.data.id,
      scenario: result.data as Scenario,
      error: null,
    };
  }
  return {
    authoredId,
    scenarioId: authoredId,
    scenario: null,
    error: formatSchemaError(result.error),
  };
}

function compareScenarioRecords(
  left: ScenarioRecord,
  right: ScenarioRecord,
) {
  const leftDiff = left.scenario?.difficulty ?? Number.MAX_SAFE_INTEGER;
  const rightDiff = right.scenario?.difficulty ?? Number.MAX_SAFE_INTEGER;
  return leftDiff - rightDiff || left.authoredId.localeCompare(right.authoredId);
}

// ── Exports ────────────────────────────────────

export const scenarioRecords = AUTHORED_SCENARIO_INPUTS.map(
  ({ authoredId, input }) => loadScenario(authoredId, input),
).sort(compareScenarioRecords);

export const allScenarios = scenarioRecords
  .flatMap((record) => (record.scenario ? [record.scenario] : []))
  .sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id));

export const scenarioLoadErrors = scenarioRecords.filter(
  (record) => record.error,
);

export const availableScenarioIds = allScenarios.map((s) => s.id);

export function getStaticScenarioParams() {
  return availableScenarioIds.map((scenarioId) => ({ scenarioId }));
}

export function getScenarioRecord(
  scenarioId: string,
): ScenarioRecord | null {
  return (
    scenarioRecords.find(
      (record) =>
        record.scenarioId === scenarioId ||
        record.authoredId === scenarioId,
    ) ?? null
  );
}

export function getScenario(scenarioId: string): Scenario {
  const record = getScenarioRecord(scenarioId);
  if (!record) {
    throw new Error(`Unknown scenario: ${scenarioId}`);
  }
  if (!record.scenario) {
    throw new Error(record.error ?? `Unable to load scenario: ${scenarioId}`);
  }
  return record.scenario;
}
