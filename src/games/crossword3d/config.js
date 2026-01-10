/**
 * Crossword 3D Configuration
 */

export const COLORS = {
  empty: '#6b7280',        // darker gray for wireframe
  wordCell: '#e5e7eb',     // light gray for word cells
  selected: '#fbbf24',     // yellow for selected cell
  wordHighlight: '#3b82f6', // blue for other cells in selected word
  correct: '#10b981',      // green for correct letters
  wrong: '#ef4444',        // red for wrong letters
  hinted: '#10b981',       // green for hinted letters
  letter: '#1f2937'        // dark text for letters
};

export const CUBE_CONFIG = {
  spacing: 1.0,
  size: 0.8
};

/**
 * Get camera position based on board size
 */
export const getCameraPosition = (boardSize = 5) => {
  switch(boardSize) {
    case 5: return [0, 0, 8];
    case 7: return [0, 0, 12];
    case 9: return [0, 0, 16];
    default: return [0, 0, 12];
  }
};

