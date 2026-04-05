/**
 * 3D 2048 game registration
 */

import { registerGame, createDefaultGameState, createCameraConfig } from '../../lib/game';
import Three2048 from './Three2048';
import { getInstructions } from './instructions';
import { getCameraPosition } from './config';

const game2048Config = {
  id: '2048-3d',
  title: '3D 2048',
  Component: Three2048,
  getInstructions,
  getCameraConfig: () => createCameraConfig(getCameraPosition(), 75, true),
  getDefaultState: () => ({
    ...createDefaultGameState(),
    isPlaying: true
  }),
  getDefaultOptions: () => ({})
};

registerGame(game2048Config);

export { Three2048, getInstructions };
export default game2048Config;
