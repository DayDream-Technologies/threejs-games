/**
 * 3D Snake
 */

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import { gridToWorld, WireBox } from '../../lib/3d';
import { commitStatus, useKeyboard } from '../../lib';
import { tickMsFor } from './config';
import { createSnakeSession, opposite, stepSnake } from './gameLogic';

const DIR_BY_NAME = {
  posX: [1, 0, 0],
  negX: [-1, 0, 0],
  posY: [0, 1, 0],
  negY: [0, -1, 0],
  posZ: [0, 0, 1],
  negZ: [0, 0, -1]
};

function CellBox({ cell, size, color, scale = 0.82 }) {
  const position = gridToWorld(cell.x, cell.y, cell.z, size, 1);
  return (
    <Box position={position} args={[scale, scale, scale]}>
      <meshStandardMaterial color={color} />
    </Box>
  );
}

function Snake3D({
  gameState,
  setGameState,
  difficulty = 'Easy',
  isPaused = false,
  mobileActionRef
}) {
  const [session, setSession] = useState(() => createSnakeSession(difficulty));
  const [wasPlaying, setWasPlaying] = useState(false);
  const sessionRef = useRef(session);
  const queue = useRef([...session.dir]);
  const acc = useRef(0);
  const playingRef = useRef(gameState.isPlaying);
  const pausedRef = useRef(isPaused);
  const difficultyRef = useRef(difficulty);
  playingRef.current = gameState.isPlaying;
  pausedRef.current = isPaused;
  difficultyRef.current = difficulty;

  if (gameState.isPlaying !== wasPlaying) {
    setWasPlaying(gameState.isPlaying);
    if (gameState.isPlaying) {
      const next = createSnakeSession(difficulty);
      sessionRef.current = next;
      queue.current = [...next.dir];
      acc.current = 0;
      setSession(next);
    }
  } else {
    sessionRef.current = session;
  }

  const turn = (dir) => {
    if (!playingRef.current || pausedRef.current) return;
    const current = sessionRef.current?.dir;
    if (current && opposite(current, dir)) return;
    queue.current = dir;
  };

  useKeyboard({
    enabled: gameState.isPlaying && !isPaused && !gameState.gameLost,
    keyMap: {
      ArrowLeft: () => turn(DIR_BY_NAME.negX),
      ArrowRight: () => turn(DIR_BY_NAME.posX),
      ArrowUp: () => turn(DIR_BY_NAME.posZ),
      ArrowDown: () => turn(DIR_BY_NAME.negZ),
      q: () => turn(DIR_BY_NAME.posY),
      e: () => turn(DIR_BY_NAME.negY)
    }
  });

  const turnRef = useRef(turn);
  turnRef.current = turn;

  React.useEffect(() => {
    if (!mobileActionRef) return undefined;
    mobileActionRef.current = {
      turn: (name) => {
        const dir = DIR_BY_NAME[name];
        if (dir) turnRef.current(dir);
      }
    };
    return () => {
      mobileActionRef.current = null;
    };
  }, [mobileActionRef]);

  React.useEffect(() => {
    if (!gameState.isPlaying) return;
    setGameState((prev) => ({
      ...prev,
      score: 0,
      lives: 1,
      level: 1,
      gameWon: false,
      gameLost: false
    }));
  }, [gameState.isPlaying, setGameState]);

  useFrame((_, rawDt) => {
    if (!playingRef.current || pausedRef.current) {
      acc.current = 0;
      return;
    }
    const current = sessionRef.current;
    if (!current?.alive) return;

    acc.current += Math.min(rawDt, 0.05) * 1000;
    const need = tickMsFor(difficultyRef.current, current.foods);
    if (acc.current < need) return;
    acc.current = 0;

    const result = stepSnake(current, queue.current);
    sessionRef.current = result.session;
    setSession(result.session);
    if (result.dirty) commitStatus(setGameState, result.status);
  });

  const size = session.size;

  return (
    <group>
      <WireBox size={[size, size, size]} color="#4ecdc4" />
      {session.obstacles.map((cell) => (
        <CellBox key={`o-${cell.x}-${cell.y}-${cell.z}`} cell={cell} size={size} color="#64748b" scale={0.78} />
      ))}
      {session.food && (
        <mesh position={gridToWorld(session.food.x, session.food.y, session.food.z, size, 1)}>
          <sphereGeometry args={[0.34, 16, 16]} />
          <meshStandardMaterial color="#ff6b9d" emissive="#ff6b9d" emissiveIntensity={0.45} />
        </mesh>
      )}
      {session.snake.map((cell, index) => (
        <CellBox
          key={`s-${index}-${cell.x}-${cell.y}-${cell.z}`}
          cell={cell}
          size={size}
          color={index === 0 ? '#4ecdc4' : '#10b981'}
          scale={index === 0 ? 0.9 : 0.78}
        />
      ))}
    </group>
  );
}

export default Snake3D;
