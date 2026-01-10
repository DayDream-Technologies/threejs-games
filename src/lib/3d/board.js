/**
 * 3D Board Utilities
 * 
 * Shared utilities for creating and managing 3D game boards.
 */

/**
 * Create an empty 3D board
 * @param {number} size - Size of the board (size x size x size)
 * @param {*} defaultValue - Default value for each cell (default: null)
 * @returns {Array} - 3D array
 */
export const createBoard3D = (size, defaultValue = null) => {
  const board = [];
  for (let x = 0; x < size; x++) {
    board[x] = [];
    for (let y = 0; y < size; y++) {
      board[x][y] = [];
      for (let z = 0; z < size; z++) {
        board[x][y][z] = typeof defaultValue === 'function' 
          ? defaultValue(x, y, z) 
          : defaultValue;
      }
    }
  }
  return board;
};

/**
 * Deep clone a 3D board
 * @param {Array} board - 3D board to clone
 * @returns {Array} - Cloned 3D board
 */
export const cloneBoard3D = (board) => {
  return board.map(col => col.map(row => row.map(cell => 
    cell && typeof cell === 'object' ? { ...cell } : cell
  )));
};

/**
 * Check if coordinates are within board bounds
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} size - Board size
 * @returns {boolean}
 */
export const isInBounds = (x, y, z, size) => {
  return x >= 0 && x < size && y >= 0 && y < size && z >= 0 && z < size;
};

/**
 * Get all neighboring positions in a 3D grid (26-neighborhood)
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} size - Board size
 * @returns {Array} - Array of [x, y, z] positions
 */
export const getNeighbors3D = (x, y, z, size) => {
  const neighbors = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (dx === 0 && dy === 0 && dz === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        const nz = z + dz;
        if (isInBounds(nx, ny, nz, size)) {
          neighbors.push([nx, ny, nz]);
        }
      }
    }
  }
  return neighbors;
};

/**
 * Get 6-neighborhood (orthogonal neighbors only)
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} size - Board size
 * @returns {Array} - Array of [x, y, z] positions
 */
export const getOrthogonalNeighbors3D = (x, y, z, size) => {
  const directions = [
    [1, 0, 0], [-1, 0, 0],
    [0, 1, 0], [0, -1, 0],
    [0, 0, 1], [0, 0, -1]
  ];
  
  return directions
    .map(([dx, dy, dz]) => [x + dx, y + dy, z + dz])
    .filter(([nx, ny, nz]) => isInBounds(nx, ny, nz, size));
};

/**
 * Iterate over all cells in a 3D board
 * @param {number} size - Board size
 * @param {function} callback - Called with (x, y, z) for each cell
 */
export const forEachCell3D = (size, callback) => {
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        callback(x, y, z);
      }
    }
  }
};

/**
 * Calculate world position from grid coordinates
 * @param {number} x - Grid x coordinate
 * @param {number} y - Grid y coordinate
 * @param {number} z - Grid z coordinate
 * @param {number} size - Grid size
 * @param {number} spacing - Space between cells (default: 1.0)
 * @returns {[number, number, number]} - World position [px, py, pz]
 */
export const gridToWorld = (x, y, z, size, spacing = 1.0) => {
  const offset = (size - 1) * spacing * 0.5;
  return [
    x * spacing - offset,
    y * spacing - offset,
    z * spacing - offset
  ];
};

/**
 * Check if a position is on the outer layer of the cube
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} size
 * @returns {boolean}
 */
export const isOnOuterLayer = (x, y, z, size) => {
  return x === 0 || x === size - 1 ||
         y === 0 || y === size - 1 ||
         z === 0 || z === size - 1;
};

/**
 * Get the layer index (0 = outer, 1 = second, etc.)
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} size
 * @returns {number}
 */
export const getLayer = (x, y, z, size) => {
  const center = Math.floor(size / 2);
  const distFromEdge = Math.min(
    x, size - 1 - x,
    y, size - 1 - y,
    z, size - 1 - z
  );
  return distFromEdge;
};

/**
 * Shuffle an array in place (Fisher-Yates)
 * @param {Array} array
 * @returns {Array} - The same array, shuffled
 */
export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * Get all coordinates in a 3D grid
 * @param {number} size
 * @returns {Array} - Array of [x, y, z] coordinates
 */
export const getAllCoordinates = (size) => {
  const coords = [];
  forEachCell3D(size, (x, y, z) => coords.push([x, y, z]));
  return coords;
};

