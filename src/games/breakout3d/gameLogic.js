/**
 * Layered breakout. Bricks sit in front of a paddle that slides on X and Y.
 * The paddle is on the near side (+Z). The ball travels away from the camera to hit bricks.
 */

import { BALL_RADIUS, BRICK, DIFFICULTY, FRONT_Z, SPACING } from './config';

function clamp(value, limit) {
  return Math.max(-limit, Math.min(limit, value));
}

export function planeAxis(held) {
  let x = 0;
  let y = 0;
  if (held?.px) x += 1;
  if (held?.nx) x -= 1;
  if (held?.py) y += 1;
  if (held?.ny) y -= 1;
  if (x !== 0 && y !== 0) {
    x *= Math.SQRT1_2;
    y *= Math.SQRT1_2;
  }
  return { x, y };
}

function normalize(ball, speed) {
  const mag = Math.hypot(ball.vx, ball.vy, ball.vz) || 1;
  ball.vx = (ball.vx / mag) * speed;
  ball.vy = (ball.vy / mag) * speed;
  ball.vz = (ball.vz / mag) * speed;
  const minZ = speed * 0.4;
  if (Math.abs(ball.vz) < minZ) {
    ball.vz = Math.sign(ball.vz || -1) * minZ;
    const mag2 = Math.hypot(ball.vx, ball.vy, ball.vz) || 1;
    ball.vx = (ball.vx / mag2) * speed;
    ball.vy = (ball.vy / mag2) * speed;
    ball.vz = (ball.vz / mag2) * speed;
  }
}

function launch(sim) {
  const speed = sim.speed;
  sim.ball.x = sim.paddleX;
  sim.ball.y = sim.paddleY;
  sim.ball.z = sim.paddleZ - 0.45;
  sim.ball.vx = (Math.random() - 0.5) * speed * 0.35;
  sim.ball.vy = (Math.random() - 0.5) * speed * 0.35;
  sim.ball.vz = -speed;
  normalize(sim.ball, speed);
}

function brickHit(ball, brick) {
  const reach = BRICK / 2 + BALL_RADIUS;
  const dx = ball.x - brick.x;
  const dy = ball.y - brick.y;
  const dz = ball.z - brick.z;
  const px = reach - Math.abs(dx);
  const py = reach - Math.abs(dy);
  const pz = reach - Math.abs(dz);
  if (px <= 0 || py <= 0 || pz <= 0) return null;
  if (px < py && px < pz) return { axis: 'x', pen: px, sign: Math.sign(dx || ball.vx || 1) };
  if (py < pz) return { axis: 'y', pen: py, sign: Math.sign(dy || ball.vy || 1) };
  return { axis: 'z', pen: pz, sign: Math.sign(dz || ball.vz || 1) };
}

function aliveCount(sim) {
  let count = 0;
  for (let i = 0; i < sim.bricks.length; i += 1) {
    if (sim.bricks[i].alive) count += 1;
  }
  return count;
}

function snapshot(sim) {
  return `${sim.score}|${sim.lives}|${sim.over}`;
}

