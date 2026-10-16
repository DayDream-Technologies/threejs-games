/**
 * Grid snake. The head is the first cell. Movement is one orthogonal step per tick.
 */

import { DIFFICULTY } from './config';

function cellKey(x, y, z) {
  return `${x},${y},${z}`;
}

function inBounds(size, x, y, z) {
  return x >= 0 && y >= 0 && z >= 0 && x < size && y < size && z < size;
}

function opposite(a, b) {
  return !!a && !!b && a[0] === -b[0] && a[1] === -b[1] && a[2] === -b[2];
}

function placeFood(size, blocked) {
  const open = [];
  for (let x = 0; x < size; x += 1) {
    for (let y = 0; y < size; y += 1) {
      for (let z = 0; z < size; z += 1) {
        if (!blocked.has(cellKey(x, y, z))) open.push({ x, y, z });
      }
    }
  }
  if (open.length === 0) return null;
  return open[Math.floor(Math.random() * open.length)];
}

export function createSnakeSession(difficulty = 'Easy') {
  const cfg = DIFFICULTY[difficulty] || DIFFICULTY.Easy;
  const size = cfg.size;
  const mid = Math.floor(size / 2);
  const snake = [
    { x: mid, y: mid, z: mid },
    { x: mid - 1, y: mid, z: mid },
    { x: mid - 2, y: mid, z: mid }
  ];
  const used = new Set(snake.map((cell) => cellKey(cell.x, cell.y, cell.z)));
  used.add(cellKey(mid + 1, mid, mid));

  const obstacles = [];
  let guard = 0;
  while (obstacles.length < cfg.obstacles && guard < cfg.obstacles * 40) {
    guard += 1;
    const x = 1 + Math.floor(Math.random() * (size - 2));
    const y = 1 + Math.floor(Math.random() * (size - 2));
    const z = 1 + Math.floor(Math.random() * (size - 2));
    const key = cellKey(x, y, z);
    if (used.has(key)) continue;
    const dist = Math.abs(x - mid) + Math.abs(y - mid) + Math.abs(z - mid);
    if (dist < 3) continue;
    used.add(key);
    obstacles.push({ x, y, z });
  }

  const food = placeFood(size, used);
  return {
    size,
    snake,
    dir: [1, 0, 0],
    food,
    obstacles,
    foods: 0,
    alive: true
  };
}

function statusFor(foods, dead) {
  return {
    score: foods,
    lives: dead ? 0 : 1,
    level: 1 + Math.floor(foods / 5),
    gameWon: false,
    gameLost: dead
  };
}

export function stepSnake(session, nextDir) {
  const dir = nextDir && !opposite(session.dir, nextDir) ? nextDir : session.dir;
  const head = session.snake[0];
  const nx = head.x + dir[0];
  const ny = head.y + dir[1];
  const nz = head.z + dir[2];
  const ate = !!(
    session.food &&
    session.food.x === nx &&
    session.food.y === ny &&
    session.food.z === nz
  );
  const body = ate ? session.snake : session.snake.slice(0, -1);
  const hitBody = body.some((cell) => cell.x === nx && cell.y === ny && cell.z === nz);
  const hitObstacle = session.obstacles.some((cell) => cell.x === nx && cell.y === ny && cell.z === nz);
  const dead = !inBounds(session.size, nx, ny, nz) || hitBody || hitObstacle;

  if (dead) {
    return {
      session: { ...session, dir: [...dir], alive: false },
      dirty: true,
      status: statusFor(session.foods, true)
    };
  }

  const snake = [{ x: nx, y: ny, z: nz }, ...session.snake];
  if (!ate) snake.pop();

  let food = session.food;
  let foods = session.foods;
  if (ate) {
    foods += 1;
    const blocked = new Set(snake.map((cell) => cellKey(cell.x, cell.y, cell.z)));
    session.obstacles.forEach((cell) => blocked.add(cellKey(cell.x, cell.y, cell.z)));
    food = placeFood(session.size, blocked);
  }

  return {
    session: { ...session, snake, dir: [...dir], food, foods, alive: true },
    dirty: ate,
    status: statusFor(foods, false)
  };
}

export { opposite };
