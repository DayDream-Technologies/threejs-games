/**
 * 3D Breakout registration
 */

import { registerGame, createDefaultGameState, createCameraConfig } from '../../lib/game';
import Breakout3D from './Breakout3D';
import BreakoutControls from './Controls';
import { getInstructions } from './instructions';
import { getCameraPosition } from './config';

const breakoutConfig = {
  id: 'breakout-3d',
  title: '3D Breakout',
  Component: Breakout3D,
  ControlsComponent: BreakoutControls,
  getInstructions,
  getCameraConfig: (options = {}) => createCameraConfig(
    getCameraPosition(options.difficulty || 'Easy'),
    52,
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

registerGame(breakoutConfig);

export { Breakout3D, BreakoutControls, getInstructions };
export default breakoutConfig;
