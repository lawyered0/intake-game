import type { ChoiceRecord, Meters } from "@/types/negotiation";
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
    <div className="screen-enter space-y-5">
      <MeterDisplay meters={meters} previousMeters={previousMeters} />

      {record.feedback ? (
        <div className="card-accent rounded-xl px-5 py-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent-gold)]">
            Read
          </p>
          <p className="mt-2 text-base leading-7">{record.feedback}</p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onContinue}
        className="action-button inline-flex w-full items-center justify-center rounded-full border border-[var(--accent-gold)] bg-[var(--accent-gold)] px-5 py-3 font-display text-lg uppercase tracking-[0.08em] text-[var(--night)]"
      >
        Continue
      </button>
    </div>
  );
}
