/**
 * Realtime arcade games share a continuous frame loop, pause key, and difficulty restart.
 * Tetris is realtime but keeps its own controls.
 */

export const ARCADE_GAME_IDS = [
  'snake-3d',
  'pong-3d',
  'breakout-3d',
  'pacman-3d',
  'asteroids-3d'
];

export const REALTIME_GAME_IDS = new Set(['tetris-3d', ...ARCADE_GAME_IDS]);

export const isArcadeGame = (gameId) => ARCADE_GAME_IDS.includes(gameId);
