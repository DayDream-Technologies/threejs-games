/**
 * Ship in a closed cube. Rocks drift, bounce, and split when shot.
 */

import {
  DIFFICULTY,
  HALF,
  MAX_BULLETS,
  ROCK_POINTS,
  ROCK_RADIUS,
  ROCK_SPEED,
  SHIP_RADIUS
} from './config';

function rand(min, max) {
  return min + Math.random() * (max - min);
}

export function forwardVector(yaw, pitch) {
  const cp = Math.cos(pitch);
  return {
    x: Math.sin(yaw) * cp,
    y: Math.sin(pitch),
    z: Math.cos(yaw) * cp
  };
}

function bounce(body, radius) {
  const limit = HALF - radius;
  if (body.x > limit) {
    body.x = limit;
    body.vx = -Math.abs(body.vx);
  } else if (body.x < -limit) {
    body.x = -limit;
    body.vx = Math.abs(body.vx);
  }
  if (body.y > limit) {
    body.y = limit;
    body.vy = -Math.abs(body.vy);
  } else if (body.y < -limit) {
    body.y = -limit;
    body.vy = Math.abs(body.vy);
  }
  if (body.z > limit) {
    body.z = limit;
    body.vz = -Math.abs(body.vz);
  } else if (body.z < -limit) {
    body.z = -limit;
    body.vz = Math.abs(body.vz);
  }
}

function makeRock(size, position, speedScale) {
  const speed = ROCK_SPEED[size] * speedScale;
  const heading = Math.random() * Math.PI * 2;
  const lift = rand(-0.6, 0.6);
  return {
    x: position.x,
    y: position.y,
    z: position.z,
    vx: Math.sin(heading) * speed,
    vy: Math.sin(lift) * speed,
    vz: Math.cos(heading) * speed,
    size,
    radius: ROCK_RADIUS[size],
    rx: rand(0, Math.PI),
    ry: rand(0, Math.PI),
    rz: rand(0, Math.PI),
    sx: rand(-1.4, 1.4),
    sy: rand(-1.4, 1.4),
    sz: rand(-1.4, 1.4)
  };
}

function farPosition() {
  for (let i = 0; i < 12; i += 1) {
    const pos = { x: rand(-6, 6), y: rand(-6, 6), z: rand(-6, 6) };
    const dist = Math.hypot(pos.x, pos.y, pos.z);
    if (dist > 4.5) return pos;
  }
  return { x: 6, y: 2, z: -5 };
}

function spawnWave(sim, count) {
  for (let i = 0; i < count; i += 1) {
    sim.rocks.push(makeRock(3, farPosition(), sim.cfg.speed));
  }
}

function splitRock(rock, speedScale) {
  if (rock.size <= 1) return [];
  const next = rock.size - 1;
  return [0, 1].map(() => {
    const child = makeRock(next, { x: rock.x, y: rock.y, z: rock.z }, speedScale);
    child.vx = rock.vx * 0.6 + rand(-1.6, 1.6);
    child.vy = rock.vy * 0.6 + rand(-1.6, 1.6);
    child.vz = rock.vz * 0.6 + rand(-1.6, 1.6);
    return child;
  });
}

function readShip(held) {
  let yaw = 0;
  let pitch = 0;
  if (held?.yawL) yaw -= 1;
  if (held?.yawR) yaw += 1;
  if (held?.pitchU) pitch += 1;
  if (held?.pitchD) pitch -= 1;
  return { yaw, pitch, thrust: !!held?.thrust, fire: !!held?.fire };
}

