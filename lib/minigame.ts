export type MiniGameState = "ready" | "playing" | "paused" | "won" | "lost";
export type Direction = "up" | "down" | "left" | "right";
export type MiniGameLevelId = "level-1" | "level-2";
export type GlarePhase = "warning" | "active" | "cooldown";
export type MiniGameResultReason = "cleared" | "spotted" | "timeout";
export type FeedbackTone = "gold" | "blue" | "red";

export interface PlayerState {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: Direction;
  animationFrame: number;
  isMoving: boolean;
  isInCover: boolean;
}

export interface GlarePattern {
  id: string;
  sourceX: number;
  sourceY: number;
  targetStartY: number;
  targetEndY: number;
  farX: number;
  nearWidth: number;
  farWidth: number;
  sweepDurationMs: number;
  cooldownMs: number;
}

export interface CoverTile {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface MiniGamePickup {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MiniGameFeedback {
  id: string;
  label: string;
  x: number;
  y: number;
  ttlMs: number;
  tone: FeedbackTone;
}

export interface MiniGameResult {
  survivedSeconds: number;
  state: Extract<MiniGameState, "won" | "lost">;
  hits: number;
  score: number;
  nearMisses: number;
  pickupsCollected: number;
  reason: MiniGameResultReason;
  isNewBest: boolean;
  bestScore: number;
}

export interface MiniGameInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  dash: boolean;
}

export interface GlareBeam {
  patternId: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  nearWidth: number;
  farWidth: number;
}

export interface GlareState {
  sweepId: string;
  patternId: string;
  phase: GlarePhase;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  nearWidth: number;
  farWidth: number;
  beam: GlareBeam | null;
}

export interface MiniGameRuntime {
  levelId: MiniGameLevelId;
  mode: MiniGameState;
  elapsedMs: number;
  hits: number;
  exposureMs: number;
  hideMsRemaining: number;
  invulnerableMs: number;
  dashCooldownMs: number;
  score: number;
  nearMisses: number;
  collectedPickupIds: string[];
  lastNearMissSweepId: string | null;
  resultReason: MiniGameResultReason | null;
  cameraShakeMs: number;
  feedbacks: MiniGameFeedback[];
  player: PlayerState;
}

export interface MiniGameLevel {
  id: MiniGameLevelId;
  order: number;
  label: string;
  title: string;
  tagline: string;
  durationMs: number;
  pressure: number;
  theme: "office" | "archive";
  playerStart: Pick<PlayerState, "x" | "y" | "direction">;
  glarePatterns: GlarePattern[];
  coverTiles: CoverTile[];
  solidBlocks: Rect[];
  pickups: MiniGamePickup[];
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BeamProximity {
  allowedWidth: number;
  lateralDistance: number;
}

type BestScoreMap = Partial<Record<MiniGameLevelId, number>>;

export const MINIGAME_STORAGE_KEY = "after-hours-arcade-best-scores-v2";
export const CANVAS_WIDTH = 160;
export const CANVAS_HEIGHT = 120;
export const TILE_SIZE = 8;
export const GAME_DURATION_MS = 30_000;
export const MAX_HITS = 3;
export const PLAYER_SPEED = 36;
export const DETECTION_WINDOW_MS = 220;
export const WARNING_WINDOW_MS = 400;
export const START_SAFE_WINDOW_MS = 1_200;
export const HIDE_WINDOW_MS = 3_000;
export const HIT_COOLDOWN_MS = 1_050;
export const DASH_COOLDOWN_MS = 1_600;
export const DASH_DISTANCE = 20;
export const PICKUP_SCORE = 100;
export const NEAR_MISS_SCORE = 25;
export const HIT_PENALTY = 75;
export const TIME_BONUS_PER_SECOND = 10;
export const PERFECT_CLEAR_BONUS = 150;
export const NEAR_MISS_MARGIN = 3;
export const PICKUP_GRAB_DISTANCE = 10;
export const ROOM_BOUNDS = {
  x: 8,
  y: 8,
  width: 136,
  height: 104,
} as const;
export const DEFAULT_MINIGAME_LEVEL_ID: MiniGameLevelId = "level-1";

export const MINIGAME_LEVELS: MiniGameLevel[] = [
  {
    id: "level-1",
    order: 1,
    label: "Level 1",
    title: "Office Floor",
    tagline: "Collect the loose files and stay ahead of the client glare.",
    durationMs: GAME_DURATION_MS,
    pressure: 1,
    theme: "office",
    playerStart: {
      x: 16,
      y: 88,
      direction: "right",
    },
    glarePatterns: [
      {
        id: "window-sweep",
        sourceX: 156,
        sourceY: 28,
        targetStartY: 18,
        targetEndY: 102,
        farX: 4,
        nearWidth: 3,
        farWidth: 20,
        sweepDurationMs: 3_800,
        cooldownMs: 800,
      },
      {
        id: "door-sweep",
        sourceX: 156,
        sourceY: 92,
        targetStartY: 104,
        targetEndY: 26,
        farX: 10,
        nearWidth: 4,
        farWidth: 18,
        sweepDurationMs: 3_300,
        cooldownMs: 900,
      },
      {
        id: "narrow-scan",
        sourceX: 156,
        sourceY: 56,
        targetStartY: 42,
        targetEndY: 78,
        farX: 24,
        nearWidth: 2,
        farWidth: 10,
        sweepDurationMs: 2_500,
        cooldownMs: 700,
      },
    ],
    solidBlocks: [
      { x: 22, y: 12, width: 14, height: 24 },
      { x: 54, y: 18, width: 10, height: 12 },
      { x: 38, y: 60, width: 28, height: 18 },
      { x: 58, y: 82, width: 10, height: 10 },
      { x: 88, y: 68, width: 18, height: 14 },
      { x: 108, y: 30, width: 14, height: 22 },
    ],
    coverTiles: [
      { x: 10, y: 14, width: 10, height: 24, label: "cabinet shadow" },
      { x: 28, y: 60, width: 10, height: 20, label: "desk shadow" },
      { x: 78, y: 68, width: 10, height: 16, label: "copier shadow" },
      { x: 92, y: 30, width: 12, height: 20, label: "bookcase shadow" },
    ],
    pickups: [
      { id: "bookcase-file", label: "Bookcase file", x: 112, y: 36, width: 6, height: 4 },
      { id: "desk-invoice", label: "Desk invoice", x: 47, y: 63, width: 6, height: 4 },
      { id: "copier-binder", label: "Copier binder", x: 94, y: 71, width: 6, height: 4 },
    ],
  },
  {
    id: "level-2",
    order: 2,
    label: "Level 2",
    title: "Archive Row",
    tagline: "Snatch the records before the brighter hallway glare pins you down.",
    durationMs: GAME_DURATION_MS,
    pressure: 1.18,
    theme: "archive",
    playerStart: {
      x: 18,
      y: 98,
      direction: "right",
    },
    glarePatterns: [
      {
        id: "shelf-slice",
        sourceX: 156,
        sourceY: 22,
        targetStartY: 20,
        targetEndY: 106,
        farX: 34,
        nearWidth: 2,
        farWidth: 11,
        sweepDurationMs: 2_800,
        cooldownMs: 520,
      },
      {
        id: "glass-wall",
        sourceX: 156,
        sourceY: 58,
        targetStartY: 24,
        targetEndY: 98,
        farX: 8,
        nearWidth: 4,
        farWidth: 22,
        sweepDurationMs: 2_950,
        cooldownMs: 640,
      },
      {
        id: "low-pass",
        sourceX: 156,
        sourceY: 94,
        targetStartY: 88,
        targetEndY: 32,
        farX: 18,
        nearWidth: 3,
        farWidth: 15,
        sweepDurationMs: 2_100,
        cooldownMs: 460,
      },
    ],
    solidBlocks: [
      { x: 20, y: 18, width: 18, height: 28 },
      { x: 48, y: 44, width: 42, height: 18 },
      { x: 58, y: 66, width: 22, height: 10 },
      { x: 98, y: 20, width: 16, height: 20 },
      { x: 108, y: 76, width: 14, height: 18 },
      { x: 24, y: 78, width: 24, height: 14 },
    ],
    coverTiles: [
      { x: 12, y: 20, width: 8, height: 24, label: "records shelf shadow" },
      { x: 40, y: 44, width: 8, height: 20, label: "conference table shadow" },
      { x: 92, y: 20, width: 8, height: 20, label: "pillar shadow" },
      { x: 101, y: 76, width: 8, height: 18, label: "water cooler shadow" },
      { x: 18, y: 78, width: 8, height: 14, label: "crate shadow" },
    ],
    pickups: [
      { id: "shelf-record", label: "Shelf record", x: 25, y: 24, width: 6, height: 4 },
      { id: "conference-memo", label: "Conference memo", x: 65, y: 48, width: 6, height: 4 },
      { id: "water-cooler-contract", label: "Water-cooler contract", x: 111, y: 80, width: 6, height: 4 },
    ],
  },
];

export const GLARE_PATTERNS = MINIGAME_LEVELS[0].glarePatterns;
export const COVER_TILES = MINIGAME_LEVELS[0].coverTiles;
export const EMPTY_INPUT: MiniGameInput = {
  up: false,
  down: false,
  left: false,
  right: false,
  dash: false,
};

export function getMiniGameLevel(levelId: MiniGameLevelId = DEFAULT_MINIGAME_LEVEL_ID) {
  const level = MINIGAME_LEVELS.find((entry) => entry.id === levelId);

  return level ?? MINIGAME_LEVELS[0];
}

export function getNextMiniGameLevelId(levelId: MiniGameLevelId) {
  const index = MINIGAME_LEVELS.findIndex((entry) => entry.id === levelId);

  if (index === -1 || index === MINIGAME_LEVELS.length - 1) {
    return null;
  }

  return MINIGAME_LEVELS[index + 1].id;
}

export function createInitialPlayerState(
  levelOrOverrides: MiniGameLevelId | Partial<PlayerState> = DEFAULT_MINIGAME_LEVEL_ID,
  overrides: Partial<PlayerState> = {},
): PlayerState {
  const levelId =
    typeof levelOrOverrides === "string" ? levelOrOverrides : DEFAULT_MINIGAME_LEVEL_ID;
  const playerOverrides = typeof levelOrOverrides === "string" ? overrides : levelOrOverrides;
  const level = getMiniGameLevel(levelId);

  return {
    x: level.playerStart.x,
    y: level.playerStart.y,
    width: 8,
    height: 10,
    direction: level.playerStart.direction,
    animationFrame: 0,
    isMoving: false,
    isInCover: false,
    ...playerOverrides,
  };
}

export function createInitialMiniGameRuntime(
  levelOrPlayerOverrides: MiniGameLevelId | Partial<PlayerState> = DEFAULT_MINIGAME_LEVEL_ID,
  playerOverrides: Partial<PlayerState> = {},
): MiniGameRuntime {
  const levelId =
    typeof levelOrPlayerOverrides === "string"
      ? levelOrPlayerOverrides
      : DEFAULT_MINIGAME_LEVEL_ID;
  const initialPlayerOverrides =
    typeof levelOrPlayerOverrides === "string"
      ? playerOverrides
      : levelOrPlayerOverrides;

  return {
    levelId,
    mode: "ready",
    elapsedMs: 0,
    hits: 0,
    exposureMs: 0,
    hideMsRemaining: HIDE_WINDOW_MS,
    invulnerableMs: 0,
    dashCooldownMs: 0,
    score: 0,
    nearMisses: 0,
    collectedPickupIds: [],
    lastNearMissSweepId: null,
    resultReason: null,
    cameraShakeMs: 0,
    feedbacks: [],
    player: createInitialPlayerState(levelId, initialPlayerOverrides),
  };
}

export function startMiniGame(
  runtime: MiniGameRuntime = createInitialMiniGameRuntime(),
): MiniGameRuntime {
  const player = {
    ...runtime.player,
    animationFrame: 0,
    isMoving: false,
  };

  return {
    ...runtime,
    mode: "playing",
    elapsedMs: 0,
    hits: 0,
    exposureMs: 0,
    hideMsRemaining: HIDE_WINDOW_MS,
    invulnerableMs: 0,
    dashCooldownMs: 0,
    score: 0,
    nearMisses: 0,
    collectedPickupIds: [],
    lastNearMissSweepId: null,
    resultReason: null,
    cameraShakeMs: 0,
    feedbacks: [],
    player: {
      ...player,
      isInCover: isPlayerInCover(player, runtime.levelId),
    },
  };
}

export function pauseMiniGame(runtime: MiniGameRuntime): MiniGameRuntime {
  if (runtime.mode !== "playing") {
    return runtime;
  }

  return {
    ...runtime,
    mode: "paused",
    exposureMs: 0,
  };
}

export function resumeMiniGame(runtime: MiniGameRuntime): MiniGameRuntime {
  if (runtime.mode !== "paused") {
    return runtime;
  }

  return {
    ...runtime,
    mode: "playing",
    exposureMs: 0,
  };
}

export function movePlayer(
  player: PlayerState,
  input: MiniGameInput,
  deltaMs: number,
  levelId: MiniGameLevelId = DEFAULT_MINIGAME_LEVEL_ID,
): PlayerState {
  const directionVector = getDirectionVector(input, player.direction);
  const speed = (PLAYER_SPEED * deltaMs) / 1_000;

  return movePlayerByDistance(player, directionVector, speed, levelId);
}

export function dashPlayer(
  player: PlayerState,
  input: MiniGameInput,
  levelId: MiniGameLevelId = DEFAULT_MINIGAME_LEVEL_ID,
): PlayerState {
  const directionVector = getDirectionVector(input, player.direction);

  return movePlayerByDistance(player, directionVector, DASH_DISTANCE, levelId);
}

export function stepMiniGame(
  runtime: MiniGameRuntime,
  input: MiniGameInput,
  deltaMs: number,
): MiniGameRuntime {
  if (runtime.mode !== "playing") {
    return runtime;
  }

  const level = getMiniGameLevel(runtime.levelId);
  const elapsedMs = Math.min(runtime.elapsedMs + deltaMs, level.durationMs);
  const invulnerableMs = Math.max(0, runtime.invulnerableMs - deltaMs);
  let dashCooldownMs = Math.max(0, runtime.dashCooldownMs - deltaMs);
  let cameraShakeMs = Math.max(0, runtime.cameraShakeMs - deltaMs);
  let feedbacks = runtime.feedbacks
    .map((feedback) => ({ ...feedback, ttlMs: feedback.ttlMs - deltaMs }))
    .filter((feedback) => feedback.ttlMs > 0);

  let player = movePlayer(runtime.player, input, deltaMs, runtime.levelId);
  const dashed = input.dash && dashCooldownMs === 0;

  if (dashed) {
    player = dashPlayer(player, input, runtime.levelId);
    dashCooldownMs = DASH_COOLDOWN_MS;
  }

  const wasInCover = runtime.player.isInCover;
  const hideMsRemaining = player.isInCover
    ? wasInCover
      ? Math.max(0, runtime.hideMsRemaining - deltaMs)
      : HIDE_WINDOW_MS
    : HIDE_WINDOW_MS;
  const hiddenActive = isPlayerHidden(player, hideMsRemaining);
  const glareState = getCurrentGlareState(elapsedMs, runtime.levelId);
  const beam = glareState.phase === "active" ? glareState.beam : null;
  const exposed = beam ? isPlayerDetected(player, beam, hiddenActive) : false;
  let exposureMs = exposed && invulnerableMs === 0 ? runtime.exposureMs + deltaMs : 0;
  let hits = runtime.hits;
  let score = runtime.score;
  let nearMisses = runtime.nearMisses;
  let lastNearMissSweepId = runtime.lastNearMissSweepId;
  let collectedPickupIds = [...runtime.collectedPickupIds];
  let resultReason: MiniGameResultReason | null = runtime.resultReason;
  let mode: MiniGameState = "playing";

  if (beam && !hiddenActive && glareState.phase === "active") {
    const proximity = getBeamProximity(player, beam);

    if (
      !exposed &&
      proximity &&
      proximity.lateralDistance <= proximity.allowedWidth + NEAR_MISS_MARGIN &&
      proximity.lateralDistance > proximity.allowedWidth &&
      lastNearMissSweepId !== glareState.sweepId
    ) {
      nearMisses += 1;
      score += NEAR_MISS_SCORE;
      lastNearMissSweepId = glareState.sweepId;
      feedbacks = addFeedback(feedbacks, {
        label: `NEAR MISS +${NEAR_MISS_SCORE}`,
        x: player.x,
        y: player.y - 10,
        tone: "blue",
      }, elapsedMs);
    }
  }

  if (exposureMs >= DETECTION_WINDOW_MS) {
    hits += 1;
    score -= HIT_PENALTY;
    exposureMs = 0;
    cameraShakeMs = 220;
    feedbacks = addFeedback(feedbacks, {
      label: `HIT -${HIT_PENALTY}`,
      x: player.x,
      y: player.y - 8,
      tone: "red",
    }, elapsedMs);
  }

  const pickup = getCollectedPickup(player, level.pickups, collectedPickupIds);

  if (pickup) {
    collectedPickupIds = [...collectedPickupIds, pickup.id];
    score += PICKUP_SCORE;
    feedbacks = addFeedback(feedbacks, {
      label: `FILE +${PICKUP_SCORE}`,
      x: pickup.x,
      y: pickup.y - 8,
      tone: "gold",
    }, elapsedMs);
  }

  if (hits >= MAX_HITS) {
    mode = "lost";
    resultReason = "spotted";
  } else if (collectedPickupIds.length === level.pickups.length) {
    const timeLeftSeconds = Math.floor((level.durationMs - elapsedMs) / 1_000);

    score += timeLeftSeconds * TIME_BONUS_PER_SECOND;

    if (hits === 0) {
      score += PERFECT_CLEAR_BONUS;
    }

    mode = "won";
    resultReason = "cleared";
    feedbacks = addFeedback(feedbacks, {
      label: "ROOM CLEAR",
      x: 48,
      y: 18,
      tone: "gold",
    }, elapsedMs);
  } else if (elapsedMs >= level.durationMs) {
    mode = "lost";
    resultReason = "timeout";
  }

  return {
    ...runtime,
    mode,
    elapsedMs,
    hits,
    exposureMs,
    hideMsRemaining,
    invulnerableMs: hits > runtime.hits ? HIT_COOLDOWN_MS : invulnerableMs,
    dashCooldownMs,
    score,
    nearMisses,
    collectedPickupIds,
    lastNearMissSweepId,
    resultReason,
    cameraShakeMs,
    feedbacks,
    player,
  };
}

export function getCurrentGlareState(
  elapsedMs: number,
  levelId: MiniGameLevelId = DEFAULT_MINIGAME_LEVEL_ID,
): GlareState {
  const level = getMiniGameLevel(levelId);
  const clampedElapsedMs = Math.max(0, elapsedMs);

  if (clampedElapsedMs < START_SAFE_WINDOW_MS) {
    const fallbackPattern = level.glarePatterns[0];
    const scaledPattern = getScaledPattern(
      fallbackPattern,
      0,
      level.durationMs,
      level.pressure,
    );

    return {
      sweepId: `${fallbackPattern.id}:safe-start`,
      patternId: fallbackPattern.id,
      phase: "cooldown",
      sourceX: fallbackPattern.sourceX,
      sourceY: fallbackPattern.sourceY,
      targetX: fallbackPattern.farX,
      targetY: fallbackPattern.targetStartY,
      nearWidth: scaledPattern.nearWidth,
      farWidth: scaledPattern.farWidth,
      beam: null,
    };
  }

  const glareElapsedMs = clampedElapsedMs - START_SAFE_WINDOW_MS;
  const scaledPatterns = level.glarePatterns.map((pattern) =>
    getScaledPattern(pattern, glareElapsedMs, level.durationMs, level.pressure),
  );
  const cycleDuration = scaledPatterns.reduce(
    (sum, pattern) => sum + WARNING_WINDOW_MS + pattern.sweepDurationMs + pattern.cooldownMs,
    0,
  );
  const cycleTime = cycleDuration === 0 ? 0 : glareElapsedMs % cycleDuration;
  const cycleIndex = cycleDuration === 0 ? 0 : Math.floor(glareElapsedMs / cycleDuration);
  let cursor = 0;

  for (let index = 0; index < level.glarePatterns.length; index += 1) {
    const pattern = level.glarePatterns[index];
    const scaledPattern = scaledPatterns[index];
    const warningEnd = cursor + WARNING_WINDOW_MS;
    const activeEnd = warningEnd + scaledPattern.sweepDurationMs;
    const cooldownEnd = activeEnd + scaledPattern.cooldownMs;
    const sweepId = `${pattern.id}:${cycleIndex}:${index}`;

    if (cycleTime >= cursor && cycleTime < warningEnd) {
      return {
        sweepId,
        patternId: pattern.id,
        phase: "warning",
        sourceX: pattern.sourceX,
        sourceY: pattern.sourceY,
        targetX: pattern.farX,
        targetY: pattern.targetStartY,
        nearWidth: scaledPattern.nearWidth,
        farWidth: scaledPattern.farWidth,
        beam: null,
      };
    }

    if (cycleTime >= warningEnd && cycleTime < activeEnd) {
      const progress = easeInOut((cycleTime - warningEnd) / scaledPattern.sweepDurationMs);
      const beam = {
        patternId: pattern.id,
        sourceX: pattern.sourceX,
        sourceY: pattern.sourceY,
        targetX: pattern.farX,
        targetY: lerp(pattern.targetStartY, pattern.targetEndY, progress),
        nearWidth: scaledPattern.nearWidth,
        farWidth: scaledPattern.farWidth,
      };

      return {
        sweepId,
        patternId: pattern.id,
        phase: "active",
        sourceX: beam.sourceX,
        sourceY: beam.sourceY,
        targetX: beam.targetX,
        targetY: beam.targetY,
        nearWidth: beam.nearWidth,
        farWidth: beam.farWidth,
        beam,
      };
    }

    if (cycleTime >= activeEnd && cycleTime < cooldownEnd) {
      return {
        sweepId,
        patternId: pattern.id,
        phase: "cooldown",
        sourceX: pattern.sourceX,
        sourceY: pattern.sourceY,
        targetX: pattern.farX,
        targetY: pattern.targetEndY,
        nearWidth: scaledPattern.nearWidth,
        farWidth: scaledPattern.farWidth,
        beam: null,
      };
    }

    cursor = cooldownEnd;
  }

  const fallbackPattern = level.glarePatterns[0];

  return {
    sweepId: `${fallbackPattern.id}:0:0`,
    patternId: fallbackPattern.id,
    phase: "cooldown",
    sourceX: fallbackPattern.sourceX,
    sourceY: fallbackPattern.sourceY,
    targetX: fallbackPattern.farX,
    targetY: fallbackPattern.targetEndY,
    nearWidth: fallbackPattern.nearWidth,
    farWidth: fallbackPattern.farWidth,
    beam: null,
  };
}

export function getActiveGlareBeam(
  elapsedMs: number,
  levelId: MiniGameLevelId = DEFAULT_MINIGAME_LEVEL_ID,
): GlareBeam | null {
  const state = getCurrentGlareState(elapsedMs, levelId);

  return state.phase === "active" ? state.beam : null;
}

export function isPlayerInCover(
  player: PlayerState,
  levelId: MiniGameLevelId = DEFAULT_MINIGAME_LEVEL_ID,
): boolean {
  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;
  const level = getMiniGameLevel(levelId);

  return level.coverTiles.some(
    (cover) =>
      centerX >= cover.x &&
      centerX <= cover.x + cover.width &&
      centerY >= cover.y &&
      centerY <= cover.y + cover.height,
  );
}

export function isPlayerDetected(
  player: PlayerState,
  beam: GlareBeam,
  isHidden = player.isInCover,
): boolean {
  if (isHidden) {
    return false;
  }

  const proximity = getBeamProximity(player, beam);

  return proximity ? proximity.lateralDistance <= proximity.allowedWidth : false;
}

export function isPlayerHidden(player: PlayerState, hideMsRemaining: number) {
  return player.isInCover && hideMsRemaining > 0;
}

export function getHideSecondsRemaining(runtime: MiniGameRuntime) {
  return Number((Math.max(0, runtime.hideMsRemaining) / 1_000).toFixed(1));
}

export function getHitsLeft(runtime: MiniGameRuntime): number {
  return Math.max(0, MAX_HITS - runtime.hits);
}

export function getDashSecondsRemaining(runtime: MiniGameRuntime) {
  return Number((Math.max(0, runtime.dashCooldownMs) / 1_000).toFixed(1));
}

export function getSurvivalSeconds(runtime: MiniGameRuntime): number {
  return Number((runtime.elapsedMs / 1_000).toFixed(1));
}

export function readBestLevelScores(): BestScoreMap {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(MINIGAME_STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    const scores: BestScoreMap = {};

    for (const level of MINIGAME_LEVELS) {
      const value = parsed[level.id];

      if (typeof value === "number" && Number.isFinite(value)) {
        scores[level.id] = value;
      }
    }

    return scores;
  } catch {
    return {};
  }
}

export function readBestLevelScore(levelId: MiniGameLevelId): number {
  return readBestLevelScores()[levelId] ?? 0;
}

export function saveBestLevelScore(
  levelId: MiniGameLevelId,
  score: number,
  didClear: boolean,
) {
  const scores = readBestLevelScores();
  const currentBest = scores[levelId] ?? 0;

  if (!didClear) {
    return {
      bestScore: currentBest,
      isNewBest: false,
    };
  }

  const bestScore = Math.max(currentBest, score);
  const isNewBest = score > currentBest;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      MINIGAME_STORAGE_KEY,
      JSON.stringify({
        ...scores,
        [levelId]: bestScore,
      }),
    );
  }

