"use client";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--night)] text-[var(--text-primary)]">
        <main className="desk-stage min-h-screen px-5 py-8 sm:px-8">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <section className="card rounded-xl px-6 py-6 sm:px-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="folder-tab">Critical Error</span>
                </div>
                <h1 className="font-display text-4xl uppercase sm:text-5xl">
                  The app could not recover.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
                  Try loading the app again.
                </p>
                <div className="card rounded-xl px-4 py-4 text-sm leading-6">
                  {error.message}
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="action-button inline-flex items-center justify-center rounded-full border border-[var(--accent-gold)] bg-[var(--accent-gold)] px-5 py-3 font-display text-lg uppercase tracking-[0.08em] text-[var(--night)]"
                >
                  Retry
                </button>
              </div>
            </section>
          </div>
        </main>
      </body>
    </html>
  );
}
