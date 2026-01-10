/**
 * Tetris 3D Game Logic
 * 
 * Core game mechanics including collision detection,
 * plane clearing, and board management.
 */

import { getPieceBlocks, movePiece, rotatePiece } from './pieces';
import { calculateScore, SCORING } from './config';

/**
 * Create an empty 3D board
 * @param {number} width - X dimension
 * @param {number} depth - Z dimension
 * @param {number} height - Y dimension
 * @returns {Array} 3D array of null values
 */
export const createBoard = (width, depth, height) => {
  const board = [];
  for (let x = 0; x < width; x++) {
    board[x] = [];
    for (let y = 0; y < height; y++) {
      board[x][y] = [];
      for (let z = 0; z < depth; z++) {
        board[x][y][z] = null; // null = empty, otherwise color string
      }
    }
  }
  return board;
};

/**
 * Check if a position is within board bounds
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} width
 * @param {number} depth
 * @param {number} height
 * @returns {boolean}
 */
export const isInBounds = (x, y, z, width, depth, height) => {
  return x >= 0 && x < width && 
         y >= 0 && y < height && 
         z >= 0 && z < depth;
};

/**
 * Check if a piece collides with the board or boundaries
 * @param {Object} piece - Piece object
 * @param {Array} board - 3D board array
 * @param {number} width
 * @param {number} depth
 * @param {number} height
 * @returns {boolean} True if collision
 */
export const checkCollision = (piece, board, width, depth, height) => {
  const blocks = getPieceBlocks(piece);
  
  for (const [x, y, z] of blocks) {
    // Check bounds
    if (x < 0 || x >= width || z < 0 || z >= depth || y < 0) {
      return true;
    }
    
    // Allow pieces above the board height (spawning)
    if (y >= height) {
      continue;
    }
    
    // Check if cell is occupied
    if (board[x][y][z] !== null) {
      return true;
    }
  }
  
  return false;
};

/**
 * Try to move a piece, returning new piece if valid
 * @param {Object} piece
 * @param {number} dx
 * @param {number} dy
 * @param {number} dz
 * @param {Array} board
 * @param {number} width
 * @param {number} depth
 * @param {number} height
 * @returns {Object|null} New piece or null if move is invalid
 */
export const tryMove = (piece, dx, dy, dz, board, width, depth, height) => {
  const newPiece = movePiece(piece, dx, dy, dz);
  if (checkCollision(newPiece, board, width, depth, height)) {
    return null;
  }
  return newPiece;
};

/**
 * Try to rotate a piece with wall kicks
 * @param {Object} piece
 * @param {string} axis - 'Y' or 'X'
 * @param {boolean} positive - Direction
 * @param {Array} board
 * @param {number} width
 * @param {number} depth
 * @param {number} height
 * @returns {Object|null} New piece or null if rotation is invalid
 */
export const tryRotate = (piece, axis, positive, board, width, depth, height) => {
  const rotated = rotatePiece(piece, axis, positive);
  
  // Try original position first
  if (!checkCollision(rotated, board, width, depth, height)) {
    return rotated;
  }
  
  // Wall kick attempts - try shifting the piece
  const kicks = [
    [1, 0, 0], [-1, 0, 0],
    [0, 0, 1], [0, 0, -1],
    [0, 1, 0], // Kick up
    [2, 0, 0], [-2, 0, 0],
    [0, 0, 2], [0, 0, -2]
  ];
  
  for (const [dx, dy, dz] of kicks) {
    const kicked = movePiece(rotated, dx, dy, dz);
    if (!checkCollision(kicked, board, width, depth, height)) {
      return kicked;
    }
  }
  
  return null; // Rotation not possible
};

/**
 * Lock a piece onto the board
 * @param {Object} piece
 * @param {Array} board
 * @param {number} height
 * @returns {Array} New board with piece locked
 */
export const lockPiece = (piece, board, height) => {
  const newBoard = board.map(col => col.map(row => [...row]));
  const blocks = getPieceBlocks(piece);
  
  for (const [x, y, z] of blocks) {
    if (y >= 0 && y < height) {
      newBoard[x][y][z] = piece.color;
    }
  }
  
  return newBoard;
};

/**
 * Check if a horizontal plane is complete
 * @param {Array} board
 * @param {number} y - Y level to check
 * @param {number} width
 * @param {number} depth
 * @returns {boolean}
 */
