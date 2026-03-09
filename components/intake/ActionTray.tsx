import { ACTION_LABELS, ACTION_ORDER } from "@/lib/game";
import type { ActionType } from "@/types/intake";

const tones: Record<ActionType, string> = {
  accept:
    "border-l-4 border-l-[var(--accent-green)] border border-white/6 bg-white/3",
  decline:
    "border-l-4 border-l-[var(--accent-red)] border border-white/6 bg-white/3",
  request_info:
    "border-l-4 border-l-[var(--accent-gold)] border border-white/6 bg-white/3",
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
    <section className="card rounded-xl px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="folder-tab folder-tab-muted">Actions</span>
      </div>
      <p className="mt-3 font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
        Make the call
      </p>
      <div className="mt-4 grid gap-3">
        {ACTION_ORDER.map((action, index) => (
          <button
            key={action}
            type="button"
            onClick={() => onSelect(action)}
            aria-label={ACTION_LABELS[action]}
            className={`action-button decision-card rounded-xl px-5 py-4 text-left ${tones[action]}`}
          >
            <div className="relative z-10 flex items-start gap-4">
              <span className="font-display text-5xl uppercase leading-none text-white/15">
                0{index + 1}
              </span>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                  Decision {index + 1}
                </p>
                <p className="font-display text-2xl uppercase">{ACTION_LABELS[action]}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
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
