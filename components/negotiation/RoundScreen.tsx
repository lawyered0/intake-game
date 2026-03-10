import type { MeterEffects, Meters, ScenarioNode } from "@/types/negotiation";
import { METER_KEYS, METER_LABELS } from "@/lib/negotiation-game";
import { MeterDisplay } from "./MeterDisplay";
import { RoundProgress } from "./RoundProgress";

interface RoundScreenProps {
  node: ScenarioNode;
  meters: Meters;
  previousMeters?: Meters;
  totalRounds: number;
  completedRounds: number;
  onSelectOption: (optionId: string) => void;
}

function EffectPreview({ effects }: { effects: MeterEffects }) {
  const entries = METER_KEYS.filter((key) => effects[key] !== 0).map(
    (key) => ({
      key,
      label: METER_LABELS[key],
      delta: effects[key],
      isGood:
        key === "riskExposure" ? effects[key] < 0 : effects[key] > 0,
    }),
  );

  if (entries.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {entries.map((entry) => (
        <span
          key={entry.key}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] ${
            entry.isGood
              ? "bg-[var(--accent-green-soft)] text-[var(--accent-green)]"
              : "bg-[var(--accent-red-soft)] text-[var(--accent-red)]"
          }`}
        >
          {entry.isGood ? "↑" : "↓"} {entry.label}
        </span>
      ))}
    </div>
  );
}

export function RoundScreen({
  node,
  meters,
  previousMeters,
  totalRounds,
  completedRounds,
  onSelectOption,
}: RoundScreenProps) {
  return (
    <div className="screen-enter space-y-5">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
          Round {node.round} of {totalRounds}
        </p>
        <RoundProgress
          totalRounds={totalRounds}
          currentRound={node.round}
          completedRounds={completedRounds}
        />
      </div>

      <MeterDisplay meters={meters} previousMeters={previousMeters} />

      <div className="dialogue-bubble px-5 py-5 sm:px-6">
        {node.speakerName ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent-gold)]">
            {node.speakerName}
          </p>
        ) : null}
        <p className="mt-2 text-base leading-7 sm:text-lg">
          {node.narration}
        </p>
      </div>

      <div className="space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
          Your move
        </p>
        <div className="grid gap-3">
          {node.options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectOption(option.id)}
              className="option-card cursor-pointer px-5 py-4 text-left"
            >
              <p className="font-display text-xl uppercase">
                {option.label}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                {option.description}
              </p>
              <EffectPreview effects={option.meterEffects} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