export const isPlaneComplete = (board, y, width, depth) => {
  for (let x = 0; x < width; x++) {
    for (let z = 0; z < depth; z++) {
      if (board[x][y][z] === null) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Find all complete planes
 * @param {Array} board
 * @param {number} width
 * @param {number} depth
 * @param {number} height
 * @returns {number[]} Array of Y levels that are complete
 */
export const findCompletePlanes = (board, width, depth, height) => {
  const complete = [];
  for (let y = 0; y < height; y++) {
    if (isPlaneComplete(board, y, width, depth)) {
      complete.push(y);
    }
  }
  return complete;
};

/**
 * Clear complete planes and drop blocks above
 * @param {Array} board
 * @param {number[]} planes - Y levels to clear (sorted ascending)
 * @param {number} width
 * @param {number} depth
 * @param {number} height
 * @returns {Array} New board with planes cleared
 */
export const clearPlanes = (board, planes, width, depth, height) => {
  if (planes.length === 0) return board;
  
  const newBoard = createBoard(width, depth, height);
  
  // Sort planes in descending order for easier processing
  const sortedPlanes = [...planes].sort((a, b) => b - a);
  
  let writeY = 0; // Where to write in new board
  
  for (let readY = 0; readY < height; readY++) {
    // Skip cleared planes
    if (sortedPlanes.includes(readY)) {
      continue;
    }
    
    // Copy this plane to the new position
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        newBoard[x][writeY][z] = board[x][readY][z];
      }
    }
    writeY++;
  }
  
  return newBoard;
};

/**
 * Calculate hard drop distance
 * @param {Object} piece
 * @param {Array} board
 * @param {number} width
 * @param {number} depth
 * @param {number} height
 * @returns {number} Distance the piece can drop
 */
export const getDropDistance = (piece, board, width, depth, height) => {
  let distance = 0;
  let testPiece = piece;
  
  while (true) {
    const dropped = movePiece(testPiece, 0, -1, 0);
    if (checkCollision(dropped, board, width, depth, height)) {
      break;
    }
    testPiece = dropped;
    distance++;
  }
  
  return distance;
};

/**
 * Get the ghost piece position (where it would land)
 * @param {Object} piece
 * @param {Array} board
 * @param {number} width
 * @param {number} depth
 * @param {number} height
 * @returns {Object} Ghost piece at landing position
 */
export const getGhostPiece = (piece, board, width, depth, height) => {
  const distance = getDropDistance(piece, board, width, depth, height);
  return movePiece(piece, 0, -distance, 0);
};

/**
 * Hard drop a piece
 * @param {Object} piece
 * @param {Array} board
 * @param {number} width
 * @param {number} depth
 * @param {number} height
 * @returns {{ piece: Object, distance: number }} Dropped piece and distance
 */
export const hardDrop = (piece, board, width, depth, height) => {
  const distance = getDropDistance(piece, board, width, depth, height);
  const droppedPiece = movePiece(piece, 0, -distance, 0);
  return { piece: droppedPiece, distance };
};

/**
 * Check if game is over (pieces stacked to top)
 * @param {Object} piece
 * @param {Array} board
 * @param {number} width
 * @param {number} depth
 * @param {number} height
 * @returns {boolean}
 */
export const isGameOver = (piece, board, width, depth, height) => {
  // Game over if newly spawned piece immediately collides
  return checkCollision(piece, board, width, depth, height);
};

/**
 * Get spawn position for a new piece
 * @param {number} width
 * @param {number} depth
 * @param {number} height
 * @returns {[number, number, number]} Spawn position
 */
export const getSpawnPosition = (width, depth, height) => {
  return [
    Math.floor(width / 2),
    height - 1, // Top of the well
    Math.floor(depth / 2)
  ];
};

/**
 * Calculate total score for clearing planes
 * @param {number} planesCleared
 * @param {number} level
 * @param {number} dropDistance - Optional hard drop distance
 * @returns {number} Total score
 */
export const calculateTotalScore = (planesCleared, level, dropDistance = 0) => {
  let score = 0;
  
  if (planesCleared > 0) {
    score += calculateScore(planesCleared, level);
  }
  
  if (dropDistance > 0) {
    score += dropDistance * SCORING.hardDrop;
  }
  
  return score;
};

/**
 * Get all occupied cells in the board for rendering
 * @param {Array} board
 * @param {number} width
 * @param {number} depth
 * @param {number} height
 * @returns {Array} Array of { x, y, z, color }
 */
export const getOccupiedCells = (board, width, depth, height) => {
  const cells = [];
  
  // Safety check: ensure board dimensions match expected dimensions
  if (!board || !Array.isArray(board) || board.length === 0) {
    return cells;
  }
  
  // Use actual board dimensions to avoid out-of-bounds access
  const actualWidth = board.length;
  const actualHeight = board[0]?.length || 0;
  const actualDepth = board[0]?.[0]?.length || 0;
  
  for (let x = 0; x < actualWidth; x++) {
    if (!board[x]) continue;
    for (let y = 0; y < actualHeight; y++) {
      if (!board[x][y]) continue;
      for (let z = 0; z < actualDepth; z++) {
        if (board[x][y][z] !== null && board[x][y][z] !== undefined) {
          cells.push({ x, y, z, color: board[x][y][z] });
        }
      }
    }
  }
  
  return cells;
};

