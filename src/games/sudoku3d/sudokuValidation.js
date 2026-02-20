/**
 * Validation for 9×9×9 Sudoku: per-layer row/col/box, and per (row,col) tower.
 */

const SIZE = 9;
const BOX = 3;

/**
 * Get set of (layer, row, col) that are in conflict (duplicates in row/col/box/tower).
 * @param {number[][][]} grid - grid[layer][row][col]
 * @returns {Set<string>} keys "layer,row,col" for cells that violate constraints
 */
export function getConflictCells(grid) {
  const conflicts = new Set();

  const key = (l, r, c) => `${l},${r},${c}`;

  // Per-layer: row, col, box
  for (let layer = 0; layer < SIZE; layer++) {
    for (let row = 0; row < SIZE; row++) {
      const seen = new Map();
      for (let col = 0; col < SIZE; col++) {
        const v = grid[layer][row][col];
        if (v === 0) continue;
        if (seen.has(v)) {
          conflicts.add(key(layer, row, col));
          conflicts.add(key(layer, row, seen.get(v)));
        } else seen.set(v, col);
      }
    }
    for (let col = 0; col < SIZE; col++) {
      const seen = new Map();
      for (let row = 0; row < SIZE; row++) {
        const v = grid[layer][row][col];
        if (v === 0) continue;
        if (seen.has(v)) {
          conflicts.add(key(layer, row, col));
          conflicts.add(key(layer, seen.get(v), col));
        } else seen.set(v, row);
      }
    }
    for (let br = 0; br < SIZE; br += BOX) {
      for (let bc = 0; bc < SIZE; bc += BOX) {
        const seen = new Map();
        for (let r = br; r < br + BOX; r++) {
          for (let c = bc; c < bc + BOX; c++) {
            const v = grid[layer][r][c];
            if (v === 0) continue;
            if (seen.has(v)) {
              conflicts.add(key(layer, r, c));
              const [or, oc] = seen.get(v);
              conflicts.add(key(layer, or, oc));
            } else seen.set(v, [r, c]);
          }
        }
      }
    }
  }

  // Tower: (row, col) across layers
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const seen = new Map();
      for (let layer = 0; layer < SIZE; layer++) {
        const v = grid[layer][row][col];
        if (v === 0) continue;
        if (seen.has(v)) {
          conflicts.add(key(layer, row, col));
          conflicts.add(key(seen.get(v), row, col));
        } else seen.set(v, layer);
      }
    }
  }

  return conflicts;
}

/**
 * Check if grid is complete (no zeros) and has no conflicts.
 */
export function isGridValid(grid) {
  for (let l = 0; l < SIZE; l++) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[l][r][c] === 0) return false;
      }
    }
  }
  return getConflictCells(grid).size === 0;
}

const key = (l, r, c) => `${l},${r},${c}`;

/**
 * Get set of cell keys that constrain (layer, row, col): same row, column, 3×3 box in layer, and tower.
 * @returns {Set<string>}
 */
export function getConstraintCells(layer, row, col) {
  const set = new Set();
  for (let c = 0; c < SIZE; c++) set.add(key(layer, row, c));
  for (let r = 0; r < SIZE; r++) set.add(key(layer, r, col));
  const br = Math.floor(row / BOX) * BOX;
  const bc = Math.floor(col / BOX) * BOX;
  for (let r = br; r < br + BOX; r++) {
    for (let c = bc; c < bc + BOX; c++) set.add(key(layer, r, c));
  }
  for (let l = 0; l < SIZE; l++) set.add(key(l, row, col));
  return set;
}

/**
 * True if cell is filled and its row, column, and 3×3 box (in that layer) are all full.
 */
export function isCellCompleted(grid, layer, row, col) {
  if (grid[layer][row][col] === 0) return false;
  for (let c = 0; c < SIZE; c++) if (grid[layer][row][c] === 0) return false;
  for (let r = 0; r < SIZE; r++) if (grid[layer][r][col] === 0) return false;
  const br = Math.floor(row / BOX) * BOX;
  const bc = Math.floor(col / BOX) * BOX;
  for (let r = br; r < br + BOX; r++) {
    for (let c = bc; c < bc + BOX; c++) if (grid[layer][r][c] === 0) return false;
  }
  return true;
}
