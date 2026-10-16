/**
 * 3D Asteroids configuration
 */

export const HALF = 8;
export const SHIP_RADIUS = 0.45;
export const MAX_BULLETS = 4;

export const ROCK_RADIUS = { 3: 1.25, 2: 0.78, 1: 0.42 };
export const ROCK_POINTS = { 3: 20, 2: 50, 1: 100 };
export const ROCK_SPEED = { 3: 1.5, 2: 2.3, 1: 3.1 };

export const DIFFICULTY = {
  Easy: { rocks: 3, speed: 0.85, thrust: 15, yaw: 2.3, pitch: 1.9 },
  Medium: { rocks: 4, speed: 1, thrust: 16, yaw: 2.45, pitch: 2 },
  Hard: { rocks: 5, speed: 1.2, thrust: 17, yaw: 2.6, pitch: 2.15 }
};

export const DIFFICULTY_OPTIONS = [
  { value: 'Easy', label: 'Easy (3 rocks)' },
  { value: 'Medium', label: 'Medium (4 rocks)' },
  { value: 'Hard', label: 'Hard (5 rocks)' }
];

export const getCameraPosition = () => [0, 8, 16.5];
