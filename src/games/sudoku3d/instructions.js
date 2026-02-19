/**
 * 3D Sudoku Instructions
 *
 * Game instructions for the instructions popup and in-game guidance.
 */

export const getInstructions = () => ({
  objective: 'Fill the 9×9×9 grid so that each of the 9 color layers is a valid Sudoku (1–9 once per row, column, and 3×3 box), and so that at every row/column position the 9 cells across the 9 layers contain 1–9 exactly once.',
  controls: [
    'Click a cell on the board to select it (highlighted). Only empty, non-given cells can be edited. Given digits (pre-filled) cannot be changed.',
    'Use the number pad (1–9) or the number buttons in the control panel to place or change a digit in the selected cell.',
    'Use Clear to remove your digit from the selected cell. You cannot remove given digits.',
    'Use the layer strip (color bar below the board in the 3D scene) to switch which of the 9 layers you are viewing. Only one layer is shown at a time so you can focus; each layer has a different color.',
    'Mouse / scroll: Orbit and zoom the camera to view the board.',
    'New Game: Start a new puzzle with the selected difficulty.',
    'Hint: Reveal one correct digit in an empty cell (optional).',
    'Check: Highlight cells that break the rules (optional).'
  ],
  tips: [
    'The third dimension is color: the 9 layers are 9 different colors. At each (row, col), all 9 digits 1–9 must appear across the 9 layers.',
    'Solve like normal Sudoku on each layer, but remember that the same (row, col) in other layers must eventually hold the other digits.',
    'Use the layer selector to move between layers; only the current layer is shown as the main 9×9 board so you can focus.',
    'Easy = more given digits; Hard = fewer. Start with Easy to learn the 3D constraints.'
  ]
});
