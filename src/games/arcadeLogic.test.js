/**
 * Rule checks for the arcade sims: crashes, scoring, clears, and maze connectivity.
 */

import { createSnakeSession, opposite, stepSnake } from './snake3d/gameLogic';
import { createPongSim, stepPong } from './pong3d/gameLogic';
import { createBreakoutSim, stepBreakout } from './breakout3d/gameLogic';
import { createPacmanSim, isOpen, stepPacman } from './pacman3d/gameLogic';
import { createAsteroidsSim, stepAsteroids } from './asteroids3d/gameLogic';
import { POINTS_TO_WIN } from './pong3d/config';

const idlePlane = { px: false, nx: false, py: false, ny: false };
const idleShip = {
  yawL: false,
  yawR: false,
  pitchU: false,
  pitchD: false,
  thrust: false,
  fire: false
};

describe('3D Snake', () => {
  test('walks forward and dies on the far wall', () => {
    let session = createSnakeSession('Easy');
    let dead = false;
    for (let i = 0; i < 20 && !dead; i += 1) {
      const result = stepSnake(session, [1, 0, 0]);
      session = result.session;
      dead = result.status.gameLost;
    }
    expect(dead).toBe(true);
    expect(session.alive).toBe(false);
  });

  test('grows when the next cell is food and ignores a reverse', () => {
    const session = createSnakeSession('Easy');
    const head = session.snake[0];
    session.food = { x: head.x + 1, y: head.y, z: head.z };
    const grown = stepSnake(session, [-1, 0, 0]);
    expect(opposite([1, 0, 0], [-1, 0, 0])).toBe(true);
    expect(grown.session.snake).toHaveLength(4);
    expect(grown.session.foods).toBe(1);
    expect(grown.status.score).toBe(1);
    expect(grown.session.dir).toEqual([1, 0, 0]);
  });
});

describe('3D Pong', () => {
  function missPlayer(sim) {
    sim.serve = 0;
    sim.over = null;
    sim.playerX = 3;
    sim.playerY = 3;
    sim.ball.x = 0;
    sim.ball.y = 0;
    sim.ball.z = sim.playerZ - 0.05;
    sim.ball.vx = 0;
    sim.ball.vy = 0;
    sim.ball.vz = 8;
    stepPong(sim, 0.05, idlePlane);
  }

  function missComputer(sim) {
    sim.serve = 0;
    sim.over = null;
    sim.aiX = 3;
    sim.aiY = 3;
    sim.ball.x = 0;
    sim.ball.y = 0;
    sim.ball.z = sim.aiZ + 0.05;
    sim.ball.vx = 0;
    sim.ball.vy = 0;
    sim.ball.vz = -8;
    stepPong(sim, 0.05, idlePlane);
  }

  test('computer scores a miss and wins at the goal', () => {
    const sim = createPongSim('Easy');
    missPlayer(sim);
    expect(sim.aiScore).toBe(1);
    sim.aiScore = POINTS_TO_WIN - 1;
    missPlayer(sim);
    expect(sim.over).toBe('lose');
  });

  test('player scores a miss and wins at the goal', () => {
    const sim = createPongSim('Easy');
    missComputer(sim);
    expect(sim.score).toBe(1);
    sim.score = POINTS_TO_WIN - 1;
    missComputer(sim);
    expect(sim.over).toBe('win');
  });
});

describe('3D Breakout', () => {
  test('clearing the last brick wins', () => {
    const sim = createBreakoutSim('Easy');
    sim.bricks.forEach((brick, index) => {
      brick.alive = index === 0;
    });
    const brick = sim.bricks[0];
    sim.serve = 0;
    sim.ball.x = brick.x;
    sim.ball.y = brick.y;
    sim.ball.z = brick.z;
    sim.ball.vx = 0;
    sim.ball.vy = 0;
    sim.ball.vz = 0.01;
    stepBreakout(sim, 0.05, idlePlane);
    expect(sim.over).toBe('win');
    expect(sim.score).toBeGreaterThan(0);
  });

  test('missing the paddle spends the last life', () => {
    const sim = createBreakoutSim('Easy');
    sim.lives = 1;
    sim.serve = 0;
    sim.paddleX = 5;
    sim.paddleY = 5;
    sim.ball.x = 0;
    sim.ball.y = 0;
    sim.ball.z = sim.paddleZ + 0.2;
    sim.ball.vx = 0;
    sim.ball.vy = 0;
    sim.ball.vz = 6;
    stepBreakout(sim, 0.2, idlePlane);
    expect(sim.over).toBe('lose');
    expect(sim.lives).toBe(0);
  });
});

