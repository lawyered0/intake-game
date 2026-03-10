import Image from "next/image";
import { getPortrait } from "@/lib/character-portraits";

interface CharacterPortraitProps {
  speakerName: string;
  size?: number;
}

export function CharacterPortrait({
  speakerName,
  size = 56,
}: CharacterPortraitProps) {
  const portrait = getPortrait(speakerName);

  if (!portrait) {
    return (
      <div className="speaker-monogram">
        <span className="font-display text-xl text-[var(--accent-gold)]">
          {speakerName.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <div
      className="portrait-frame"
      style={
        {
          width: size,
          height: size,
          "--portrait-accent": portrait.accentColor,
        } as React.CSSProperties
      }
    >
      <Image
        src={portrait.src}
        alt={portrait.alt}
        width={size}
        height={size}
        className="portrait-image"
      />
    </div>
  );
}
