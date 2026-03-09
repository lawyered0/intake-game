import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dataDir = join(process.cwd(), "data", "intake");
const requestInfoPositivePhrases = [
  "prudent",
  "reasonable",
  "defensible",
  "disciplined",
  "right move",
  "right call",
  "kept",
  "strong intake move",
];
const mixedOutcomePhrases = ["but", "still", "yet", "even so", "understandable"];

const dayFiles = readdirSync(dataDir)
  .filter((file) => file.endsWith(".json"))
  .sort();
const days = dayFiles.map((file) =>
  JSON.parse(readFileSync(join(dataDir, file), "utf8")),
);
const issues = [];
const globalCaseIds = new Set();

for (const day of days) {
  const bestActions = day.cases.map((intakeCase) => {
    const outcomes = Object.entries(intakeCase.outcomes);
    const bestScore = Math.max(...outcomes.map(([, outcome]) => outcome.scoreDelta));
    const winners = outcomes.filter(([, outcome]) => outcome.scoreDelta === bestScore);

    if (winners.length !== 1) {
      issues.push(`${day.id}/${intakeCase.id}: case must have one unique best action`);
    }

    if (globalCaseIds.has(intakeCase.id)) {
      issues.push(`${day.id}/${intakeCase.id}: duplicate case id across days`);
    }
    globalCaseIds.add(intakeCase.id);

    if (intakeCase.outcomes.request_info.scoreDelta <= 0) {
      issues.push(`${day.id}/${intakeCase.id}: request_info must stay positive`);
    }

    if (!intakeCase.outcomes.request_info.followUpQuestion) {
      issues.push(`${day.id}/${intakeCase.id}: request_info needs a follow-up question`);
    }

    const requestExplanation =
      intakeCase.outcomes.request_info.explanation.toLowerCase();
    if (
      !requestInfoPositivePhrases.some((phrase) =>
        requestExplanation.includes(phrase),
      )
    ) {
      issues.push(
        `${day.id}/${intakeCase.id}: request_info explanation should frame the pause as prudent`,
      );
    }

    for (const action of ["accept", "decline"]) {
      const outcome = intakeCase.outcomes[action];
      const explanation = outcome.explanation.toLowerCase();

      if (
        outcome.verdict === "mixed" &&
        !mixedOutcomePhrases.some((phrase) => explanation.includes(phrase))
      ) {
        issues.push(
          `${day.id}/${intakeCase.id}/${action}: mixed explanation should describe why the call was incomplete`,
        );
      }
    }

    return winners[0]?.[0] ?? "unknown";
  });

  const actionCounts = bestActions.reduce(
    (counts, action) => {
      counts[action] = (counts[action] ?? 0) + 1;
      return counts;
    },
    { accept: 0, request_info: 0, decline: 0 },
  );

  if (day.cases.length !== 10) {
    issues.push(`${day.id}: expected 10 cases`);
  }

  if (actionCounts.accept !== 3 || actionCounts.request_info !== 4 || actionCounts.decline !== 3) {
    issues.push(`${day.id}: expected 3 accept / 4 request_info / 3 decline best actions`);
  }

  let currentRun = 1;
  for (let index = 1; index < bestActions.length; index += 1) {
    currentRun = bestActions[index] === bestActions[index - 1] ? currentRun + 1 : 1;
    if (currentRun > 2) {
      issues.push(`${day.id}: more than two identical best actions in a row`);
      break;
    }
  }

  const urgentNonDeclines = day.cases.filter(
    (intakeCase, index) =>
      intakeCase.hiddenRiskTags.includes("urgency") && bestActions[index] !== "decline",
  );
  if (urgentNonDeclines.length < 3) {
    issues.push(`${day.id}: expected at least three urgent non-decline best actions`);
  }
}

if (issues.length) {
  console.error("Intake content audit failed:\n");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

const totalCases = days.reduce((sum, day) => sum + day.cases.length, 0);
console.log(`Audited ${days.length} days and ${totalCases} cases.`);
for (const day of days) {
  console.log(`- ${day.title} (${day.theme})`);
}
