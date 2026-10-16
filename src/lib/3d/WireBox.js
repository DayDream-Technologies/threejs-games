/**
 * Axis-aligned wire cube centered on the origin.
 */

import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';

const EDGE_INDEX = [
  [0, 1], [0, 2], [0, 4],
  [1, 3], [1, 5],
  [2, 3], [2, 6],
  [3, 7],
  [4, 5], [4, 6],
  [5, 7],
  [6, 7]
];

function WireBox({ size = [1, 1, 1], color = '#4ecdc4' }) {
  const [sx, sy, sz] = size;

  const segments = useMemo(() => {
    const corners = [
      [-sx / 2, -sy / 2, -sz / 2],
      [sx / 2, -sy / 2, -sz / 2],
      [-sx / 2, sy / 2, -sz / 2],
      [sx / 2, sy / 2, -sz / 2],
      [-sx / 2, -sy / 2, sz / 2],
      [sx / 2, -sy / 2, sz / 2],
      [-sx / 2, sy / 2, sz / 2],
      [sx / 2, sy / 2, sz / 2]
    ];
    return EDGE_INDEX.map(([a, b]) => [corners[a], corners[b]]);
  }, [sx, sy, sz]);

  return (
    <group>
      {segments.map((points, index) => (
        <Line key={index} points={points} color={color} lineWidth={1} />
      ))}
    </group>
  );
}

export default WireBox;
