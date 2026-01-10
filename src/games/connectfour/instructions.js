/**
 * Connect Four 3D Instructions
 */

export const getInstructions = () => ({
  objective: 'Be the first player to get four pieces in a row! Pieces can be connected vertically, horizontally, or diagonally in all 3D directions.',
  controls: [
    'Board Size: Choose 5×5×5, 7×7×7, or 9×9×9 from dropdown',
    'Players: Choose 2-8 players from dropdown',
    'Arrow Keys: Move the white preview piece between columns and depths',
    'Enter or Space: Drop piece in the current column',
    'Click on Column: Drop piece in clicked column',
    'Mouse/Wheel: Rotate and zoom the 3D board',
    'Hover over columns: See where pieces will land',
    'B: Toggle show only blue pieces',
    'R: Toggle show only red pieces',
    'Y: Toggle show only yellow pieces',
    'G: Toggle show only green pieces',
    'O: Toggle show only orange pieces',
    'P: Toggle show only pink pieces',
    'W: Toggle show only white pieces',
    'K: Toggle show only black pieces',
    'Use grid button to toggle grid visibility'
  ],
  tips: [
    'Choose board size (5×5×5, 7×7×7, 9×9×9) and 2-8 players from the dropdown menus',
    'Board size and player count changes automatically start a new game',
    'Player colors: 1(Red), 2(Blue), 3(Yellow), 4(Green), 5(Orange), 6(Pink), 7(White), 8(Black)',
    'Pieces fall to the lowest available position in the selected column',
    'Win by connecting 4 pieces in any direction - includes all 3D diagonals!',
    'When someone wins, only the winning 4 pieces remain visible',
    'Use the white preview piece to plan your moves',
    'Use B, R, Y, G, O, P, W, K keys to filter pieces by color - great for strategy!'
  ]
});

