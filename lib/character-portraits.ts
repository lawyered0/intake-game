export interface CharacterPortrait {
  src: string;
  alt: string;
  accentColor: string;
}

const PORTRAITS: Record<string, CharacterPortrait> = {
  "Alex Chen": {
    src: "/portraits/alex-chen.svg",
    alt: "Alex Chen, Founder & CEO of NovaMind AI",
    accentColor: "var(--stat-deal)",
  },
  "Dana Park": {
    src: "/portraits/dana-park.svg",
    alt: "Dana Park, Senior Broker for Meridian Properties",
    accentColor: "var(--accent-gold)",
  },
  "Marcus Webb": {
    src: "/portraits/marcus-webb.svg",
    alt: "Marcus Webb, Plaintiff's Attorney",
    accentColor: "var(--accent-red)",
  },
  "Patricia Okonkwo": {
    src: "/portraits/patricia-okonkwo.svg",
    alt: "Ret. Judge Patricia Okonkwo, Mediator",
    accentColor: "var(--stat-rel)",
  },
};

/**
 * Look up a portrait by speaker name. Handles all formats from scenario data:
 * "Alex Chen", "Dana Park, Meridian Properties",
 * "Marcus Webb, Plaintiff's Attorney",
 * "Mediator (Ret. Judge Patricia Okonkwo)"
 */
export function getPortrait(speakerName: string): CharacterPortrait | null {
  if (PORTRAITS[speakerName]) return PORTRAITS[speakerName];
  for (const [key, portrait] of Object.entries(PORTRAITS)) {
    if (speakerName.includes(key)) return portrait;
  }
  return null;
}
