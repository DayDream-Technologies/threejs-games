/**
 * 3D 2048 instructions
 */

export const getInstructions = () => ({
  objective:
    'Slide numbered cubes in a 4×4×4 grid. When two matching values collide, they merge into their sum. Reach 8096 to win — you can keep playing for a higher score. The game ends when no move is possible.',
  controls: [
    'Arrow Left / Right (L / R): slide along X (−X / +X)',
    'Arrow Up / Down (labels Up / Down): slide along Z (+Z / −Z)',
    'Space: slide along +Y (up)',
    'Shift: slide along −Y (down)',
    'Mouse drag: rotate camera (orbit controls)'
  ],
  tips: [
    'Each move shifts and merges every line parallel to that axis, like classic 2048 in 3D',
    'Only identical values merge in one step; a line 2,2,2,2 becomes 4,4 — not 8',
    'Try to keep your largest tile in a corner and build layers',
    'After each successful move, a new 2 or 4 appears in a random empty cell'
  ]
});
