/**
 * Connect Four 3D Configuration
 */

export const COLORS = {
  empty: '#6b7280',    // darker gray for wireframe
  player1: '#dc2626',  // darker red
  player2: '#3b82f6',  // blue
  player3: '#eab308',  // yellow
  player4: '#22c55e',  // green
  player5: '#fb923c',  // orange
  player6: '#f9a8d4',  // lighter pink
  player7: '#ffffff',  // white
  player8: '#1f2937',  // black/dark gray
  preview: '#ffffff',  // white
  highlight: '#10b981' // green for winning pieces
};

export const CUBE_CONFIG = {
  spacing: 1.0,
  size: 0.8,
  gridSize: 0.7
};

export const PLAYER_COLORS = [
  { id: 1, name: 'Red', color: COLORS.player1 },
  { id: 2, name: 'Blue', color: COLORS.player2 },
  { id: 3, name: 'Yellow', color: COLORS.player3 },
  { id: 4, name: 'Green', color: COLORS.player4 },
  { id: 5, name: 'Orange', color: COLORS.player5 },
  { id: 6, name: 'Pink', color: COLORS.player6 },
  { id: 7, name: 'White', color: COLORS.player7 },
  { id: 8, name: 'Black', color: COLORS.player8 }
];

/**
 * Get camera position based on board size
 */
export const getCameraPosition = (boardSize = 7) => {
  switch(boardSize) {
    case 5: return [0, 0, 8];
    case 7: return [0, 0, 12];
    case 9: return [0, 0, 16];
    default: return [0, 0, 12];
  }
};

/**
 * Get player color by player number
 */
export const getPlayerColor = (playerNum) => {
  const player = PLAYER_COLORS.find(p => p.id === playerNum);
  return player ? player.color : COLORS.player1;
};

