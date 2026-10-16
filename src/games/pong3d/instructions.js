/**
 * 3D Pong instructions
 */

import { POINTS_TO_WIN } from './config';

export const getInstructions = () => ({
  objective: `Defend the near face of the cube. First to ${POINTS_TO_WIN} wins against the computer on the far face.`,
  controls: [
    'W / S or Arrow Up / Down: slide the paddle up and down',
    'A / D or Arrow Left / Right: slide the paddle left and right',
    'P: Pause / Resume',
    'Mouse drag: orbit the camera'
  ],
  tips: [
    'Hitting the edge of the paddle bends the return',
    'The ball speeds up a little after every paddle hit',
    'Hard difficulty tracks the ball with almost no error',
    'The other four walls always bounce'
  ]
});