  return {
    bestScore,
    isNewBest,
  };
}

function movePlayerByDistance(
  player: PlayerState,
  directionVector: { x: number; y: number; direction: Direction; isMoving: boolean },
  distance: number,
  levelId: MiniGameLevelId,
) {
  const dx = directionVector.x * distance;
  const dy = directionVector.y * distance;
  let nextX = player.x;
  let nextY = player.y;

  if (!collidesAt(player.x + dx, player.y, player.width, player.height, levelId)) {
    nextX = player.x + dx;
  }

  if (!collidesAt(nextX, player.y + dy, player.width, player.height, levelId)) {
    nextY = player.y + dy;
  }

  const movedPlayer = {
    ...player,
    x: nextX,
    y: nextY,
    direction: directionVector.direction,
    animationFrame: directionVector.isMoving ? Math.floor((nextX + nextY) / 4) % 2 : 0,
    isMoving: directionVector.isMoving,
  };

  return {
    ...movedPlayer,
    isInCover: isPlayerInCover(movedPlayer, levelId),
  };
}

function getDirectionVector(input: MiniGameInput, previous: Direction) {
  const horizontal = Number(input.right) - Number(input.left);
  const vertical = Number(input.down) - Number(input.up);
  const magnitude = Math.hypot(horizontal, vertical);
  const direction = getDirectionFromInput(previous, input);

  return {
    x: magnitude ? horizontal / magnitude : 0,
    y: magnitude ? vertical / magnitude : 0,
    direction,
    isMoving: magnitude > 0,
  };
}

