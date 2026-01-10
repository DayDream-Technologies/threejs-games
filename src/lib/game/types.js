/**
 * Game Interface Types
 * 
 * This module defines the contract that all games must implement
 * to integrate with the game framework.
 */

/**
 * @typedef {Object} InstructionsData
 * @property {string} objective - The main goal of the game
 * @property {string[]} controls - List of control instructions
 * @property {string[]} tips - List of gameplay tips
 */

/**
 * @typedef {Object} CameraConfig
 * @property {[number, number, number]} position - Camera position [x, y, z]
 * @property {number} fov - Field of view
 * @property {boolean} enableZoom - Whether zoom is enabled
 */

/**
 * @typedef {Object} GameState
 * @property {number} score - Current score
 * @property {number} lives - Remaining lives
 * @property {string} level - Current difficulty level
 * @property {boolean} isPlaying - Whether the game is active
 * @property {boolean} gameWon - Whether the player has won
 * @property {boolean} gameLost - Whether the player has lost
 * @property {Object} [custom] - Game-specific state
 */

/**
 * @typedef {Object} GameConfig
 * @property {string} id - Unique game identifier (matches route param)
 * @property {string} title - Display title for the game
 * @property {React.ComponentType} Component - The main game component
 * @property {function(): InstructionsData} getInstructions - Returns game instructions
 * @property {function(Object): CameraConfig} getCameraConfig - Returns camera configuration
 * @property {function(): GameState} getDefaultState - Returns initial game state
 * @property {React.ComponentType|null} [ControlsComponent] - Optional game-specific controls UI
 * @property {function(): Object} [getDefaultOptions] - Returns default game options (difficulty, etc.)
 */

/**
 * Creates a default game state object
 * @returns {GameState}
 */
export const createDefaultGameState = () => ({
  score: 0,
  lives: 1,
  level: 'Easy',
  isPlaying: false,
  gameWon: false,
  gameLost: false
});

/**
 * Creates a default camera config
 * @param {[number, number, number]} position 
 * @returns {CameraConfig}
 */
export const createCameraConfig = (position = [0, 0, 8], fov = 75, enableZoom = true) => ({
  position,
  fov,
  enableZoom
});

/**
 * Validates a game configuration object
 * @param {GameConfig} config 
 * @returns {boolean}
 */
export const validateGameConfig = (config) => {
  const required = ['id', 'title', 'Component', 'getInstructions', 'getCameraConfig', 'getDefaultState'];
  
  for (const key of required) {
    if (!config[key]) {
      console.error(`Game config missing required field: ${key}`);
      return false;
    }
  }
  
  if (typeof config.getInstructions !== 'function') {
    console.error('getInstructions must be a function');
    return false;
  }
  
  if (typeof config.getCameraConfig !== 'function') {
    console.error('getCameraConfig must be a function');
    return false;
  }
  
  if (typeof config.getDefaultState !== 'function') {
    console.error('getDefaultState must be a function');
    return false;
  }
  
  return true;
};

