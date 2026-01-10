/**
 * Crossword 3D Game Registration
 */

import { registerGame, createDefaultGameState, createCameraConfig } from '../../lib/game';
import Crossword3D from './Crossword3D';
import CrosswordControls from './Controls';
import { getInstructions } from './instructions';
import { getCameraPosition } from './config';

const crosswordConfig = {
  id: 'crossword-3d',
  title: '3D Crossword',
  Component: Crossword3D,
  ControlsComponent: CrosswordControls,
  
  getInstructions,
  
  getCameraConfig: (options = {}) => {
    const boardSize = options.boardSize || 5;
    return createCameraConfig(getCameraPosition(boardSize), 75, true);
  },
  
  getDefaultState: () => ({
    ...createDefaultGameState(),
    score: 0,
    lives: 1,
    level: 'Medium'
  }),
  
  getDefaultOptions: () => ({
    boardSize: 5,
    hideFilledWords: false
  })
};

registerGame(crosswordConfig);

export { Crossword3D, CrosswordControls, getInstructions };
export default crosswordConfig;