function collidesAt(
  x: number,
  y: number,
  width: number,
  height: number,
  levelId: MiniGameLevelId,
) {
  if (
    x < ROOM_BOUNDS.x ||
    y < ROOM_BOUNDS.y ||
    x + width > ROOM_BOUNDS.x + ROOM_BOUNDS.width ||
    y + height > ROOM_BOUNDS.y + ROOM_BOUNDS.height
  ) {
    return true;
  }

  const level = getMiniGameLevel(levelId);

  return level.solidBlocks.some((block) =>
    rectanglesOverlap(
      { x, y, width, height },
      block,
    ),
  );
}

function getCollectedPickup(
  player: PlayerState,
  pickups: MiniGamePickup[],
  collectedPickupIds: string[],
) {
  const playerRect = {
    x: player.x,
    y: player.y,
    width: player.width,
    height: player.height,
  };

  return pickups.find(
    (pickup) =>
      !collectedPickupIds.includes(pickup.id) &&
      distanceBetweenRects(playerRect, pickup) <= PICKUP_GRAB_DISTANCE,
  );
}

function addFeedback(
  feedbacks: MiniGameFeedback[],
  feedback: Omit<MiniGameFeedback, "id" | "ttlMs">,
  elapsedMs: number,
) {
  return [
    ...feedbacks,
    {
      ...feedback,
      id: `${feedback.label}-${elapsedMs}-${feedbacks.length}`,
      ttlMs: 700,
    },
  ];
}

