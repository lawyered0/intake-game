import { METER_KEYS, METER_LABELS } from "@/lib/negotiation-game";
import type { Meters } from "@/types/negotiation";
import { MeterBar } from "./MeterBar";

interface MeterDisplayProps {
  meters: Meters;
  previousMeters?: Meters;
}

export function MeterDisplay({ meters, previousMeters }: MeterDisplayProps) {
  return (
    <div className="rpg-panel">
      <div className="rpg-panel-header">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent-gold)]">
          Status
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 p-4">
        {METER_KEYS.map((key) => (
          <MeterBar
            key={key}
            label={METER_LABELS[key]}
            value={meters[key]}
            previousValue={previousMeters?.[key]}
            inverted={key === "riskExposure"}
            meterKey={key}
          />
        ))}
      </div>
    </div>
  );
}
