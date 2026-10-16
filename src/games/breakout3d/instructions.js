/**
 * 3D Breakout instructions
 */

export const getInstructions = () => ({
  objective: 'Clear every brick in the 3D stack. You have three lives. Missing the paddle costs one.',
  controls: [
    'W / S or Arrow Up / Down: move the paddle up and down',
    'A / D or Arrow Left / Right: move the paddle left and right',
    'P: Pause / Resume',
    'Mouse drag: orbit the camera'
  ],
  tips: [
    'Each depth layer has its own color',
    'Hitting the edge of the paddle changes the return angle',
    'The ball speeds up slightly as bricks disappear',
    'The far wall and the sides bounce'
  ]
});
