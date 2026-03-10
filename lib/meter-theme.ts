import type { Meters } from "@/types/negotiation";

/** Per-stat CSS custom property for color */
export const STAT_CSS_VAR: Record<keyof Meters, string> = {
  dealValue: "var(--stat-deal)",
  riskExposure: "var(--stat-risk)",
  relationship: "var(--stat-rel)",
  clientSatisfaction: "var(--stat-sat)",
};

/** Per-stat meter bar fill class */
export const STAT_FILL_CLASS: Record<keyof Meters, string> = {
  dealValue: "meter-fill-deal",
  riskExposure: "meter-fill-risk",
  relationship: "meter-fill-rel",
  clientSatisfaction: "meter-fill-sat",
};

/** Short abbreviated stat names for ability card previews */
export const METER_ABBREV: Record<keyof Meters, string> = {
  dealValue: "DEAL",
  riskExposure: "RISK",
  relationship: "REL",
  clientSatisfaction: "SAT",
};
