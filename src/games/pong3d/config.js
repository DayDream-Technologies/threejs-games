/**
 * 3D Pong configuration
 */

export const POINTS_TO_WIN = 7;
export const ARENA = 3.7;
export const BALL_RADIUS = 0.22;

export const DIFFICULTY = {
  Easy: { ballSpeed: 4.2, maxSpeed: 8, aiSpeed: 2.5, error: 1.15, paddle: 1.15, playerSpeed: 6 },
  Medium: { ballSpeed: 5.5, maxSpeed: 10, aiSpeed: 3.8, error: 0.48, paddle: 0.88, playerSpeed: 6.2 },
  Hard: { ballSpeed: 6.8, maxSpeed: 12.5, aiSpeed: 5.4, error: 0.12, paddle: 0.64, playerSpeed: 6.4 }
};

export const DIFFICULTY_OPTIONS = [
  { value: 'Easy', label: 'Easy (wide paddle)' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Hard', label: 'Hard (sharp computer)' }
];

export const getCameraPosition = () => [0, 2.4, 11];