function substep(sim, h, held) {
  const input = readShip(held);
  const ship = sim.ship;
  sim.time += h;
  ship.invuln = Math.max(0, ship.invuln - h);
  sim.cooldown = Math.max(0, sim.cooldown - h);

  ship.yaw += input.yaw * sim.cfg.yaw * h;
  ship.pitch = Math.max(-1.15, Math.min(1.15, ship.pitch + input.pitch * sim.cfg.pitch * h));

  const forward = forwardVector(ship.yaw, ship.pitch);
  if (input.thrust) {
    ship.vx += forward.x * sim.cfg.thrust * h;
    ship.vy += forward.y * sim.cfg.thrust * h;
    ship.vz += forward.z * sim.cfg.thrust * h;
  }
  const drag = Math.exp(-0.7 * h);
  ship.vx *= drag;
  ship.vy *= drag;
  ship.vz *= drag;
  const speed = Math.hypot(ship.vx, ship.vy, ship.vz);
  if (speed > 9) {
    const scale = 9 / speed;
    ship.vx *= scale;
    ship.vy *= scale;
    ship.vz *= scale;
  }

  ship.x += ship.vx * h;
  ship.y += ship.vy * h;
  ship.z += ship.vz * h;
  bounce(ship, SHIP_RADIUS);

  if (input.fire && sim.cooldown <= 0 && sim.bullets.length < MAX_BULLETS) {
    sim.cooldown = 0.26;
    sim.bullets.push({
      x: ship.x + forward.x * 0.9,
      y: ship.y + forward.y * 0.9,
      z: ship.z + forward.z * 0.9,
      vx: forward.x * 20 + ship.vx,
      vy: forward.y * 20 + ship.vy,
      vz: forward.z * 20 + ship.vz,
      life: 1.35
    });
  }

  for (let i = sim.bullets.length - 1; i >= 0; i -= 1) {
    const bullet = sim.bullets[i];
    bullet.life -= h;
    bullet.x += bullet.vx * h;
    bullet.y += bullet.vy * h;
    bullet.z += bullet.vz * h;
    const outside = Math.abs(bullet.x) > HALF || Math.abs(bullet.y) > HALF || Math.abs(bullet.z) > HALF;
    if (bullet.life <= 0 || outside) sim.bullets.splice(i, 1);
  }

  for (let i = 0; i < sim.rocks.length; i += 1) {
    const rock = sim.rocks[i];
    rock.x += rock.vx * h;
    rock.y += rock.vy * h;
    rock.z += rock.vz * h;
    rock.rx += rock.sx * h;
    rock.ry += rock.sy * h;
    rock.rz += rock.sz * h;
    bounce(rock, rock.radius);
  }

  const removed = new Set();
  const spawned = [];
  for (let b = sim.bullets.length - 1; b >= 0; b -= 1) {
    const bullet = sim.bullets[b];
    for (let r = 0; r < sim.rocks.length; r += 1) {
      if (removed.has(r)) continue;
      const rock = sim.rocks[r];
      const dx = bullet.x - rock.x;
      const dy = bullet.y - rock.y;
      const dz = bullet.z - rock.z;
      const reach = rock.radius + 0.12;
      if (dx * dx + dy * dy + dz * dz > reach * reach) continue;
      removed.add(r);
      sim.bullets.splice(b, 1);
      sim.score += ROCK_POINTS[rock.size] || 20;
      spawned.push(...splitRock(rock, sim.cfg.speed));
      break;
    }
  }
  if (removed.size) {
    sim.rocks = sim.rocks.filter((_, index) => !removed.has(index)).concat(spawned);
  }

  let hit = false;
  for (let i = 0; i < sim.rocks.length; i += 1) {
    const rock = sim.rocks[i];
    const dx = ship.x - rock.x;
    const dy = ship.y - rock.y;
    const dz = ship.z - rock.z;
    const dist = Math.hypot(dx, dy, dz) || 0.0001;
    const reach = SHIP_RADIUS + rock.radius;
    if (dist >= reach) continue;
    const overlap = reach - dist;
    ship.x += (dx / dist) * overlap;
    ship.y += (dy / dist) * overlap;
    ship.z += (dz / dist) * overlap;
    if (!hit && ship.invuln <= 0) {
      hit = true;
      sim.lives -= 1;
      ship.invuln = 2;
      ship.vx *= -0.25;
      ship.vy *= -0.25;
      ship.vz *= -0.25;
      if (sim.lives <= 0) {
        sim.over = 'lose';
        return;
      }
    }
  }

  if (sim.rocks.length === 0 && sim.over !== 'lose') {
    sim.level += 1;
    ship.invuln = Math.max(ship.invuln, 2);
    spawnWave(sim, Math.min(9, sim.cfg.rocks + sim.level - 1));
  }
}

export function createAsteroidsSim(difficulty = 'Easy') {
  const cfg = DIFFICULTY[difficulty] || DIFFICULTY.Easy;
  const sim = {
    cfg,
    half: HALF,
    ship: {
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      yaw: 0,
      pitch: 0,
      invuln: 2
    },
    bullets: [],
    rocks: [],
    cooldown: 0,
    time: 0,
    score: 0,
    lives: 3,
    level: 1,
    over: null
  };
  spawnWave(sim, cfg.rocks);
  return sim;
}

function statusKey(sim) {
  return `${sim.score}|${sim.lives}|${sim.level}|${sim.over}`;
}

export function stepAsteroids(sim, dt, held) {
  if (!sim || sim.over) return false;
  const before = statusKey(sim);
  let left = dt;
  while (left > 0 && !sim.over) {
    const h = Math.min(left, 0.016);
    substep(sim, h, held);
    left -= h;
  }
  return statusKey(sim) !== before;
}
