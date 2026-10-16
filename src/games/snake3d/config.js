/**
 * 3D Snake configuration
 */

export const DIFFICULTY = {
  Easy: { size: 8, obstacles: 0, tickMs: 320, speedUp: 14, minTick: 90 },
  Medium: { size: 10, obstacles: 6, tickMs: 240, speedUp: 12, minTick: 80 },
  Hard: { size: 12, obstacles: 14, tickMs: 180, speedUp: 10, minTick: 70 }
};

export const DIFFICULTY_OPTIONS = [
  { value: 'Easy', label: 'Easy (8³)' },
  { value: 'Medium', label: 'Medium (10³, walls)' },
  { value: 'Hard', label: 'Hard (12³, walls)' }
];

export const getCameraPosition = (difficulty = 'Easy') => {
  const size = (DIFFICULTY[difficulty] || DIFFICULTY.Easy).size;
  const distance = size * 1.35;
  return [distance * 0.82, distance * 0.72, distance * 0.95];
};

export function tickMsFor(difficulty, foods) {
  const cfg = DIFFICULTY[difficulty] || DIFFICULTY.Easy;
  return Math.max(cfg.minTick, cfg.tickMs - foods * cfg.speedUp);
}
