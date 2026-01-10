/**
 * Minesweeper 3D Game Registration
 * 
 * This module registers the Minesweeper game with the game framework.
 */

import { registerGame, createDefaultGameState, createCameraConfig } from '../../lib/game';
import Minesweeper3D from './Minesweeper3D';
import MinesweeperControls from './Controls';
import { getInstructions } from './instructions';
import { getCameraPosition, getNumBombs } from './config';

// Game configuration
const minesweeperConfig = {
  id: 'minesweeper-3d',
  title: '3D Minesweeper',
  Component: Minesweeper3D,
  ControlsComponent: MinesweeperControls,
  
  getInstructions,
  
  getCameraConfig: (options = {}) => {
    const difficulty = options.difficulty || 'Easy';
    return createCameraConfig(getCameraPosition(difficulty), 75, true);
  },
  
  getDefaultState: () => ({
    ...createDefaultGameState(),
    bombsRemaining: getNumBombs('Easy')
  }),
  
  getDefaultOptions: () => ({
    difficulty: 'Easy',
    flagMode: false
  })
};

// Register with the game framework
registerGame(minesweeperConfig);

// Export for direct usage if needed
export { Minesweeper3D, MinesweeperControls, getInstructions };
export default minesweeperConfig;

