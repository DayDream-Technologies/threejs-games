/**
 * 3D Snake registration
 */

import { registerGame, createDefaultGameState, createCameraConfig } from '../../lib/game';
import Snake3D from './Snake3D';
import SnakeControls from './Controls';
import { getInstructions } from './instructions';
import { getCameraPosition } from './config';

const snakeConfig = {
  id: 'snake-3d',
  title: '3D Snake',
  Component: Snake3D,
  ControlsComponent: SnakeControls,
  getInstructions,
  getCameraConfig: (options = {}) => createCameraConfig(getCameraPosition(options.difficulty || 'Easy'), 55, true),
  getDefaultState: () => ({
    ...createDefaultGameState(),
    score: 0,
    lives: 1,
    level: 1
  }),
  getDefaultOptions: () => ({
    difficulty: 'Easy',
    isPaused: false
  })
};

registerGame(snakeConfig);

export { Snake3D, SnakeControls, getInstructions };
export default snakeConfig;
