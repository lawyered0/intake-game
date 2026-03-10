import Image from "next/image";
import Link from "next/link";

const GAMES = [
  {
    id: "intake",
    title: "Intake Training",
    tag: "Intake",
    description:
      "Review intake files for a small firm. Spot signals, filter clients.",
    href: "/play",
    external: false,
  },
  {
    id: "lsat",
    title: "LSAT Fun Time",
    tag: "LSAT",
    description: "Logical Reasoning Practice Game",
    href: "https://lawyereds-lsat-game.vercel.app/",
    external: true,
  },
  {
    id: "after-hours",
    title: "After Hours",
    tag: "Minigame",
    description:
      "Hide from the client glare in Lawyered's pixel minigame.",
    href: "/after-hours",
    external: false,
  },
] as const;

export default function Home() {
  return (
    <main className="desk-stage min-h-screen px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col items-center gap-5 text-center">
          <Image
            src="/lawyered.png"
            alt="Lawyered relaxing behind a desk with sunglasses, coffee, and a laptop."
            width={1024}
            height={1024}
            priority
            className="h-auto w-full max-w-[200px] drop-shadow-[0_12px_12px_rgba(0,0,0,0.5)]"
          />
          <div className="space-y-2">
            <h1 className="font-display title-glow text-5xl uppercase sm:text-6xl">
              Lawyered
            </h1>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
              Legal Practice Games
            </p>
          </div>
        </header>

        {/* Hero: Closing Table */}
        <Link
          href="/negotiate"
          className="group card relative overflow-hidden rounded-xl transition-all hover:ring-1 hover:ring-[var(--accent-gold)]/30"
        >
          {/* Scene background */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, rgba(6,8,16,0.7), rgba(6,8,16,0.95)), url(/backgrounds/startup-acquisition.svg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="folder-tab">Closing Table</span>
              <span className="folder-tab folder-tab-muted">Featured</span>
            </div>
            <div className="mt-4 space-y-3">
              <p className="eyebrow-rule font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                Negotiation Game
              </p>
              <h2 className="font-display title-glow text-4xl uppercase sm:text-5xl">
                Closing Table
              </h2>
              <p className="max-w-2xl text-lg leading-7 text-[var(--text-secondary)]">
                Negotiate deals over multiple rounds. Manage risk,
                relationships, and deal value.
              </p>
            </div>
            <p className="mt-5 inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.18em] text-[var(--accent-gold)] group-hover:gap-3 transition-all">
              Play <span aria-hidden="true">→</span>
            </p>
          </div>
        </Link>

        {/* Game grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          {GAMES.map((game) => {
            const inner = (
              <>
                <div className="flex items-center gap-3">
                  <span className="folder-tab">{game.tag}</span>
                  {game.external ? (
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      ↗ External
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 space-y-2">
                  <h3 className="font-display text-2xl uppercase">
                    {game.title}
                  </h3>
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">
                    {game.description}
                  </p>
                </div>
                <p className="mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent-gold)] group-hover:gap-3 transition-all">
                  Play <span aria-hidden="true">→</span>
                </p>
              </>
            );

            if (game.external) {
              return (
                <a
                  key={game.id}
                  href={game.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group card flex flex-col rounded-xl px-5 py-5 transition-all hover:ring-1 hover:ring-[var(--accent-gold)]/30"
                >
                  {inner}
                </a>
              );
            }

            return (
              <Link
                key={game.id}
                href={game.href}
                className="group card flex flex-col rounded-xl px-5 py-5 transition-all hover:ring-1 hover:ring-[var(--accent-gold)]/30"
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
