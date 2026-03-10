import { getDifficultyLabel } from "@/lib/negotiation-game";
import type { Scenario } from "@/types/negotiation";
import { MeterDisplay } from "./MeterDisplay";

interface NegotiationBriefingProps {
  scenario: Scenario;
  onStart: () => void;
}

export function NegotiationBriefing({
  scenario,
  onStart,
}: NegotiationBriefingProps) {
  const { briefing } = scenario;

  return (
    <section className="screen-enter rpg-panel">
      <div className="rpg-panel-header px-6 sm:px-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent-gold)]">
          Mission Briefing
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            Difficulty
          </span>
          <div className="flex gap-1">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className={`w-2.5 h-2.5 rounded-sm ${
                  level <= scenario.difficulty
                    ? "bg-[var(--accent-gold)]"
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="folder-tab">{scenario.dealType}</span>
                <span className="folder-tab folder-tab-muted">
                  {getDifficultyLabel(scenario.difficulty)}
                </span>
              </div>
              <h1 className="font-display mt-3 text-4xl uppercase sm:text-5xl">
                {scenario.title}
              </h1>
              <p className="mt-2 text-lg leading-7 text-[var(--text-secondary)]">
                {scenario.subtitle}
              </p>
            </div>

            <div className="rpg-panel px-5 py-5 space-y-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent-gold)]">
                  Situation
                </p>
                <p className="mt-2 text-base leading-7">
                  {briefing.situation}
                </p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent-gold)]">
                  Your role
                </p>
                <p className="mt-2 text-base font-semibold">
                  {scenario.playerRole}
                </p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  vs. {scenario.counterpartyRole}
                </p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent-gold)]">
                  Client goals
                </p>
                <ul className="mt-2 space-y-2">
                  {briefing.clientGoals.map((goal, i) => (
                    <li
                      key={goal}
                      className="flex items-start gap-3 text-sm leading-6"
                    >
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-white/8 bg-white/6 font-mono text-[10px] text-[var(--text-secondary)]">
                        {i + 1}
                      </span>
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rpg-panel px-5 py-5 space-y-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent-red)]">
                  BATNA
                </p>
                <p className="mt-2 text-sm leading-6">{briefing.batna}</p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                  Constraints
                </p>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {briefing.constraints.map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                  Intel on other side
                </p>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {briefing.intelOnOtherSide.map((intel) => (
                    <li key={intel}>• {intel}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <p className="font-mono mb-2 text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                Base stats
              </p>
              <MeterDisplay meters={scenario.initialMeters} />
            </div>

            <button
              type="button"
              onClick={onStart}
              aria-label="Begin the negotiation encounter"
              className="action-button mt-2 inline-flex w-full items-center justify-center rounded-lg border border-[var(--accent-gold)] bg-[var(--accent-gold)] px-5 py-3 font-display text-lg uppercase tracking-[0.08em] text-[var(--night)]"
            >
              Begin Encounter
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
