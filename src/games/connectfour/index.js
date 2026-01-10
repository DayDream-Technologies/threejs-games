/**
 * Connect Four 3D Game Registration
 */

import { registerGame, createDefaultGameState, createCameraConfig } from '../../lib/game';
import ConnectFour3D from './ConnectFour3D';
import ConnectFourControls from './Controls';
import { getInstructions } from './instructions';
import { getCameraPosition } from './config';

const connectFourConfig = {
  id: 'connectfour-3d',
  title: '3D Connect Four',
  Component: ConnectFour3D,
  ControlsComponent: ConnectFourControls,
  
  getInstructions,
  
  getCameraConfig: (options = {}) => {
    const boardSize = options.boardSize || 7;
    return createCameraConfig(getCameraPosition(boardSize), 75, true);
  },
  
  getDefaultState: () => ({
    ...createDefaultGameState(),
    currentPlayer: 1
  }),
  
  getDefaultOptions: () => ({
    boardSize: 5,
    numPlayers: 2,
    showGrid: true,
    colorFilters: {
      red: false,
      blue: false,
      yellow: false,
      green: false,
      orange: false,
      pink: false,
      white: false,
      black: false
    }
  })
};

registerGame(connectFourConfig);

export { ConnectFour3D, ConnectFourControls, getInstructions };
export default connectFourConfig;

