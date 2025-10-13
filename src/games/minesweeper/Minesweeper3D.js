import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Box, Text, Edges } from '@react-three/drei';
import { useRef } from 'react';

const GRID_SIZE = 5; // 5x5x5
const NUM_BOMBS = 30;

const colors = {
  neutral: '#9ca3af', // gray
  revealed: '#e5e7eb', // light gray
  bomb: '#ef4444', // red (only used on game over reveal)
  flag: '#3b82f6', // blue
  correctFlag: '#10b981' // green (correctly flagged bombs)
};

function getNeighbors(x, y, z) {
  const neighbors = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (dx === 0 && dy === 0 && dz === 0) continue;
        const nx = x + dx, ny = y + dy, nz = z + dz;
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && nz >= 0 && nz < GRID_SIZE) {
          neighbors.push([nx, ny, nz]);
        }
      }
    }
  }
  return neighbors;
}

function generateBoard() {
  const board = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    board[x] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      board[x][y] = [];
      for (let z = 0; z < GRID_SIZE; z++) {
        board[x][y][z] = {
          bomb: false,
          revealed: false,
          flagged: false,
          count: 0,
          removed: false
        };
      }
    }
  }

  // place bombs
  const coords = [];
  for (let x = 0; x < GRID_SIZE; x++)
    for (let y = 0; y < GRID_SIZE; y++)
      for (let z = 0; z < GRID_SIZE; z++)
        coords.push([x, y, z]);

  // shuffle and take NUM_BOMBS
  for (let i = coords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [coords[i], coords[j]] = [coords[j], coords[i]];
  }
  const bombs = coords.slice(0, NUM_BOMBS);
  bombs.forEach(([x, y, z]) => {
    board[x][y][z].bomb = true;
  });

  // compute counts
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        if (board[x][y][z].bomb) continue;
        const neighbors = getNeighbors(x, y, z);
        let count = 0;
        for (const [nx, ny, nz] of neighbors) {
          if (board[nx][ny][nz].bomb) count++;
        }
        board[x][y][z].count = count;
      }
    }
  }

  return board;
}

