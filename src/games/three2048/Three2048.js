import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text, Edges, Cone, Cylinder } from '@react-three/drei';
import {
  GRID,
  cloneBoard,
  applyMove,
  spawnRandomTile,
  hasAnyMove,
  hasReachedWin,
  createInitialBoard,
  createEmptyBoard,
  WIN_VALUE
} from './gameLogic';
import {
  CUBE_CONFIG,
  BOARD_OUTLINE_COLOR,
  getBoardOuterExtent,
  getTileBackgroundColor,
  getTileTextColor,
  formatCubeLabel,
  formatWinLabel
} from './config';

const OFFSET = ((GRID - 1) * CUBE_CONFIG.spacing) / 2;
const BOARD_EXTENT = getBoardOuterExtent(GRID, CUBE_CONFIG.spacing, CUBE_CONFIG.size);

const KEY_TO_DIR = {
  ArrowLeft: 'negX',
  ArrowRight: 'posX',
  ArrowUp: 'posZ',
  ArrowDown: 'negZ',
  ' ': 'posY'
};

/** 3D arrow + key label (same pattern as Tetris `DirectionIndicators`) */
function ControlArrow({ position, rotation, color, label, labelOffset = [0, 0.45, 0], labelFontSize = 0.22 }) {
  return (
    <group position={position} rotation={rotation} raycast={() => null}>
      <Cylinder args={[0.06, 0.06, 0.55, 8]} position={[0, 0.28, 0]} raycast={() => null}>
        <meshStandardMaterial color={color} />
      </Cylinder>
      <Cone args={[0.14, 0.28, 8]} position={[0, 0.72, 0]} raycast={() => null}>
        <meshStandardMaterial color={color} />
      </Cone>
      <Text position={labelOffset} fontSize={labelFontSize} color="#f3f4f6" anchorX="center" anchorY="middle" raycast={null}>
        {label}
      </Text>
    </group>
  );
}

/** Downward-pointing arrow only (label rendered separately so text stays upright) */
function DownArrowWithLabel({ color }) {
  return (
    <group position={[0, -0.5, 0]} raycast={() => null}>
      <group rotation={[Math.PI, 0, 0]} raycast={() => null}>
        <Cylinder args={[0.06, 0.06, 0.55, 8]} position={[0, 0.28, 0]} raycast={() => null}>
          <meshStandardMaterial color={color} />
        </Cylinder>
        <Cone args={[0.14, 0.28, 8]} position={[0, 0.72, 0]} raycast={() => null}>
          <meshStandardMaterial color={color} />
        </Cone>
      </group>
      <Text position={[0, -0.42, 0]} fontSize={0.22} color="#f3f4f6" anchorX="center" anchorY="middle" raycast={null}>
        Shift
      </Text>
    </group>
  );
}