describe('3D maze chase', () => {
  test('every open cell is reachable from the start', () => {
    const sim = createPacmanSim('Easy');
    const dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    const seen = new Set([`${sim.start.x},${sim.start.y},${sim.start.z}`]);
    const queue = [{ ...sim.start }];
    while (queue.length) {
      const cell = queue.pop();
      dirs.forEach(([dx, dy, dz]) => {
        const next = { x: cell.x + dx, y: cell.y + dy, z: cell.z + dz };
        const key = `${next.x},${next.y},${next.z}`;
        if (seen.has(key) || !isOpen(sim.wall, next.x, next.y, next.z)) return;
        seen.add(key);
        queue.push(next);
      });
    }
    let openCount = 0;
    for (let x = 0; x < sim.size; x += 1) {
      for (let y = 0; y < sim.size; y += 1) {
        for (let z = 0; z < sim.size; z += 1) {
          if (isOpen(sim.wall, x, y, z)) openCount += 1;
        }
      }
    }
    expect(seen.size).toBe(openCount);
    expect(sim.pelletsLeft).toBe(openCount - 1);
  });

  test('eating the last pellet wins', () => {
    const sim = createPacmanSim('Easy');
    const target = sim.pellets.find((pellet) => !pellet.eaten);
    sim.pellets.forEach((pellet) => {
      pellet.eaten = pellet !== target;
    });
    sim.pelletsLeft = 1;
    sim.ghosts.forEach((ghost) => {
      ghost.waiting = 100;
    });
    sim.invuln = 0;

    const dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    const approach = dirs
      .map((dir) => ({
        dir,
        from: { x: target.x - dir[0], y: target.y - dir[1], z: target.z - dir[2] }
      }))
      .find((option) => isOpen(sim.wall, option.from.x, option.from.y, option.from.z));

    sim.player.x = approach.from.x;
    sim.player.y = approach.from.y;
    sim.player.z = approach.from.z;
    sim.player.dir = null;
    sim.player.to = null;
    sim.player.from = null;

    for (let i = 0; i < 40 && sim.over !== 'win'; i += 1) {
      stepPacman(sim, 0.05, approach.dir);
    }
    expect(sim.over).toBe('win');
    expect(sim.pelletsLeft).toBe(0);
  });
});

describe('3D Asteroids', () => {
  test('a shot destroys a small rock and the empty field starts the next wave', () => {
    const sim = createAsteroidsSim('Easy');
    sim.rocks = [{
      x: 0,
      y: 0,
      z: 1.3,
      vx: 0,
      vy: 0,
      vz: 0,
      size: 1,
      radius: 0.42,
      rx: 0,
      ry: 0,
      rz: 0,
      sx: 0,
      sy: 0,
      sz: 0
    }];
    sim.ship.invuln = 0;
    sim.cooldown = 0;
    stepAsteroids(sim, 0.05, { ...idleShip, fire: true });
    expect(sim.score).toBeGreaterThanOrEqual(100);
    expect(sim.level).toBe(2);
    expect(sim.rocks.length).toBeGreaterThan(0);
  });

  test('clearing the field raises the wave', () => {
    const sim = createAsteroidsSim('Easy');
    sim.rocks = [];
    stepAsteroids(sim, 0.02, idleShip);
    expect(sim.level).toBe(2);
    expect(sim.rocks.length).toBeGreaterThan(0);
  });
});
