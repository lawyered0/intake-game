import type { IntakeCase } from "@/types/intake";

interface CaseFileProps {
  intakeCase: IntakeCase;
}

export function CaseFile({ intakeCase }: CaseFileProps) {
  return (
    <section className="card rounded-xl px-5 py-5 sm:px-7 sm:py-6">
      <div className="flex flex-col gap-5 border-b border-white/6 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="folder-tab">Case File</span>
            <span className="folder-tab folder-tab-muted">{intakeCase.matterType}</span>
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
            {intakeCase.sourceChannel}
          </p>
          <h2 className="font-display mt-2 text-4xl uppercase leading-none sm:text-5xl">
            {intakeCase.clientName}
          </h2>
          <p className="mt-3 text-lg font-semibold">{intakeCase.headline}</p>
        </div>
        <div className="card rounded-xl px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
            Matter
          </p>
          <p className="mt-2 text-lg font-semibold">{intakeCase.matterType}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <article className="card rounded-xl px-4 py-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
              Summary
            </p>
            <p className="mt-3 text-base leading-7">{intakeCase.summary}</p>
          </article>

          <article>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
              Goal
            </p>
            <p className="card mt-3 rounded-xl px-4 py-4 text-base leading-7">
              {intakeCase.requestedOutcome}
            </p>
          </article>

          <article>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
              Key facts
            </p>
            <ul className="mt-3 space-y-3 text-sm leading-6 sm:text-base">
              {intakeCase.facts.map((fact, index) => (
                <li
                  key={fact}
                  className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/3 px-4 py-3"
                >
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/6 font-mono text-xs text-[var(--text-secondary)]">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{fact}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="space-y-5">
          <article>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
              Signals
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {intakeCase.visibleSignals.map((signal) => (
                <span
                  key={signal}
                  className="signal-chip rounded-full px-3 py-1 text-sm font-medium"
                >
                  {signal}
                </span>
              ))}
            </div>
          </article>

          <article>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
              Documents
            </p>
            <div className="mt-3 space-y-3">
              {intakeCase.documents.map((document, index) => (
                <article
                  key={document.label}
                  className="card rounded-xl px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                        Exhibit 0{index + 1}
                      </p>
                      <p className="font-display text-xl uppercase">
                        {document.label}
                      </p>
                    </div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                      {document.type}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6">
                    {document.body}
                  </p>
                </article>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
