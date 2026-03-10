import type { MeterEffects, Meters, ScenarioNode } from "@/types/negotiation";
import { METER_KEYS, METER_LABELS } from "@/lib/negotiation-game";
import { METER_ABBREV, STAT_CSS_VAR } from "@/lib/meter-theme";
import { CharacterPortrait } from "./CharacterPortrait";
import { MeterDisplay } from "./MeterDisplay";
import { RoundProgress } from "./RoundProgress";

const OPTION_LETTERS = ["A", "B", "C", "D"];

interface RoundScreenProps {
  node: ScenarioNode;
  meters: Meters;
  previousMeters?: Meters;
  totalRounds: number;
  completedRounds: number;
  counterpartyRole?: string;
  onSelectOption: (optionId: string) => void;
}

function AbilityEffects({ effects }: { effects: MeterEffects }) {
  const entries = METER_KEYS.filter((key) => effects[key] !== 0).map(
    (key) => ({
      key,
      delta: effects[key],
      isGood: key === "riskExposure" ? effects[key] < 0 : effects[key] > 0,
    }),
  );

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col items-end gap-0.5 shrink-0">
      {entries.map((entry) => (
        <span
          key={entry.key}
          className={`font-mono text-sm font-bold tabular-nums ${
            entry.isGood ? "stat-delta-up" : "stat-delta-down"
          }`}
        >
          {entry.delta > 0 ? "+" : ""}{entry.delta} {METER_ABBREV[entry.key]}
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
  counterpartyRole,
  onSelectOption,
}: RoundScreenProps) {
  return (
    <div className="screen-enter space-y-4">
      {/* Zone 1: Round header + turn tracker */}
      <div className="rpg-panel">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl uppercase text-[var(--accent-gold)]">
              Turn {node.round}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
              of {totalRounds}
            </span>
          </div>
          <div className="w-40 sm:w-52">
            <RoundProgress
              totalRounds={totalRounds}
              currentRound={node.round}
              completedRounds={completedRounds}
            />
          </div>
        </div>
      </div>

      {/* Zone 2: Stats panel */}
      <MeterDisplay meters={meters} previousMeters={previousMeters} />

      {/* Zone 3: Dialogue + Actions side by side */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* Dialogue text */}
        <div className="rpg-panel flex flex-col">
          <div className="rpg-panel-header">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent-gold)]">
              Dialogue
            </p>
          </div>
          <div className="p-5 flex-1">
            {node.speakerName ? (
              <div className="flex items-center gap-3 mb-3">
                <CharacterPortrait speakerName={node.speakerName} size={56} />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent-gold)]">
                    {node.speakerName}
                  </p>
                  {counterpartyRole ? (
                    <p className="font-mono text-[10px] text-[var(--text-secondary)]">
                      {counterpartyRole}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
            <p className="text-base leading-7 sm:text-lg">
              {node.narration}
            </p>
          </div>
        </div>

        {/* Actions / abilities */}
        <div className="rpg-panel flex flex-col">
          <div className="rpg-panel-header">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent-gold)]">
              Actions
            </p>
          </div>
          <div className="p-4 flex-1">
            <div className="grid gap-3">
              {node.options.map((option, idx) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelectOption(option.id)}
                  className="ability-card cursor-pointer px-4 py-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    <span className="option-letter option-letter-gold mt-1 text-sm font-bold">
                      {OPTION_LETTERS[idx] ?? String.fromCharCode(65 + idx)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-lg uppercase">
                        {option.label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                        {option.description}
                      </p>
                    </div>
                    <AbilityEffects effects={option.meterEffects} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