/** Movement key hints above the board (arrow keys + Space / Shift on Y) */
function DirectionIndicators2048() {
  const topFaceY = OFFSET + CUBE_CONFIG.size / 2;
  const baseY = topFaceY + 1.5;
  /** L/R spacing (X) — tight cluster with Space/Shift */
  const spreadLR = 0.58;
  /** Up/Down along Z (camera sits at +Z: −Z is “into” the screen, +Z toward viewer) */
  const spreadZ = 0.58;
  const yzLabel = 0.22;
  const spaceShiftY = 0.5;

  return (
    <group position={[0, baseY, 0]} raycast={() => null}>
      <Text position={[0, 1.05, 0]} fontSize={0.26} color="#94a3b8" anchorX="center" anchorY="middle" raycast={null}>
        Controls
      </Text>

      {/* L / R on X */}
      <ControlArrow
        position={[-spreadLR, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        color="#ef4444"
        label="L"
        labelOffset={[-0.22, 0.28, 0]}
      />
      <ControlArrow
        position={[spreadLR, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        color="#22c55e"
        label="R"
        labelOffset={[0.22, 0.28, 0]}
      />
      {/*
        Arrow Up → +Z slide: indicator on −Z side, arrow still points +Z.
        Arrow Down → −Z slide: indicator on +Z side, arrow still points −Z.
        (Swapped from before so labels match screen depth vs default camera.)
      */}
      <ControlArrow
        position={[0, 0, -spreadZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        color="#3b82f6"
        label="Up"
        labelOffset={[0, 0.28, -yzLabel]}
        labelFontSize={0.19}
      />
      <ControlArrow
        position={[0, 0, spreadZ]}
        rotation={[Math.PI / 2, 0, 0]}
        color="#f59e0b"
        label="Down"
        labelOffset={[0, 0.28, yzLabel]}
        labelFontSize={0.19}
      />

      {/* Space = +Y, Shift = −Y — tucked in with L/R */}
      <ControlArrow
        position={[0, spaceShiftY, 0]}
        rotation={[0, 0, 0]}
        color="#a855f7"
        label="Space"
        labelOffset={[0, 0.42, 0]}
      />
      <DownArrowWithLabel color="#06b6d4" />
    </group>
  );
}

/** Gentle scale pulse on tiles that satisfy the win condition while the win modal is open */
function WinPulseGroup({ active, children }) {
  const groupRef = useRef(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    if (active) {
      const s = 1 + 0.08 * Math.sin(state.clock.elapsedTime * 2.8);
      groupRef.current.scale.setScalar(s);
    } else {
      groupRef.current.scale.setScalar(1);
    }
  });
  useEffect(() => {
    if (!active && groupRef.current) {
      groupRef.current.scale.setScalar(1);
    }
  }, [active]);
  return <group ref={groupRef}>{children}</group>;
}

function Three2048({ gameState, setGameState, mobileActionRef }) {
  const [board, setBoard] = useState(() => createEmptyBoard());
  const winAnnouncedRef = useRef(false);
  const playingRef = useRef(gameState.isPlaying);
  const wasPlayingRef = useRef(false);

  useEffect(() => {
    playingRef.current = gameState.isPlaying && !gameState.winPendingChoice;
  }, [gameState.isPlaying, gameState.winPendingChoice]);

  useEffect(() => {
    if (gameState.isPlaying && !wasPlayingRef.current) {
      winAnnouncedRef.current = false;
      setBoard(createInitialBoard());
      setGameState((prev) => ({
        ...prev,
        score: 0,
        gameWon: false,
        gameLost: false,
        winPendingChoice: false
      }));
    }
    wasPlayingRef.current = gameState.isPlaying;
  }, [gameState.isPlaying, setGameState]);

  const applyDirection = useCallback(
    (dir) => {
      if (!playingRef.current) return;

      setBoard((prev) => {
        const next = cloneBoard(prev);
        const { score: moveScore, changed } = applyMove(next, dir);
        if (!changed) return prev;

        spawnRandomTile(next);

        setGameState((gs) => {
          if (gs.gameLost) return gs;
          const newScore = gs.score + moveScore;
          let gameWon = gs.gameWon;
          let winPendingChoice = gs.winPendingChoice ?? false;
          if (!winAnnouncedRef.current && hasReachedWin(next)) {
            winAnnouncedRef.current = true;
            gameWon = true;
            winPendingChoice = true;
          }
          const lost = !hasAnyMove(next);
          const gameLost = lost && !gameWon;
          return {
            ...gs,
            score: newScore,
            gameWon,
            gameLost,
            winPendingChoice,
            isPlaying: gameLost ? false : gs.isPlaying
          };
        });

        return next;
      });
    },
    [setGameState]
  );

  useEffect(() => {
    if (!mobileActionRef) return;
    mobileActionRef.current = {
      applyDirection: (dir) => applyDirection(dir)
    };
    return () => {
      mobileActionRef.current = null;
    };
  }, [mobileActionRef, applyDirection]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!playingRef.current) return;

      let dir = KEY_TO_DIR[e.key];
      if (e.key === 'Shift') {
        dir = 'negY';
      }
      if (!dir) return;

      if (e.repeat) return;
      e.preventDefault();
      applyDirection(dir);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [applyDirection]);

  const cubes = [];
  for (let x = 0; x < GRID; x++) {
    for (let y = 0; y < GRID; y++) {
      for (let z = 0; z < GRID; z++) {
        const v = board[x][y][z];
        if (v === 0) continue;
        const px = x * CUBE_CONFIG.spacing - OFFSET;
        const py = y * CUBE_CONFIG.spacing - OFFSET;
        const pz = z * CUBE_CONFIG.spacing - OFFSET;
        const bg = getTileBackgroundColor(v);
        const fg = getTileTextColor(v);
        cubes.push({ x, y, z, px, py, pz, v, bg, fg });
      }
    }
  }

  const showGameOver = gameState.gameLost;
  const winModalOpen = !!gameState.winPendingChoice;
  const pulseWinTiles = winModalOpen;

  return (
    <group>
      <DirectionIndicators2048 />

      {/* Outer shell: top, sides, and bottom edges of the full board */}
      <Box
        args={[BOARD_EXTENT, BOARD_EXTENT, BOARD_EXTENT]}
        raycast={() => null}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        <Edges color={BOARD_OUTLINE_COLOR} threshold={15} />
      </Box>

      {cubes.map(({ x, y, z, px, py, pz, v, bg, fg }) => {
        const isWinningTile = v >= WIN_VALUE;
        const inner = (
          <group>
            <Box args={[CUBE_CONFIG.size, CUBE_CONFIG.size, CUBE_CONFIG.size]}>
              <meshStandardMaterial color={bg} />
              <Edges scale={1.001} color={CUBE_CONFIG.edgeColor} threshold={15} />
            </Box>
            <Text raycast={null} position={[0, 0, 0.41]} fontSize={0.2} color={fg} anchorX="center" anchorY="middle">
              {formatCubeLabel(v)}
            </Text>
            <Text
              raycast={null}
              position={[0, 0, -0.41]}
              rotation={[0, Math.PI, 0]}
              fontSize={0.2}
              color={fg}
              anchorX="center"
              anchorY="middle"
            >
              {formatCubeLabel(v)}
            </Text>
            <Text
              raycast={null}
              position={[0.41, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
              fontSize={0.2}
              color={fg}
              anchorX="center"
              anchorY="middle"
            >
              {formatCubeLabel(v)}
            </Text>
            <Text
              raycast={null}
              position={[-0.41, 0, 0]}
              rotation={[0, -Math.PI / 2, 0]}
              fontSize={0.2}
              color={fg}
              anchorX="center"
              anchorY="middle"
            >
              {formatCubeLabel(v)}
            </Text>
            <Text
              raycast={null}
              position={[0, 0.41, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.2}
              color={fg}
              anchorX="center"
              anchorY="middle"
            >
              {formatCubeLabel(v)}
            </Text>
            <Text
              raycast={null}
              position={[0, -0.41, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              fontSize={0.2}
              color={fg}
              anchorX="center"
              anchorY="middle"
            >
              {formatCubeLabel(v)}
            </Text>
          </group>
        );
        return (
          <group key={`${x}-${y}-${z}`} position={[px, py, pz]}>
            {isWinningTile && pulseWinTiles ? (
              <WinPulseGroup active={pulseWinTiles}>{inner}</WinPulseGroup>
            ) : (
              inner
            )}
          </group>
        );
      })}

      {gameState.gameWon && !winModalOpen && (
        <Text position={[0, OFFSET + 1.1, 0]} fontSize={0.34} color="#10b981" anchorX="center" anchorY="middle">
          {`${formatWinLabel()} — keep going!`}
        </Text>
      )}
      {showGameOver && (
        <Text
          position={[0, OFFSET + (gameState.gameWon && !winModalOpen ? 1.65 : 1.1), 0]}
          fontSize={0.45}
          color="#ef4444"
          anchorX="center"
          anchorY="middle"
        >
          Game Over
        </Text>
      )}
    </group>
  );
}

export default Three2048;
