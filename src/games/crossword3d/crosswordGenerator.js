/**
 * 3D Crossword Generator
 * Generates crossword layouts in 3D space with words placed across multiple planes
 * 
 * Algorithm inspired by word search generation techniques, adapted for 3D crossword puzzles.
 * Concepts derived from word search puzzle generation algorithms, extended to support
 * three-dimensional word placement across multiple planes.
 * 
 * References:
 * - Word search generation concepts from various puzzle generation algorithms
 * - Adapted for 3D space with support for axis-aligned word placements only
 */

// Import word lists with definitions
import { WORD_LISTS, getWordDefinition } from './wordLists.js';

// 3D directions: [dx, dy, dz] for word placement
// Only axis-aligned directions (no diagonals)
const DIRECTIONS_3D = [
  [1, 0, 0],   // X+ (right)
  [-1, 0, 0],  // X- (left)
  [0, 1, 0],   // Y+ (up)
  [0, -1, 0],  // Y- (down)
  [0, 0, 1],   // Z+ (forward)
  [0, 0, -1],  // Z- (backward)
];

/**
 * Get number of words to place based on grid size
 */
function getWordCount(gridSize) {
  if (gridSize === 5) return 10;
  if (gridSize === 7) return 15;
  if (gridSize === 9) return 20;
  return 10; // default
}

/**
 * Check if a word can be placed at a given position and direction
 * Ensures intersections are valid and no invalid adjacency exists
 */
function canPlaceWord(board, word, x, y, z, dx, dy, dz, gridSize, intersectionIndex = null, placedWords = []) {
  // intersectionIndex is the index in the word where it should intersect with existing word
  const startOffset = intersectionIndex !== null ? -intersectionIndex : 0;
  
  // Track which cells will be used by this word (for intersection checking)
  const wordCellPositions = new Set();
  
  // First pass: check bounds and intersections
  for (let i = 0; i < word.length; i++) {
    const nx = x + (i + startOffset) * dx;
    const ny = y + (i + startOffset) * dy;
    const nz = z + (i + startOffset) * dz;
    
    // Check bounds
    if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize || nz < 0 || nz >= gridSize) {
      return false;
    }
    
    const cellKey = `${nx},${ny},${nz}`;
    wordCellPositions.add(cellKey);
    
    const cell = board[nx][ny][nz];
    const letterIndex = i;
    
    // If this is the intersection point, the letter must match
    if (intersectionIndex !== null && i === intersectionIndex) {
      if (cell === null || !cell.isWordCell || cell.correctLetter !== word[letterIndex]) {
        return false; // Invalid intersection
      }
    } else {
      // For non-intersection cells, check if they conflict
      if (cell !== null) {
        if (cell.isWordCell) {
          // Must match the correct letter for valid intersection
          if (cell.correctLetter !== word[letterIndex]) {
            return false; // Invalid intersection - letters don't match
          }
        } else {
          // Cell exists but is not a word cell - reject if letter doesn't match
          if (cell.letter && cell.letter !== word[letterIndex]) {
            return false;
          }
        }
      }
    }
  }
  
  // Second pass: check for invalid adjacency
  // For each cell in the new word, check adjacent cells (not overlapping)
  const adjacentDirections = [
    [1, 0, 0], [-1, 0, 0],  // X neighbors
    [0, 1, 0], [0, -1, 0],  // Y neighbors
    [0, 0, 1], [0, 0, -1]   // Z neighbors
  ];
  
  for (let i = 0; i < word.length; i++) {
    const nx = x + (i + startOffset) * dx;
    const ny = y + (i + startOffset) * dy;
    const nz = z + (i + startOffset) * dz;
    
    // Check all 6 adjacent directions
    for (const [adx, ady, adz] of adjacentDirections) {
      const adjX = nx + adx;
      const adjY = ny + ady;
      const adjZ = nz + adz;
      
      // Skip if out of bounds
      if (adjX < 0 || adjX >= gridSize || adjY < 0 || adjY >= gridSize || adjZ < 0 || adjZ >= gridSize) {
        continue;
      }
      
      const adjKey = `${adjX},${adjY},${adjZ}`;
      
      // Skip if this adjacent cell is part of the word we're placing (intersection/overlap)
      if (wordCellPositions.has(adjKey)) {
        continue; // This is an intersection, which is valid
      }
      
      const adjCell = board[adjX][adjY][adjZ];
      
      // If adjacent cell is part of an existing word, check if it's invalid adjacency
      if (adjCell && adjCell.isWordCell) {
        // Check if the adjacent cell belongs to a word in the same direction
        // If so, this is invalid adjacency (parallel words next to each other)
        for (const wordData of placedWords) {
          const [wdx, wdy, wdz] = wordData.direction;
          
          // Check if this word is in the same direction
          if (dx === wdx && dy === wdy && dz === wdz) {
            // Same direction - check if adjacent cell is part of this word
            for (const [wx, wy, wz] of wordData.positions) {
              if (wx === adjX && wy === adjY && wz === adjZ) {
                // Adjacent cell is part of a parallel word - invalid adjacency
                return false;
              }
            }
          }
        }
      }
    }
  }
  
  return true;
}

