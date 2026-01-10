/**
 * Tetris 3D Pieces
 * 
 * Defines all 7 standard tetromino pieces with their 3D coordinates
 * and rotation logic around Y-axis and X-axis.
 * 
 * Each piece is defined as an array of [x, y, z] offsets from the pivot point.
 * Y is the vertical axis (up), X and Z are horizontal.
 */

import { PIECE_COLORS } from './config';

/**
 * Standard tetromino shapes
 * Coordinates are relative to pivot point (0, 0, 0)
 * Y-axis points up, pieces start flat on the XZ plane
 */
export const TETROMINOES = {
  // I-piece: straight line of 4
  I: {
    shape: [
      [-1, 0, 0],
      [0, 0, 0],
      [1, 0, 0],
      [2, 0, 0]
    ],
    color: PIECE_COLORS.I,
    pivot: [0.5, 0, 0] // Center between blocks
  },
  
  // O-piece: 2x2 square
  O: {
    shape: [
      [0, 0, 0],
      [1, 0, 0],
      [0, 0, 1],
      [1, 0, 1]
    ],
    color: PIECE_COLORS.O,
    pivot: [0.5, 0, 0.5]
  },
  
  // T-piece: T shape
  T: {
    shape: [
      [-1, 0, 0],
      [0, 0, 0],
      [1, 0, 0],
      [0, 0, 1]
    ],
    color: PIECE_COLORS.T,
    pivot: [0, 0, 0]
  },
  
  // S-piece: S/zigzag shape
  S: {
    shape: [
      [0, 0, 0],
      [1, 0, 0],
      [-1, 0, 1],
      [0, 0, 1]
    ],
    color: PIECE_COLORS.S,
    pivot: [0, 0, 0]
  },
  
  // Z-piece: reverse S shape
  Z: {
    shape: [
      [-1, 0, 0],
      [0, 0, 0],
      [0, 0, 1],
      [1, 0, 1]
    ],
    color: PIECE_COLORS.Z,
    pivot: [0, 0, 0]
  },
  
  // L-piece: L shape
  L: {
    shape: [
      [-1, 0, 0],
      [0, 0, 0],
      [1, 0, 0],
      [1, 0, 1]
    ],
    color: PIECE_COLORS.L,
    pivot: [0, 0, 0]
  },
  
  // J-piece: reverse L shape
  J: {
    shape: [
      [-1, 0, 0],
      [0, 0, 0],
      [1, 0, 0],
      [-1, 0, 1]
    ],
    color: PIECE_COLORS.J,
    pivot: [0, 0, 0]
  }
};

/**
 * Rotate a point around the Y axis (vertical)
 * @param {number[]} point - [x, y, z] coordinates
 * @param {boolean} clockwise - Direction of rotation
 * @returns {number[]} Rotated point
 */
export const rotateAroundY = (point, clockwise = true) => {
  const [x, y, z] = point;
  if (clockwise) {
    // 90° clockwise: (x, z) -> (z, -x)
    return [z, y, -x];
  } else {
    // 90° counter-clockwise: (x, z) -> (-z, x)
    return [-z, y, x];
  }
};

/**
 * Rotate a point around the X axis (horizontal, front-back flip)
 * @param {number[]} point - [x, y, z] coordinates
 * @param {boolean} forward - Direction of rotation
 * @returns {number[]} Rotated point
 */
export const rotateAroundX = (point, forward = true) => {
  const [x, y, z] = point;
  if (forward) {
    // 90° forward: (y, z) -> (z, -y)
    return [x, z, -y];
  } else {
    // 90° backward: (y, z) -> (-z, y)
    return [x, -z, y];
  }
};

/**
 * Rotate an entire piece shape
 * @param {number[][]} shape - Array of [x, y, z] coordinates
 * @param {string} axis - 'Y' or 'X'
 * @param {boolean} positive - Direction
 * @returns {number[][]} Rotated shape
 */
export const rotateShape = (shape, axis, positive = true) => {
  const rotateFunc = axis === 'Y' ? rotateAroundY : rotateAroundX;
  return shape.map(point => {
    const rotated = rotateFunc(point, positive);
    // Round to avoid floating point errors
    return rotated.map(v => Math.round(v));
  });
};

/**
 * Get a random tetromino type
 * @returns {string} Piece type key (I, O, T, S, Z, L, J)
 */
export const getRandomPieceType = () => {
  const types = Object.keys(TETROMINOES);
  return types[Math.floor(Math.random() * types.length)];
};

