import type { MeterEffects, Meters, ScenarioNode } from "@/types/negotiation";
import { METER_KEYS, METER_LABELS } from "@/lib/negotiation-game";
import { MeterDisplay } from "./MeterDisplay";
import { RoundProgress } from "./RoundProgress";

const OPTION_LETTERS = ["A", "B", "C", "D"];
const OPTION_CARD_STYLES = ["option-card-gold", "option-card-green", "option-card-muted", "option-card-muted"];
const OPTION_LETTER_STYLES = ["option-letter-gold", "option-letter-green", "option-letter-muted", "option-letter-muted"];

interface RoundScreenProps {
  node: ScenarioNode;
  meters: Meters;
  previousMeters?: Meters;
  totalRounds: number;
  completedRounds: number;
  counterpartyRole?: string;
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
          {entry.delta > 0 ? "↑" : "↓"} {entry.label}
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
          <div className="flex items-center gap-3 mb-3">
            <div className="speaker-monogram">
              <span className="font-display text-xl text-[var(--accent-gold)]">
                {node.speakerName.charAt(0)}
              </span>
            </div>
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

      <div className="player-zone space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
          Your move
        </p>
        <div className="grid gap-3">
          {node.options.map((option, idx) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectOption(option.id)}
              className={`option-card ${OPTION_CARD_STYLES[idx] ?? "option-card-muted"} cursor-pointer px-5 py-4 text-left`}
            >
              <div className="flex items-start gap-3">
                <span className={`option-letter ${OPTION_LETTER_STYLES[idx] ?? "option-letter-muted"} mt-0.5`}>
                  {OPTION_LETTERS[idx] ?? String.fromCharCode(65 + idx)}
                </span>
                <div className="flex-1">
                  <p className="font-display text-xl uppercase">
                    {option.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    {option.description}
                  </p>
                  <EffectPreview effects={option.meterEffects} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