function getBeamProximity(player: PlayerState, beam: GlareBeam): BeamProximity | null {
  const beamX = beam.targetX - beam.sourceX;
  const beamY = beam.targetY - beam.sourceY;
  const beamLengthSquared = beamX * beamX + beamY * beamY;

  if (beamLengthSquared === 0) {
    return null;
  }
  const sampleCount = 12;
  let bestMatch: BeamProximity | null = null;

  for (let index = 0; index <= sampleCount; index += 1) {
    const projection = index / sampleCount;
    const sampleX = beam.sourceX + beamX * projection;
    const sampleY = beam.sourceY + beamY * projection;
    const lateralDistance = distanceToRect(sampleX, sampleY, player);
    const allowedWidth = lerp(beam.nearWidth, beam.farWidth, projection);

    if (!bestMatch || lateralDistance < bestMatch.lateralDistance) {
      bestMatch = {
        allowedWidth,
        lateralDistance,
      };
    }
  }

  return bestMatch;
}

function rectanglesOverlap(left: Rect, right: Rect) {
  return (
    left.x < right.x + right.width &&
    left.x + left.width > right.x &&
    left.y < right.y + right.height &&
    left.y + left.height > right.y
  );
}

function distanceToRect(x: number, y: number, rect: Rect) {
  const deltaX =
    x < rect.x ? rect.x - x : x > rect.x + rect.width ? x - (rect.x + rect.width) : 0;
  const deltaY =
    y < rect.y ? rect.y - y : y > rect.y + rect.height ? y - (rect.y + rect.height) : 0;

  return Math.hypot(deltaX, deltaY);
}

