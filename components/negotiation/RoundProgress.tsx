interface RoundProgressProps {
  totalRounds: number;
  currentRound: number;
  completedRounds: number;
}

export function RoundProgress({
  totalRounds,
  currentRound,
  completedRounds,
}: RoundProgressProps) {
  return (
    <div
      className="turn-tracker"
      role="progressbar"
      aria-valuenow={completedRounds}
      aria-valuemax={totalRounds}
    >
      {Array.from({ length: totalRounds }, (_, i) => {
        const round = i + 1;
        const isComplete = round <= completedRounds;
        const isActive = round === currentRound;

        let segmentClass = "turn-segment-future";
        if (isComplete) segmentClass = "turn-segment-complete";
        else if (isActive) segmentClass = "turn-segment-active";

        return (
          <div
            key={round}
            className={`turn-segment ${segmentClass}`}
            aria-label={`Turn ${round}${isActive ? " (current)" : ""}${isComplete ? " (complete)" : ""}`}
          >
            {round}
          </div>
        );
      })}
    </div>
  );
}
