import { useEffect, useRef, useState } from "react";

interface MeterBarProps {
  label: string;
  value: number;
  previousValue?: number;
  inverted?: boolean; // true for riskExposure (lower is better)
}

function getFillClass(value: number, inverted: boolean): string {
  const effective = inverted ? 100 - value : value;
  if (effective >= 65) return "meter-fill-green";
  if (effective >= 35) return "meter-fill-gold";
  return "meter-fill-red";
}

export function MeterBar({
  label,
  value,
  previousValue,
  inverted = false,
}: MeterBarProps) {
  const fillRef = useRef<HTMLDivElement>(null);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    if (previousValue !== undefined && previousValue !== value) {
      setShowPulse(true);
      const timeout = setTimeout(() => setShowPulse(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [value, previousValue]);

  const delta =
    previousValue !== undefined ? value - previousValue : undefined;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
          {label}
        </p>
        <div className="flex items-center gap-2">
          {delta !== undefined && delta !== 0 ? (
            <span
              className={`font-mono text-[11px] font-medium ${
                (inverted ? -delta : delta) > 0 ? "effect-up" : "effect-down"
              }`}
            >
              {(inverted ? -delta : delta) > 0 ? "+" : ""}
              {inverted ? -delta : delta}
            </span>
          ) : null}
          <span className="font-mono text-xs tabular-nums text-[var(--text-primary)]">
            {value}
          </span>
        </div>
      </div>
      <div className="meter-bar-track">
        <div
          ref={fillRef}
          className={`meter-bar-fill ${getFillClass(value, inverted)} ${showPulse ? "meter-pulse" : ""}`}
          style={{ width: `${value}%` }}
          role="meter"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
    </div>
  );
}
