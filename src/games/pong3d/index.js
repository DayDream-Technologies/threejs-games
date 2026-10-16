/**
 * 3D Pong registration
 */

import { registerGame, createDefaultGameState, createCameraConfig } from '../../lib/game';
import Pong3D from './Pong3D';
import PongControls from './Controls';
import { getInstructions } from './instructions';
import { getCameraPosition } from './config';

const pongConfig = {
  id: 'pong-3d',
  title: '3D Pong',
  Component: Pong3D,
  ControlsComponent: PongControls,
  getInstructions,
  getCameraConfig: () => createCameraConfig(getCameraPosition(), 50, true),
  getDefaultState: () => ({
    ...createDefaultGameState(),
    score: 0,
    lives: 1,
    level: 1,
    opponentScore: 0
  }),
  getDefaultOptions: () => ({
    difficulty: 'Easy',
    isPaused: false
  })
};

registerGame(pongConfig);

export { Pong3D, PongControls, getInstructions };
export default pongConfig;
