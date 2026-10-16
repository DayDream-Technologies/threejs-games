/**
 * Game Framework Public API
 * 
 * This module exports all public APIs for the game framework.
 */

export {
  registerGame,
  getGame,
  getAllGames,
  getGameIds,
  hasGame,
  unregisterGame,
  clearRegistry
} from './registry';

export {
  createDefaultGameState,
  createCameraConfig,
  validateGameConfig
} from './types';

export { ARCADE_GAME_IDS, REALTIME_GAME_IDS, isArcadeGame } from './realtime';
export { commitStatus } from './status';

