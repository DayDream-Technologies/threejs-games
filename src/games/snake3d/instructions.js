/**
 * 3D Snake instructions
 */

export const getInstructions = () => ({
  objective: 'Guide the snake through a 3D grid, eat the glowing food, and do not hit a wall, a block, or your own tail.',
  controls: [
    'Arrow keys: move on X and Z (Left/Right, Forward/Back)',
    'Q / E: move up / down on Y',
    'P: Pause / Resume',
    'Mouse drag: orbit the camera'
  ],
  tips: [
    'The snake cannot reverse in a single step',
    'Each bite speeds the next tick up',
    'Medium and Hard add interior blocks',
    'The run ends on a crash — there is no finish line'
  ]
});
