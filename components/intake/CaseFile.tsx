import type { IntakeCase } from "@/types/intake";

interface CaseFileProps {
  intakeCase: IntakeCase;
}

export function CaseFile({ intakeCase }: CaseFileProps) {
  return (
    <section className="paper-sheet rounded-[32px] px-5 py-5 sm:px-7 sm:py-6">
      <div className="paper-fold" />
      <div
        aria-hidden="true"
        className="absolute right-8 top-5 hidden h-16 w-10 rotate-[12deg] rounded-full border-[4px] border-[#2f241e]/35 border-b-0 lg:block"
      />
      <div className="flex flex-col gap-5 border-b border-black/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="folder-tab">Case File</span>
            <span className="folder-tab folder-tab-on-light">{intakeCase.matterType}</span>
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-black/45">
            {intakeCase.sourceChannel}
          </p>
          <h2 className="font-display mt-2 text-4xl uppercase leading-none text-[var(--ink)] sm:text-5xl">
            {intakeCase.clientName}
          </h2>
          <p className="mt-3 text-lg font-semibold text-black/75">{intakeCase.headline}</p>
        </div>
        <div className="rounded-[20px] border border-black/10 bg-black/4 px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-black/45">
            Matter
          </p>
          <p className="mt-2 text-lg font-semibold text-black/80">{intakeCase.matterType}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <article className="rounded-[24px] border border-black/10 bg-black/4 px-4 py-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-black/45">
              Summary
            </p>
            <p className="mt-3 text-base leading-7 text-black/80">{intakeCase.summary}</p>
          </article>

          <article>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-black/45">
              Goal
            </p>
            <p className="paper-note mt-3 rounded-[20px] px-4 py-4 text-base leading-7 text-black/80">
              {intakeCase.requestedOutcome}
            </p>
          </article>

          <article>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-black/45">
              Key facts
            </p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-black/80 sm:text-base">
              {intakeCase.facts.map((fact, index) => (
                <li
                  key={fact}
                  className="flex items-start gap-3 rounded-[18px] border border-black/10 bg-black/4 px-4 py-3"
                >
                  <span className="case-index shrink-0">{index + 1}</span>
                  <span className="pt-1">{fact}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="space-y-5">
          <article>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-black/45">
              Signals
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {intakeCase.visibleSignals.map((signal) => (
                <span
                  key={signal}
                  className="signal-chip rounded-full px-3 py-1 text-sm font-medium text-black/75"
                >
                  {signal}
                </span>
              ))}
            </div>
          </article>

          <article>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-black/45">
              Documents
            </p>
            <div className="mt-3 space-y-3">
              {intakeCase.documents.map((document, index) => (
                <article
                  key={document.label}
                  className="document-card rounded-[22px] px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-black/45">
                        Exhibit 0{index + 1}
                      </p>
                      <p className="font-display text-xl uppercase text-[var(--ink)]">
                        {document.label}
                      </p>
                    </div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-black/45">
                      {document.type}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-black/80">
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
