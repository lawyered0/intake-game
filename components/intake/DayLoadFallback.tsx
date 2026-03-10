import Link from "next/link";

interface DayLoadFallbackProps {
  dayId: string;
  error?: string | null;
}

export function DayLoadFallback({ dayId, error }: DayLoadFallbackProps) {
  return (
    <main className="desk-stage min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <section className="card rounded-xl px-6 py-6 sm:px-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="folder-tab">Data Error</span>
              <span className="folder-tab folder-tab-muted">{dayId}</span>
            </div>
            <h1 className="font-display text-4xl uppercase sm:text-5xl">
              This intake day is unavailable.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
              The authored JSON for this day could not be loaded. The rest of the app is still available.
            </p>
            {error ? (
              <div className="card rounded-xl px-4 py-4 text-sm leading-6">
                {error}
              </div>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/play"
                className="action-button inline-flex items-center justify-center rounded-full border border-[var(--accent-gold)] bg-[var(--accent-gold)] px-5 py-3 font-display text-lg uppercase tracking-[0.08em] text-[var(--night)]"
              >
                Back Home
              </Link>
              <Link
                href="/play/day-1"
                className="action-button inline-flex items-center justify-center rounded-full border border-[var(--line)] px-5 py-3 font-display text-lg uppercase tracking-[0.08em]"
              >
                Open Day 1
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
