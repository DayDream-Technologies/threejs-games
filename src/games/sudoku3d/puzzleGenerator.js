/**
 * 3D Sudoku puzzle generator
 *
 * Generates a full valid 9×9×9 grid (backtracking), then masks by difficulty.
 * Constraints: per-layer row/col/box; per (row,col) tower across layers.
 */

import { getGivenRatio } from './config';

const SIZE = 9;
const BOX = 3;

/**
 * Create an empty 9×9×9 grid (all zeros)
 * @returns {number[][][]} grid[layer][row][col], 0 = empty
 */
export function createEmptyGrid() {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
  );
}

/**
 * Check if placing d at (layer, row, col) is valid
 */
function canPlace(grid, layer, row, col, d) {
  // In this layer: row
  for (let c = 0; c < SIZE; c++) {
    if (c !== col && grid[layer][row][c] === d) return false;
  }
  // In this layer: column
  for (let r = 0; r < SIZE; r++) {
    if (r !== row && grid[layer][r][col] === d) return false;
  }
  // In this layer: 3×3 box
  const br = Math.floor(row / BOX) * BOX;
  const bc = Math.floor(col / BOX) * BOX;
  for (let r = br; r < br + BOX; r++) {
    for (let c = bc; c < bc + BOX; c++) {
      if ((r !== row || c !== col) && grid[layer][r][c] === d) return false;
    }
  }
  // Tower: (row, col) across all layers
  for (let L = 0; L < SIZE; L++) {
    if (L !== layer && grid[L][row][col] === d) return false;
  }
  return true;
}

/**
 * Shuffle array in place (Fisher–Yates)
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Fill grid with a valid 9×9×9 solution via iterative backtracking.
 * Uses position index 0..728 to avoid recursion and stack overflow.
 */
function fillGrid(grid) {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffle(digits);
  const nextTried = new Array(SIZE * SIZE * SIZE).fill(0);
  let k = 0;

  while (k >= 0) {
    if (k >= SIZE * SIZE * SIZE) return true;
    const layer = Math.floor(k / 81);
    const row = Math.floor((k % 81) / 9);
    const col = k % 9;

    let placed = false;
    for (let i = nextTried[k]; i < SIZE; i++) {
      const d = digits[i];
      if (canPlace(grid, layer, row, col, d)) {
        grid[layer][row][col] = d;
        nextTried[k] = i + 1;
        k++;
        placed = true;
        break;
      }
    }
    if (!placed) {
      nextTried[k] = 0;
      grid[layer][row][col] = 0;
      k--;
    }
  }
  return false;
}

/**
 * Generate a full valid 9×9×9, then mask by difficulty (clear some cells, mark as givens the rest).
 * @param {string} difficulty - 'Easy' | 'Medium' | 'Hard'
 * @returns {{ grid: number[][][], givens: boolean[][][] }}
 */
export function generatePuzzle(difficulty) {
  const ratio = getGivenRatio(difficulty);
  const grid = createEmptyGrid();
  const ok = fillGrid(grid);
  if (!ok) {
    // Fallback: use a known valid pattern (shifted rows per layer)
    for (let layer = 0; layer < SIZE; layer++) {
      for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
          grid[layer][row][col] = ((row * 3 + Math.floor(row / 3) + col + layer) % SIZE) + 1;
        }
      }
    }
  }

  const givens = createEmptyGrid().map((layer) =>
    layer.map((row) => row.map(() => false))
  );

  const total = SIZE * SIZE * SIZE;
  const numGivens = Math.round(total * ratio);
  const indices = [];
  for (let l = 0; l < SIZE; l++) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) indices.push([l, r, c]);
    }
  }
  shuffle(indices);
  for (let i = 0; i < numGivens; i++) {
    const [l, r, c] = indices[i];
    givens[l][r][c] = true;
  }

  const solution = createEmptyGrid();
  for (let l = 0; l < SIZE; l++) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        solution[l][r][c] = grid[l][r][c];
        if (!givens[l][r][c]) grid[l][r][c] = 0;
      }
    }
  }

  return { grid, givens, solution };
}
