/**
 * 3D Pong — player versus a computer paddle inside a cube.
 */

import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { commitStatus, useFreshSim, useHeldKeyMap } from '../../lib';
import { WireBox } from '../../lib/3d';
import { createPongSim, stepPong } from './gameLogic';

const PONG_KEYS = {
  w: 'py',
  s: 'ny',
  a: 'nx',
  d: 'px',
  ArrowUp: 'py',
  ArrowDown: 'ny',
  ArrowLeft: 'nx',
  ArrowRight: 'px'
};

function Paddle({ meshRef, position, size, color }) {
  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[size, size, 0.22]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} />
    </mesh>
  );
}

function Pong3D({ gameState, setGameState, difficulty = 'Easy', isPaused = false, mobileActionRef }) {
  const simRef = useFreshSim(gameState.isPlaying, difficulty, createPongSim, setGameState);
  const held = useHeldKeyMap(PONG_KEYS);
  const playingRef = useRef(gameState.isPlaying);
  const pausedRef = useRef(isPaused);
  const ballRef = useRef();
  const playerRef = useRef();
  const aiRef = useRef();
  playingRef.current = gameState.isPlaying;
  pausedRef.current = isPaused;

  useEffect(() => {
    if (!mobileActionRef) return undefined;
    mobileActionRef.current = {
      hold: (flag, on) => {
        held.current[flag] = on;
      }
    };
    return () => {
      mobileActionRef.current = null;
    };
  }, [mobileActionRef, held]);

  useFrame((_, rawDt) => {
    const sim = simRef.current;
    if (!sim) return;
    if (playingRef.current && !pausedRef.current && !sim.over) {
      const dirty = stepPong(sim, Math.min(rawDt, 0.05), held.current);
      if (dirty) {
        commitStatus(setGameState, {
          score: sim.score,
          lives: sim.lives,
          level: sim.level,
          opponentScore: sim.aiScore,
          gameWon: sim.over === 'win',
          gameLost: sim.over === 'lose'
        });
      }
    }
    if (ballRef.current) ballRef.current.position.set(sim.ball.x, sim.ball.y, sim.ball.z);
    if (playerRef.current) playerRef.current.position.set(sim.playerX, sim.playerY, sim.playerZ);
    if (aiRef.current) aiRef.current.position.set(sim.aiX, sim.aiY, sim.aiZ);
  });

  const sim = simRef.current;
  const span = sim.half * 2;
  const paddleSize = sim.paddle * 2;

  return (
    <group>
      <WireBox size={[span, span, span]} color="#ffd93d" />
      <Paddle
        meshRef={playerRef}
        position={[sim.playerX, sim.playerY, sim.playerZ]}
        size={paddleSize}
        color="#ffd93d"
      />
      <Paddle
        meshRef={aiRef}
        position={[sim.aiX, sim.aiY, sim.aiZ]}
        size={paddleSize}
        color="#ff6b9d"
      />
      <mesh ref={ballRef} position={[sim.ball.x, sim.ball.y, sim.ball.z]}>
        <sphereGeometry args={[0.22, 18, 18]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

export default Pong3D;
