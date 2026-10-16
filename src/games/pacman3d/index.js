/**
 * 3D maze chase registration
 */

import { registerGame, createDefaultGameState, createCameraConfig } from '../../lib/game';
import Pacman3D from './Pacman3D';
import PacmanControls from './Controls';
import { getInstructions } from './instructions';
import { getCameraPosition } from './config';

const pacmanConfig = {
  id: 'pacman-3d',
  title: '3D Pac-Man',
  Component: Pacman3D,
  ControlsComponent: PacmanControls,
  getInstructions,
  getCameraConfig: (options = {}) => createCameraConfig(
    getCameraPosition(options.difficulty || 'Easy'),
    55,
    true
  ),
  getDefaultState: () => ({
    ...createDefaultGameState(),
    score: 0,
    lives: 3,
    level: 1
  }),
  getDefaultOptions: () => ({
    difficulty: 'Easy',
    isPaused: false
  })
};

registerGame(pacmanConfig);

export { Pacman3D, PacmanControls, getInstructions };
export default pacmanConfig;
