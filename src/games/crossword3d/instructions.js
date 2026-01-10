/**
 * Crossword 3D Instructions
 */

export const getInstructions = () => ({
  objective: 'Solve crossword puzzles in three dimensions! Place words across, down, and through a 3D grid of cubes.',
  controls: [
    'Click on a cell: Select the cell and its word',
    'Click same cell again: Cycle between intersecting words',
    'Type letters: Fill in the selected word from current position',
    'Backspace: Delete previous letter and move back',
    'Mouse/Wheel: Rotate and zoom the 3D board',
    'Board Size: Choose 5×5×5, 7×7×7, or 9×9×9 from dropdown',
    'Hint button: Reveals a random unfilled cell',
    'Check button: Verifies if current cell is correct'
  ],
  tips: [
    'Words are placed along the X, Y, and Z axes (no diagonals)',
    'Blue highlighted cells show other letters in the selected word',
    'Green cells indicate correct or hinted letters',
    'Red cells indicate incorrect letters after checking',
    'The definition for the selected word appears in the controls area',
    'Use Hide Filled Words to focus on incomplete words',
    'Larger board sizes have more words to solve'
  ]
});