/**
 * Create a new piece instance
 * @param {string} type - Piece type (I, O, T, S, Z, L, J)
 * @param {number} x - Initial X position
 * @param {number} y - Initial Y position (height)
 * @param {number} z - Initial Z position
 * @returns {Object} Piece object
 */
export const createPiece = (type, x, y, z) => {
  const template = TETROMINOES[type];
  return {
    type,
    shape: template.shape.map(([dx, dy, dz]) => [dx, dy, dz]), // Clone shape
    color: template.color,
    position: [x, y, z]
  };
};

/**
 * Get world coordinates of all blocks in a piece
 * @param {Object} piece - Piece object
 * @returns {number[][]} Array of [x, y, z] world coordinates
 */
export const getPieceBlocks = (piece) => {
  const [px, py, pz] = piece.position;
  return piece.shape.map(([dx, dy, dz]) => [
    px + dx,
    py + dy,
    pz + dz
  ]);
};

/**
 * Rotate a piece around an axis
 * @param {Object} piece - Piece object
 * @param {string} axis - 'Y' or 'X'
 * @param {boolean} positive - Direction
 * @returns {Object} New piece with rotated shape
 */
export const rotatePiece = (piece, axis, positive = true) => {
  // O-piece doesn't rotate
  if (piece.type === 'O') {
    return piece;
  }
  
  return {
    ...piece,
    shape: rotateShape(piece.shape, axis, positive)
  };
};

/**
 * Move a piece
 * @param {Object} piece - Piece object
 * @param {number} dx - X movement
 * @param {number} dy - Y movement
 * @param {number} dz - Z movement
 * @returns {Object} New piece with updated position
 */
export const movePiece = (piece, dx, dy, dz) => {
  const [x, y, z] = piece.position;
  return {
    ...piece,
    position: [x + dx, y + dy, z + dz]
  };
};

/**
 * Get the bounding box of a piece's shape (world coordinates)
 * @param {Object} piece - Piece object
 * @returns {Object} { minX, maxX, minY, maxY, minZ, maxZ }
 */
export const getPieceBounds = (piece) => {
  const blocks = getPieceBlocks(piece);
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  for (const [x, y, z] of blocks) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }
  
  return { minX, maxX, minY, maxY, minZ, maxZ };
};

/**
 * Get the bounding box of a raw shape (relative coordinates)
 * @param {number[][]} shape - Array of [x, y, z] offsets
 * @returns {Object} { minX, maxX, minY, maxY, minZ, maxZ }
 */
export const getShapeBounds = (shape) => {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  for (const [x, y, z] of shape) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }
  
  return { minX, maxX, minY, maxY, minZ, maxZ };
};

/**
 * Calculate spawn position for a piece type that keeps it within bounds
 * @param {string} pieceType - Type of piece (I, O, T, S, Z, L, J)
 * @param {number} width - Board width
 * @param {number} depth - Board depth
 * @param {number} height - Board height
 * @returns {[number, number, number]} Spawn position [x, y, z]
 */
export const calculateSpawnPosition = (pieceType, width, depth, height) => {
  const template = TETROMINOES[pieceType];
  const bounds = getShapeBounds(template.shape);
  
  // Start at center
  let x = Math.floor(width / 2);
  let z = Math.floor(depth / 2);
  
  // Clamp X position to keep piece within bounds
  // minX + x >= 0  =>  x >= -minX
  // maxX + x < width  =>  x < width - maxX  =>  x <= width - 1 - maxX
  const minValidX = -bounds.minX;
  const maxValidX = width - 1 - bounds.maxX;
  x = Math.max(minValidX, Math.min(maxValidX, x));
  
  // Clamp Z position to keep piece within bounds
  const minValidZ = -bounds.minZ;
  const maxValidZ = depth - 1 - bounds.maxZ;
  z = Math.max(minValidZ, Math.min(maxValidZ, z));
  
  return [x, height - 1, z];
};

/**
 * Bag randomizer for fair piece distribution
 * Returns pieces in random order, ensuring all 7 appear before repeating
 */
export class PieceBag {
  constructor() {
    this.bag = [];
    this.refill();
  }
  
  refill() {
    this.bag = Object.keys(TETROMINOES);
    // Fisher-Yates shuffle
    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
    }
  }
  
  next() {
    if (this.bag.length === 0) {
      this.refill();
    }
    return this.bag.pop();
  }
  
  peek() {
    if (this.bag.length === 0) {
      this.refill();
    }
    return this.bag[this.bag.length - 1];
  }
}

