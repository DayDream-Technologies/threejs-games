/**
 * 3D Breakout controls
 */

import React from 'react';
import ArcadeControls from '../../components/game/ArcadeControls';
import { DIFFICULTY_OPTIONS } from './config';

function BreakoutControls(props) {
  return <ArcadeControls {...props} label="Lattice" options={DIFFICULTY_OPTIONS} />;
}

export default BreakoutControls;
