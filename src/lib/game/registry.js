/**
 * Game Registry
 * 
 * Central registry for all games in the application.
 * Games self-register by importing this module and calling registerGame().
 */

import { validateGameConfig } from './types';

/** @type {Map<string, import('./types').GameConfig>} */
const games = new Map();

/**
 * Register a game with the framework
 * @param {import('./types').GameConfig} config - Game configuration object
 * @returns {boolean} - Whether registration was successful
 */
export const registerGame = (config) => {
  if (!validateGameConfig(config)) {
    console.error(`Failed to register game: ${config?.id || 'unknown'}`);
    return false;
  }
  
  if (games.has(config.id)) {
    console.warn(`Game already registered: ${config.id}. Overwriting.`);
  }
  
  games.set(config.id, config);
  return true;
};

/**
 * Get a game configuration by ID
 * @param {string} id - Game identifier
 * @returns {import('./types').GameConfig|undefined}
 */
export const getGame = (id) => {
  return games.get(id);
};

/**
 * Get all registered games
 * @returns {import('./types').GameConfig[]}
 */
export const getAllGames = () => {
  return Array.from(games.values());
};

/**
 * Get all registered game IDs
 * @returns {string[]}
 */
export const getGameIds = () => {
  return Array.from(games.keys());
};

/**
 * Check if a game is registered
 * @param {string} id - Game identifier
 * @returns {boolean}
 */
export const hasGame = (id) => {
  return games.has(id);
};

/**
 * Unregister a game (useful for testing)
 * @param {string} id - Game identifier
 * @returns {boolean} - Whether the game was removed
 */
export const unregisterGame = (id) => {
  return games.delete(id);
};

/**
 * Clear all registered games (useful for testing)
 */
export const clearRegistry = () => {
  games.clear();
};

