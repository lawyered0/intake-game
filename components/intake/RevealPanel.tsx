import { ACTION_LABELS } from "@/lib/game";
import type { DecisionRecord } from "@/types/intake";

const verdictTone = {
  strong: "text-[var(--accent-green)]",
  mixed: "text-[var(--accent-gold)]",
  poor: "text-[var(--accent-red)]",
} as const;

interface RevealPanelProps {
  record: DecisionRecord;
  onContinue: () => void;
  isLastCase: boolean;
}

export function RevealPanel({ record, onContinue, isLastCase }: RevealPanelProps) {
  const framing = getRevealFraming(record);

  return (
    <div className="dossier-shell paper-panel rounded-[30px] border px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="folder-tab folder-tab-muted">Result</span>
            </div>
            <span className={`stamp ${verdictTone[record.outcome.verdict]}`}>
              {record.outcome.verdict}
            </span>
            <div>
              <p className="font-display text-3xl uppercase sm:text-4xl">
                {record.outcome.headline}
              </p>
              <p className="mt-2 text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
                Score{" "}
                {record.outcome.scoreDelta > 0
                  ? `+${record.outcome.scoreDelta}`
                  : record.outcome.scoreDelta}
              </p>
            </div>
          </div>
          {!record.wasBest ? (
            <div className="paper-note rounded-[20px] px-4 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
                Better move
              </p>
              <p className="mt-2 font-display text-2xl uppercase">
                {ACTION_LABELS[record.bestAction]}
              </p>
            </div>
          ) : null}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="paper-note space-y-4 rounded-[22px] px-4 py-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
                Intake read
                <span className="sr-only"> Intake read for this decision</span>
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--paper)] sm:text-base">
                {framing.summary}
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
                Assessment
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--paper-bright)] sm:text-base">
                {record.outcome.explanation}
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
                Process point
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--paper-bright)] sm:text-base">
                {record.outcome.whyItMatters}
              </p>
            </div>
            {record.outcome.followUpQuestion ? (
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
                  Next question
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--paper-bright)] sm:text-base">
                  {record.outcome.followUpQuestion}
                </p>
              </div>
            ) : null}
          </div>

          <div className="grid gap-4">
            <DetailList title="Signals caught" items={record.outcome.signalsCaught} />
            <DetailList title="Signals missed" items={record.outcome.signalsMissed} />
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          aria-label={isLastCase ? "View scorecard" : "Continue to next file"}
          className="action-button inline-flex items-center justify-center rounded-full border border-[var(--accent-gold)] bg-[var(--accent-gold)] px-5 py-3 font-display text-lg uppercase tracking-[0.08em] text-[var(--ink)]"
        >
          {isLastCase ? "View Score" : "Next File"}
        </button>
      </div>
    </div>
  );
}

function getRevealFraming(record: DecisionRecord) {
  if (record.outcome.verdict === "strong") {
    if (record.action === "accept") {
      return {
        summary:
          "You opened a file that already had enough fit, record, and client posture to move responsibly.",
      };
    }

    if (record.action === "request_info") {
      return {
        summary:
          "You kept a plausible file alive while protecting the desk from committing before the record was ready.",
      };
    }

    return {
      summary:
        "You declined for a real intake reason rather than letting urgency, polish, or sympathy make the call for you.",
    };
  }

  if (record.outcome.verdict === "mixed") {
    if (record.action === "accept") {
      return {
        summary:
          "The file may have promise, but opening it now skipped at least one step the desk still needed.",
      };
    }

    if (record.action === "request_info" && record.bestAction === "accept") {
      return {
        summary:
          "The pause was disciplined, but this file already had enough on paper to open without another loop.",
      };
    }

    if (record.action === "request_info") {
      return {
        summary:
          "The pause was safer than opening, but the risk profile likely justified a firmer decline.",
      };
    }

    return {
      summary:
        "You protected the desk from moving too fast, but this file likely needed a process step rather than a final no.",
    };
  }

  if (record.action === "accept") {
    return {
      summary:
        "Opening the file asked the firm to take on risk before fit, process, or the source record was where it needed to be.",
    };
  }

  if (record.action === "request_info") {
    return {
      summary:
        "The follow-up was narrower than the real intake problem, so the desk stayed in the file longer than it should have.",
    };
  }

  return {
    summary:
      "The decline closed the door on a file that still had a responsible path to move or to be checked further.",
  };
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="paper-note rounded-[22px] px-4 py-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--paper-bright)]">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </article>
  );
}
