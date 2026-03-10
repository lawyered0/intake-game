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
    <div className="flex items-center justify-center gap-0" role="progressbar" aria-valuenow={completedRounds} aria-valuemax={totalRounds}>
      {Array.from({ length: totalRounds }, (_, i) => {
        const round = i + 1;
        const isComplete = round <= completedRounds;
        const isActive = round === currentRound;

        return (
          <div key={round} className="flex items-center">
            {i > 0 ? (
              <div
                className={`round-connector ${isComplete ? "round-connector-complete" : ""}`}
              />
            ) : null}
            <div
              className={`round-dot ${isComplete ? "round-dot-complete" : ""} ${isActive && !isComplete ? "round-dot-active" : ""}`}
              aria-label={`Round ${round}${isActive ? " (current)" : ""}${isComplete ? " (complete)" : ""}`}
            />
          </div>
        );
      })}
    </div>
  );
}
