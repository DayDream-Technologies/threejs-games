/**
 * Cube pong. The player defends the near face (+Z). The computer defends -Z.
 */

import { ARENA, BALL_RADIUS, DIFFICULTY, POINTS_TO_WIN } from './config';

function approach(current, target, maxStep) {
  const delta = target - current;
  if (Math.abs(delta) <= maxStep) return target;
  return current + Math.sign(delta) * maxStep;
}

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

function ballSpeed(ball) {
  return Math.hypot(ball.vx, ball.vy, ball.vz) || 0;
}

function normalizeBall(ball, speed) {
  const mag = Math.hypot(ball.vx, ball.vy, ball.vz) || 1;
  ball.vx = (ball.vx / mag) * speed;
  ball.vy = (ball.vy / mag) * speed;
  ball.vz = (ball.vz / mag) * speed;
  const minZ = speed * 0.42;
  if (Math.abs(ball.vz) < minZ) {
    ball.vz = Math.sign(ball.vz || 1) * minZ;
    const mag2 = Math.hypot(ball.vx, ball.vy, ball.vz) || 1;
    ball.vx = (ball.vx / mag2) * speed;
    ball.vy = (ball.vy / mag2) * speed;
    ball.vz = (ball.vz / mag2) * speed;
  }
}

function launch(sim) {
  const speed = sim.cfg.ballSpeed;
  sim.ball.x = 0;
  sim.ball.y = 0;
  sim.ball.z = 0;
  sim.ball.vx = (Math.random() - 0.5) * speed * 0.55;
  sim.ball.vy = (Math.random() - 0.5) * speed * 0.55;
  sim.ball.vz = sim.serveDir * speed;
  normalizeBall(sim.ball, speed);
}

function reflect(ball, paddleX, paddleY, paddle, signZ, maxSpeed) {
  const ox = (ball.x - paddleX) / paddle;
  const oy = (ball.y - paddleY) / paddle;
  const speed = Math.min(ballSpeed(ball) * 1.04, maxSpeed);
  ball.vx += ox * 2.4;
  ball.vy += oy * 2.4;
  ball.vz = signZ * Math.abs(ball.vz || speed);
  normalizeBall(ball, speed);
}

function scorePoint(sim, scorer) {
  if (scorer === 'player') sim.score += 1;
  else sim.aiScore += 1;

  if (sim.score >= POINTS_TO_WIN) {
    sim.over = 'win';
    return;
  }
  if (sim.aiScore >= POINTS_TO_WIN) {
    sim.over = 'lose';
    return;
  }

  sim.serve = 0.75;
  sim.serveDir = scorer === 'player' ? -1 : 1;
  sim.ball.x = 0;
  sim.ball.y = 0;
  sim.ball.z = 0;
  sim.ball.vx = 0;
  sim.ball.vy = 0;
  sim.ball.vz = 0;
}

function snapshot(sim) {
  return `${sim.score}|${sim.aiScore}|${sim.over}`;
}

function substep(sim, h, held) {
  const { cfg, half, paddle } = sim;
  const limit = half - paddle - 0.08;
  const axis = planeAxis(held);

  sim.playerX = clamp(sim.playerX + axis.x * cfg.playerSpeed * h, limit);
  sim.playerY = clamp(sim.playerY + axis.y * cfg.playerSpeed * h, limit);

  sim.errTimer -= h;
  if (sim.errTimer <= 0) {
    sim.errTimer = 0.45;
    sim.errX = (Math.random() * 2 - 1) * cfg.error;
    sim.errY = (Math.random() * 2 - 1) * cfg.error;
  }

  let targetX = sim.errX * 0.25;
  let targetY = sim.errY * 0.25;
  if (sim.ball.vz < -0.05 && sim.serve <= 0) {
    const time = (sim.aiZ - sim.ball.z) / sim.ball.vz;
    targetX = sim.ball.x + sim.ball.vx * time + sim.errX;
    targetY = sim.ball.y + sim.ball.vy * time + sim.errY;
  }
  const aiStep = cfg.aiSpeed * h;
  sim.aiX = clamp(approach(sim.aiX, targetX, aiStep), limit);
  sim.aiY = clamp(approach(sim.aiY, targetY, aiStep), limit);

  if (sim.serve > 0) {
    sim.serve -= h;
    sim.ball.x = 0;
    sim.ball.y = 0;
    sim.ball.z = 0;
    sim.ball.vx = 0;
    sim.ball.vy = 0;
    sim.ball.vz = 0;
    if (sim.serve <= 0) launch(sim);
    return;
  }

  const prevZ = sim.ball.z;
  sim.ball.x += sim.ball.vx * h;
  sim.ball.y += sim.ball.vy * h;
  sim.ball.z += sim.ball.vz * h;

  const wall = half - BALL_RADIUS;
  if (sim.ball.x > wall) {
    sim.ball.x = wall;
    sim.ball.vx = -Math.abs(sim.ball.vx);
  } else if (sim.ball.x < -wall) {
    sim.ball.x = -wall;
    sim.ball.vx = Math.abs(sim.ball.vx);
  }
  if (sim.ball.y > wall) {
    sim.ball.y = wall;
    sim.ball.vy = -Math.abs(sim.ball.vy);
  } else if (sim.ball.y < -wall) {
    sim.ball.y = -wall;
    sim.ball.vy = Math.abs(sim.ball.vy);
  }

  const reachX = paddle + BALL_RADIUS;
  const reachY = paddle + BALL_RADIUS;

  if (sim.ball.vz > 0 && prevZ <= sim.playerZ && sim.ball.z >= sim.playerZ) {
    const hit = Math.abs(sim.ball.x - sim.playerX) <= reachX && Math.abs(sim.ball.y - sim.playerY) <= reachY;
    if (hit) {
      reflect(sim.ball, sim.playerX, sim.playerY, paddle, -1, cfg.maxSpeed);
      sim.ball.z = sim.playerZ - BALL_RADIUS - 0.02;
    } else {
      scorePoint(sim, 'ai');
    }
    return;
  }

  if (sim.ball.vz < 0 && prevZ >= sim.aiZ && sim.ball.z <= sim.aiZ) {
    const hit = Math.abs(sim.ball.x - sim.aiX) <= reachX && Math.abs(sim.ball.y - sim.aiY) <= reachY;
    if (hit) {
      reflect(sim.ball, sim.aiX, sim.aiY, paddle, 1, cfg.maxSpeed);
      sim.ball.z = sim.aiZ + BALL_RADIUS + 0.02;
    } else {
      scorePoint(sim, 'player');
    }
  }
}

export function createPongSim(difficulty = 'Easy') {
  const cfg = DIFFICULTY[difficulty] || DIFFICULTY.Easy;
  const half = ARENA;
  return {
    cfg,
    half,
    paddle: cfg.paddle,
    playerZ: half - 0.2,
    aiZ: -half + 0.2,
    playerX: 0,
    playerY: 0,
    aiX: 0,
    aiY: 0,
    ball: { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
    serve: 0.7,
    serveDir: 1,
    errX: 0,
    errY: 0,
    errTimer: 0.2,
    score: 0,
    aiScore: 0,
    lives: 1,
    level: 1,
    over: null
  };
}

export function stepPong(sim, dt, held) {
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
