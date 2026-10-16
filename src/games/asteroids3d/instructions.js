/**
 * 3D Asteroids instructions
 */

export const getInstructions = () => ({
  objective: 'Clear each wave of rocks inside the cube. Large rocks split twice. You have three lives, and the run ends at zero.',
  controls: [
    'A / D or Arrow Left / Right: yaw',
    'W / S or Arrow Up / Down: pitch',
    'Shift: thrust',
    'Space: fire (a few shots at a time)',
    'P: Pause / Resume',
    'Mouse drag: orbit the camera'
  ],
  tips: [
    'The ship and the rocks bounce off the cube',
    'Shots disappear at the boundary',
    'After a hit the ship blinks and cannot be hurt for a moment',
    'Each cleared wave adds another large rock, up to nine'
  ]
});
