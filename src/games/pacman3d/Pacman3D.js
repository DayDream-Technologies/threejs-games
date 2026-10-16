/**
 * 3D maze chase
 */

import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { commitStatus, useFreshSim, useKeyboard } from '../../lib';
import { WireBox, gridToWorld } from '../../lib/3d';
import { actorPosition, createPacmanSim, stepPacman } from './gameLogic';

const DIR_BY_NAME = {
  posX: [1, 0, 0],
  negX: [-1, 0, 0],
  posY: [0, 1, 0],
  negY: [0, -1, 0],
  posZ: [0, 0, 1],
  negZ: [0, 0, -1]
};

const MAX_CELLS = 11 * 11 * 11;

function worldOf(cell, size, nudge = null) {
  const [x, y, z] = gridToWorld(cell.x, cell.y, cell.z, size, 1);
  if (!nudge) return [x, y, z];
  return [x + nudge.x, y + nudge.y, z + nudge.z];
}

function Field({ simRef, kind }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pelletColor = useMemo(() => new THREE.Color('#f8fafc'), []);
  const powerColor = useMemo(() => new THREE.Color('#ffd93d'), []);
  const wallColor = useMemo(() => new THREE.Color('#9aa6ff'), []);

  useLayoutEffect(() => {
    if (ref.current) ref.current.count = 0;
  }, []);

  useFrame(() => {
    const mesh = ref.current;
    const sim = simRef.current;
    if (!mesh || !sim) return;
    let index = 0;
    if (kind === 'walls') {
      const cells = sim.barriers;
      for (let i = 0; i < cells.length; i += 1) {
        dummy.position.set(...worldOf(cells[i], sim.size));
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
        mesh.setColorAt(index, wallColor);
        index += 1;
      }
    } else {
      const pulse = 1.35 + Math.sin(sim.time * 5) * 0.12;
      for (let i = 0; i < sim.pellets.length; i += 1) {
        const pellet = sim.pellets[i];
        if (pellet.eaten) continue;
        dummy.position.set(...worldOf(pellet, sim.size));
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(pellet.power ? pulse : 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
        mesh.setColorAt(index, pellet.power ? powerColor : pelletColor);
        index += 1;
      }
    }
    mesh.count = index;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[null, null, MAX_CELLS]} frustumCulled={false}>
      {kind === 'walls' ? (
        <boxGeometry args={[0.92, 0.92, 0.92]} />
      ) : (
        <sphereGeometry args={[0.12, 8, 8]} />
      )}
      <meshStandardMaterial
        emissive={kind === 'walls' ? '#4c5ad4' : '#000000'}
        emissiveIntensity={kind === 'walls' ? 0.4 : 0}
        roughness={0.55}
      />
    </instancedMesh>
  );
}

function Actor({ simRef, index, kind }) {
  const ref = useRef();
  const body = useRef();

  useFrame(() => {
    const sim = simRef.current;
    const group = ref.current;
    if (!sim || !group) return;
    const actor = kind === 'player' ? sim.player : sim.ghosts[index];
    if (!actor) return;
    const pos = actorPosition(actor);
    group.position.set(...worldOf(pos, sim.size));
    if (actor.dir) {
      const ahead = {
        x: pos.x + actor.dir[0],
        y: pos.y + actor.dir[1],
        z: pos.z + actor.dir[2]
      };
      const target = worldOf(ahead, sim.size);
      group.lookAt(target[0], target[1], target[2]);
    }
    if (kind === 'player') {
      group.visible = sim.invuln <= 0 || Math.floor(sim.time * 10) % 2 === 0;
    } else if (body.current) {
      const frightened = sim.fright > 0 && actor.waiting <= 0;
      body.current.color.set(frightened ? '#60a5fa' : actor.color);
      group.visible = actor.waiting <= 0;
    }
  });

  if (kind === 'player') {
    return (
      <group ref={ref}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.38, 18, 14]} />
          <meshStandardMaterial color="#ffd93d" emissive="#ffd93d" emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0, 0, -0.28]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.12, 0.28, 8]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={ref}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[0.36, 16, 12]} />
        <meshStandardMaterial ref={body} color="#ef4444" emissive="#111827" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-0.1, 0.12, -0.22]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.1, 0.12, -0.22]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Pacman3D({ gameState, setGameState, difficulty = 'Easy', isPaused = false, mobileActionRef }) {
  const simRef = useFreshSim(gameState.isPlaying, difficulty, createPacmanSim, setGameState);
  const desired = useRef(null);
  const playingRef = useRef(gameState.isPlaying);
  const pausedRef = useRef(isPaused);
  playingRef.current = gameState.isPlaying;
  pausedRef.current = isPaused;

  const setDesired = (dir) => {
    if (!playingRef.current || pausedRef.current) return;
    desired.current = dir;
  };

  useKeyboard({
    enabled: gameState.isPlaying && !isPaused && !gameState.gameLost && !gameState.gameWon,
    keyMap: {
      ArrowLeft: () => setDesired(DIR_BY_NAME.negX),
      ArrowRight: () => setDesired(DIR_BY_NAME.posX),
      ArrowUp: () => setDesired(DIR_BY_NAME.posZ),
      ArrowDown: () => setDesired(DIR_BY_NAME.negZ),
      q: () => setDesired(DIR_BY_NAME.posY),
      e: () => setDesired(DIR_BY_NAME.negY)
    }
  });

  useEffect(() => {
    desired.current = null;
  }, [gameState.isPlaying, difficulty]);

  useEffect(() => {
    if (!mobileActionRef) return undefined;
    mobileActionRef.current = {
      turn: (name) => {
        if (!playingRef.current || pausedRef.current) return;
        const dir = DIR_BY_NAME[name];
        if (dir) desired.current = dir;
      }
    };
    return () => {
      mobileActionRef.current = null;
    };
  }, [mobileActionRef]);

  useFrame((_, rawDt) => {
    const sim = simRef.current;
    if (!sim) return;
    if (playingRef.current && !pausedRef.current && !sim.over) {
      const dirty = stepPacman(sim, Math.min(rawDt, 0.05), desired.current);
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
  });

  const sim = simRef.current;

  return (
    <group>
      <WireBox size={[sim.size, sim.size, sim.size]} color="#4ecdc4" />
      <pointLight position={[0, 0, 0]} intensity={0.7} distance={sim.size * 2} />
      <Field simRef={simRef} kind="walls" />
      <Field simRef={simRef} kind="pellets" />
      <Actor simRef={simRef} kind="player" />
      {sim.ghosts.map((ghost, index) => (
        <Actor key={`${ghost.color}-${index}`} simRef={simRef} kind="ghost" index={index} />
      ))}
    </group>
  );
}

export default Pacman3D;
