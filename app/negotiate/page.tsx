import Link from "next/link";
import { ScenarioPicker } from "@/components/negotiation/ScenarioPicker";
import { allScenarios } from "@/lib/negotiation-data";

export const metadata = {
  title: "Closing Table — Negotiation Game",
  description:
    "Negotiate deals over multiple rounds. Manage deal value, risk, relationships, and client satisfaction.",
};

export default function NegotiateHub() {
  return (
    <main className="negotiate-stage min-h-screen px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {/* Back link */}
        <div>
          <Link
            href="/"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors"
          >
            ← All Games
          </Link>
        </div>

        {/* Header */}
        <header className="rpg-panel px-6 py-6 sm:px-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="folder-tab">Closing Table</span>
              <span className="folder-tab folder-tab-muted">Negotiation</span>
            </div>
            <div className="space-y-3">
              <p className="eyebrow-rule font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                Negotiation Game
              </p>
              <h1 className="font-display title-glow text-4xl uppercase sm:text-5xl lg:text-6xl">
                Closing Table
              </h1>
              <p className="max-w-2xl text-lg leading-7 text-[var(--text-secondary)]">
                Negotiate a deal over multiple rounds. Manage deal value, risk,
                relationships, and client satisfaction.
              </p>
            </div>
          </div>
        </header>

        {/* Scenario picker */}
        <section className="rpg-panel px-6 py-6 sm:px-8">
          <p className="eyebrow-rule font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)] mb-5">
            Choose a Scenario
          </p>
          <ScenarioPicker
            scenarios={allScenarios.map((s) => ({
              id: s.id,
              title: s.title,
              subtitle: s.subtitle,
              dealType: s.dealType,
              difficulty: s.difficulty,
              estimatedMinutes: s.estimatedMinutes,
              playerRole: s.playerRole,
            }))}
          />
        </section>
      </div>
    </main>
  );
}
