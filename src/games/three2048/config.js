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

/** Background color by tile value (2048-style progression) */
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
  4096: '#3c3a32',
  8096: '#edc22e',
  8192: '#3c3a32'
};

export function getTileBackgroundColor(value) {
  if (value <= 0) return '#cdc1b4';
  if (TILE_BG_BY_VALUE[value]) return TILE_BG_BY_VALUE[value];
  // Beyond table: alternate dark tiles
  let v = value;
  while (v > 8192) v /= 2;
  return v >= 4096 ? '#3c3a32' : '#edc22e';
}

/** Text color: dark on light tiles, light on dark */
export function getTileTextColor(value) {
  if (value <= 4) return '#776e65';
  if (value <= 2048) return '#f9f6f2';
  return '#f9f6f2';
}

/** Default view: closer than initial 2048 setup so the grid fills more of the frame */
export function getCameraPosition() {
  return [0, 2.2, 5.2];
}

export function formatWinLabel() {
  return `${WIN_VALUE}`;
}
