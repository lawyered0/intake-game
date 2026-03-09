"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  EMPTY_INPUT,
  HIDE_WINDOW_MS,
  MAX_HITS,
  MINIGAME_LEVELS,
  ROOM_BOUNDS,
  TILE_SIZE,
  createInitialMiniGameRuntime,
  getCurrentGlareState,
  getDashSecondsRemaining,
  getHideSecondsRemaining,
  getHitsLeft,
  getMiniGameLevel,
  getNextMiniGameLevelId,
  getSurvivalSeconds,
  isPlayerDetected,
  isPlayerHidden,
  pauseMiniGame,
  readBestLevelScores,
  resumeMiniGame,
  saveBestLevelScore,
  startMiniGame,
  stepMiniGame,
  type Direction,
  type FeedbackTone,
  type GlareState,
  type MiniGameFeedback,
  type MiniGameLevel,
  type MiniGameLevelId,
  type MiniGameInput,
  type MiniGameResult,
  type MiniGameRuntime,
  type PlayerState,
} from "@/lib/minigame";

interface AfterHoursGameProps {
  initialRuntimeFactory?: () => MiniGameRuntime;
}

const PALETTE = {
  void: "#05060d",
  wall: "#121a31",
  wallEdge: "#213056",
  carpetDark: "#0e1630",
  carpetLight: "#141f42",
  trim: "#1d2848",
  amber: "#f9b15e",
  amberBright: "#ffd78f",
  clientGlow: "#7ddcff",
  clientCore: "#d7f4ff",
  danger: "#ff6b8d",
  woodDark: "#4c2d26",
  woodMid: "#7b4c38",
  woodLight: "#c67f47",
  steelDark: "#34415d",
  steelMid: "#526079",
  steelLight: "#8797b0",
  leaf: "#45aa7b",
  leafShadow: "#2a6b58",
  paper: "#f3dfbc",
  monitor: "#63dfff",
  jacket: "#1a2b53",
  jacketLight: "#2e477b",
  hair: "#ff8b2f",
  skin: "#f2b36d",
  shades: "#090b12",
  shirt: "#273454",
  archiveJacket: "#3a2f5b",
  archiveShirt: "#54437d",
  archiveLight: "#7f5fe6",
  shadow: "rgba(0, 0, 0, 0.44)",
} as const;

