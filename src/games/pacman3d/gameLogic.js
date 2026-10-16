/**
 * Procedural 3D maze. Open cells are carved with a backtracker, then a few
 * extra doors are punched so the paths loop. Pursuers chase on the grid.
 */

import { DIFFICULTY, GHOST_COLORS } from './config';

const DIRS = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1]
];

function opposite(a, b) {
  return !!a && !!b && a[0] === -b[0] && a[1] === -b[1] && a[2] === -b[2];
}

function dist2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
}

export function isOpen(wall, x, y, z) {
  return !!(wall[x] && wall[x][y] && wall[x][y][z] === false);
}

export function canStep(wall, x, y, z, dir) {
  if (!dir) return false;
  return isOpen(wall, x + dir[0], y + dir[1], z + dir[2]);
}

function generateWalls(size) {
  const wall = Array.from({ length: size }, () => (
    Array.from({ length: size }, () => Array(size).fill(true))
  ));
  const stack = [[1, 1, 1]];
  wall[1][1][1] = false;

  while (stack.length) {
    const [x, y, z] = stack[stack.length - 1];
    const options = [];
    for (let i = 0; i < DIRS.length; i += 1) {
      const [dx, dy, dz] = DIRS[i];
      const nx = x + dx * 2;
      const ny = y + dy * 2;
      const nz = z + dz * 2;
      if (nx > 0 && ny > 0 && nz > 0 && nx < size - 1 && ny < size - 1 && nz < size - 1 && wall[nx][ny][nz]) {
        options.push([dx, dy, dz, nx, ny, nz]);
      }
    }
    if (options.length === 0) {
      stack.pop();
      continue;
    }
    const [dx, dy, dz, nx, ny, nz] = options[Math.floor(Math.random() * options.length)];
    wall[x + dx][y + dy][z + dz] = false;
    wall[nx][ny][nz] = false;
    stack.push([nx, ny, nz]);
  }

  for (let x = 1; x < size - 1; x += 1) {
    for (let y = 1; y < size - 1; y += 1) {
      for (let z = 1; z < size - 1; z += 1) {
        if (!wall[x][y][z]) continue;
        for (let i = 0; i < DIRS.length; i += 1) {
          const [dx, dy, dz] = DIRS[i];
          if (dx < 0 || dy < 0 || dz < 0) continue;
          const behind = wall[x - dx]?.[y - dy]?.[z - dz];
          const ahead = wall[x + dx]?.[y + dy]?.[z + dz];
          if (behind === false && ahead === false && Math.random() < 0.22) {
            wall[x][y][z] = false;
            break;
          }
        }
      }
    }
  }

  wall[1][1][1] = false;
  return wall;
}

function listOpen(wall) {
  const size = wall.length;
  const cells = [];
  for (let x = 0; x < size; x += 1) {
    for (let y = 0; y < size; y += 1) {
      for (let z = 0; z < size; z += 1) {
        if (!wall[x][y][z]) cells.push({ x, y, z });
      }
    }
  }
  return cells;
}

export function barrierCells(wall) {
  const size = wall.length;
  const cells = [];
  for (let x = 1; x < size - 1; x += 1) {
    for (let y = 1; y < size - 1; y += 1) {
      for (let z = 1; z < size - 1; z += 1) {
        if (!wall[x][y][z]) continue;
        const touchesOpen = DIRS.some(([dx, dy, dz]) => isOpen(wall, x + dx, y + dy, z + dz));
        if (touchesOpen) cells.push({ x, y, z });
      }
    }
  }
  return cells;
}

function nearestOpen(open, size) {
  const center = (size - 1) / 2;
  let best = open[0];
  let bestD = Infinity;
  for (let i = 0; i < open.length; i += 1) {
    const cell = open[i];
    const d = (cell.x - center) ** 2 + (cell.y - center) ** 2 + (cell.z - center) ** 2;
    if (d < bestD) {
      bestD = d;
      best = cell;
    }
  }
  return { ...best };
}

function pickSpread(pool, start, count) {
  const remaining = pool.filter((cell) => cell.x !== start.x || cell.y !== start.y || cell.z !== start.z);
  const chosen = [];
  while (chosen.length < count && remaining.length) {
    let bestIndex = 0;
    let bestScore = -1;
    for (let i = 0; i < remaining.length; i += 1) {
      let score = dist2(remaining[i], start);
      for (let c = 0; c < chosen.length; c += 1) {
        score = Math.min(score, dist2(remaining[i], chosen[c]));
      }
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }
    chosen.push(remaining.splice(bestIndex, 1)[0]);
  }
  return chosen;
}

