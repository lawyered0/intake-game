export interface ScenarioTheme {
  backgroundImage: string;
  gradientOverlay: string;
  ambientColor: string;
  gridOpacity: number;
}

export const SCENARIO_THEMES: Record<string, ScenarioTheme> = {
  "startup-acquisition": {
    backgroundImage: "/backgrounds/startup-acquisition.svg",
    gradientOverlay: [
      "radial-gradient(ellipse 50% 40% at 50% -10%, rgba(91, 170, 255, 0.06) 0%, transparent 70%)",
      "radial-gradient(ellipse 60% 55% at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.75) 100%)",
      "linear-gradient(180deg, rgba(6,8,16,0.92) 0%, rgba(10,12,20,0.88) 40%, rgba(8,10,16,0.92) 100%)",
    ].join(", "),
    ambientColor: "rgba(91, 170, 255, 0.05)",
    gridOpacity: 0.35,
  },
  "commercial-lease": {
    backgroundImage: "/backgrounds/commercial-lease.svg",
    gradientOverlay: [
      "radial-gradient(ellipse 50% 40% at 50% -10%, rgba(255, 190, 99, 0.05) 0%, transparent 70%)",
      "radial-gradient(ellipse 60% 55% at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.75) 100%)",
      "linear-gradient(180deg, rgba(12,10,6,0.92) 0%, rgba(16,14,8,0.88) 40%, rgba(10,8,6,0.92) 100%)",
    ].join(", "),
    ambientColor: "rgba(255, 190, 99, 0.04)",
    gridOpacity: 0.3,
  },
  "settlement-conference": {
    backgroundImage: "/backgrounds/settlement-conference.svg",
    gradientOverlay: [
      "radial-gradient(ellipse 50% 40% at 50% -10%, rgba(167, 139, 250, 0.05) 0%, transparent 70%)",
      "radial-gradient(ellipse 60% 55% at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.8) 100%)",
      "linear-gradient(180deg, rgba(8,6,16,0.92) 0%, rgba(12,10,20,0.88) 40%, rgba(8,6,16,0.92) 100%)",
    ].join(", "),
    ambientColor: "rgba(167, 139, 250, 0.04)",
    gridOpacity: 0.4,
  },
};

export function getScenarioTheme(scenarioId: string): ScenarioTheme | null {
  return SCENARIO_THEMES[scenarioId] ?? null;
}
