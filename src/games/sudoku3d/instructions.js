/**
 * 3D Sudoku Instructions
 *
 * Game instructions for the instructions popup and in-game guidance.
 */

export const getInstructions = () => ({
  objective: 'Fill the 9×9×9 grid so that each of the 9 color layers is a valid Sudoku (1–9 once per row, column, and 3×3 box), and so that at every row/column position the 9 cells across the 9 layers contain 1–9 exactly once.',
  controls: [
    'Click a cell to select it. The full 9×9×9 grid is shown; orbit the camera to see all layers. Selected cell and its constraint cells (same row, column, 3×3 box, and tower) are highlighted.',
    'Arrow keys: Move the selection within the current layer. Page Up / Page Down: Change layer (keep same row/col).',
    'Type 1–9 or use the number buttons to place or change a digit. Clear or Backspace to remove your digit. Given digits cannot be changed.',
    'Mouse / scroll: Orbit and zoom to view the 3D grid.',
    'New Game: Start a new puzzle. Hint: Reveal one correct digit. Check: Highlight cells that break the rules.',
    'Hide completed cells: When enabled, cells whose row, column, and box are all full are hidden from view. Toggle on or off in the control panel.'
  ],
  tips: [
    'The third dimension is color: each of the 9 layers has a different color. At each (row, col), the 9 cells across layers must contain 1–9 exactly once.',
    'Use constraint highlighting to see which cells affect the selected cell (row, column, box in that layer, plus the tower through all layers).',
    'Hide completed cells to reduce clutter once a row/column/box is finished.',
    'Easy = more given digits; Hard = fewer. Start with Easy to learn the 3D constraints.'
  ]
});
