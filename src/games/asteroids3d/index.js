/**
 * 3D Asteroids registration
 */

import { registerGame, createDefaultGameState, createCameraConfig } from '../../lib/game';
import Asteroids3D from './Asteroids3D';
import AsteroidsControls from './Controls';
import { getInstructions } from './instructions';
import { getCameraPosition } from './config';

const asteroidsConfig = {
  id: 'asteroids-3d',
  title: '3D Asteroids',
  Component: Asteroids3D,
  ControlsComponent: AsteroidsControls,
  getInstructions,
  getCameraConfig: () => createCameraConfig(getCameraPosition(), 55, true),
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

registerGame(asteroidsConfig);

export { Asteroids3D, AsteroidsControls, getInstructions };
export default asteroidsConfig;
