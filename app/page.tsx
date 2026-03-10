import Image from "next/image";
import Link from "next/link";
import { DayPicker } from "@/components/intake/DayPicker";
import { ScenarioPicker } from "@/components/negotiation/ScenarioPicker";
import { ACTION_DETAILS } from "@/lib/game";
import { allDays, dayLoadErrors } from "@/lib/intake-data";
import { allScenarios } from "@/lib/negotiation-data";

export default function Home() {
  const totalScenarios = allDays.reduce((sum, day) => sum + day.cases.length, 0);

  return (
    <main className="desk-stage min-h-screen px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="card rounded-xl px-6 py-6 sm:px-8 sm:py-8">
          <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
            <div className="max-w-3xl space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="folder-tab">Intake Training</span>
                <span className="folder-tab folder-tab-muted">Lawyered</span>
              </div>
              <div className="space-y-4">
                <p className="eyebrow-rule font-mono text-xs uppercase tracking-[0.34em] text-[var(--text-secondary)]">
                  Intake-Game
                </p>
                <h1 className="font-display title-glow max-w-4xl text-5xl uppercase leading-[0.9] sm:text-6xl lg:text-7xl">
                  Intake-Game
                </h1>
                <p className="max-w-2xl text-lg leading-7 text-[var(--text-secondary)] sm:text-xl">
                  Review a 10-file intake day for a small firm. Open ready files, pause thin
                  ones, and decline the wrong fits.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="stamp text-[var(--accent-red)]">Filter Clients</span>
                <span className="signal-chip rounded-full px-3 py-1 font-medium">Spot signals</span>
                <span className="signal-chip rounded-full px-3 py-1 font-medium">{totalScenarios} scenarios</span>
              </div>
            </div>
            <div className="relative min-h-[300px]">
              <div className="card relative overflow-hidden rounded-xl border p-5 sm:p-6">
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                  <span className="folder-tab">Meet Lawyered</span>
                  <span className="folder-tab folder-tab-muted">Host</span>
                </div>
                <div className="relative z-10 mt-4">
                  <Image
                    src="/lawyered.png"
                    alt="Lawyered relaxing behind a desk with sunglasses, coffee, and a laptop."
                    width={1024}
                    height={1024}
                    priority
                    className="mx-auto h-auto w-full max-w-[380px] drop-shadow-[0_12px_12px_rgba(0,0,0,0.5)]"
                  />
                </div>
                <div className="relative z-10 mt-4 max-w-xs card rounded-xl px-4 py-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent-gold)]">
                    Lawyered note
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    Polish is not proof.
                  </p>
                </div>
                <div className="relative z-10 mt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href="/after-hours"
                    className="pixel-button pixel-button-primary inline-flex items-center justify-center rounded-full px-5 py-3 font-display text-lg uppercase tracking-[0.08em]"
                  >
                    Play After Hours
                  </Link>
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">
                    Hide from the client glare.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="card rounded-xl px-6 py-6 sm:px-8">
            <p className="eyebrow-rule font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
              How To Play
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {ACTION_DETAILS.map((action, index) => (
                <article
                  key={action.id}
                  className="decision-card rounded-xl border border-[var(--line)] bg-white/3 px-5 py-5"
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                    0{index + 1}
                  </p>
                  <p className="font-display text-2xl uppercase">{action.label}</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                    {action.description}
                  </p>
                </article>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <DayPicker
                days={allDays.map((day) => ({
                  id: day.id,
                  title: day.title,
                  theme: day.theme,
                  teaser: day.teaser,
                }))}
              />
              <p className="max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
                Start with Day 1. Later days hide more risk behind cleaner files.
              </p>
            </div>
            {dayLoadErrors.length ? (
              <div className="card mt-4 rounded-xl px-4 py-4 text-sm leading-6">
                Some intake days could not be loaded. The available days still work.
              </div>
            ) : null}
          </div>

          <aside className="card rounded-xl px-6 py-6">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent-red)]">
              Read For
            </p>
            <ul className="mt-5 space-y-4 text-sm leading-6 sm:text-base">
              <li>Urgency is a signal, not a verdict.</li>
              <li>Fee friction, lawyer churn, and bad motives raise risk.</li>
              <li>Request More Info is often the correct intake move.</li>
              <li>Messy files can still be viable.</li>
            </ul>
            <div className="mt-6 card rounded-xl px-4 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                Goal
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Build a healthy practice with disciplined intake calls.
              </p>
            </div>
          </aside>
        </section>

        {/* Closing Table — Negotiation Game */}
        <section className="card rounded-xl px-6 py-6 sm:px-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="folder-tab">Closing Table</span>
              <span className="folder-tab folder-tab-muted">New</span>
            </div>
            <div className="space-y-3">
              <p className="eyebrow-rule font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                Negotiation Game
              </p>
              <h2 className="font-display title-glow text-4xl uppercase sm:text-5xl">
                Closing Table
              </h2>
              <p className="max-w-2xl text-lg leading-7 text-[var(--text-secondary)]">
                Negotiate a deal over multiple rounds. Manage deal value, risk,
                relationships, and client satisfaction.
              </p>
            </div>
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
          </div>
        </section>
      </div>
    </main>
  );
}
