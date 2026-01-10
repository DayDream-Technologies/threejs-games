/**
 * Minesweeper 3D Configuration
 * 
 * Contains all game-specific configuration including difficulty settings,
 * colors, camera positions, and other constants.
 */

// Difficulty configurations
export const DIFFICULTY_CONFIG = {
  Easy: { gridSize: 5, bombRatio: 0.24 },   // 5x5x5 = 125 cubes, ~30 bombs
  Medium: { gridSize: 7, bombRatio: 0.24 }, // 7x7x7 = 343 cubes, ~82 bombs
  Hard: { gridSize: 9, bombRatio: 0.24 }    // 9x9x9 = 729 cubes, ~175 bombs
};

// Color scheme
export const COLORS = {
  neutral: '#9ca3af',     // gray - unrevealed cells
  revealed: '#e5e7eb',    // light gray - revealed safe cells
  bomb: '#ef4444',        // red - bombs (game over reveal)
  flag: '#3b82f6',        // blue - flagged cells
  correctFlag: '#10b981'  // green - correctly flagged bombs
};

// Cube rendering settings
export const CUBE_CONFIG = {
  spacing: 0.9,
  size: 0.8,
  edgeColor: '#ffffff'
};

// Scoring configuration
export const SCORING = {
  outer: 10,    // Outer layer cubes
  second: 100,  // Second layer cubes  
  center: 250   // Center cube
};

/**
 * Get camera position based on difficulty
 * @param {string} difficulty - 'Easy' | 'Medium' | 'Hard'
 * @returns {[number, number, number]}
 */
export const getCameraPosition = (difficulty = 'Easy') => {
  switch (difficulty) {
    case 'Easy': return [0, 0, 8];
    case 'Medium': return [0, 0, 12];
    case 'Hard': return [0, 0, 16];
    default: return [0, 0, 8];
  }
};

/**
 * Get grid size for difficulty
 * @param {string} difficulty
 * @returns {number}
 */
export const getGridSize = (difficulty = 'Easy') => {
  return DIFFICULTY_CONFIG[difficulty]?.gridSize || 5;
};

/**
 * Get number of bombs for difficulty
 * @param {string} difficulty
 * @returns {number}
 */
export const getNumBombs = (difficulty = 'Easy') => {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Easy;
  return Math.floor(config.gridSize ** 3 * config.bombRatio);
};

