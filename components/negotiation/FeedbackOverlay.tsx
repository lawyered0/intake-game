import type { ChoiceRecord, Meters } from "@/types/negotiation";
import { METER_KEYS, METER_LABELS } from "@/lib/negotiation-game";
import { STAT_CSS_VAR } from "@/lib/meter-theme";
import { MeterDisplay } from "./MeterDisplay";

interface FeedbackOverlayProps {
  record: ChoiceRecord;
  meters: Meters;
  previousMeters: Meters;
  onContinue: () => void;
}

export function FeedbackOverlay({
  record,
  meters,
  previousMeters,
  onContinue,
}: FeedbackOverlayProps) {
  return (
    <div className="screen-enter space-y-4">
      {/* Action result header */}
      <div className="rpg-panel px-5 py-4">
        <p className="font-display text-xl uppercase text-[var(--accent-gold)]">
          {record.optionLabel}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-secondary)] mt-1">
          Result
        </p>
      </div>

      {/* Impact panel — large delta numbers */}
      <div className="rpg-panel">
        <div className="rpg-panel-header">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent-gold)]">
            Impact
          </p>
        </div>
        <div className="p-4 grid gap-3">
          {METER_KEYS.map((key) => {
            const delta = record.meterEffects[key];
            const displayDelta = key === "riskExposure" ? -delta : delta;
            const isGood = key === "riskExposure" ? delta < 0 : delta > 0;
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <p
                    className="font-mono text-[10px] uppercase tracking-[0.22em] w-28"
                    style={{ color: STAT_CSS_VAR[key] }}
                  >
                    {METER_LABELS[key]}
                  </p>
                  {delta !== 0 ? (
                    <span
                      className={`font-mono text-xl font-bold tabular-nums stat-delta-float ${
                        isGood ? "stat-delta-up" : "stat-delta-down"
                      }`}
                    >
                      {delta > 0 ? "+" : ""}{delta}
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-[var(--text-secondary)]">
                      --
                    </span>
                  )}
                </div>
                <span
                  className="font-mono text-lg font-bold tabular-nums"
                  style={{ color: STAT_CSS_VAR[key] }}
                >
                  {meters[key]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Updated stat bars */}
      <MeterDisplay meters={meters} previousMeters={previousMeters} />

      {/* Feedback narrative */}
      {record.feedback ? (
        <div className="rpg-panel feedback-card px-5 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent-gold)]">
            Insight
          </p>
          <p className="mt-2 text-base leading-7">{record.feedback}</p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onContinue}
        className="action-button inline-flex w-full items-center justify-center rounded-lg border border-[var(--accent-gold)] bg-[var(--accent-gold)] px-5 py-3 font-display text-lg uppercase tracking-[0.08em] text-[var(--night)]"
      >
        Next Turn
      </button>
    </div>
  );
}
