import Link from "next/link";
import type { IntakeDay } from "@/types/intake";

interface DeskHeaderProps {
  day: IntakeDay;
  currentCaseNumber: number;
  remainingCases: number;
  score: number;
}

export function DeskHeader({
  day,
  currentCaseNumber,
  remainingCases,
  score,
}: DeskHeaderProps) {
  return (
    <header className="dossier-shell paper-panel rounded-[30px] border px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="folder-tab hover:brightness-110 transition-[filter]">Intake Desk</Link>
            <span className="folder-tab folder-tab-muted">{`Day ${day.order}`}</span>
          </div>
          <p className="eyebrow-rule font-mono text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Intake-Game // Training Desk
          </p>
          <h1 className="font-display mt-2 text-3xl uppercase sm:text-4xl">{day.title}</h1>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Metric label="File" value={`${currentCaseNumber}/${day.cases.length}`} />
          <Metric label="Remaining" value={remainingCases.toString()} />
          <Metric label="Score" value={score.toString()} highlight />
        </div>
      </div>
    </header>
  );
}

function Metric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`metric-card rounded-[18px] px-4 py-3 ${
        highlight ? "score-plaque border border-[var(--brass-dark)]/35" : ""
      }`}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">
        {label}
      </p>
      <p
        className={`font-display mt-2 text-2xl uppercase ${
          highlight ? "text-[var(--ink)]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
