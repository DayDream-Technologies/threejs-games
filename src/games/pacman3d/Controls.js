/**
 * 3D maze chase controls
 */

import React from 'react';
import ArcadeControls from '../../components/game/ArcadeControls';
import { DIFFICULTY_OPTIONS } from './config';

function PacmanControls(props) {
  return <ArcadeControls {...props} label="Maze" options={DIFFICULTY_OPTIONS} />;
}

export default PacmanControls;
