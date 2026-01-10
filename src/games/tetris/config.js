/**
 * Tetris 3D Configuration
 * 
 * Game-specific configuration including difficulty settings,
 * colors, speeds, and scoring.
 */

// Difficulty configurations
export const DIFFICULTY_CONFIG = {
  Easy: { 
    baseWidth: 4, 
    baseDepth: 4, 
    height: 10,
    initialSpeed: 1000,  // ms per drop
    speedDecrement: 100, // ms decrease per level
    minSpeed: 200
  },
  Medium: { 
    baseWidth: 5, 
    baseDepth: 5, 
    height: 12,
    initialSpeed: 800,
    speedDecrement: 80,
    minSpeed: 150
  },
  Hard: { 
    baseWidth: 6, 
    baseDepth: 6, 
    height: 15,
    initialSpeed: 600,
    speedDecrement: 60,
    minSpeed: 100
  }
};

// Piece colors (one for each tetromino type)
export const PIECE_COLORS = {
  I: '#00f5ff', // Cyan
  O: '#ffd700', // Yellow/Gold
  T: '#9400d3', // Purple
  S: '#00ff00', // Green
  Z: '#ff0000', // Red
  L: '#ff8c00', // Orange
  J: '#0000ff'  // Blue
};

// Visual configuration
export const COLORS = {
  well: '#1a1a2e',       // Dark well background
  wellEdge: '#4a4a6a',   // Well edges
  grid: '#2a2a4e',       // Grid lines
  ghost: '#ffffff',      // Ghost piece
  locked: '#3a3a5e',     // Locked pieces tint
  clearing: '#ffffff'    // Clearing animation
};

// Cube rendering settings
export const CUBE_CONFIG = {
  size: 0.9,           // Cube size (slightly less than 1 for gaps)
  spacing: 1.0,        // Grid spacing
  ghostOpacity: 0.3,   // Ghost piece opacity
  activeOpacity: 0.9   // Active piece opacity
};

// Scoring configuration
export const SCORING = {
  single: 100,    // 1 plane cleared
  double: 300,    // 2 planes cleared
  triple: 500,    // 3 planes cleared
  tetris: 800,    // 4 planes cleared
  hardDrop: 2,    // Points per cell dropped
  softDrop: 1     // Points per cell soft dropped
};

// Lines required to level up
export const LINES_PER_LEVEL = 10;

/**
 * Get camera position based on difficulty/grid size
 */
export const getCameraPosition = (difficulty = 'Easy') => {
  const config = DIFFICULTY_CONFIG[difficulty];
  const maxDim = Math.max(config.baseWidth, config.height);
  const distance = maxDim * 1.8;
  return [distance * 0.8, distance * 0.6, distance * 0.8];
};

/**
 * Get drop speed for a given level
 */
export const getDropSpeed = (level, difficulty = 'Easy') => {
  const config = DIFFICULTY_CONFIG[difficulty];
  const speed = config.initialSpeed - (level - 1) * config.speedDecrement;
  return Math.max(speed, config.minSpeed);
};

/**
 * Calculate score for clearing planes
 */
export const calculateScore = (planesCleared, level) => {
  const baseScore = {
    1: SCORING.single,
    2: SCORING.double,
    3: SCORING.triple,
    4: SCORING.tetris
  }[planesCleared] || planesCleared * SCORING.single;
  
  return baseScore * level;
};

