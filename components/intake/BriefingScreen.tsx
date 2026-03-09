import type { IntakeDay } from "@/types/intake";

interface BriefingScreenProps {
  day: IntakeDay;
  onStart: () => void;
}

export function BriefingScreen({ day, onStart }: BriefingScreenProps) {
  return (
    <section className="card rounded-xl px-6 py-6 sm:px-8 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="folder-tab">Briefing</span>
              <span className="folder-tab folder-tab-muted">Day Setup</span>
            </div>
            <h1 className="font-display mt-3 text-4xl uppercase sm:text-5xl">
              {day.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-7 text-[var(--text-secondary)]">
              {day.briefing.overview}
            </p>
          </div>

          <article className="card rounded-xl px-5 py-5">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent-red)]">
              Your role
            </p>
            <p className="mt-3 text-lg font-semibold">{day.briefing.role}</p>
            <ul className="mt-4 space-y-3 rounded-xl border border-white/6 bg-white/3 px-4 py-3 text-sm leading-6 sm:text-base">
              {day.briefing.goals.map((goal, index) => (
                <li key={goal} className="flex items-start gap-3 py-2">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/6 font-mono text-xs text-[var(--text-secondary)]">
                    {index + 1}
                  </span>
                  <span className="pt-1">{goal}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 card rounded-xl px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
              {day.briefing.reminder}
            </p>
          </article>
        </div>

        <aside className="card rounded-xl px-5 py-5">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent-red)]">
            Scoring
          </p>
          <div className="mt-4 space-y-4">
            {day.scoringGuide.map((item) => (
              <article
                key={item.label}
                className="card rounded-xl px-4 py-4"
              >
                <p className="font-display text-xl uppercase">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.detail}</p>
              </article>
            ))}
          </div>
          <button
            type="button"
            onClick={onStart}
            aria-label="Open the first file"
            className="action-button mt-6 inline-flex w-full items-center justify-center rounded-full border border-[var(--accent-gold)] bg-[var(--accent-gold)] px-5 py-3 font-display text-lg uppercase tracking-[0.08em] text-[var(--night)]"
          >
            Start Day
          </button>
        </aside>
      </div>
    </section>
  );
}
