/**
 * 3D 2048 configuration — grid, cubes (match Minesweeper spacing), tile colors
 */

import { WIN_VALUE } from './gameLogic';

export const CUBE_CONFIG = {
  spacing: 0.9,
  size: 0.8,
  edgeColor: '#ffffff'
};

/** Light grey wireframe around the full 4×4×4 board (outer shell) */
export const BOARD_OUTLINE_COLOR = '#c4c4c4';

/**
 * Outer edge length along one axis: from far edge of min cell to far edge of max cell.
 * @param {number} gridSize
 * @param {number} spacing
 * @param {number} cubeSize
 */
export function getBoardOuterExtent(gridSize, spacing, cubeSize) {
  return (gridSize - 1) * spacing + cubeSize;
}

export function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Background colors for tile values 2 … 4096 (powers of 2 up through 8096 exclusive of 8192).
 * 4096 uses a saturated gold so it never reads as “black” on screen.
 */
export const TILE_BG_BY_VALUE = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
  4096: '#d97706'
};

/**
 * Tiles with value > HIGH_TILE_LABEL (8096): these colors cycle by exponent.
 * First entry is for 2^13 = 8192.
 */
export const EXTENDED_TILE_COLORS = [
  '#8b5cf6',
  '#6366f1',
  '#0ea5e9',
  '#14b8a6',
  '#f43f5e',
  '#eab308',
  '#84cc16',
  '#a855f7',
  '#ec4899'
];

/** Above this value, use EXTENDED_TILE_COLORS and `formatCubeLabel` → 2^x */
export const HIGH_TILE_THRESHOLD = 8096;

export function getTileBackgroundColor(value) {
  if (value <= 0) return '#cdc1b4';
  if (TILE_BG_BY_VALUE[value]) return TILE_BG_BY_VALUE[value];
  if (value > HIGH_TILE_THRESHOLD && isPowerOfTwo(value)) {
    const exp = Math.round(Math.log2(value));
    const idx = (exp - 13 + EXTENDED_TILE_COLORS.length * 10) % EXTENDED_TILE_COLORS.length;
    return EXTENDED_TILE_COLORS[idx];
  }
  if (isPowerOfTwo(value)) {
    const exp = Math.round(Math.log2(value));
    return EXTENDED_TILE_COLORS[exp % EXTENDED_TILE_COLORS.length];
  }
  return '#ca8a04';
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255
  };
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Dark text on light tiles, light text on dark tiles */
export function getTileTextColor(value) {
  const bg = getTileBackgroundColor(value);
  return relativeLuminance(bg) > 0.55 ? '#1f2937' : '#f9fafb';
}

/**
 * @param {number} value
 * @returns {string} Decimal label, or `2^x` when value is a power of 2 and > 8096
 */
export function formatCubeLabel(value) {
  if (value <= 0) return '';
  if (value > HIGH_TILE_THRESHOLD && isPowerOfTwo(value)) {
    const x = Math.round(Math.log2(value));
    return `2^${x}`;
  }
  return String(value);
}

/** Default view: closer than initial 2048 setup so the grid fills more of the frame */
export function getCameraPosition() {
  return [0, 2.2, 5.2];
}

export function formatWinLabel() {
  return `${WIN_VALUE}`;
}
