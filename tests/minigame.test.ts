import { afterEach, describe, expect, it } from "vitest";
import {
  COVER_TILES,
  DASH_COOLDOWN_MS,
  DETECTION_WINDOW_MS,
  GAME_DURATION_MS,
  HIDE_WINDOW_MS,
  MINIGAME_LEVELS,
  MINIGAME_STORAGE_KEY,
  START_SAFE_WINDOW_MS,
  WARNING_WINDOW_MS,
  createInitialMiniGameRuntime,
  getActiveGlareBeam,
  getCurrentGlareState,
  getHideSecondsRemaining,
  getMiniGameLevel,
  getNextMiniGameLevelId,
  isPlayerDetected,
  isPlayerHidden,
  isPlayerInCover,
  movePlayer,
  pauseMiniGame,
  readBestLevelScore,
  resumeMiniGame,
  saveBestLevelScore,
  startMiniGame,
  stepMiniGame,
} from "@/lib/minigame";

afterEach(() => {
  window.localStorage.clear();
});

describe("after hours logic", () => {
  it("marks a player as hidden inside a cover zone", () => {
    const cover = COVER_TILES[0];
    const runtime = createInitialMiniGameRuntime({
      x: cover.x + 1,
      y: cover.y + 1,
    });

    expect(isPlayerInCover(runtime.player)).toBe(true);
  });

  it("supports a distinct level-two layout and progression", () => {
    const levelTwo = getMiniGameLevel("level-2");
    const cover = levelTwo.coverTiles[0];
    const runtime = createInitialMiniGameRuntime("level-2", {
      x: cover.x + 1,
      y: cover.y + 1,
    });

    expect(runtime.levelId).toBe("level-2");
    expect(isPlayerInCover(runtime.player, "level-2")).toBe(true);
    expect(getNextMiniGameLevelId("level-1")).toBe("level-2");
    expect(getNextMiniGameLevelId("level-2")).toBeNull();
    expect(MINIGAME_LEVELS).toHaveLength(2);
  });

  it("collects a pickup and adds score", () => {
    const pickup = getMiniGameLevel("level-1").pickups[0];
    let runtime = startMiniGame(
      createInitialMiniGameRuntime("level-1", {
        x: pickup.x,
        y: pickup.y,
      }),
    );

    runtime = stepMiniGame(runtime, { up: false, down: false, left: false, right: false, dash: false }, 16);

    expect(runtime.collectedPickupIds).toContain(pickup.id);
    expect(runtime.score).toBeGreaterThanOrEqual(100);
  });

  it("clears immediately when the final pickup is collected", () => {
    const level = getMiniGameLevel("level-1");
    const finalPickup = level.pickups[2];
    let runtime = startMiniGame(
      createInitialMiniGameRuntime("level-1", {
        x: finalPickup.x,
        y: finalPickup.y,
      }),
    );
    runtime = {
      ...runtime,
      collectedPickupIds: level.pickups.slice(0, 2).map((pickup) => pickup.id),
      score: 200,
      elapsedMs: 4_800,
    };

    runtime = stepMiniGame(runtime, { up: false, down: false, left: false, right: false, dash: false }, 16);

    expect(runtime.mode).toBe("won");
    expect(runtime.resultReason).toBe("cleared");
    expect(runtime.collectedPickupIds).toHaveLength(3);
    expect(runtime.score).toBeGreaterThan(300);
  });

  it("times out if not all pickups are collected", () => {
    let runtime = startMiniGame(createInitialMiniGameRuntime("level-1"));
    runtime = {
      ...runtime,
      elapsedMs: GAME_DURATION_MS - 16,
    };

    runtime = stepMiniGame(runtime, { up: false, down: false, left: false, right: false, dash: false }, 32);

    expect(runtime.mode).toBe("lost");
    expect(runtime.resultReason).toBe("timeout");
  });

  it("does not detect the player during the warning phase", () => {
    const warningState = getCurrentGlareState(START_SAFE_WINDOW_MS + 200, "level-1");

    expect(warningState.phase).toBe("warning");

    let runtime = startMiniGame(
      createInitialMiniGameRuntime("level-1", {
        x: 92,
        y: 54,
      }),
    );
    runtime = {
      ...runtime,
      elapsedMs: START_SAFE_WINDOW_MS + 120,
      exposureMs: DETECTION_WINDOW_MS - 16,
      player: {
        ...runtime.player,
        x: 92,
        y: 54,
        isInCover: false,
      },
    };

    runtime = stepMiniGame(runtime, { up: false, down: false, left: false, right: false, dash: false }, 120);

    expect(runtime.hits).toBe(0);
    expect(runtime.exposureMs).toBe(0);
  });

  it("keeps the opening seconds free of glare", () => {
    const startState = getCurrentGlareState(0, "level-1");
    const midStartState = getCurrentGlareState(START_SAFE_WINDOW_MS - 1, "level-1");

    expect(startState.phase).toBe("cooldown");
    expect(startState.beam).toBeNull();
    expect(midStartState.phase).toBe("cooldown");
    expect(midStartState.beam).toBeNull();
  });

  it("detects a player standing in the active glare beam", () => {
    const beam = getActiveGlareBeam(START_SAFE_WINDOW_MS + WARNING_WINDOW_MS + 16);

    if (!beam) {
      throw new Error("Expected an active glare beam.");
    }

    const targetX = (beam.sourceX + beam.targetX) / 2;
    const targetY = (beam.sourceY + beam.targetY) / 2;
    const runtime = createInitialMiniGameRuntime({
      x: targetX - 4,
      y: targetY - 5,
      isInCover: false,
    });

    expect(isPlayerDetected(runtime.player, beam, false)).toBe(true);
  });

  it("awards a near miss only once per sweep", () => {
    const state = getCurrentGlareState(
      START_SAFE_WINDOW_MS + WARNING_WINDOW_MS + 284,
      "level-1",
    );

    if (state.phase !== "active" || !state.beam) {
      throw new Error("Expected an active glare state.");
    }

    const beam = state.beam;
    const midX = (beam.sourceX + beam.targetX) / 2;
    const midY = (beam.sourceY + beam.targetY) / 2;
    const beamX = beam.targetX - beam.sourceX;
    const beamY = beam.targetY - beam.sourceY;
    const beamLength = Math.hypot(beamX, beamY);
    const normalX = -beamY / beamLength;
    const normalY = beamX / beamLength;
    const midWidth = (beam.nearWidth + beam.farWidth) / 2;
    const halfWidth = 4;
    const halfHeight = 5;
    const spriteRadius = Math.abs(normalX) * halfWidth + Math.abs(normalY) * halfHeight;
    const centerX = midX + normalX * (midWidth + spriteRadius + 2);
    const centerY = midY + normalY * (midWidth + spriteRadius + 2);
    let runtime = startMiniGame(
      createInitialMiniGameRuntime("level-1", {
        x: centerX - 4,
        y: centerY - 5,
      }),
    );
    runtime = {
      ...runtime,
      elapsedMs: START_SAFE_WINDOW_MS + WARNING_WINDOW_MS + 268,
      player: {
        ...runtime.player,
        x: centerX - 4,
        y: centerY - 5,
        isInCover: false,
      },
      hideMsRemaining: 0,
    };

    runtime = stepMiniGame(runtime, { up: false, down: false, left: false, right: false, dash: false }, 16);

    expect(runtime.nearMisses).toBe(1);
    expect(runtime.score).toBe(25);

    runtime = stepMiniGame(runtime, { up: false, down: false, left: false, right: false, dash: false }, 16);

    expect(runtime.nearMisses).toBe(1);
    expect(runtime.score).toBe(25);
  });

  it("applies dash with cooldown and respects collision", () => {
    let runtime = startMiniGame(
      createInitialMiniGameRuntime("level-1", {
        x: 70,
        y: 92,
      }),
    );

    runtime = stepMiniGame(runtime, { up: false, down: false, left: false, right: true, dash: true }, 16);

    expect(runtime.player.x).toBeGreaterThan(80);
    expect(runtime.dashCooldownMs).toBe(DASH_COOLDOWN_MS);

    const afterDashX = runtime.player.x;
    runtime = stepMiniGame(runtime, { up: false, down: false, left: false, right: true, dash: true }, 16);

    expect(runtime.player.x - afterDashX).toBeLessThan(4);
  });

  it("burns through cover after three seconds and resets after leaving it", () => {
    const cover = COVER_TILES[0];
    let runtime = startMiniGame(
      createInitialMiniGameRuntime({
        x: cover.x + 1,
        y: cover.y + 1,
      }),
    );

    runtime = stepMiniGame(runtime, { up: false, down: false, left: false, right: false, dash: false }, 1_600);

    expect(isPlayerHidden(runtime.player, runtime.hideMsRemaining)).toBe(true);
    expect(getHideSecondsRemaining(runtime)).toBeLessThan(3);

    runtime = stepMiniGame(runtime, { up: false, down: false, left: false, right: false, dash: false }, 1_500);

    expect(runtime.hideMsRemaining).toBe(0);
    expect(isPlayerHidden(runtime.player, runtime.hideMsRemaining)).toBe(false);

    runtime = stepMiniGame(runtime, { up: false, down: true, left: false, right: false, dash: false }, 800);

    expect(runtime.player.isInCover).toBe(false);
    expect(runtime.hideMsRemaining).toBe(HIDE_WINDOW_MS);
  });

  it("pauses and resumes a run without dropping progress", () => {
    const playingRuntime = startMiniGame(
      createInitialMiniGameRuntime({
        x: 44,
        y: 72,
      }),
    );
    const progressedRuntime = {
      ...playingRuntime,
      elapsedMs: 12_400,
      hits: 1,
      exposureMs: 120,
      score: 125,
    };

    const pausedRuntime = pauseMiniGame(progressedRuntime);

    expect(pausedRuntime.mode).toBe("paused");
    expect(pausedRuntime.elapsedMs).toBe(12_400);
    expect(pausedRuntime.exposureMs).toBe(0);

    const resumedRuntime = resumeMiniGame(pausedRuntime);

    expect(resumedRuntime.mode).toBe("playing");
    expect(resumedRuntime.elapsedMs).toBe(12_400);
    expect(resumedRuntime.score).toBe(125);
  });

  it("stores best clear scores per level and ignores worse failed runs", () => {
    expect(readBestLevelScore("level-1")).toBe(0);

    const firstSave = saveBestLevelScore("level-1", 560, true);

    expect(firstSave.isNewBest).toBe(true);
    expect(window.localStorage.getItem(MINIGAME_STORAGE_KEY)).toContain("560");

    const failedSave = saveBestLevelScore("level-1", 999, false);

    expect(failedSave.isNewBest).toBe(false);
    expect(readBestLevelScore("level-1")).toBe(560);
  });

  it("blocks movement into office furniture", () => {
    const runtime = createInitialMiniGameRuntime({
      x: 30,
      y: 64,
    });
    const moved = movePlayer(runtime.player, { up: false, down: false, left: false, right: true, dash: false }, 600);

    expect(moved.x).toBeLessThan(38);
  });
});