/**
 * Place a word on the board starting from an intersection point
 */
function placeWordFromIntersection(board, word, intersectX, intersectY, intersectZ, dx, dy, dz, wordId, letterIndex) {
  // Calculate starting position (offset by letterIndex)
  const startX = intersectX - letterIndex * dx;
  const startY = intersectY - letterIndex * dy;
  const startZ = intersectZ - letterIndex * dz;
  
  const positions = [];
  
  for (let i = 0; i < word.length; i++) {
    const nx = startX + i * dx;
    const ny = startY + i * dy;
    const nz = startZ + i * dz;
    const correctLetter = word[i];
    
    if (board[nx][ny][nz] === null) {
      // New cell - create it
      board[nx][ny][nz] = {
        letter: null,
        correctLetter: correctLetter,
        wordIds: [wordId],
        isWordCell: true
      };
    } else {
      // Cell already exists (intersection)
      if (board[nx][ny][nz].correctLetter && board[nx][ny][nz].correctLetter !== correctLetter) {
        console.warn(`Invalid intersection at [${nx}, ${ny}, ${nz}]`);
        return null;
      }
      
      // Add this word to the cell's word list
      if (!board[nx][ny][nz].wordIds.includes(wordId)) {
        board[nx][ny][nz].wordIds.push(wordId);
      }
      
      // Ensure correctLetter is set
      if (!board[nx][ny][nz].correctLetter) {
        board[nx][ny][nz].correctLetter = correctLetter;
      }
    }
    positions.push([nx, ny, nz]);
  }
  
  return positions;
}

/**
 * Get all available intersection points from placed words
 */
function getAvailableIntersections(board, placedWords, gridSize) {
  const intersections = [];
  
  for (const wordData of placedWords) {
    for (let i = 0; i < wordData.positions.length; i++) {
      const [x, y, z] = wordData.positions[i];
      const letter = wordData.word[i];
      
      intersections.push({
        x, y, z,
        letter,
        letterIndex: i,
        wordData
      });
    }
  }
  
  return intersections;
}

/**
 * Find words from the word list that contain a specific letter
 */
function findWordsWithLetter(wordList, letter, excludeWords = []) {
  const excludeSet = new Set(excludeWords.map(w => w.toUpperCase()));
  return wordList.filter(word => {
    const upperWord = word.toUpperCase();
    return !excludeSet.has(upperWord) && upperWord.includes(letter);
  });
}

/**
 * Generate a 3D crossword puzzle using intersection-based placement
 */
