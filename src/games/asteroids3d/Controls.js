/**
 * 3D Asteroids controls
 */

import React from 'react';
import ArcadeControls from '../../components/game/ArcadeControls';
import { DIFFICULTY_OPTIONS } from './config';

function AsteroidsControls(props) {
  return <ArcadeControls {...props} label="Wave" options={DIFFICULTY_OPTIONS} />;
}

export default AsteroidsControls;