function substep(sim, h, held) {
  const axis = planeAxis(held);
  sim.paddleX = clamp(sim.paddleX + axis.x * sim.cfg.playerSpeed * h, sim.boundX - sim.cfg.paddleX);
  sim.paddleY = clamp(sim.paddleY + axis.y * sim.cfg.playerSpeed * h, sim.boundY - sim.cfg.paddleY);

  if (sim.serve > 0) {
    sim.serve -= h;
    sim.ball.x = sim.paddleX;
    sim.ball.y = sim.paddleY;
    sim.ball.z = sim.paddleZ - 0.45;
    sim.ball.vx = 0;
    sim.ball.vy = 0;
    sim.ball.vz = 0;
    if (sim.serve <= 0) launch(sim);
    return;
  }

  sim.ball.x += sim.ball.vx * h;
  sim.ball.y += sim.ball.vy * h;
  sim.ball.z += sim.ball.vz * h;

  if (sim.ball.x > sim.boundX) {
    sim.ball.x = sim.boundX;
    sim.ball.vx = -Math.abs(sim.ball.vx);
  } else if (sim.ball.x < -sim.boundX) {
    sim.ball.x = -sim.boundX;
    sim.ball.vx = Math.abs(sim.ball.vx);
  }
  if (sim.ball.y > sim.boundY) {
    sim.ball.y = sim.boundY;
    sim.ball.vy = -Math.abs(sim.ball.vy);
  } else if (sim.ball.y < -sim.boundY) {
    sim.ball.y = -sim.boundY;
    sim.ball.vy = Math.abs(sim.ball.vy);
  }
  if (sim.ball.z < sim.farZ) {
    sim.ball.z = sim.farZ;
    sim.ball.vz = Math.abs(sim.ball.vz);
  }

  let best = null;
  let bestBrick = null;
  for (let i = 0; i < sim.bricks.length; i += 1) {
    const brick = sim.bricks[i];
    if (!brick.alive) continue;
    const hit = brickHit(sim.ball, brick);
    if (!hit) continue;
    if (!best || hit.pen < best.pen) {
      best = hit;
      bestBrick = brick;
    }
  }

  if (best && bestBrick) {
    bestBrick.alive = false;
    sim.score += (bestBrick.layer + 1) * 10;
    sim.speed = Math.min(sim.speed * 1.02, sim.cfg.maxSpeed);
    const reach = BRICK / 2 + BALL_RADIUS + 0.02;
    if (best.axis === 'x') {
      sim.ball.vx = Math.abs(sim.speed) * best.sign * 0.55;
      sim.ball.x = bestBrick.x + best.sign * reach;
    } else if (best.axis === 'y') {
      sim.ball.vy = Math.abs(sim.speed) * best.sign * 0.55;
      sim.ball.y = bestBrick.y + best.sign * reach;
    } else {
      sim.ball.vz = Math.abs(sim.speed) * best.sign;
      sim.ball.z = bestBrick.z + best.sign * reach;
    }
    normalize(sim.ball, sim.speed);
    if (aliveCount(sim) === 0) {
      sim.over = 'win';
      sim.ball.vx = 0;
      sim.ball.vy = 0;
      sim.ball.vz = 0;
    }
    return;
  }

  const prevZ = sim.ball.z - sim.ball.vz * h;
  if (sim.ball.vz > 0 && prevZ <= sim.paddleZ && sim.ball.z >= sim.paddleZ - 0.05) {
    const hit = Math.abs(sim.ball.x - sim.paddleX) <= sim.cfg.paddleX + BALL_RADIUS
      && Math.abs(sim.ball.y - sim.paddleY) <= sim.cfg.paddleY + BALL_RADIUS;
    if (hit) {
      const ox = (sim.ball.x - sim.paddleX) / sim.cfg.paddleX;
      const oy = (sim.ball.y - sim.paddleY) / sim.cfg.paddleY;
      sim.speed = Math.min(sim.speed * 1.03, sim.cfg.maxSpeed);
      sim.ball.vx += ox * 2.2;
      sim.ball.vy += oy * 2.2;
      sim.ball.vz = -Math.abs(sim.ball.vz || sim.speed);
      sim.ball.z = sim.paddleZ - BALL_RADIUS - 0.04;
      normalize(sim.ball, sim.speed);
      return;
    }
  }

  if (sim.ball.z > sim.paddleZ + 0.5 && sim.ball.vz >= 0) {
    sim.lives -= 1;
    if (sim.lives <= 0) {
      sim.over = 'lose';
      sim.ball.vz = 0;
      return;
    }
    sim.serve = 0.85;
  }
}

export function createBreakoutSim(difficulty = 'Easy') {
  const cfg = DIFFICULTY[difficulty] || DIFFICULTY.Easy;
  const bricks = [];
  for (let z = 0; z < cfg.d; z += 1) {
    for (let y = 0; y < cfg.h; y += 1) {
      for (let x = 0; x < cfg.w; x += 1) {
        bricks.push({
          x: (x - (cfg.w - 1) / 2) * SPACING,
          y: (y - (cfg.h - 1) / 2) * SPACING,
          z: FRONT_Z - z * SPACING,
          layer: z,
          alive: true
        });
      }
    }
  }
  const backZ = FRONT_Z - (cfg.d - 1) * SPACING;
  return {
    cfg,
    bricks,
    paddleX: 0,
    paddleY: 0,
    paddleZ: FRONT_Z + 1.5,
    boundX: ((cfg.w - 1) / 2) * SPACING + 0.7,
    boundY: ((cfg.h - 1) / 2) * SPACING + 0.7,
    farZ: backZ - 0.65,
    ball: { x: 0, y: 0, z: FRONT_Z + 1.05, vx: 0, vy: 0, vz: 0 },
    serve: 0.6,
    speed: cfg.ballSpeed,
    score: 0,
    lives: 3,
    level: 1,
    over: null
  };
}

export function stepBreakout(sim, dt, held) {
  if (sim.over) return false;
  const before = snapshot(sim);
  let left = dt;
  while (left > 0 && !sim.over) {
    const h = Math.min(left, 0.016);
    substep(sim, h, held);
    left -= h;
  }
  return snapshot(sim) !== before;
}
