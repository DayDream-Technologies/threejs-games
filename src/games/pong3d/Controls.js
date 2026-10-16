/**
 * 3D Pong controls
 */

import React from 'react';
import ArcadeControls from '../../components/game/ArcadeControls';
import { DIFFICULTY_OPTIONS } from './config';

function PongControls(props) {
  return <ArcadeControls {...props} label="Difficulty" options={DIFFICULTY_OPTIONS} />;
}

export default PongControls;
