/**
 * 3D Asteroids
 */

import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { commitStatus, useFreshSim, useHeldKeyMap } from '../../lib';
import { WireBox } from '../../lib/3d';
import { HALF, MAX_BULLETS, ROCK_RADIUS } from './config';
import { createAsteroidsSim, forwardVector, stepAsteroids } from './gameLogic';

const SHIP_KEYS = {
  a: 'yawL',
  d: 'yawR',
  w: 'pitchU',
  s: 'pitchD',
  ArrowLeft: 'yawL',
  ArrowRight: 'yawR',
  ArrowUp: 'pitchU',
  ArrowDown: 'pitchD',
  Shift: 'thrust',
  ' ': 'fire'
};

function RockField({ simRef, size, color }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (ref.current) ref.current.count = 0;
  }, []);

  useFrame(() => {
    const mesh = ref.current;
    const sim = simRef.current;
    if (!mesh || !sim) return;
    let index = 0;
    for (let i = 0; i < sim.rocks.length; i += 1) {
      const rock = sim.rocks[i];
      if (rock.size !== size) continue;
      dummy.position.set(rock.x, rock.y, rock.z);
      dummy.rotation.set(rock.rx, rock.ry, rock.rz);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      index += 1;
    }
    mesh.count = index;
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[null, null, 48]} frustumCulled={false}>
      <icosahedronGeometry args={[ROCK_RADIUS[size], 0]} />
      <meshStandardMaterial color={color} flatShading />
    </instancedMesh>
  );
}

function Bullets({ simRef }) {
  const refs = useRef([]);

  useFrame(() => {
    const sim = simRef.current;
    if (!sim) return;
    for (let i = 0; i < MAX_BULLETS; i += 1) {
      const mesh = refs.current[i];
      const bullet = sim.bullets[i];
      if (!mesh) continue;
      mesh.visible = !!bullet;
      if (bullet) mesh.position.set(bullet.x, bullet.y, bullet.z);
    }
  });

  return (
    <group>
      {Array.from({ length: MAX_BULLETS }, (_, index) => (
        <mesh
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          visible={false}
        >
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#ffd93d" emissive="#ffd93d" emissiveIntensity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function Asteroids3D({ gameState, setGameState, difficulty = 'Easy', isPaused = false, mobileActionRef }) {
  const simRef = useFreshSim(gameState.isPlaying, difficulty, createAsteroidsSim, setGameState);
  const held = useHeldKeyMap(SHIP_KEYS);
  const playingRef = useRef(gameState.isPlaying);
  const pausedRef = useRef(isPaused);
  const shipRef = useRef();
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
      const dirty = stepAsteroids(sim, Math.min(rawDt, 0.05), held.current);
      if (dirty) {
        commitStatus(setGameState, {
          score: sim.score,
          lives: sim.lives,
          level: sim.level,
          gameWon: false,
          gameLost: sim.over === 'lose'
        });
      }
    }
    const ship = shipRef.current;
    if (!ship) return;
    const body = sim.ship;
    ship.position.set(body.x, body.y, body.z);
    const forward = forwardVector(body.yaw, body.pitch);
    ship.lookAt(body.x + forward.x, body.y + forward.y, body.z + forward.z);
    ship.visible = body.invuln <= 0 || Math.floor(sim.time * 10) % 2 === 0;
  });

  return (
    <group>
      <WireBox size={[HALF * 2, HALF * 2, HALF * 2]} color="#4ecdc4" />
      <group ref={shipRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.32, 1.05, 10]} />
          <meshStandardMaterial color="#4ecdc4" emissive="#4ecdc4" emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.42]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#ff6b9d" emissive="#ff6b9d" emissiveIntensity={0.6} />
        </mesh>
      </group>
      <RockField simRef={simRef} size={3} color="#94a3b8" />
      <RockField simRef={simRef} size={2} color="#ffd93d" />
      <RockField simRef={simRef} size={1} color="#ff6b9d" />
      <Bullets simRef={simRef} />
    </group>
  );
}

export default Asteroids3D;
