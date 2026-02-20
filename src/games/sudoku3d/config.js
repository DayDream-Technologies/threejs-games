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

// Difficulty: fraction of cells that are given (pre-filled). Higher = easier.
export const DIFFICULTY_CONFIG = {
  Easy:   { givenRatio: 0.38 },  // ~38% givens
  Medium: { givenRatio: 0.32 }, // ~32% givens
  Hard:   { givenRatio: 0.26 }   // ~26% givens
};

export const BOARD_CONFIG = {
  size: 9,
  spacing: 0.55,
  cellSize: 0.48,
  layerSpacing: 0.9
};

export const getCameraPosition = (difficulty = 'Medium') => {
  return [8, 8, 14];
};

export const getGivenRatio = (difficulty = 'Medium') => {
  return DIFFICULTY_CONFIG[difficulty]?.givenRatio ?? DIFFICULTY_CONFIG.Medium.givenRatio;
};
