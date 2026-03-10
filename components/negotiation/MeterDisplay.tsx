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
      {METER_KEYS.map((key) => (
        <MeterBar
          key={key}
          label={METER_LABELS[key]}
          value={meters[key]}
          previousValue={previousMeters?.[key]}
          inverted={key === "riskExposure"}
        />
      ))}
    </div>
  );
}