export function generateCrossword3D(gridSize = 9, difficulty = 'medium', maxAttempts = 1000) {
  const board = [];
  // Initialize empty board
  for (let x = 0; x < gridSize; x++) {
    board[x] = [];
    for (let y = 0; y < gridSize; y++) {
      board[x][y] = [];
      for (let z = 0; z < gridSize; z++) {
        board[x][y][z] = null;
      }
    }
  }
  
  const words = WORD_LISTS[difficulty] || WORD_LISTS.medium;
  const placedWords = [];
  const wordPositions = {};
  const usedWords = new Set();
  const targetWordCount = getWordCount(gridSize);
  
  // Step 1: Place first word on the front face (z = gridSize - 1)
  // Place it horizontally (along X axis) spanning the full width
  // Filter words to only those that fit the grid size
  const wordsThatFit = words.filter(word => word.toUpperCase().length <= gridSize);
  if (wordsThatFit.length === 0) {
    console.warn(`No words fit in grid size ${gridSize}`);
    return { board, words: [], wordPositions: {} };
  }
  
  const firstWord = wordsThatFit[Math.floor(Math.random() * wordsThatFit.length)].toUpperCase();
  
  // Place first word on front face, centered vertically
  const firstZ = gridSize - 1; // Front face
  const firstY = Math.floor(gridSize / 2); // Center vertically
  const firstX = Math.floor((gridSize - firstWord.length) / 2); // Center horizontally
  
  const firstPositions = [];
  for (let i = 0; i < firstWord.length; i++) {
    const x = firstX + i;
    const y = firstY;
    const z = firstZ;
    
    board[x][y][z] = {
      letter: null,
      correctLetter: firstWord[i],
      wordIds: [0],
      isWordCell: true
    };
    firstPositions.push([x, y, z]);
  }
  
  placedWords.push({
    id: 0,
    word: firstWord,
    start: [firstX, firstY, firstZ],
    direction: [1, 0, 0], // X+ direction
    positions: firstPositions
  });
  wordPositions[0] = firstPositions;
  usedWords.add(firstWord);
  
  // Step 2: Continue placing words from intersections
  let attempts = 0;
  while (placedWords.length < targetWordCount && attempts < maxAttempts * 10) {
    attempts++;
    
    // Get all available intersection points
    const intersections = getAvailableIntersections(board, placedWords, gridSize);
    
    if (intersections.length === 0) {
      break; // No more intersections available
    }
    
    // Pick a random intersection
    const intersection = intersections[Math.floor(Math.random() * intersections.length)];
    const { x, y, z, letter, letterIndex } = intersection;
    
    // Find words that contain this letter
    const availableWords = findWordsWithLetter(words, letter, Array.from(usedWords));
    
    if (availableWords.length === 0) {
      continue; // No words available with this letter, try next intersection
    }
    
    // Shuffle available words and directions
    const shuffledWords = [...availableWords].sort(() => Math.random() - 0.5);
    const shuffledDirections = [...DIRECTIONS_3D].sort(() => Math.random() - 0.5);
    
    let wordPlaced = false;
    
    // Try to place a word from this intersection
    for (const word of shuffledWords) {
      const upperWord = word.toUpperCase();
      const wordLetterIndex = upperWord.indexOf(letter);
      
        // Try each direction
        for (const [dx, dy, dz] of shuffledDirections) {
          // Skip if direction is same as the word we're intersecting with
          const [prevDx, prevDy, prevDz] = intersection.wordData.direction;
          if (dx === prevDx && dy === prevDy && dz === prevDz) {
            continue; // Can't place in same direction
          }
          
          // Check if word can be placed (including adjacency checking)
          if (canPlaceWord(board, upperWord, x, y, z, dx, dy, dz, gridSize, wordLetterIndex, placedWords)) {
          const wordId = placedWords.length;
          const positions = placeWordFromIntersection(
            board, upperWord, x, y, z, dx, dy, dz, wordId, wordLetterIndex
          );
          
          if (positions !== null) {
            placedWords.push({
              id: wordId,
              word: upperWord,
              start: [x - wordLetterIndex * dx, y - wordLetterIndex * dy, z - wordLetterIndex * dz],
              direction: [dx, dy, dz],
              positions: positions
            });
            wordPositions[wordId] = positions;
            usedWords.add(upperWord);
            wordPlaced = true;
            break;
          }
        }
      }
      
      if (wordPlaced) {
        break;
      }
    }
  }
  
  return {
    board,
    words: placedWords,
    wordPositions
  };
}

/**
 * Get word list for a difficulty level
 */
export function getWordList(difficulty = 'medium') {
  return WORD_LISTS[difficulty] || WORD_LISTS.medium;
}
