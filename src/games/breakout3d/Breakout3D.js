/**
 * 3D Breakout
 */

import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { commitStatus, useFreshSim, useHeldKeyMap } from '../../lib';
import { WireBox } from '../../lib/3d';
import { BALL_RADIUS, BRICK, LAYER_COLORS } from './config';
import { createBreakoutSim, stepBreakout } from './gameLogic';

const KEYS = {
  w: 'py',
  s: 'ny',
  a: 'nx',
  d: 'px',
  ArrowUp: 'py',
  ArrowDown: 'ny',
  ArrowLeft: 'nx',
  ArrowRight: 'px'
};

const MAX_BRICKS = 9 * 7 * 4;

function BrickField({ simRef }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(() => LAYER_COLORS.map((hex) => new THREE.Color(hex)), []);

  useLayoutEffect(() => {
    if (ref.current) ref.current.count = 0;
  }, []);

  useFrame(() => {
    const mesh = ref.current;
    const sim = simRef.current;
    if (!mesh || !sim) return;
    let index = 0;
    for (let i = 0; i < sim.bricks.length; i += 1) {
      const brick = sim.bricks[i];
      if (!brick.alive) continue;
      dummy.position.set(brick.x, brick.y, brick.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.setColorAt(index, colors[brick.layer % colors.length]);
      index += 1;
    }
    mesh.count = index;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[null, null, MAX_BRICKS]} frustumCulled={false}>
      <boxGeometry args={[BRICK, BRICK, BRICK * 0.82]} />
      <meshStandardMaterial />
    </instancedMesh>
  );
}

function Breakout3D({ gameState, setGameState, difficulty = 'Easy', isPaused = false, mobileActionRef }) {
  const simRef = useFreshSim(gameState.isPlaying, difficulty, createBreakoutSim, setGameState);
  const held = useHeldKeyMap(KEYS);
  const playingRef = useRef(gameState.isPlaying);
  const pausedRef = useRef(isPaused);
  const ballRef = useRef();
  const paddleRef = useRef();
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
      const dirty = stepBreakout(sim, Math.min(rawDt, 0.05), held.current);
      if (dirty) {
        commitStatus(setGameState, {
          score: sim.score,
          lives: sim.lives,
          level: sim.level,
          gameWon: sim.over === 'win',
          gameLost: sim.over === 'lose'
        });
      }
    }
    if (ballRef.current) ballRef.current.position.set(sim.ball.x, sim.ball.y, sim.ball.z);
    if (paddleRef.current) paddleRef.current.position.set(sim.paddleX, sim.paddleY, sim.paddleZ);
  });

  const sim = simRef.current;
  const width = sim.boundX * 2;
  const height = sim.boundY * 2;
  const depth = sim.paddleZ - sim.farZ;

  return (
    <group>
      <group position={[0, 0, (sim.paddleZ + sim.farZ) / 2]}>
        <WireBox size={[width, height, depth]} color="#4ecdc4" />
      </group>
      <BrickField simRef={simRef} />
      <mesh ref={paddleRef} position={[sim.paddleX, sim.paddleY, sim.paddleZ]}>
        <boxGeometry args={[sim.cfg.paddleX * 2, sim.cfg.paddleY * 2, 0.22]} />
        <meshStandardMaterial color="#ffd93d" emissive="#ffd93d" emissiveIntensity={0.2} />
      </mesh>
      <mesh ref={ballRef} position={[sim.ball.x, sim.ball.y, sim.ball.z]}>
        <sphereGeometry args={[BALL_RADIUS, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

export default Breakout3D;
