import { useEffect, useRef, useState } from "react";
import type { Meters } from "@/types/negotiation";
import { STAT_CSS_VAR, STAT_FILL_CLASS } from "@/lib/meter-theme";

interface MeterBarProps {
  label: string;
  value: number;
  previousValue?: number;
  inverted?: boolean;
  meterKey: keyof Meters;
}

export function MeterBar({
  label,
  value,
  previousValue,
  inverted = false,
  meterKey,
}: MeterBarProps) {
  const fillRef = useRef<HTMLDivElement>(null);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    if (previousValue !== undefined && previousValue !== value) {
      setShowPulse(true);
      const timeout = setTimeout(() => setShowPulse(false), 800);
      return () => clearTimeout(timeout);
    }
  }, [value, previousValue]);

  const delta =
    previousValue !== undefined ? value - previousValue : undefined;
  const displayDelta = delta !== undefined ? (inverted ? -delta : delta) : undefined;
  const statColor = STAT_CSS_VAR[meterKey];
  const fillClass = STAT_FILL_CLASS[meterKey];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] font-medium"
          style={{ color: statColor }}
        >
          {label}
        </p>
        <div className="flex items-center gap-2">
          {displayDelta !== undefined && displayDelta !== 0 ? (
            <span
              className={`font-mono text-sm font-bold tabular-nums stat-delta-float ${
                displayDelta > 0 ? "stat-delta-up" : "stat-delta-down"
              }`}
            >
              {displayDelta > 0 ? "+" : ""}{displayDelta}
            </span>
          ) : null}
          <span
            className="font-mono text-lg font-bold tabular-nums"
            style={{ color: statColor }}
          >
            {value}
          </span>
        </div>
      </div>
      <div className="meter-bar-track">
        <div
          ref={fillRef}
          className={`meter-bar-fill ${fillClass} ${showPulse ? "meter-pulse" : ""}`}
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
