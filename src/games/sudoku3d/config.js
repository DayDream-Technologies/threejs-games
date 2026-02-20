/**
 * 3D Sudoku Configuration
 *
 * Layer colors (9 distinguishable), camera, spacing, difficulty presets.
 */

// 9 easily distinguishable colors (one per layer / "third dimension")
export const LAYER_COLORS = [
  '#e63946', // red
  '#1d3557', // dark blue
  '#2a9d8f', // teal
  '#e9c46a', // yellow/gold
  '#f4a261', // orange
  '#9b5de5', // purple
  '#00b4d8', // cyan
  '#e056fd', // magenta
  '#90be6d'  // lime/green
];

// Difficulty: clue count range (per 81 cells) mapped to given ratio for 729-cell grid.
// Easy 35-40, Medium 28-32, Hard 25-28, Very Hard 22-25, Insane 17-22.
export const DIFFICULTY_CONFIG = {
  Easy:      { givenRatio: 0.46 },  // ~35-40 clues per 81
  Medium:    { givenRatio: 0.36 },  // ~28-32
  Hard:      { givenRatio: 0.32 },  // ~25-28
  'Very Hard': { givenRatio: 0.29 }, // ~22-25
  Insane:    { givenRatio: 0.24 }   // ~17-22
};

export const BOARD_CONFIG = {
  size: 9,
  spacing: 1.05,
  cellSize: 0.82,
  layerSpacing: 1.35,
  edgeColor: '#ffffff'
};

export const getCameraPosition = (difficulty = 'Medium') => {
  return [6, 6, 11];
};

export const getGivenRatio = (difficulty = 'Medium') => {
  return DIFFICULTY_CONFIG[difficulty]?.givenRatio ?? DIFFICULTY_CONFIG.Medium.givenRatio;
};
