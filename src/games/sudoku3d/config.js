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
  rowSpacing: 1.18,
  cellSize: 0.82,
  layerSpacing: 1.35,
  edgeColor: '#ffffff'
};

const BASE_USER = '#f9fafb';
const BASE_GIVEN = '#e5e7eb';
const TINT_MIX = 0.18;
const EDGE_MIX = 0.45;

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex(r, g, b) {
  const to = (n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

function mixHex(a, b, t) {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

/**
 * Default cube face color for a layer. Slight blend of neutral base with LAYER_COLORS.
 * @param {number} layerIndex
 * @param {boolean} [isGiven]
 */
export function getLayerTint(layerIndex, isGiven = false) {
  const base = isGiven ? BASE_GIVEN : BASE_USER;
  const layer = LAYER_COLORS[layerIndex] || '#888888';
  return mixHex(base, layer, TINT_MIX);
}

/** Edge color when a cell is not selected, so the layer stays visible. */
export function getLayerEdgeColor(layerIndex) {
  const layer = LAYER_COLORS[layerIndex] || '#888888';
  return mixHex('#ffffff', layer, EDGE_MIX);
}

/** Nav button fill matches the default (user) cube face for that layer. */
export function getLayerNavButtonColor(layerIndex) {
  return getLayerTint(layerIndex, false);
}

export const getCameraPosition = (difficulty = 'Medium') => {
  return [6, 6, 11];
};

export const getGivenRatio = (difficulty = 'Medium') => {
  return DIFFICULTY_CONFIG[difficulty]?.givenRatio ?? DIFFICULTY_CONFIG.Medium.givenRatio;
};