function distanceBetweenRects(left: Rect, right: Rect) {
  const deltaX = Math.max(0, right.x - (left.x + left.width), left.x - (right.x + right.width));
  const deltaY = Math.max(0, right.y - (left.y + left.height), left.y - (right.y + right.height));

  return Math.hypot(deltaX, deltaY);
}

function getDirectionFromInput(previous: Direction, input: MiniGameInput): Direction {
  if (input.left) {
    return "left";
  }

  if (input.right) {
    return "right";
  }

  if (input.up) {
    return "up";
  }

  if (input.down) {
    return "down";
  }

  return previous;
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function easeInOut(progress: number) {
  return 0.5 - Math.cos(progress * Math.PI) / 2;
}

function getScaledPattern(
  pattern: GlarePattern,
  elapsedMs: number,
  durationMs: number,
  pressure: number,
) {
  const progress = Math.min(1, elapsedMs / durationMs);

  return {
    ...pattern,
    sweepDurationMs: Math.max(
      1_450,
      Math.round((pattern.sweepDurationMs * (1 - progress * 0.22)) / pressure),
    ),
    cooldownMs: Math.max(
      280,
      Math.round((pattern.cooldownMs * (1 - progress * 0.28)) / pressure),
    ),
    nearWidth: pattern.nearWidth * (1 + progress * 0.14 * pressure),
    farWidth: pattern.farWidth * (1 + progress * 0.18 * pressure),
  };
}
