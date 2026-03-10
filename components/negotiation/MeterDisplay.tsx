import { METER_KEYS, METER_LABELS } from "@/lib/negotiation-game";
import type { Meters } from "@/types/negotiation";
import { MeterBar } from "./MeterBar";

interface MeterDisplayProps {
  meters: Meters;
  previousMeters?: Meters;
}

export function MeterDisplay({ meters, previousMeters }: MeterDisplayProps) {
  return (
    <div className="card rounded-xl px-4 py-4 space-y-3">
      {METER_KEYS.map((key, idx) => (
        <div
          key={key}
          className={idx < METER_KEYS.length - 1 ? "meter-separator" : ""}
        >
          <MeterBar
            label={METER_LABELS[key]}
            value={meters[key]}
            previousValue={previousMeters?.[key]}
            inverted={key === "riskExposure"}
          />
        </div>
      ))}
    </div>
  );
}
