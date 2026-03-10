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
    <header className="card rounded-xl px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/play" className="folder-tab">Intake Desk</Link>
            <span className="folder-tab folder-tab-muted">{`Day ${day.order}`}</span>
          </div>
          <p className="eyebrow-rule font-mono text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">
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
      className={`rounded-xl px-4 py-3 ${
        highlight ? "card-accent" : "card"
      }`}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-secondary)]">
        {label}
      </p>
      <p
        className={`font-display mt-2 text-2xl uppercase ${
          highlight ? "text-[var(--accent-gold)]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
