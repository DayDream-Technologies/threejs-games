/**
 * Tetris 3D Instructions
 */

export const getInstructions = () => ({
  objective: 'Stack falling 3D tetromino pieces to fill complete horizontal planes. Clear planes to score points and prevent the well from filling up!',
  controls: [
    'Arrow Left/Right: Move piece on X axis',
    'Arrow Up/Down: Move piece on Z axis',
    'Q/E: Rotate piece around Y axis (vertical spin)',
    'W/S: Rotate piece around X axis (flip forward/back)',
    'Space: Hard drop (instant drop)',
    'Shift: Soft drop (faster fall)',
    'P: Pause/Resume game',
    'Mouse drag: Rotate camera view'
  ],
  tips: [
    'Complete horizontal planes (fill entire NxN layer) to clear them',
    'Clear multiple planes at once for bonus points (Tetris = 4 planes!)',
    'Use the ghost piece (transparent) to see where your piece will land',
    'Rotate the camera to see the well from different angles',
    'Speed increases every 10 lines cleared',
    'Plan ahead - watch the next piece preview!',
    'Hard drops give bonus points based on distance dropped'
  ]
});

