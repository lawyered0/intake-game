import dayOneRaw from "@/data/intake/day-1.json";
import dayTwoRaw from "@/data/intake/day-2.json";
import dayThreeRaw from "@/data/intake/day-3.json";
import { intakeDaySchema } from "@/lib/intake-schema";
import type { IntakeDay } from "@/types/intake";

export interface IntakeDayRecord {
  authoredId: string;
  dayId: string;
  day: IntakeDay | null;
  error: string | null;
}

const AUTHORED_DAY_INPUTS = [
  { authoredId: "day-1", input: dayOneRaw },
  { authoredId: "day-2", input: dayTwoRaw },
  { authoredId: "day-3", input: dayThreeRaw },
] as const;

function formatSchemaError(error: { issues: Array<{ message: string }> }) {
  return error.issues
    .slice(0, 3)
    .map((issue) => issue.message)
    .join(" ");
}

function loadIntakeDay(authoredId: string, input: unknown): IntakeDayRecord {
  const result = intakeDaySchema.safeParse(input);

  if (result.success) {
    return {
      authoredId,
      dayId: result.data.id,
      day: result.data,
      error: null,
    };
  }

  return {
    authoredId,
    dayId: authoredId,
    day: null,
    error: formatSchemaError(result.error),
  };
}

function compareDayRecords(left: IntakeDayRecord, right: IntakeDayRecord) {
  const leftOrder = left.day?.order ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = right.day?.order ?? Number.MAX_SAFE_INTEGER;

  return leftOrder - rightOrder || left.authoredId.localeCompare(right.authoredId);
}

function compareDays(left: IntakeDay, right: IntakeDay) {
  return left.order - right.order || left.id.localeCompare(right.id);
}

export const dayRecords = AUTHORED_DAY_INPUTS.map(({ authoredId, input }) =>
  loadIntakeDay(authoredId, input),
).sort(compareDayRecords);

export const allDays = dayRecords
  .flatMap((record) => (record.day ? [record.day] : []))
  .sort(compareDays);

export const dayLoadErrors = dayRecords.filter((record) => record.error);
export const availableDayIds = allDays.map((day) => day.id);

export function getStaticDayParams() {
  return availableDayIds.map((dayId) => ({ dayId }));
}

export function getIntakeDayRecord(dayId: string): IntakeDayRecord | null {
  return (
    dayRecords.find((record) => record.dayId === dayId || record.authoredId === dayId) ?? null
  );
}

export function getIntakeDay(dayId: string): IntakeDay {
  const record = getIntakeDayRecord(dayId);

  if (!record) {
    throw new Error(`Unknown intake day: ${dayId}`);
  }

  if (!record.day) {
    throw new Error(record.error ?? `Unable to load intake day: ${dayId}`);
  }

  return record.day;
}

export function getNextIntakeDay(dayId: string): IntakeDay | null {
  const dayIndex = allDays.findIndex((day) => day.id === dayId);

  if (dayIndex < 0) {
    return null;
  }

  return allDays[dayIndex + 1] ?? null;
}
