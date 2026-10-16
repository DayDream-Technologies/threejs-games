/**
 * 3D maze chase configuration
 */

export const DIFFICULTY = {
  Easy: {
    size: 7,
    pursuers: 2,
    playerSpeed: 2.7,
    ghostSpeed: 2.05,
    wander: 0.38,
    frightTime: 7
  },
  Medium: {
    size: 9,
    pursuers: 3,
    playerSpeed: 3.05,
    ghostSpeed: 2.55,
    wander: 0.22,
    frightTime: 5.5
  },
  Hard: {
    size: 11,
    pursuers: 4,
    playerSpeed: 3.4,
    ghostSpeed: 3.05,
    wander: 0.1,
    frightTime: 4
  }
};

export const GHOST_COLORS = ['#ef4444', '#f472b6', '#22d3ee', '#f97316'];

export const DIFFICULTY_OPTIONS = [
  { value: 'Easy', label: 'Easy (7³, 2 pursuers)' },
  { value: 'Medium', label: 'Medium (9³, 3 pursuers)' },
  { value: 'Hard', label: 'Hard (11³, 4 pursuers)' }
];

export const getCameraPosition = (difficulty = 'Easy') => {
  const size = (DIFFICULTY[difficulty] || DIFFICULTY.Easy).size;
  const distance = size * 1.2;
  return [distance * 0.72, distance * 0.88, distance];
};