function sameCell(a, b) {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

export function actorPosition(actor) {
  if (!actor.to || !actor.from) return { x: actor.x, y: actor.y, z: actor.z };
  const t = actor.t;
  return {
    x: actor.from.x + (actor.to.x - actor.from.x) * t,
    y: actor.from.y + (actor.to.y - actor.from.y) * t,
    z: actor.from.z + (actor.to.z - actor.from.z) * t
  };
}

function reverseActor(actor) {
  if (!actor.dir) return;
  if (actor.to && actor.from) {
    const goingTo = actor.to;
    actor.to = { x: actor.x, y: actor.y, z: actor.z };
    actor.from = { x: goingTo.x, y: goingTo.y, z: goingTo.z };
    actor.t = 1 - actor.t;
  }
  actor.dir = [-actor.dir[0], -actor.dir[1], -actor.dir[2]];
}

function choosePlayerDir(sim, desired) {
  const player = sim.player;
  if (desired && canStep(sim.wall, player.x, player.y, player.z, desired)) return desired;
  if (player.dir && canStep(sim.wall, player.x, player.y, player.z, player.dir)) return player.dir;
  return null;
}

function ghostTarget(sim, ghost) {
  const player = sim.player;
  if (ghost.role !== 'ambush' || !player.dir) {
    return { x: player.x, y: player.y, z: player.z };
  }
  const [dx, dy, dz] = player.dir;
  const x = player.x + dx * 3;
  const y = player.y + dy * 3;
  const z = player.z + dz * 3;
  if (isOpen(sim.wall, x, y, z)) return { x, y, z };
  return { x: player.x, y: player.y, z: player.z };
}

function chooseGhostDir(sim, ghost) {
  const options = [];
  for (let i = 0; i < DIRS.length; i += 1) {
    if (canStep(sim.wall, ghost.x, ghost.y, ghost.z, DIRS[i])) options.push(DIRS[i]);
  }
  if (options.length === 0) return null;
  const forward = options.filter((dir) => !opposite(dir, ghost.dir));
  const choices = forward.length ? forward : options;
  const frightened = sim.fright > 0;
  if (frightened || Math.random() < sim.cfg.wander) {
    return choices[Math.floor(Math.random() * choices.length)];
  }
  const target = ghostTarget(sim, ghost);
  let best = choices[0];
  let bestD = Infinity;
  for (let i = 0; i < choices.length; i += 1) {
    const dir = choices[i];
    const next = { x: ghost.x + dir[0], y: ghost.y + dir[1], z: ghost.z + dir[2] };
    const d = manhattan(next, target);
    if (d < bestD) {
      bestD = d;
      best = dir;
    }
  }
  return best;
}

function arrivePlayer(sim) {
  const player = sim.player;

  for (let i = 0; i < sim.pellets.length; i += 1) {
    const pellet = sim.pellets[i];
    if (pellet.eaten || !sameCell(pellet, player)) continue;
    pellet.eaten = true;
    sim.pelletsLeft -= 1;
    sim.score += pellet.power ? 50 : 10;
    if (pellet.power) {
      sim.fright = sim.cfg.frightTime;
      for (let g = 0; g < sim.ghosts.length; g += 1) reverseActor(sim.ghosts[g]);
    }
    if (sim.pelletsLeft <= 0) sim.over = 'win';
    break;
  }
  return !!sim.over;
}

function moveActor(actor, time, speed, pickDir) {
  let left = time;
  let guard = 0;
  while (left > 0 && guard < 4) {
    guard += 1;
    if (!actor.to) {
      const dir = pickDir();
      if (!dir) return;
      actor.dir = [dir[0], dir[1], dir[2]];
      actor.from = { x: actor.x, y: actor.y, z: actor.z };
      actor.to = { x: actor.x + dir[0], y: actor.y + dir[1], z: actor.z + dir[2] };
      actor.t = 0;
    }
    const need = (1 - actor.t) / speed;
    if (left < need) {
      actor.t += left * speed;
      return;
    }
    left -= need;
    actor.x = actor.to.x;
    actor.y = actor.to.y;
    actor.z = actor.to.z;
    actor.from = null;
    actor.to = null;
    actor.t = 0;
    if (actor.onArrive && actor.onArrive()) return;
  }
}

function resetPositions(sim, ghostWait) {
  const player = sim.player;
  player.x = sim.start.x;
  player.y = sim.start.y;
  player.z = sim.start.z;
  player.dir = null;
  player.from = null;
  player.to = null;
  player.t = 0;
  for (let i = 0; i < sim.ghosts.length; i += 1) {
    const ghost = sim.ghosts[i];
    ghost.x = ghost.home.x;
    ghost.y = ghost.home.y;
    ghost.z = ghost.home.z;
    ghost.dir = null;
    ghost.from = null;
    ghost.to = null;
    ghost.t = 0;
    ghost.waiting = ghostWait;
  }
}

function loseLife(sim) {
  sim.lives -= 1;
  sim.fright = 0;
  if (sim.lives <= 0) {
    sim.over = 'lose';
    return;
  }
  sim.invuln = 2;
  resetPositions(sim, 1.2);
}

function eatGhost(sim, ghost) {
  sim.score += 200;
  ghost.waiting = sim.cfg.frightTime > 5 ? 3 : 2.4;
  ghost.x = ghost.home.x;
  ghost.y = ghost.home.y;
  ghost.z = ghost.home.z;
  ghost.dir = null;
  ghost.from = null;
  ghost.to = null;
  ghost.t = 0;
}

function actorsClose(a, b) {
  const pa = actorPosition(a);
  const pb = actorPosition(b);
  const dx = pa.x - pb.x;
  const dy = pa.y - pb.y;
  const dz = pa.z - pb.z;
  return dx * dx + dy * dy + dz * dz < 0.36;
}

function substep(sim, h, desired) {
  sim.time += h;
  sim.fright = Math.max(0, sim.fright - h);
  sim.invuln = Math.max(0, sim.invuln - h);

  const player = sim.player;
  if (player.to && desired && player.dir && opposite(desired, player.dir)) {
    reverseActor(player);
    player.dir = [desired[0], desired[1], desired[2]];
  }

  moveActor(player, h, sim.cfg.playerSpeed, () => choosePlayerDir(sim, desired));

  if (sim.over) return;

  const ghostSpeed = sim.cfg.ghostSpeed * (sim.fright > 0 ? 0.55 : 1);
  for (let i = 0; i < sim.ghosts.length; i += 1) {
    const ghost = sim.ghosts[i];
    if (ghost.waiting > 0) {
      ghost.waiting = Math.max(0, ghost.waiting - h);
      continue;
    }
    moveActor(ghost, h, ghostSpeed, () => chooseGhostDir(sim, ghost));
  }

  if (sim.over || sim.invuln > 0) return;

  for (let i = 0; i < sim.ghosts.length; i += 1) {
    const ghost = sim.ghosts[i];
    if (ghost.waiting > 0) continue;
    if (!actorsClose(player, ghost)) continue;
    if (sim.fright > 0) eatGhost(sim, ghost);
    else {
      loseLife(sim);
      break;
    }
  }
}

export function createPacmanSim(difficulty = 'Easy') {
  const cfg = DIFFICULTY[difficulty] || DIFFICULTY.Easy;
  const wall = generateWalls(cfg.size);
  const open = listOpen(wall);
  const start = nearestOpen(open, cfg.size);
  const spread = pickSpread(open, start, 4 + cfg.pursuers);
  const powers = spread.slice(0, 4);
  const homes = spread.slice(4, 4 + cfg.pursuers);
  while (homes.length < cfg.pursuers) homes.push(start);

  const pellets = [];
  for (let i = 0; i < open.length; i += 1) {
    const cell = open[i];
    if (sameCell(cell, start)) continue;
    const power = powers.some((spot) => sameCell(spot, cell));
    pellets.push({ x: cell.x, y: cell.y, z: cell.z, power, eaten: false });
  }

  const player = {
    x: start.x,
    y: start.y,
    z: start.z,
    dir: null,
    from: null,
    to: null,
    t: 0,
    onArrive: null
  };

  const sim = {
    cfg,
    size: cfg.size,
    wall,
    barriers: barrierCells(wall),
    pellets,
    pelletsLeft: pellets.length,
    start,
    player,
    ghosts: [],
    fright: 0,
    invuln: 1.4,
    time: 0,
    score: 0,
    lives: 3,
    level: 1,
    over: null
  };

  player.onArrive = () => arrivePlayer(sim);

  for (let i = 0; i < cfg.pursuers; i += 1) {
    const home = homes[i];
    sim.ghosts.push({
      x: home.x,
      y: home.y,
      z: home.z,
      home: { ...home },
      color: GHOST_COLORS[i % GHOST_COLORS.length],
      role: i === 0 ? 'ambush' : 'chase',
      dir: null,
      from: null,
      to: null,
      t: 0,
      waiting: 0.4 + i * 0.35,
      onArrive: null
    });
  }

  return sim;
}

function statusKey(sim) {
  return `${sim.score}|${sim.lives}|${sim.over}`;
}

export function stepPacman(sim, dt, desired) {
  if (!sim || sim.over) return false;
  const before = statusKey(sim);
  let left = dt;
  while (left > 0 && !sim.over) {
    const h = Math.min(left, 0.05);
    substep(sim, h, desired);
    left -= h;
  }
  return statusKey(sim) !== before;
}