function Minesweeper3D({ gameState, setGameState, flagMode, hintFunctionRef }) {
  const [board, setBoard] = useState(() => generateBoard());
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const isDraggingRef = useRef(false);
  const pointerDownPos = useRef([0, 0]);
  const rightClickProcessedRef = useRef(false);
  const hasStartedRef = useRef(false);
  const DRAG_THRESHOLD = 4; // pixels

  // center grid around origin with spacing
  const spacing = 0.9;
  const offset = (GRID_SIZE - 1) * spacing * 0.5;

  // bombs remaining derived from flags
  const bombsRemaining = useMemo(() => {
    let flagged = 0;
    for (let x = 0; x < GRID_SIZE; x++)
      for (let y = 0; y < GRID_SIZE; y++)
        for (let z = 0; z < GRID_SIZE; z++)
          if (board[x][y][z].flagged) flagged++;
    return Math.max(NUM_BOMBS - flagged, 0);
  }, [board]);

  useEffect(() => {
    setGameState(prev => ({ ...prev, bombsRemaining }));
  }, [bombsRemaining, setGameState]);

  const revealZerosFlood = useCallback((startX, startY, startZ, draft) => {
    const queue = [[startX, startY, startZ]];
    const visited = new Set();
    const key = (x, y, z) => `${x},${y},${z}`;
    while (queue.length) {
      const [x, y, z] = queue.shift();
      const k = key(x, y, z);
      if (visited.has(k)) continue;
      visited.add(k);
      const cell = draft[x][y][z];
      if (cell.removed || cell.revealed) continue;
      cell.revealed = true;
      if (cell.count === 0) {
        for (const [nx, ny, nz] of getNeighbors(x, y, z)) {
          const neighbor = draft[nx][ny][nz];
          if (!neighbor.revealed && !neighbor.removed && !neighbor.bomb) {
            queue.push([nx, ny, nz]);
          }
        }
      }
    }
  }, []);

  const checkVictory = useCallback((draft) => {
    for (let x = 0; x < GRID_SIZE; x++)
      for (let y = 0; y < GRID_SIZE; y++)
        for (let z = 0; z < GRID_SIZE; z++) {
          const c = draft[x][y][z];
          if (!c.bomb && !c.revealed) return false;
        }
    return true;
  }, []);

  const useHint = useCallback(() => {
    if (gameOver || victory) return;
    
    // Find all non-bomb cubes adjacent to revealed cubes
    const adjacentCubes = [];
    
    // First, try to find cubes adjacent to revealed cubes
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let z = 0; z < GRID_SIZE; z++) {
          const cell = board[x][y][z];
          
          if (!cell.bomb && !cell.revealed && !cell.flagged) {
            // Check if this cube is adjacent to any revealed cube
            const neighbors = getNeighbors(x, y, z);
            const hasRevealedNeighbor = neighbors.some(([nx, ny, nz]) => {
              return board[nx][ny][nz].revealed;
            });
            
            if (hasRevealedNeighbor) {
              adjacentCubes.push([x, y, z]);
            }
          }
        }
      }
    }
    
    let hintCubes = adjacentCubes;
    
    // If no cubes adjacent to revealed cubes, fall back to outer layer
    if (adjacentCubes.length === 0) {
      const outsideCubes = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          for (let z = 0; z < GRID_SIZE; z++) {
            const cell = board[x][y][z];
            // Check if it's on the outside (at least one coordinate is 0 or GRID_SIZE-1)
            const isOutside = x === 0 || x === GRID_SIZE - 1 || 
                             y === 0 || y === GRID_SIZE - 1 || 
                             z === 0 || z === GRID_SIZE - 1;
            
            if (isOutside && !cell.bomb && !cell.revealed && !cell.flagged) {
              outsideCubes.push([x, y, z]);
            }
          }
        }
      }
      hintCubes = outsideCubes;
    }
    
    if (hintCubes.length === 0) {
      return false; // Signal to parent that no hints are available
    }
    
    // Pick a random hint cube
    const randomIndex = Math.floor(Math.random() * hintCubes.length);
    const [hintX, hintY, hintZ] = hintCubes[randomIndex];
    
    setBoard(prev => {
      const draft = prev.map(col => col.map(row => row.slice()));
      const cell = draft[hintX][hintY][hintZ];
      
      if (cell.count === 0) {
        revealZerosFlood(hintX, hintY, hintZ, draft);
      } else {
        cell.revealed = true;
      }
      
      if (checkVictory(draft)) {
        setVictory(true);
        setGameState(prevGs => ({ ...prevGs, isPlaying: false }));
      }
      
      return draft;
    });
    
  }, [board, gameOver, victory, revealZerosFlood, checkVictory, setGameState]);

  // Store hint function in ref for parent access
  useEffect(() => {
    if (hintFunctionRef) {
      hintFunctionRef.current = useHint;
    }
  }, [useHint, hintFunctionRef]);

  const onPointerDown = useCallback((e, x, y, z) => {
    if (e && e.pointer) {
      pointerDownPos.current = [e.pointer.x, e.pointer.y];
    } else if (e && e.clientX != null) {
      pointerDownPos.current = [e.clientX, e.clientY];
    }
    isDraggingRef.current = false;
  }, []);

  const onPointerMove = useCallback((e) => {
    const [sx, sy] = pointerDownPos.current;
    const cx = e.pointer?.x ?? e.clientX ?? sx;
    const cy = e.pointer?.y ?? e.clientY ?? sy;
    const dx = Math.abs(cx - sx);
    const dy = Math.abs(cy - sy);
    if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
      isDraggingRef.current = true;
    }
  }, []);

  const onPointerUp = useCallback((e, x, y, z) => {
    // Pointer up event handler - currently not used but kept for future functionality
  }, []);

  const onLeftClick = useCallback((e, x, y, z) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isDraggingRef.current) return; // treat as navigation, ignore click
    if (gameOver || victory) return;
    
    // If flag mode is enabled, treat left click as right click (flag toggle)
    if (flagMode) {
      setBoard(prev => {
        // Check if this cell has already been processed in this click
        if (rightClickProcessedRef.current) {
          return prev;
        }
        
        rightClickProcessedRef.current = true;
        
        const draft = prev.map(col => col.map(row => row.slice()));
        const cell = draft[x][y][z];
        
        if (cell.removed || cell.revealed) {
          rightClickProcessedRef.current = false;
          return prev;
        }
        
        cell.flagged = !cell.flagged;
        return draft;
      });
      
      // Reset the flag after a short delay to allow for the next legitimate click
      setTimeout(() => {
        rightClickProcessedRef.current = false;
      }, 100);
      return;
    }
    
    // Normal left click behavior (reveal cells)
    setBoard(prev => {
      const draft = prev.map(col => col.map(row => row.slice()));
      const cell = draft[x][y][z];
      if (cell.removed || cell.flagged || cell.revealed) return prev;
      if (cell.bomb) {
        // game over: reveal bombs
        for (let i = 0; i < GRID_SIZE; i++)
          for (let j = 0; j < GRID_SIZE; j++)
            for (let k = 0; k < GRID_SIZE; k++)
              if (draft[i][j][k].bomb) draft[i][j][k].revealed = true;
        setGameOver(true);
        setGameState(prevGs => ({ ...prevGs, isPlaying: false }));
        return draft;
      }
      if (cell.count === 0) {
        revealZerosFlood(x, y, z, draft);
      } else {
        cell.revealed = true;
      }
      if (checkVictory(draft)) {
        setVictory(true);
        setGameState(prevGs => ({ ...prevGs, isPlaying: false }));
      }
      return draft;
    });
  }, [gameOver, victory, revealZerosFlood, checkVictory, setGameState, flagMode]);

  const onRightClick = useCallback((e, x, y, z) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (e && e.nativeEvent && e.nativeEvent.preventDefault) e.nativeEvent.preventDefault();
    if (isDraggingRef.current) return; // navigation drag, ignore
    if (gameOver || victory) return;
    
    setBoard(prev => {
      // Check if this cell has already been processed in this click
      if (rightClickProcessedRef.current) {
        return prev;
      }
      
      rightClickProcessedRef.current = true;
      
      const draft = prev.map(col => col.map(row => row.slice()));
      const cell = draft[x][y][z];
      
      if (cell.removed || cell.revealed) {
        rightClickProcessedRef.current = false;
        return prev;
      }
      
      cell.flagged = !cell.flagged;
      return draft;
    });
    
    // Reset the flag after a short delay to allow for the next legitimate right click
    setTimeout(() => {
      rightClickProcessedRef.current = false;
    }, 100);
  }, [gameOver, victory]);

  const onDoubleClick = useCallback((e, x, y, z) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isDraggingRef.current) return; // ignore after rotate drag
    if (gameOver || victory) return;
    setBoard(prev => {
      const draft = prev.map(col => col.map(row => row.slice()));
      const cell = draft[x][y][z];
      if (cell.bomb) return prev; // cannot double-click bombs (would have ended game on first click)
      if (!cell.revealed) return prev; // only remove if revealed
      cell.removed = true; // no longer rendered
      return draft;
    });
  }, [gameOver, victory]);

  // Auto-start game when component loads and reset when game starts again
  useEffect(() => {
    if (gameState.isPlaying) {
      setBoard(generateBoard());
      setGameOver(false);
      setVictory(false);
      hasStartedRef.current = true;
    } else if (!hasStartedRef.current) {
      // Auto-start the game only on initial component load
      setGameState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [gameState.isPlaying, setGameState]);

  const cubes = [];
  for (let x = 0; x < GRID_SIZE; x++)
    for (let y = 0; y < GRID_SIZE; y++)
      for (let z = 0; z < GRID_SIZE; z++) {
        const cell = board[x][y][z];
        if (cell.removed) continue;
        const px = x * spacing - offset;
        const py = y * spacing - offset;
        const pz = z * spacing - offset;
        let color = colors.neutral;
        if (cell.flagged) color = colors.flag;
        if (cell.revealed && !cell.bomb) color = colors.revealed;
        if (cell.revealed && cell.bomb) color = colors.bomb;
        // When game is over, correctly flagged bombs should be green
        if (gameOver && cell.bomb && cell.flagged) color = colors.correctFlag;
        cubes.push({ x, y, z, px, py, pz, color, cell });
      }

  return (
    <group>
      {cubes.map(({ x, y, z, px, py, pz, color, cell }) => (
        <group key={`${x}-${y}-${z}`} position={[px, py, pz]}>
          <Box args={[0.8, 0.8, 0.8]}
            onClick={(e) => onLeftClick(e, x, y, z)}
            onContextMenu={(e) => onRightClick(e, x, y, z)}
            onDoubleClick={(e) => onDoubleClick(e, x, y, z)}
            onPointerDown={(e) => onPointerDown(e, x, y, z)}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => onPointerUp(e, x, y, z)}
          >
            <meshStandardMaterial color={color} />
            <Edges scale={1.001} color="#ffffff" threshold={15} />
          </Box>
          {cell.flagged && (
            <>
              {/* Flag on front face */}
              <group raycast={null} position={[0, 0, 0.41]}>
                <Box args={[0.02, 0.3, 0.02]} position={[-0.1, 0, 0]}>
                  <meshStandardMaterial color="#8b4513" />
                </Box>
                <Box args={[0.2, 0.12, 0.02]} position={[0, 0.09, 0]}>
                  <meshStandardMaterial color="#ff0000" />
                </Box>
              </group>
              {/* Flag on back face */}
              <group raycast={null} position={[0, 0, -0.41]} rotation={[0, Math.PI, 0]}>
                <Box args={[0.02, 0.3, 0.02]} position={[-0.1, 0, 0]}>
                  <meshStandardMaterial color="#8b4513" />
                </Box>
                <Box args={[0.2, 0.12, 0.02]} position={[0, 0.09, 0]}>
                  <meshStandardMaterial color="#ff0000" />
                </Box>
              </group>
              {/* Flag on right face */}
              <group raycast={null} position={[0.41, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <Box args={[0.02, 0.3, 0.02]} position={[-0.1, 0, 0]}>
                  <meshStandardMaterial color="#8b4513" />
                </Box>
                <Box args={[0.2, 0.12, 0.02]} position={[0, 0.09, 0]}>
                  <meshStandardMaterial color="#ff0000" />
                </Box>
              </group>
              {/* Flag on left face */}
              <group raycast={null} position={[-0.41, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <Box args={[0.02, 0.3, 0.02]} position={[-0.1, 0, 0]}>
                  <meshStandardMaterial color="#8b4513" />
                </Box>
                <Box args={[0.2, 0.12, 0.02]} position={[0, 0.09, 0]}>
                  <meshStandardMaterial color="#ff0000" />
                </Box>
              </group>
              {/* Flag on top face */}
              <group raycast={null} position={[0, 0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <Box args={[0.02, 0.3, 0.02]} position={[-0.1, 0, 0]}>
                  <meshStandardMaterial color="#8b4513" />
                </Box>
                <Box args={[0.2, 0.12, 0.02]} position={[0, 0.09, 0]}>
                  <meshStandardMaterial color="#ff0000" />
                </Box>
              </group>
              {/* Flag on bottom face */}
              <group raycast={null} position={[0, -0.41, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <Box args={[0.02, 0.3, 0.02]} position={[-0.1, 0, 0]}>
                  <meshStandardMaterial color="#8b4513" />
                </Box>
                <Box args={[0.2, 0.12, 0.02]} position={[0, 0.09, 0]}>
                  <meshStandardMaterial color="#ff0000" />
                </Box>
              </group>
            </>
          )}
          {cell.revealed && !cell.bomb && !cell.flagged && cell.count > 0 && (
            <>
              <Text raycast={null} position={[0, 0, 0.41]} fontSize={0.25} color="#111827" anchorX="center" anchorY="middle">{String(cell.count)}</Text>
              <Text raycast={null} position={[0, 0, -0.41]} rotation={[0, Math.PI, 0]} fontSize={0.25} color="#111827" anchorX="center" anchorY="middle">{String(cell.count)}</Text>
              <Text raycast={null} position={[0.41, 0, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.25} color="#111827" anchorX="center" anchorY="middle">{String(cell.count)}</Text>
              <Text raycast={null} position={[-0.41, 0, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.25} color="#111827" anchorX="center" anchorY="middle">{String(cell.count)}</Text>
              <Text raycast={null} position={[0, 0.41, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.25} color="#111827" anchorX="center" anchorY="middle">{String(cell.count)}</Text>
              <Text raycast={null} position={[0, -0.41, 0]} rotation={[Math.PI / 2, 0, 0]} fontSize={0.25} color="#111827" anchorX="center" anchorY="middle">{String(cell.count)}</Text>
            </>
          )}
        </group>
      ))}
      {(gameOver || victory) && (
        <Text position={[0, offset + 1.2, 0]} fontSize={0.5} color={victory ? '#10b981' : '#ef4444'} anchorX="center" anchorY="middle">
          {victory ? 'You Win!' : 'Game Over'}
        </Text>
      )}
    </group>
  );
}

export default Minesweeper3D;


