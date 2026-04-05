/**
 * 3D 2048 core logic — 4×4×4 grid, classic merge rules per line.
 */

export const GRID = 4;
export const WIN_VALUE = 8096;

/** @typedef {'negX'|'posX'|'negY'|'posY'|'negZ'|'posZ'} Direction */

/**
 * @returns {number[][][]}
 */
export function createEmptyBoard() {
  const b = [];
  for (let x = 0; x < GRID; x++) {
    b[x] = [];
    for (let y = 0; y < GRID; y++) {
      b[x][y] = [];
      for (let z = 0; z < GRID; z++) {
        b[x][y][z] = 0;
      }
    }
  }
  return b;
}

/**
 * Deep clone board
 * @param {number[][][]} board
 */
export function cloneBoard(board) {
  return board.map((col) => col.map((row) => row.slice()));
}

/**
 * Classic 2048 line merge: strip zeros, merge adjacent pairs once from the "low" end.
 * @param {number[]} line - length GRID, direction is "toward index 0"
 * @returns {{ line: number[], score: number }}
 */
export function mergeLineTowardZero(line) {
  const filtered = line.filter((v) => v !== 0);
  const merged = [];
  let score = 0;
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const v = filtered[i] * 2;
      merged.push(v);
      score += v;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i += 1;
    }
  }
  while (merged.length < GRID) merged.push(0);
  return { line: merged, score };
}

/**
 * Reverse line so we merge "toward high index" then reverse back.
 */
function mergeLineTowardEnd(line) {
  const rev = line.slice().reverse();
  const { line: out, score } = mergeLineTowardZero(rev);
  return { line: out.reverse(), score };
}

/**
 * Extract a line along X at fixed (y,z), low→high x
 */
function getLineX(board, y, z) {
  const line = [];
  for (let x = 0; x < GRID; x++) line.push(board[x][y][z]);
  return line;
}

function setLineX(board, y, z, line) {
  for (let x = 0; x < GRID; x++) board[x][y][z] = line[x];
}

function getLineY(board, x, z) {
  const line = [];
  for (let y = 0; y < GRID; y++) line.push(board[x][y][z]);
  return line;
}

function setLineY(board, x, z, line) {
  for (let y = 0; y < GRID; y++) board[x][y][z] = line[y];
}

function getLineZ(board, x, y) {
  const line = [];
  for (let z = 0; z < GRID; z++) line.push(board[x][y][z]);
  return line;
}

function setLineZ(board, x, y, line) {
  for (let z = 0; z < GRID; z++) board[x][y][z] = line[z];
}

/**
 * Apply one move; mutates `next`. Returns score gained and whether board changed.
 * @param {number[][][]} next
 * @param {Direction} dir
 * @returns {{ score: number, changed: boolean }}
 */
export function applyMove(next, dir) {
  let totalScore = 0;
  let changed = false;
  const before = cloneBoard(next);

  const runLines = (getLine, setLine) => {
    for (let a = 0; a < GRID; a++) {
      for (let b = 0; b < GRID; b++) {
        let line = getLine(a, b);
        let result;
        if (dir === 'negX' || dir === 'negY' || dir === 'negZ') {
          result = mergeLineTowardZero(line);
        } else {
          result = mergeLineTowardEnd(line);
        }
        totalScore += result.score;
        setLine(a, b, result.line);
      }
    }
  };

  switch (dir) {
    case 'negX':
      runLines(
        (y, z) => getLineX(next, y, z),
        (y, z, line) => setLineX(next, y, z, line)
      );
      break;
    case 'posX':
      runLines(
        (y, z) => getLineX(next, y, z),
        (y, z, line) => setLineX(next, y, z, line)
      );
      break;
    case 'negY':
      runLines(
        (x, z) => getLineY(next, x, z),
        (x, z, line) => setLineY(next, x, z, line)
      );
      break;
    case 'posY':
      runLines(
        (x, z) => getLineY(next, x, z),
        (x, z, line) => setLineY(next, x, z, line)
      );
      break;
    case 'negZ':
      runLines(
        (x, y) => getLineZ(next, x, y),
        (x, y, line) => setLineZ(next, x, y, line)
      );
      break;
    case 'posZ':
      runLines(
        (x, y) => getLineZ(next, x, y),
        (x, y, line) => setLineZ(next, x, y, line)
      );
      break;
    default:
      break;
  }

  for (let x = 0; x < GRID; x++) {
    for (let y = 0; y < GRID; y++) {
      for (let z = 0; z < GRID; z++) {
        if (before[x][y][z] !== next[x][y][z]) {
          changed = true;
          break;
        }
      }
    }
  }

  return { score: totalScore, changed };
}

const ALL_DIRS = /** @type {Direction[]} */ ([
  'negX',
  'posX',
  'negY',
  'posY',
  'negZ',
  'posZ'
]);

/**
 * @param {number[][][]} board
 */
export function hasAnyMove(board) {
  for (const dir of ALL_DIRS) {
    const test = cloneBoard(board);
    const { changed } = applyMove(test, dir);
    if (changed) return true;
  }
  return false;
}

/**
 * @param {number[][][]} board
 */
export function countEmpty(board) {
  let n = 0;
  for (let x = 0; x < GRID; x++) {
    for (let y = 0; y < GRID; y++) {
      for (let z = 0; z < GRID; z++) {
        if (board[x][y][z] === 0) n++;
      }
    }
  }
  return n;
}

/**
 * @param {number[][][]} board
 */
export function spawnRandomTile(board) {
  const empty = [];
  for (let x = 0; x < GRID; x++) {
    for (let y = 0; y < GRID; y++) {
      for (let z = 0; z < GRID; z++) {
        if (board[x][y][z] === 0) empty.push([x, y, z]);
      }
    }
  }
  if (empty.length === 0) return false;
  const pick = empty[Math.floor(Math.random() * empty.length)];
  const [x, y, z] = pick;
  board[x][y][z] = Math.random() < 0.9 ? 2 : 4;
  return true;
}

/**
 * @param {number[][][]} board
 */
export function hasReachedWin(board) {
  for (let x = 0; x < GRID; x++) {
    for (let y = 0; y < GRID; y++) {
      for (let z = 0; z < GRID; z++) {
        if (board[x][y][z] >= WIN_VALUE) return true;
      }
    }
  }
  return false;
}

/**
 * Initial board: two random tiles
 */
export function createInitialBoard() {
  const board = createEmptyBoard();
  spawnRandomTile(board);
  spawnRandomTile(board);
  return board;
}
