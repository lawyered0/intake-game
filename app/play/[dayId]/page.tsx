import type { Metadata } from "next";
import { DayLoadFallback } from "@/components/intake/DayLoadFallback";
import { IntakeGame } from "@/components/intake/IntakeGame";
import {
  getIntakeDayRecord,
  getNextIntakeDay,
  getStaticDayParams,
} from "@/lib/intake-data";

interface PlayDayPageProps {
  params: Promise<{
    dayId: string;
  }>;
}

function getUnavailableTitle(dayId: string) {
  return `${dayId.replace(/-/g, " ")} unavailable`;
}

export async function generateMetadata({
  params,
}: PlayDayPageProps): Promise<Metadata> {
  const { dayId } = await params;
  const record = getIntakeDayRecord(dayId);

  if (!record?.day) {
    return {
      title: getUnavailableTitle(dayId),
      description: record?.error ?? "That intake day could not be loaded.",
    };
  }

  return {
    title: record.day.title,
    description: record.day.teaser,
  };
}

export function generateStaticParams() {
  return getStaticDayParams();
}

export default async function PlayDayPage({ params }: PlayDayPageProps) {
  const { dayId } = await params;
  const record = getIntakeDayRecord(dayId);

  if (!record) {
    return (
      <DayLoadFallback
        dayId={dayId}
        error="That intake day does not exist yet."
      />
    );
  }

  if (!record.day) {
    return <DayLoadFallback dayId={dayId} error={record.error} />;
  }

  return (
    <IntakeGame day={record.day} nextDay={getNextIntakeDay(record.day.id)} />
  );
}
