/**
 * 3D Sudoku Game Registration
 */

import { registerGame, createDefaultGameState, createCameraConfig } from '../../lib/game';
import Sudoku3D from './Sudoku3D';
import SudokuControls from './Controls';
import { getInstructions } from './instructions';
import { getCameraPosition } from './config';

const sudokuConfig = {
  id: 'sudoku-3d',
  title: '3D Sudoku',
  Component: Sudoku3D,
  ControlsComponent: SudokuControls,

  getInstructions,

  getCameraConfig: (options = {}) => {
    const difficulty = options.difficulty || 'Medium';
    return createCameraConfig(getCameraPosition(difficulty), 75, true);
  },

  getDefaultState: () => ({
    ...createDefaultGameState(),
    level: 'Medium',
    isPlaying: true,
    gameWon: false,
    gameLost: false
  }),

  getDefaultOptions: () => ({
    difficulty: 'Medium',
    hideCompletedCells: false
  })
};

registerGame(sudokuConfig);

export { Sudoku3D, SudokuControls, getInstructions };
export default sudokuConfig;
