import { ACTION_LABELS, ACTION_ORDER } from "@/lib/game";
import type { ActionType } from "@/types/intake";

const tones: Record<ActionType, string> = {
  accept:
    "border-[var(--accent-green)]/70 bg-[var(--accent-green-soft)] text-[var(--paper-bright)]",
  decline:
    "border-[var(--accent-red)]/70 bg-[var(--accent-red-soft)] text-[var(--paper-bright)]",
  request_info:
    "border-[var(--accent-gold)]/70 bg-white/4 text-[var(--paper-bright)]",
};

const descriptions: Record<ActionType, string> = {
  accept: "Open it when fit and facts are solid.",
  decline: "Pass when the risk is wrong.",
  request_info: "Pause and ask for more.",
};

interface ActionTrayProps {
  onSelect: (action: ActionType) => void;
}

export function ActionTray({ onSelect }: ActionTrayProps) {
  return (
    <section className="dossier-shell paper-panel rounded-[30px] border px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="folder-tab folder-tab-muted">Actions</span>
      </div>
      <p className="mt-3 font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
        Make the call
      </p>
      <div className="mt-4 grid gap-3">
        {ACTION_ORDER.map((action, index) => (
          <button
            key={action}
            type="button"
            onClick={() => onSelect(action)}
            aria-label={ACTION_LABELS[action]}
            className={`action-button decision-card rounded-[24px] border px-5 py-4 text-left ${tones[action]}`}
          >
            <div className="relative z-10 flex items-start gap-4">
              <span className="font-display text-5xl uppercase leading-none text-current/30">
                0{index + 1}
              </span>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-current/70">
                  Decision {index + 1}
                </p>
                <p className="font-display text-2xl uppercase">{ACTION_LABELS[action]}</p>
                <p className="mt-2 text-sm leading-6 text-current/80">
                  {descriptions[action]}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