export function AfterHoursGame({
  initialRuntimeFactory = () => createInitialMiniGameRuntime(),
}: AfterHoursGameProps) {
  const initialRuntime = useMemo(() => initialRuntimeFactory(), [initialRuntimeFactory]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef<MiniGameRuntime>(initialRuntime);
  const frameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const keyboardInputRef = useRef<MiniGameInput>({ ...EMPTY_INPUT });
  const touchInputRef = useRef<MiniGameInput>({ ...EMPTY_INPUT });
  const [runtime, setRuntime] = useState<MiniGameRuntime>(initialRuntime);
  const [bestScores, setBestScores] = useState(() => readBestLevelScores());
  const [lastResult, setLastResult] = useState<MiniGameResult | null>(null);
  const [runToken, setRunToken] = useState(0);
  const currentLevel = useMemo(() => getMiniGameLevel(runtime.levelId), [runtime.levelId]);
  const nextLevelId = useMemo(
    () => getNextMiniGameLevelId(runtime.levelId),
    [runtime.levelId],
  );
  const currentGlareState = useMemo(
    () => getCurrentGlareState(runtime.elapsedMs, runtime.levelId),
    [runtime.elapsedMs, runtime.levelId],
  );
  const hiddenActive = useMemo(
    () => isPlayerHidden(runtime.player, runtime.hideMsRemaining),
    [runtime.hideMsRemaining, runtime.player],
  );
  const detectionActive = useMemo(() => {
    if (currentGlareState.phase !== "active" || !currentGlareState.beam) {
      return false;
    }

    return isPlayerDetected(runtime.player, currentGlareState.beam, hiddenActive);
  }, [currentGlareState, hiddenActive, runtime.player]);
  const timerLabel = Math.max(0, (currentLevel.durationMs - runtime.elapsedMs) / 1_000).toFixed(1);
  const hitsLeft = getHitsLeft(runtime);
  const filesLabel = `${runtime.collectedPickupIds.length}/${currentLevel.pickups.length}`;
  const hideLabel = runtime.player.isInCover
    ? `${getHideSecondsRemaining(runtime).toFixed(1)}s`
    : `${(HIDE_WINDOW_MS / 1_000).toFixed(1)}s`;
  const dashLabel = runtime.dashCooldownMs > 0
    ? `${getDashSecondsRemaining(runtime).toFixed(1)}s`
    : "Ready";
  const bestScore = bestScores[runtime.levelId] ?? 0;
  const statusLabel = useMemo(() => {
    if (runtime.mode === "paused") {
      return "Paused";
    }

    if (runtime.mode === "won") {
      return "Clear";
    }

    if (runtime.mode === "lost") {
      return runtime.resultReason === "timeout" ? "Time" : "Caught";
    }

    if (runtime.invulnerableMs > 0) {
      return "Recover";
    }

    if (detectionActive) {
      return "Exposed";
    }

    if (hiddenActive && runtime.hideMsRemaining <= 1_000) {
      return "Fading";
    }

    if (hiddenActive) {
      return "Hidden";
    }

    if (runtime.player.isInCover) {
      return "Spent";
    }

    if (currentGlareState.phase === "warning") {
      return "Warn";
    }

    return "Move";
  }, [
    currentGlareState.phase,
    detectionActive,
    hiddenActive,
    runtime.hideMsRemaining,
    runtime.invulnerableMs,
    runtime.mode,
    runtime.player.isInCover,
    runtime.resultReason,
  ]);
  const sweepLabel = currentGlareState.phase === "warning"
    ? "Warn"
    : currentGlareState.phase === "active"
      ? formatPatternLabel(currentGlareState.patternId)
      : "Cool";

  const resetInputs = useCallback(() => {
    keyboardInputRef.current = { ...EMPTY_INPUT };
    touchInputRef.current = { ...EMPTY_INPUT };
  }, []);

  const resetRun = useCallback((nextRuntime: MiniGameRuntime, shouldAnimate: boolean) => {
    resetInputs();
    runtimeRef.current = nextRuntime;
    setRuntime(nextRuntime);
    setLastResult(null);
    lastTimestampRef.current = null;

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (shouldAnimate) {
      setRunToken((token) => token + 1);
    }
  }, [resetInputs]);

  const selectLevel = useCallback((levelId: MiniGameLevelId, autoStart = false) => {
    const baseRuntime = createInitialMiniGameRuntime(levelId);
    const nextRuntime = autoStart ? startMiniGame(baseRuntime) : baseRuntime;

    resetRun(nextRuntime, autoStart);
  }, [resetRun]);

  const handleStart = useCallback(() => {
    const freshRuntime = startMiniGame(createInitialMiniGameRuntime(runtimeRef.current.levelId));

    resetRun(freshRuntime, true);
  }, [resetRun]);

  const pauseRun = useCallback(() => {
    if (runtimeRef.current.mode !== "playing") {
      return;
    }

    const pausedRuntime = pauseMiniGame(runtimeRef.current);

    resetInputs();
    runtimeRef.current = pausedRuntime;
    setRuntime(pausedRuntime);
    lastTimestampRef.current = null;

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, [resetInputs]);

  const resumeRun = useCallback(() => {
    if (runtimeRef.current.mode !== "paused") {
      return;
    }

    const resumedRuntime = resumeMiniGame(runtimeRef.current);

    resetInputs();
    runtimeRef.current = resumedRuntime;
    setRuntime(resumedRuntime);
    lastTimestampRef.current = null;
    setRunToken((token) => token + 1);
  }, [resetInputs]);

  const handleRestart = useCallback(() => {
    handleStart();
  }, [handleStart]);

  const handleAdvanceLevel = useCallback(() => {
    if (!nextLevelId) {
      return;
    }

    selectLevel(nextLevelId, true);
  }, [nextLevelId, selectLevel]);

  const handleTouchDirection = useCallback((direction: Direction | null) => {
    if (!direction) {
      touchInputRef.current = {
        ...touchInputRef.current,
        up: false,
        down: false,
        left: false,
        right: false,
      };
      return;
    }

    touchInputRef.current = {
      ...touchInputRef.current,
      up: direction === "up",
      down: direction === "down",
      left: direction === "left",
      right: direction === "right",
    };
  }, []);

  const handleTouchDash = useCallback(() => {
    touchInputRef.current = {
      ...touchInputRef.current,
      dash: true,
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === "p" || key === "escape") {
        event.preventDefault();

        if (runtimeRef.current.mode === "playing") {
          pauseRun();
        } else if (runtimeRef.current.mode === "paused") {
          resumeRun();
        }

        return;
      }

      if (key === " " || key === "enter") {
        event.preventDefault();

        if (
          runtimeRef.current.mode === "ready" ||
          runtimeRef.current.mode === "won" ||
          runtimeRef.current.mode === "lost"
        ) {
          handleStart();
        } else if (runtimeRef.current.mode === "paused") {
          resumeRun();
        }

        return;
      }

      if (key === "shift") {
        keyboardInputRef.current.dash = true;
        event.preventDefault();
        return;
      }

      if (key === "arrowup" || key === "w") {
        keyboardInputRef.current.up = true;
        event.preventDefault();
      }

      if (key === "arrowdown" || key === "s") {
        keyboardInputRef.current.down = true;
        event.preventDefault();
      }

      if (key === "arrowleft" || key === "a") {
        keyboardInputRef.current.left = true;
        event.preventDefault();
      }

      if (key === "arrowright" || key === "d") {
        keyboardInputRef.current.right = true;
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === "shift") {
        keyboardInputRef.current.dash = false;
      }

      if (key === "arrowup" || key === "w") {
        keyboardInputRef.current.up = false;
      }

      if (key === "arrowdown" || key === "s") {
        keyboardInputRef.current.down = false;
      }

      if (key === "arrowleft" || key === "a") {
        keyboardInputRef.current.left = false;
      }

      if (key === "arrowright" || key === "d") {
        keyboardInputRef.current.right = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleStart, pauseRun, resumeRun]);

  useEffect(() => {
    const handleWindowBlur = () => {
      pauseRun();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseRun();
      }
    };

    const handlePointerRelease = () => {
      touchInputRef.current = { ...EMPTY_INPUT };
    };

    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pointerup", handlePointerRelease);
    window.addEventListener("pointercancel", handlePointerRelease);

    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pointerup", handlePointerRelease);
      window.removeEventListener("pointercancel", handlePointerRelease);
    };
  }, [pauseRun]);

  useEffect(() => {
    if (runtime.mode !== "playing") {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = null;
      lastTimestampRef.current = null;
      return;
    }

    const loop = (timestamp: number) => {
      const lastTimestamp = lastTimestampRef.current ?? timestamp;
      const deltaMs = Math.min(timestamp - lastTimestamp, 32);
      const input = mergeInput(keyboardInputRef.current, touchInputRef.current);
      const nextRuntime = stepMiniGame(runtimeRef.current, input, deltaMs);

      keyboardInputRef.current.dash = false;
      touchInputRef.current.dash = false;
      runtimeRef.current = nextRuntime;
      lastTimestampRef.current = timestamp;
      setRuntime(nextRuntime);

      if (nextRuntime.mode === "won" || nextRuntime.mode === "lost") {
        const { bestScore: persistedBest, isNewBest } = saveBestLevelScore(
          nextRuntime.levelId,
          nextRuntime.score,
          nextRuntime.resultReason === "cleared",
        );

        setBestScores((current) => ({
          ...current,
          [nextRuntime.levelId]: persistedBest,
        }));
        setLastResult({
          survivedSeconds: getSurvivalSeconds(nextRuntime),
          state: nextRuntime.mode,
          hits: nextRuntime.hits,
          score: nextRuntime.score,
          nearMisses: nextRuntime.nearMisses,
          pickupsCollected: nextRuntime.collectedPickupIds.length,
          reason: nextRuntime.resultReason ?? "spotted",
          isNewBest,
          bestScore: persistedBest,
        });
        frameRef.current = null;
        lastTimestampRef.current = null;
        return;
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = null;
    };
  }, [runtime.mode, runToken]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    drawAfterHoursScene(context, runtime, currentGlareState, bestScore, currentLevel);
  }, [bestScore, currentGlareState, currentLevel, runtime]);

  return (
    <main className="desk-stage min-h-screen px-5 py-8 text-[var(--paper)] sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="pixel-shell rounded-[30px] border px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="folder-tab">After Hours</span>
                <span className="folder-tab folder-tab-muted">{currentLevel.label}</span>
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent-blue)]">
                {currentLevel.title}
              </p>
              <h1 className="font-display text-4xl uppercase sm:text-5xl">
                Hide from the client glare
              </h1>
              <p className="max-w-3xl text-base leading-7 text-[var(--paper-bright)] sm:text-lg">
                {currentLevel.tagline}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="pixel-button inline-flex items-center justify-center rounded-full px-5 py-3 font-display text-lg uppercase tracking-[0.08em]"
              >
                Back to Intake-Game
              </Link>
              <button
                type="button"
                onClick={handleStart}
                className="pixel-button pixel-button-primary inline-flex items-center justify-center rounded-full px-5 py-3 font-display text-lg uppercase tracking-[0.08em]"
              >
                {runtime.mode === "playing" ? "Restart run" : "Start hiding"}
              </button>
              {runtime.mode === "playing" || runtime.mode === "paused" ? (
                <button
                  type="button"
                  onClick={runtime.mode === "paused" ? resumeRun : pauseRun}
                  className="pixel-button inline-flex items-center justify-center rounded-full px-5 py-3 font-display text-lg uppercase tracking-[0.08em]"
                >
                  {runtime.mode === "paused" ? "Resume" : "Pause"}
                </button>
              ) : null}
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="pixel-shell rounded-[30px] border px-4 py-4 sm:px-5 sm:py-5">
            <div className="pixel-frame mx-auto max-w-[720px] rounded-[26px] border p-3 sm:p-4">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="pixel-canvas h-auto w-full rounded-[18px]"
                aria-label="After Hours pixel minigame"
              />
            </div>
            <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent-gold)]">
              Walk next to glowing files to grab them. Press Shift to dash.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <PixelStat label="Time left" value={`${timerLabel}s`} />
              <PixelStat label="Hits left" value={String(hitsLeft)} />
              <PixelStat label="Score" value={String(runtime.score)} />
              <PixelStat label="Files" value={filesLabel} />
              <PixelStat label="Hide left" value={hideLabel} />
              <PixelStat label="Dash" value={dashLabel} />
              <PixelStat label="Sweep" value={sweepLabel} />
              <PixelStat label="Status" value={statusLabel} />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <section className="pixel-shell rounded-[30px] border px-6 py-6">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent-blue)]">
                Levels
              </p>
              <div className="mt-4 grid gap-3">
                {MINIGAME_LEVELS.map((level) => {
                  const isActive = level.id === runtime.levelId;

                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => selectLevel(level.id)}
                      className={`pixel-level-card rounded-[22px] border px-4 py-4 text-left ${
                        isActive ? "pixel-level-card-active" : ""
                      }`}
                      aria-label={`${level.label} ${level.title}`}
                    >
                      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                        {level.label}
                      </p>
                      <p className="mt-2 font-display text-2xl uppercase">{level.title}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--paper-bright)]">
                        {level.tagline}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="pixel-shell rounded-[30px] border px-6 py-6">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent-gold)]">
                Controls
              </p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--paper-bright)]">
                <p>
                  Collect all <span className="font-mono text-[var(--accent-gold)]">3 files</span>{" "}
                  before time runs out.
                </p>
                <p>Walk next to a glowing file to pick it up automatically.</p>
                <p>
                  <span className="font-mono text-[var(--accent-gold)]">WASD</span> or arrow
                  keys move. Press <span className="font-mono text-[var(--accent-gold)]">Shift</span>{" "}
                  to dash.
                </p>
                <p>Shadow patches only hide you for 3 seconds.</p>
                <p>Step out and re-enter cover to refresh the hide timer.</p>
                <p>Bright warning flashes mean the next glare is about to fire.</p>
                <p>The game auto-pauses if you switch tabs or window focus.</p>
              </div>
              <button
                type="button"
                onClick={handleRestart}
                className="pixel-button mt-5 inline-flex w-full items-center justify-center rounded-full px-5 py-3 font-display text-lg uppercase tracking-[0.08em]"
              >
                Restart
              </button>
            </section>

            <section className="pixel-shell rounded-[30px] border px-6 py-6">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent-blue)]">
                Touch pad
              </p>
              <div className="touch-pad mt-5">
                <div />
                <TouchButton
                  label="Up"
                  onPress={() => handleTouchDirection("up")}
                  onRelease={() => handleTouchDirection(null)}
                />
                <div />
                <TouchButton
                  label="Left"
                  onPress={() => handleTouchDirection("left")}
                  onRelease={() => handleTouchDirection(null)}
                />
                <TouchButton
                  label="Down"
                  onPress={() => handleTouchDirection("down")}
                  onRelease={() => handleTouchDirection(null)}
                />
                <TouchButton
                  label="Right"
                  onPress={() => handleTouchDirection("right")}
                  onRelease={() => handleTouchDirection(null)}
                />
              </div>
              <button
                type="button"
                onPointerDown={handleTouchDash}
                className="pixel-button pixel-button-primary mt-5 inline-flex w-full items-center justify-center rounded-full px-5 py-3 font-display text-lg uppercase tracking-[0.08em]"
                aria-label="Dash"
              >
                Dash
              </button>
            </section>

            <section className="pixel-shell rounded-[30px] border px-6 py-6">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--accent-red)]">
                Outcome
              </p>
              {runtime.mode === "ready" ? (
                <p className="mt-4 text-base leading-7 text-[var(--paper-bright)]">
                  Walk next to the glowing files to grab them, refresh your cover often, and press Shift when the glare telegraphs.
                </p>
              ) : null}
              {runtime.mode === "paused" ? (
                <p className="mt-4 text-base leading-7 text-[var(--paper-bright)]">
                  Run paused. Resume when you are ready to move again.
                </p>
              ) : null}
              {lastResult ? (
                <div className="mt-4 space-y-3 text-[var(--paper-bright)]">
                  <p className="font-display text-3xl uppercase">
                    {getResultTitle(lastResult)}
                  </p>
                  <p className="text-sm leading-6">
                    {getResultSummary(lastResult)}
                  </p>
                  <p className="text-sm leading-6">
                    Score {lastResult.score}. Files {lastResult.pickupsCollected}/{currentLevel.pickups.length}. Near misses {lastResult.nearMisses}.
                  </p>
                  <p className="text-sm leading-6">
                    {lastResult.isNewBest
                      ? `New best clear: ${lastResult.bestScore}.`
                      : `Best clear: ${lastResult.bestScore}.`}
                  </p>
                  {lastResult.state === "won" && nextLevelId ? (
                    <button
                      type="button"
                      onClick={handleAdvanceLevel}
                      className="pixel-button pixel-button-primary inline-flex items-center justify-center rounded-full px-5 py-3 font-display text-lg uppercase tracking-[0.08em]"
                    >
                      Play {getMiniGameLevel(nextLevelId).label}
                    </button>
                  ) : null}
                  {lastResult.state === "won" && !nextLevelId ? (
                    <p className="text-sm leading-6 text-[var(--accent-gold)]">
                      Both levels clear.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function PixelStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="pixel-stat rounded-[20px] border px-4 py-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl uppercase">{value}</p>
    </div>
  );
}

function TouchButton({
  label,
  onPress,
  onRelease,
}: {
  label: string;
  onPress: () => void;
  onRelease: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="pixel-button touch-button rounded-[18px] px-4 py-4 font-display text-xl uppercase"
      onPointerDown={onPress}
      onPointerUp={onRelease}
      onPointerLeave={onRelease}
      onPointerCancel={onRelease}
    >
      {label.slice(0, 1)}
    </button>
  );
}

function mergeInput(keyboard: MiniGameInput, touch: MiniGameInput): MiniGameInput {
  return {
    up: keyboard.up || touch.up,
    down: keyboard.down || touch.down,
    left: keyboard.left || touch.left,
    right: keyboard.right || touch.right,
    dash: keyboard.dash || touch.dash,
  };
}

function drawAfterHoursScene(
  context: CanvasRenderingContext2D,
  runtime: MiniGameRuntime,
  glareState: GlareState,
  bestScore: number,
  level: MiniGameLevel,
) {
  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const shakeOffsetX = runtime.cameraShakeMs > 0 ? (runtime.elapsedMs % 4 < 2 ? -2 : 2) : 0;
  const shakeOffsetY = runtime.cameraShakeMs > 0 ? (runtime.elapsedMs % 6 < 3 ? 1 : -1) : 0;

  context.save();
  context.translate(shakeOffsetX, shakeOffsetY);
  drawRoom(context, runtime.elapsedMs, level);
  drawPickups(context, level, runtime.collectedPickupIds, runtime.elapsedMs);

  if (glareState.phase === "warning") {
    drawSourceWarning(context, glareState);
  }

  if (glareState.phase === "active" && glareState.beam) {
    drawClientGlare(context, glareState.beam);
    drawClientSilhouette(context, glareState);
  } else {
    drawClientSilhouette(context, glareState);
  }

  drawCoverShadows(context, level);
  drawPlayer(
    context,
    runtime.player,
    runtime.invulnerableMs > 0,
    level,
    isPlayerHidden(runtime.player, runtime.hideMsRemaining),
  );
  drawFeedbacks(context, runtime.feedbacks);
  drawHud(context, runtime, bestScore, level, glareState);
  context.restore();

  if (runtime.mode === "ready") {
    drawOverlay(context, "START", "Walk next to glowing files.", PALETTE.clientGlow);
  }

  if (runtime.mode === "paused") {
    drawOverlay(context, "PAUSED", "Press P or resume.", PALETTE.amberBright);
  }

  if (runtime.mode === "won") {
    drawOverlay(
      context,
      "CLEAR",
      getNextMiniGameLevelId(level.id) ? "Next room unlocked." : "Both rooms clear.",
      PALETTE.clientGlow,
    );
  }

  if (runtime.mode === "lost") {
    drawOverlay(
      context,
      runtime.resultReason === "timeout" ? "TIME" : "CAUGHT",
      runtime.resultReason === "timeout" ? "Files left behind." : "The client saw you.",
      runtime.resultReason === "timeout" ? PALETTE.amberBright : PALETTE.danger,
    );
  }
}

function drawRoom(context: CanvasRenderingContext2D, elapsedMs: number, level: MiniGameLevel) {
  fillRect(context, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, PALETTE.void);
  fillRect(
    context,
    ROOM_BOUNDS.x,
    ROOM_BOUNDS.y,
    ROOM_BOUNDS.width,
    ROOM_BOUNDS.height,
    PALETTE.wall,
  );
  fillRect(
    context,
    ROOM_BOUNDS.x + 2,
    ROOM_BOUNDS.y + 2,
    ROOM_BOUNDS.width - 4,
    ROOM_BOUNDS.height - 4,
    level.theme === "office" ? PALETTE.carpetDark : "#11182f",
  );

  for (let y = ROOM_BOUNDS.y + 2; y < ROOM_BOUNDS.y + ROOM_BOUNDS.height - 2; y += TILE_SIZE) {
    for (
      let x = ROOM_BOUNDS.x + 2;
      x < ROOM_BOUNDS.x + ROOM_BOUNDS.width - 2;
      x += TILE_SIZE
    ) {
      fillRect(
        context,
        x,
        y,
        TILE_SIZE,
        TILE_SIZE,
        level.theme === "office"
          ? ((x + y) / TILE_SIZE) % 2 === 0
            ? PALETTE.carpetDark
            : PALETTE.carpetLight
          : ((x + y) / TILE_SIZE) % 2 === 0
            ? "#121a37"
            : "#172146",
      );
    }
  }

  drawWallTrim(context);

  if (level.theme === "office") {
    drawOfficeRoom(context, elapsedMs);
    return;
  }

  drawArchiveRoom(context, elapsedMs);
}

function drawOfficeRoom(context: CanvasRenderingContext2D, elapsedMs: number) {
  drawWindow(context, elapsedMs);
  drawDoor(context);
  drawFilingCabinet(context, 22, 12);
  drawPlant(context, 54, 18);
  drawBookcase(context, 108, 30);
  drawDesk(context, 38, 60, elapsedMs);
  drawChair(context, 58, 82);
  drawCopier(context, 88, 68);
}

function drawArchiveRoom(context: CanvasRenderingContext2D, elapsedMs: number) {
  drawArchiveGlass(context, elapsedMs);
  drawArchiveDoor(context);
  drawRecordsShelves(context, 20, 18);
  drawConferenceTable(context, 48, 44, elapsedMs);
  drawBench(context, 58, 66);
  drawPillar(context, 98, 20);
  drawWaterCooler(context, 108, 76, elapsedMs);
  drawFileCrates(context, 24, 78);
}

function drawWallTrim(context: CanvasRenderingContext2D) {
  fillRect(context, ROOM_BOUNDS.x, ROOM_BOUNDS.y, ROOM_BOUNDS.width, 2, PALETTE.wallEdge);
  fillRect(context, ROOM_BOUNDS.x, ROOM_BOUNDS.y, 2, ROOM_BOUNDS.height, PALETTE.wallEdge);
  fillRect(
    context,
    ROOM_BOUNDS.x,
    ROOM_BOUNDS.y + ROOM_BOUNDS.height - 2,
    ROOM_BOUNDS.width,
    2,
    PALETTE.trim,
  );
  fillRect(
    context,
    ROOM_BOUNDS.x + ROOM_BOUNDS.width - 2,
    ROOM_BOUNDS.y,
    2,
    ROOM_BOUNDS.height,
    PALETTE.wallEdge,
  );
}

function drawWindow(context: CanvasRenderingContext2D, elapsedMs: number) {
  const pulse = Math.sin(elapsedMs / 280) * 0.08 + 0.28;
  fillRect(context, 140, 16, 4, 34, PALETTE.steelDark);
  fillRect(context, 144, 18, 10, 30, "rgba(125, 220, 255, 0.22)");
  fillRect(context, 144, 18, 1, 30, PALETTE.clientCore);

  for (let row = 0; row < 5; row += 1) {
    fillRect(context, 145, 21 + row * 5, 8, 1, `rgba(215, 244, 255, ${pulse})`);
  }
}

function drawDoor(context: CanvasRenderingContext2D) {
  fillRect(context, 140, 72, 4, 30, PALETTE.steelDark);
  fillRect(context, 144, 74, 10, 26, "rgba(125, 220, 255, 0.12)");
  fillRect(context, 146, 86, 2, 2, PALETTE.clientCore);
}

function drawArchiveGlass(context: CanvasRenderingContext2D, elapsedMs: number) {
  const pulse = Math.sin(elapsedMs / 180) * 0.07 + 0.25;

  fillRect(context, 140, 14, 4, 88, PALETTE.steelDark);
  fillRect(context, 144, 16, 10, 84, "rgba(125, 220, 255, 0.18)");
  fillRect(context, 145, 16, 1, 84, PALETTE.clientCore);

  for (let row = 0; row < 10; row += 1) {
    fillRect(context, 146, 20 + row * 8, 7, 1, `rgba(215, 244, 255, ${pulse})`);
  }
}

function drawArchiveDoor(context: CanvasRenderingContext2D) {
  fillRect(context, 12, 88, 14, 18, PALETTE.steelDark);
  fillRect(context, 13, 89, 12, 16, "#202f55");
  fillRect(context, 20, 96, 2, 2, PALETTE.clientCore);
}

function drawFilingCabinet(context: CanvasRenderingContext2D, x: number, y: number) {
  fillRect(context, x, y, 14, 24, PALETTE.steelDark);
  fillRect(context, x + 1, y + 1, 12, 22, PALETTE.steelMid);
  fillRect(context, x + 2, y + 4, 10, 4, PALETTE.steelLight);
  fillRect(context, x + 2, y + 10, 10, 4, PALETTE.steelLight);
  fillRect(context, x + 2, y + 16, 10, 5, PALETTE.steelLight);
}

function drawPlant(context: CanvasRenderingContext2D, x: number, y: number) {
  fillRect(context, x + 3, y + 7, 4, 5, PALETTE.woodMid);
  fillRect(context, x + 1, y + 10, 8, 2, PALETTE.woodDark);
  fillRect(context, x, y + 2, 4, 6, PALETTE.leafShadow);
  fillRect(context, x + 4, y, 4, 8, PALETTE.leaf);
  fillRect(context, x + 6, y + 4, 4, 5, PALETTE.leafShadow);
}

function drawBookcase(context: CanvasRenderingContext2D, x: number, y: number) {
  fillRect(context, x, y, 14, 22, PALETTE.woodDark);
  fillRect(context, x + 1, y + 1, 12, 20, PALETTE.woodMid);
  fillRect(context, x + 2, y + 4, 10, 1, PALETTE.woodDark);
  fillRect(context, x + 2, y + 10, 10, 1, PALETTE.woodDark);
  fillRect(context, x + 2, y + 16, 10, 1, PALETTE.woodDark);
  fillRect(context, x + 3, y + 2, 2, 2, "#ef6f61");
  fillRect(context, x + 6, y + 2, 2, 2, "#ffd166");
  fillRect(context, x + 9, y + 2, 2, 2, "#45aa7b");
  fillRect(context, x + 3, y + 8, 2, 2, "#7ddcff");
  fillRect(context, x + 6, y + 8, 2, 2, "#ff8b2f");
  fillRect(context, x + 9, y + 8, 2, 2, "#d287ff");
}

function drawRecordsShelves(context: CanvasRenderingContext2D, x: number, y: number) {
  fillRect(context, x, y, 18, 28, PALETTE.steelDark);
  fillRect(context, x + 1, y + 1, 16, 26, "#495673");
  fillRect(context, x + 2, y + 6, 14, 1, PALETTE.steelDark);
  fillRect(context, x + 2, y + 13, 14, 1, PALETTE.steelDark);
  fillRect(context, x + 2, y + 20, 14, 1, PALETTE.steelDark);
  for (let column = 0; column < 5; column += 1) {
    fillRect(context, x + 3 + column * 3, y + 2, 2, 4, column % 2 === 0 ? "#ffd166" : "#ef6f61");
    fillRect(context, x + 3 + column * 3, y + 9, 2, 4, column % 2 === 0 ? "#7ddcff" : "#45aa7b");
    fillRect(context, x + 3 + column * 3, y + 16, 2, 4, column % 2 === 0 ? PALETTE.paper : "#d287ff");
  }
}

function drawDesk(context: CanvasRenderingContext2D, x: number, y: number, elapsedMs: number) {
  fillRect(context, x, y, 28, 18, PALETTE.woodDark);
  fillRect(context, x + 1, y + 1, 26, 16, PALETTE.woodMid);
  fillRect(context, x + 2, y + 2, 24, 4, PALETTE.woodLight);
  fillRect(context, x + 11, y + 5, 8, 5, PALETTE.steelDark);
  fillRect(context, x + 12, y + 6, 6, 3, elapsedMs % 520 < 260 ? PALETTE.monitor : "#3ab8d9");
  fillRect(context, x + 20, y + 3, 2, 8, PALETTE.amberBright);
}

function drawChair(context: CanvasRenderingContext2D, x: number, y: number) {
  fillRect(context, x + 1, y, 8, 5, PALETTE.steelMid);
  fillRect(context, x, y + 5, 10, 3, PALETTE.steelDark);
  fillRect(context, x + 3, y + 8, 4, 2, PALETTE.steelMid);
}

function drawCopier(context: CanvasRenderingContext2D, x: number, y: number) {
  fillRect(context, x, y, 18, 14, PALETTE.steelDark);
  fillRect(context, x + 1, y + 1, 16, 12, "#607089");
  fillRect(context, x + 2, y + 2, 14, 3, "#cfd8e5");
  fillRect(context, x + 3, y + 6, 12, 5, PALETTE.steelLight);
  fillRect(context, x + 4, y + 7, 10, 1, PALETTE.paper);
  fillRect(context, x + 6, y - 1, 6, 2, PALETTE.paper);
}

function drawConferenceTable(context: CanvasRenderingContext2D, x: number, y: number, elapsedMs: number) {
  fillRect(context, x, y, 42, 18, PALETTE.woodDark);
  fillRect(context, x + 1, y + 1, 40, 16, "#6a4332");
  fillRect(context, x + 16, y + 5, 10, 5, PALETTE.steelDark);
  fillRect(context, x + 17, y + 6, 8, 3, elapsedMs % 340 < 170 ? PALETTE.monitor : "#479fc2");
}

function drawBench(context: CanvasRenderingContext2D, x: number, y: number) {
  fillRect(context, x, y, 22, 10, PALETTE.steelDark);
  fillRect(context, x + 1, y + 1, 20, 8, "#41506b");
}

function drawPillar(context: CanvasRenderingContext2D, x: number, y: number) {
  fillRect(context, x, y, 16, 20, PALETTE.steelDark);
  fillRect(context, x + 1, y + 1, 14, 18, "#4d5b78");
}

function drawWaterCooler(context: CanvasRenderingContext2D, x: number, y: number, elapsedMs: number) {
  fillRect(context, x, y, 14, 18, PALETTE.steelDark);
  fillRect(context, x + 1, y + 1, 12, 16, PALETTE.steelMid);
  fillRect(
    context,
    x + 3,
    y,
    8,
    7,
    elapsedMs % 420 < 210 ? "rgba(125, 220, 255, 0.55)" : "rgba(215, 244, 255, 0.45)",
  );
}

function drawFileCrates(context: CanvasRenderingContext2D, x: number, y: number) {
  fillRect(context, x, y, 24, 14, PALETTE.woodDark);
  fillRect(context, x + 1, y + 1, 22, 12, "#5f3c2e");
  fillRect(context, x + 3, y + 3, 18, 1, PALETTE.woodLight);
  fillRect(context, x + 3, y + 6, 18, 1, PALETTE.woodLight);
}

function drawPickups(
  context: CanvasRenderingContext2D,
  level: MiniGameLevel,
  collectedPickupIds: string[],
  elapsedMs: number,
) {
  level.pickups
    .filter((pickup) => !collectedPickupIds.includes(pickup.id))
    .forEach((pickup, index) => {
      const pulse = elapsedMs % 360 < 180 ? PALETTE.amberBright : PALETTE.paper;
      const glow = elapsedMs % 360 < 180 ? "rgba(249, 177, 94, 0.22)" : "rgba(125, 220, 255, 0.16)";
      const sparkleY = pickup.y - 7 - (elapsedMs % 480 < 240 ? 1 : 0);

      fillRect(context, pickup.x - 4, pickup.y - 4, pickup.width + 8, pickup.height + 8, glow);
      fillRect(context, pickup.x - 2, pickup.y - 2, pickup.width + 4, pickup.height + 4, glow);
      fillRect(context, pickup.x + 2, sparkleY, 2, 2, PALETTE.clientCore);
      fillRect(context, pickup.x + 1, sparkleY + 1, 4, 1, PALETTE.amberBright);
      fillRect(context, pickup.x + 2, sparkleY + 2, 2, 2, PALETTE.clientCore);
      fillRect(context, pickup.x - 1, pickup.y, 1, pickup.height, PALETTE.amberBright);
      fillRect(context, pickup.x + pickup.width, pickup.y, 1, pickup.height, PALETTE.amberBright);
      fillRect(context, pickup.x, pickup.y - 1, pickup.width, 1, PALETTE.clientCore);
      fillRect(context, pickup.x, pickup.y + pickup.height, pickup.width, 1, PALETTE.clientCore);
      fillRect(context, pickup.x, pickup.y, pickup.width, pickup.height, PALETTE.amber);
      fillRect(context, pickup.x + 1, pickup.y + 1, pickup.width - 2, pickup.height - 2, pulse);
      fillRect(context, pickup.x + 1, pickup.y, pickup.width - 2, 1, index % 2 === 0 ? PALETTE.danger : PALETTE.clientGlow);
      fillRect(context, pickup.x + 2, pickup.y + pickup.height, pickup.width - 4, 1, PALETTE.shadow);
    });
}

function drawSourceWarning(context: CanvasRenderingContext2D, glareState: GlareState) {
  fillRect(
    context,
    glareState.sourceX - 8,
    glareState.sourceY - 10,
    12,
    20,
    "rgba(125, 220, 255, 0.28)",
  );
  fillRect(
    context,
    glareState.sourceX - 4,
    glareState.sourceY - 6,
    4,
    12,
    PALETTE.clientCore,
  );
}

function drawCoverShadows(context: CanvasRenderingContext2D, level: MiniGameLevel) {
  level.coverTiles.forEach((cover) => {
    fillRect(context, cover.x, cover.y, cover.width, cover.height, PALETTE.shadow);
    fillRect(context, cover.x, cover.y, cover.width, 1, "rgba(255, 255, 255, 0.03)");
  });
}

function drawClientGlare(context: CanvasRenderingContext2D, beam: NonNullable<GlareState["beam"]>) {
  const beamX = beam.targetX - beam.sourceX;
  const beamY = beam.targetY - beam.sourceY;
  const length = Math.hypot(beamX, beamY) || 1;
  const normalX = -beamY / length;
  const normalY = beamX / length;

  context.save();
  context.globalAlpha = 0.18;
  context.fillStyle = PALETTE.clientGlow;
  context.beginPath();
  context.moveTo(beam.sourceX + normalX * beam.nearWidth, beam.sourceY + normalY * beam.nearWidth);
  context.lineTo(beam.sourceX - normalX * beam.nearWidth, beam.sourceY - normalY * beam.nearWidth);
  context.lineTo(beam.targetX - normalX * beam.farWidth, beam.targetY - normalY * beam.farWidth);
  context.lineTo(beam.targetX + normalX * beam.farWidth, beam.targetY + normalY * beam.farWidth);
  context.closePath();
  context.fill();

  context.globalAlpha = 0.28;
  for (let stripe = 0; stripe < 8; stripe += 1) {
    const progress = stripe / 8;
    const stripeX = beam.sourceX + beamX * progress;
    const stripeY = beam.sourceY + beamY * progress;
    const stripeWidth = beam.nearWidth + (beam.farWidth - beam.nearWidth) * progress;

    fillRect(
      context,
      stripeX - 2,
      stripeY - stripeWidth,
      2,
      stripeWidth * 2,
      stripe % 2 === 0 ? PALETTE.clientGlow : PALETTE.clientCore,
    );
  }
  context.restore();
}

function drawClientSilhouette(context: CanvasRenderingContext2D, glareState: GlareState) {
  const x = 146;
  const y = glareState.sourceY - 8;
  fillRect(context, x, y, 6, 10, PALETTE.shades);
  fillRect(context, x + 1, y - 2, 4, 3, PALETTE.clientCore);
  fillRect(context, x + 2, y + 10, 2, 4, PALETTE.shades);
  fillRect(
    context,
    x - 1,
    y + 4,
    1,
    4,
    glareState.phase === "warning" ? PALETTE.amberBright : PALETTE.clientGlow,
  );
}

function drawPlayer(
  context: CanvasRenderingContext2D,
  player: PlayerState,
  flashing: boolean,
  level: MiniGameLevel,
  hiddenActive: boolean,
) {
  const x = Math.round(player.x);
  const y = Math.round(player.y);
  const hidden = hiddenActive && !player.isMoving;
  const alpha = flashing ? 0.6 : 1;
  const jacket = level.theme === "office" ? PALETTE.jacket : PALETTE.archiveJacket;
  const shirt = level.theme === "office" ? PALETTE.shirt : PALETTE.archiveShirt;
  const accent = level.theme === "office" ? PALETTE.jacketLight : PALETTE.archiveLight;

  context.save();
  context.globalAlpha = alpha;

  if (hidden) {
    fillRect(context, x + 1, y + 4, 6, 4, jacket);
    fillRect(context, x + 2, y + 3, 4, 2, PALETTE.hair);
    fillRect(context, x + 2, y + 5, 4, 1, PALETTE.shades);
    fillRect(context, x, y + 8, 8, 2, PALETTE.shadow);
    context.restore();
    return;
  }

  fillRect(context, x + 1, y + 8, 6, 2, PALETTE.shadow);
  fillRect(context, x + 2, y, 4, 2, PALETTE.hair);
  fillRect(context, x + 1, y + 2, 6, 3, PALETTE.skin);
  fillRect(context, x + 1, y + 3, 6, 1, PALETTE.shades);
  fillRect(context, x + 1, y + 5, 6, 3, jacket);
  fillRect(context, x + 2, y + 6, 4, 2, shirt);

  if (player.direction === "left") {
    fillRect(context, x + 1, y + 2, 1, 2, PALETTE.hair);
  }

  if (player.direction === "right") {
    fillRect(context, x + 6, y + 2, 1, 2, PALETTE.hair);
  }

  if (player.isMoving && player.animationFrame % 2 === 0) {
    fillRect(context, x + 1, y + 8, 2, 2, accent);
    fillRect(context, x + 5, y + 7, 2, 3, accent);
  } else {
    fillRect(context, x + 2, y + 7, 2, 3, accent);
    fillRect(context, x + 4, y + 8, 2, 2, accent);
  }

  context.restore();
}

function drawFeedbacks(context: CanvasRenderingContext2D, feedbacks: MiniGameFeedback[]) {
  feedbacks.forEach((feedback) => {
    const progress = 1 - feedback.ttlMs / 700;
    const y = feedback.y - progress * 6;
    const color = getFeedbackColor(feedback.tone);

    drawPixelText(context, feedback.label, feedback.x, y, color);
  });
}

function drawHud(
  context: CanvasRenderingContext2D,
  runtime: MiniGameRuntime,
  bestScore: number,
  level: MiniGameLevel,
  glareState: GlareState,
) {
  fillRect(context, 10, 10, 42, 14, "rgba(5, 6, 13, 0.75)");
  drawPixelHeartRow(context, runtime.hits, 14, 14);
  drawTimer(context, Math.max(0, (level.durationMs - runtime.elapsedMs) / 1_000), 66, 14);
  drawMiniLevel(context, level.order, 120, 14);
  drawMiniScore(context, runtime.score, 104, 26);
  drawMiniFiles(context, runtime.collectedPickupIds.length, level.pickups.length, 104, 36);
  drawMiniHide(context, runtime, 104, 94);
  drawDashMeter(context, runtime.dashCooldownMs, 104, 104);
  drawMiniBest(context, bestScore, 104, 84);
  drawSweepBadge(context, glareState, 120, 26);
}

function drawPixelHeartRow(
  context: CanvasRenderingContext2D,
  hits: number,
  x: number,
  y: number,
) {
  for (let heart = 0; heart < MAX_HITS; heart += 1) {
    const lost = heart < hits;
    const color = lost ? "#402033" : PALETTE.danger;
    const offsetX = x + heart * 9;

    fillRect(context, offsetX + 1, y, 2, 2, color);
    fillRect(context, offsetX + 4, y, 2, 2, color);
    fillRect(context, offsetX, y + 2, 7, 2, color);
    fillRect(context, offsetX + 1, y + 4, 5, 2, color);
    fillRect(context, offsetX + 2, y + 6, 3, 2, color);
  }
}

function drawTimer(context: CanvasRenderingContext2D, seconds: number, x: number, y: number) {
  fillRect(context, x - 4, y - 4, 38, 12, "rgba(5, 6, 13, 0.75)");
  drawPixelText(context, `${seconds.toFixed(1)}s`, x, y, PALETTE.clientCore);
}

function drawMiniLevel(context: CanvasRenderingContext2D, levelOrder: number, x: number, y: number) {
  fillRect(context, x - 4, y - 4, 22, 12, "rgba(5, 6, 13, 0.75)");
  drawPixelText(context, `L${levelOrder}`, x, y, PALETTE.paper);
}

function drawMiniScore(context: CanvasRenderingContext2D, score: number, x: number, y: number) {
  fillRect(context, x - 2, y - 2, 44, 10, "rgba(5, 6, 13, 0.72)");
  drawPixelText(context, `S ${score}`, x, y, PALETTE.paper);
}

function drawMiniFiles(context: CanvasRenderingContext2D, current: number, total: number, x: number, y: number) {
  fillRect(context, x - 2, y - 2, 30, 10, "rgba(5, 6, 13, 0.72)");
  drawPixelText(context, `F ${current}/${total}`, x, y, PALETTE.amberBright);
}

function drawMiniBest(context: CanvasRenderingContext2D, bestScore: number, x: number, y: number) {
  fillRect(context, x - 2, y - 2, 42, 10, "rgba(5, 6, 13, 0.72)");
  drawPixelText(context, `B ${bestScore}`, x, y, PALETTE.amberBright);
}

function drawMiniHide(context: CanvasRenderingContext2D, runtime: MiniGameRuntime, x: number, y: number) {
  fillRect(context, x - 2, y - 2, 58, 10, "rgba(5, 6, 13, 0.72)");
  const label = runtime.player.isInCover
    ? `HIDE ${getHideSecondsRemaining(runtime).toFixed(1)}`
    : "HIDE OK";
  const color = runtime.player.isInCover
    ? isPlayerHidden(runtime.player, runtime.hideMsRemaining)
      ? PALETTE.clientCore
      : PALETTE.danger
    : PALETTE.leaf;

  drawPixelText(context, label, x, y, color);
}

function drawDashMeter(context: CanvasRenderingContext2D, dashCooldownMs: number, x: number, y: number) {
  fillRect(context, x - 2, y - 2, 58, 10, "rgba(5, 6, 13, 0.72)");
  const ready = dashCooldownMs === 0;
  const label = ready ? "DASH OK" : `DASH ${(dashCooldownMs / 1_000).toFixed(1)}`;

  drawPixelText(context, label, x, y, ready ? PALETTE.leaf : PALETTE.danger);
}

function drawSweepBadge(context: CanvasRenderingContext2D, glareState: GlareState, x: number, y: number) {
  fillRect(context, x - 4, y - 4, 26, 12, "rgba(5, 6, 13, 0.75)");
  const label = glareState.phase === "warning" ? "WARN" : formatPatternLabel(glareState.patternId);
  const color = glareState.phase === "warning" ? PALETTE.amberBright : PALETTE.clientCore;

  drawPixelText(context, label, x, y, color);
}

function drawOverlay(
  context: CanvasRenderingContext2D,
  title: string,
  subtitle: string,
  accent: string,
) {
  fillRect(context, 26, 38, 108, 42, "rgba(5, 6, 13, 0.82)");
  fillRect(context, 26, 38, 108, 2, accent);
  drawPixelText(context, title, 58, 48, accent, 2);
  drawPixelText(context, subtitle, 36, 64, PALETTE.paper);
}

function drawPixelText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  size = 1,
) {
  context.save();
  context.fillStyle = color;
  context.font = `${7 * size}px monospace`;
  context.textBaseline = "top";
  context.fillText(text.toUpperCase(), x, y);
  context.restore();
}

function fillRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
) {
  context.fillStyle = color;
  context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function formatPatternLabel(patternId: string) {
  switch (patternId) {
    case "window-sweep":
      return "Window";
    case "door-sweep":
      return "Door";
    case "narrow-scan":
      return "Slice";
    case "shelf-slice":
      return "Shelf";
    case "glass-wall":
      return "Glass";
    case "low-pass":
      return "Low";
    default:
      return "Sweep";
  }
}

function getResultTitle(result: MiniGameResult) {
  if (result.reason === "cleared") {
    return "Room cleared";
  }

  if (result.reason === "timeout") {
    return "Time ran out";
  }

  return "The client saw you";
}

function getResultSummary(result: MiniGameResult) {
  if (result.reason === "cleared") {
    return `You secured all files in ${result.survivedSeconds.toFixed(1)} seconds.`;
  }

  if (result.reason === "timeout") {
    return `You lasted ${result.survivedSeconds.toFixed(1)} seconds but missed the full set.`;
  }

  return `You were spotted after ${result.survivedSeconds.toFixed(1)} seconds.`;
}

function getFeedbackColor(tone: FeedbackTone) {
  switch (tone) {
    case "gold":
      return PALETTE.amberBright;
    case "blue":
      return PALETTE.clientCore;
    case "red":
      return PALETTE.danger;
    default:
      return PALETTE.paper;
  }
}
