import Image from "next/image";
import Link from "next/link";
import { DayPicker } from "@/components/intake/DayPicker";
import { ACTION_DETAILS } from "@/lib/game";
import { allDays, dayLoadErrors } from "@/lib/intake-data";

export default function Home() {
  const totalScenarios = allDays.reduce((sum, day) => sum + day.cases.length, 0);

  return (
    <main className="desk-stage desk-grid min-h-screen px-5 py-8 text-[var(--paper)] sm:px-8 lg:px-10">
      <div
        aria-hidden="true"
        className="desk-orb left-[-3rem] top-24 h-48 w-48 bg-[var(--accent-red-soft)]"
      />
      <div
        aria-hidden="true"
        className="desk-orb bottom-12 right-[-2rem] h-56 w-56 bg-[var(--accent-blue-soft)]"
      />
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="hero-marquee dossier-shell paper-panel grain rounded-[32px] border px-6 py-6 sm:px-8 sm:py-8">
          <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
            <div className="max-w-3xl space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="folder-tab">Intake Training</span>
                <span className="folder-tab folder-tab-muted">Lawyered</span>
              </div>
              <div className="space-y-4">
                <p className="eyebrow-rule font-mono text-xs uppercase tracking-[0.34em] text-[var(--muted)]">
                  Intake-Game
                </p>
                <h1 className="font-title title-glow max-w-4xl text-5xl leading-[0.9] sm:text-6xl lg:text-7xl">
                  Intake-Game
                </h1>
                <p className="max-w-2xl text-lg leading-7 text-[var(--paper-bright)] sm:text-xl">
                  Review a 10-file intake day for a small firm. Open ready files, pause thin
                  ones, and decline the wrong fits.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-[var(--paper-bright)]">
                <span className="stamp text-[var(--accent-red)]">Filter Clients</span>
                <span className="star-chip">Spot signals</span>
                <span className="star-chip">{totalScenarios} scenarios</span>
              </div>
            </div>
            <div className="relative min-h-[300px]">
              <div className="mascot-stage stage-card relative overflow-hidden rounded-[34px] border p-5 sm:p-6">
                <div aria-hidden="true" className="mascot-spotlight" />
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                  <span className="folder-tab">Meet Lawyered</span>
                  <span className="folder-tab folder-tab-muted">Host</span>
                </div>
                <div className="mascot-portrait relative z-10 mt-4">
                  <div aria-hidden="true" className="mascot-glow" />
                  <Image
                    src="/lawyered.png"
                    alt="Lawyered relaxing behind a desk with sunglasses, coffee, and a laptop."
                    width={1024}
                    height={1024}
                    priority
                    className="mascot-image mx-auto h-auto w-full max-w-[380px]"
                  />
                </div>
                <div className="relative z-10 mt-4 max-w-xs rounded-[24px] border border-white/12 bg-black/18 px-4 py-4 backdrop-blur-sm">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent-gold)]">
                    Lawyered note
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--paper-bright)]">
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
                  <p className="text-sm leading-6 text-[var(--muted)]">
                    Hide from the client glare.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="dossier-shell paper-panel rounded-[30px] border px-6 py-6 sm:px-8">
            <p className="eyebrow-rule font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              How To Play
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {ACTION_DETAILS.map((action, index) => (
                <article
                  key={action.id}
                  className="decision-card rounded-[24px] border border-[var(--line)] bg-white/3 px-5 py-5"
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                    0{index + 1}
                  </p>
                  <p className="font-display text-2xl uppercase">{action.label}</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--paper-bright)]">
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
              <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
                Start with Day 1. Later days hide more risk behind cleaner files.
              </p>
            </div>
            {dayLoadErrors.length ? (
              <div className="paper-note mt-4 rounded-[22px] px-4 py-4 text-sm leading-6 text-[var(--paper-bright)]">
                Some intake days could not be loaded. The available days still work.
              </div>
            ) : null}
          </div>

          <aside className="hero-ticket paper-sheet rounded-[30px] px-6 py-6">
            <div className="paper-fold" />
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent-red)]">
              Read For
            </p>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-black/80 sm:text-base">
              <li>Urgency is a signal, not a verdict.</li>
              <li>Fee friction, lawyer churn, and bad motives raise risk.</li>
              <li>Request More Info is often the correct intake move.</li>
              <li>Messy files can still be viable.</li>
            </ul>
            <div className="mt-6 rounded-[22px] border border-black/10 bg-black/4 px-4 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-black/45">
                Goal
              </p>
              <p className="mt-2 text-sm leading-6 text-black/75">
                Build a healthy practice with disciplined intake calls.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
