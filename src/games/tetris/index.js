/**
 * Tetris 3D Game Registration
 */

import { registerGame, createDefaultGameState, createCameraConfig } from '../../lib/game';
import Tetris3D from './Tetris3D';
import TetrisControls from './Controls';
import { getInstructions } from './instructions';
import { getCameraPosition } from './config';

const tetrisConfig = {
  id: 'tetris-3d',
  title: '3D Tetris',
  Component: Tetris3D,
  ControlsComponent: TetrisControls,
  
  getInstructions,
  
  getCameraConfig: (options = {}) => {
    const difficulty = options.difficulty || 'Easy';
    return createCameraConfig(getCameraPosition(difficulty), 60, true);
  },
  
  getDefaultState: () => ({
    ...createDefaultGameState(),
    score: 0,
    lives: 1,
    level: 1,
    linesCleared: 0
  }),
  
  getDefaultOptions: () => ({
    difficulty: 'Easy',
    isPaused: false
  })
};

registerGame(tetrisConfig);

export { Tetris3D, TetrisControls, getInstructions };
export default tetrisConfig;

