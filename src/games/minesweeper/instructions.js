/**
 * Minesweeper 3D Instructions
 * 
 * Game instructions displayed in the instructions popup.
 */

export const getInstructions = () => ({
  objective: 'Reveal all safe cubes in a 3D grid without clicking a bomb.',
  controls: [
    'Left Click: Reveal cube / flood reveal if zero',
    'Right Click: Flag/unflag suspected bomb (turns blue)',
    'Double Click on revealed number: Remove that cube from scene',
    'Mouse/Wheel: Orbit and zoom camera',
    'F: Toggle flag mode (left click becomes right click)',
    'R: Reset game'
  ],
  tips: [
    'Numbers show count of adjacent bombs in 26-neighborhood',
    'Use flags to track bombs; bombs remaining updates as you flag',
    'Zoom in/out to inspect deeper layers',
    'Scoring: Outer layer cubes = 10 points, Second layer = 100 points, Center cube = 250 points',
    'Difficulty: Easy (5×5×5), Medium (7×7×7), Hard (9×9×9) - bomb count scales proportionally'
  ]
});

