/**
 * 3D Snake controls
 */

import React from 'react';
import ArcadeControls from '../../components/game/ArcadeControls';
import { DIFFICULTY_OPTIONS } from './config';

function SnakeControls(props) {
  return <ArcadeControls {...props} label="Grid" options={DIFFICULTY_OPTIONS} />;
}

export default SnakeControls;
