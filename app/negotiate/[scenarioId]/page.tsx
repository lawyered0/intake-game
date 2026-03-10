import type { Metadata } from "next";
import Link from "next/link";
import { NegotiationGame } from "@/components/negotiation/NegotiationGame";
import {
  getScenarioRecord,
  getStaticScenarioParams,
} from "@/lib/negotiation-data";

interface NegotiatePageProps {
  params: Promise<{ scenarioId: string }>;
}

export async function generateMetadata({
  params,
}: NegotiatePageProps): Promise<Metadata> {
  const { scenarioId } = await params;
  const record = getScenarioRecord(scenarioId);

  if (!record?.scenario) {
    return { title: "Scenario not found" };
  }

  return {
    title: record.scenario.title,
    description: record.scenario.subtitle,
  };
}

export function generateStaticParams() {
  return getStaticScenarioParams();
}

export default async function NegotiatePage({ params }: NegotiatePageProps) {
  const { scenarioId } = await params;
  const record = getScenarioRecord(scenarioId);

  if (!record?.scenario) {
    return (
      <main className="desk-stage min-h-screen px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <section className="card rounded-xl px-6 py-6 sm:px-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="folder-tab">Data Error</span>
                <span className="folder-tab folder-tab-muted">{scenarioId}</span>
              </div>
              <h1 className="font-display text-4xl uppercase sm:text-5xl">
                This scenario is unavailable.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
                The scenario data could not be loaded.{" "}
                {record?.error ? record.error : ""}
              </p>
              <Link
                href="/"
                className="action-button inline-flex items-center justify-center rounded-full border border-[var(--accent-gold)] bg-[var(--accent-gold)] px-5 py-3 font-display text-lg uppercase tracking-[0.08em] text-[var(--night)]"
              >
                Back Home
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return <NegotiationGame scenario={record.scenario} />;
}
