/**
 * 3D Breakout configuration
 */

export const SPACING = 0.8;
export const BRICK = 0.62;
export const BALL_RADIUS = 0.18;
export const FRONT_Z = 1.2;

export const LAYER_COLORS = ['#ff6b9d', '#ffd93d', '#4ecdc4', '#a855f7', '#3b82f6', '#10b981'];

export const DIFFICULTY = {
  Easy: { w: 7, h: 5, d: 2, ballSpeed: 4.6, maxSpeed: 9, paddleX: 1.55, paddleY: 0.85, playerSpeed: 6.5 },
  Medium: { w: 8, h: 6, d: 3, ballSpeed: 5.7, maxSpeed: 11, paddleX: 1.25, paddleY: 0.7, playerSpeed: 6.8 },
  Hard: { w: 9, h: 7, d: 4, ballSpeed: 6.8, maxSpeed: 13, paddleX: 1.0, paddleY: 0.58, playerSpeed: 7.2 }
};

export const DIFFICULTY_OPTIONS = [
  { value: 'Easy', label: 'Easy (7×5×2)' },
  { value: 'Medium', label: 'Medium (8×6×3)' },
  { value: 'Hard', label: 'Hard (9×7×4)' }
];

export const getCameraPosition = (difficulty = 'Easy') => {
  const cfg = DIFFICULTY[difficulty] || DIFFICULTY.Easy;
  return [0, cfg.h * 0.12, FRONT_Z + 1.5 + 8];
};
