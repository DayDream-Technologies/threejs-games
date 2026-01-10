/**
 * Tetris 3D Main Component
 * 
 * True 3D Tetris where pieces fall into a 3D well and
 * complete horizontal planes are cleared.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Box, Edges, Text, Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

import { DIFFICULTY_CONFIG, CUBE_CONFIG, COLORS, getDropSpeed, LINES_PER_LEVEL } from './config';
import { createPiece, getPieceBlocks, PieceBag } from './pieces';
import {
  createBoard,
  tryMove,
  tryRotate,
  lockPiece,
  findCompletePlanes,
  clearPlanes,
  getGhostPiece,
  hardDrop,
  isGameOver,
  getSpawnPosition,
  calculateTotalScore,
  getOccupiedCells
} from './gameLogic';

// Single cube component
const Cube = ({ position, color, opacity = 1, edges = true }) => (
  <group position={position}>
    <Box args={[CUBE_CONFIG.size, CUBE_CONFIG.size, CUBE_CONFIG.size]}>
      <meshStandardMaterial 
        color={color} 
        transparent={opacity < 1}
        opacity={opacity}
      />
      {edges && <Edges color="#ffffff" threshold={15} />}
    </Box>
  </group>
);

// Well wireframe component
const Well = ({ width, depth, height, spacing }) => {
  const lines = useMemo(() => {
    const result = [];
    const w = width * spacing;
    const d = depth * spacing;
    const h = height * spacing;
    
    // Offset to center
    const ox = -spacing / 2;
    const oy = -spacing / 2;
    const oz = -spacing / 2;
    
    // Bottom edges
    result.push([[ox, oy, oz], [ox + w, oy, oz]]);
    result.push([[ox, oy, oz], [ox, oy, oz + d]]);
    result.push([[ox + w, oy, oz], [ox + w, oy, oz + d]]);
    result.push([[ox, oy, oz + d], [ox + w, oy, oz + d]]);
    
    // Vertical edges
    result.push([[ox, oy, oz], [ox, oy + h, oz]]);
    result.push([[ox + w, oy, oz], [ox + w, oy + h, oz]]);
    result.push([[ox, oy, oz + d], [ox, oy + h, oz + d]]);
    result.push([[ox + w, oy, oz + d], [ox + w, oy + h, oz + d]]);
    
    // Top edges (open top for pieces to fall in)
    result.push([[ox, oy + h, oz], [ox + w, oy + h, oz]]);
    result.push([[ox, oy + h, oz], [ox, oy + h, oz + d]]);
    result.push([[ox + w, oy + h, oz], [ox + w, oy + h, oz + d]]);
    result.push([[ox, oy + h, oz + d], [ox + w, oy + h, oz + d]]);
    
    return result;
  }, [width, depth, height, spacing]);
  
  return (
    <group>
      {lines.map((points, i) => (
        <Line 
          key={i}
          points={points}
          color={COLORS.wellEdge}
          lineWidth={2}
        />
      ))}
    </group>
  );
};

// Grid floor component
const GridFloor = ({ width, depth, spacing }) => {
  const lines = useMemo(() => {
    const result = [];
    const ox = -spacing / 2;
    const oz = -spacing / 2;
    const y = -spacing / 2 + 0.01; // Slightly above bottom
    
    // X-axis lines
    for (let x = 0; x <= width; x++) {
      result.push([
        [ox + x * spacing, y, oz],
        [ox + x * spacing, y, oz + depth * spacing]
      ]);
    }
    
    // Z-axis lines
    for (let z = 0; z <= depth; z++) {
      result.push([
        [ox, y, oz + z * spacing],
        [ox + width * spacing, y, oz + z * spacing]
      ]);
    }
    
    return result;
  }, [width, depth, spacing]);
  
  return (
    <group>
      {lines.map((points, i) => (
        <Line 
          key={i}
          points={points}
          color={COLORS.grid}
          lineWidth={1}
        />
      ))}
    </group>
  );
};

// Next piece preview
const NextPiecePreview = ({ pieceType, position }) => {
  if (!pieceType) return null;
  
  const piece = createPiece(pieceType, 0, 0, 0);
  const blocks = getPieceBlocks(piece);
  
  return (
    <group position={position}>
      <Text
        position={[0, 2, 0]}
        fontSize={0.4}
        color="#e5e7eb"
        anchorX="center"
      >
        NEXT
      </Text>
      {blocks.map(([x, y, z], i) => (
        <Cube
          key={i}
          position={[x * 0.5, y * 0.5, z * 0.5]}
          color={piece.color}
          opacity={0.9}
        />
      ))}
    </group>
  );
};

function Tetris3D({ gameState, setGameState, difficulty = 'Easy', isPaused = false }) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const { baseWidth: width, baseDepth: depth, height } = config;
  const spacing = CUBE_CONFIG.spacing;
  
  // Game state
  const [board, setBoard] = useState(() => createBoard(width, depth, height));
  const [currentPiece, setCurrentPiece] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);
  const [clearingPlanes, setClearingPlanes] = useState([]); // For animation
  
  // Refs
  const pieceBagRef = useRef(new PieceBag());
  const nextPieceRef = useRef(pieceBagRef.current.next());
  const lastDropRef = useRef(Date.now());
  const hasStartedRef = useRef(false);
  const softDropRef = useRef(false);
  
  // Calculate center offset for rendering
  const centerX = (width - 1) * spacing / 2;
  const centerZ = (depth - 1) * spacing / 2;
  
  // Spawn a new piece
  const spawnPiece = useCallback(() => {
    const type = nextPieceRef.current;
    nextPieceRef.current = pieceBagRef.current.next();
    
    const [sx, sy, sz] = getSpawnPosition(width, depth, height);
    const piece = createPiece(type, sx, sy, sz);
    
    // Check for game over
    if (isGameOver(piece, board, width, depth, height)) {
      setGameOver(true);
      setGameState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        gameWon: false, 
        gameLost: true 
      }));
      return null;
    }
    
    return piece;
  }, [board, width, depth, height, setGameState]);
  
  // Lock current piece and handle line clears
  const lockCurrentPiece = useCallback(() => {
    if (!currentPiece) return;
    
    // Lock piece to board
    const newBoard = lockPiece(currentPiece, board, height);
    
    // Find and clear complete planes
    const completePlanes = findCompletePlanes(newBoard, width, depth, height);
    
    if (completePlanes.length > 0) {
      // Show clearing animation
      setClearingPlanes(completePlanes);
      
      // Calculate score
      const score = calculateTotalScore(completePlanes.length, level);
      const newLinesCleared = linesCleared + completePlanes.length;
      const newLevel = Math.floor(newLinesCleared / LINES_PER_LEVEL) + 1;
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + score,
        level: newLevel,
        linesCleared: newLinesCleared
      }));
      
      setLinesCleared(newLinesCleared);
      setLevel(newLevel);
      
      // Clear planes after short delay for animation
      setTimeout(() => {
        const clearedBoard = clearPlanes(newBoard, completePlanes, width, depth, height);
        setBoard(clearedBoard);
        setClearingPlanes([]);
        
        // Spawn next piece
        const newPiece = spawnPiece();
        setCurrentPiece(newPiece);
      }, 200);
    } else {
      setBoard(newBoard);
      
      // Spawn next piece immediately
      const newPiece = spawnPiece();
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, board, width, depth, height, level, linesCleared, setGameState, spawnPiece]);
  
  // Move piece down (gravity)
  const dropPiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    
    const moved = tryMove(currentPiece, 0, -1, 0, board, width, depth, height);
    
    if (moved) {
      setCurrentPiece(moved);
      
      // Add soft drop score
      if (softDropRef.current) {
        setGameState(prev => ({ ...prev, score: prev.score + 1 }));
      }
    } else {
      // Piece can't move down - lock it
      lockCurrentPiece();
    }
  }, [currentPiece, gameOver, isPaused, board, width, depth, height, lockCurrentPiece, setGameState]);
  
  // Handle keyboard input
  useEffect(() => {
    if (!gameState.isPlaying || gameOver) return;
    
    const handleKeyDown = (e) => {
      if (isPaused && e.key !== 'p' && e.key !== 'P') return;
      if (!currentPiece) return;
      
      let newPiece = null;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          newPiece = tryMove(currentPiece, -1, 0, 0, board, width, depth, height);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newPiece = tryMove(currentPiece, 1, 0, 0, board, width, depth, height);
          break;
        case 'ArrowUp':
          e.preventDefault();
          newPiece = tryMove(currentPiece, 0, 0, 1, board, width, depth, height);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newPiece = tryMove(currentPiece, 0, 0, -1, board, width, depth, height);
          break;
        case 'q':
        case 'Q':
          e.preventDefault();
          newPiece = tryRotate(currentPiece, 'Y', false, board, width, depth, height);
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          newPiece = tryRotate(currentPiece, 'Y', true, board, width, depth, height);
          break;
        case 'w':
        case 'W':
          e.preventDefault();
          newPiece = tryRotate(currentPiece, 'X', true, board, width, depth, height);
          break;
        case 's':
        case 'S':
          e.preventDefault();
          newPiece = tryRotate(currentPiece, 'X', false, board, width, depth, height);
          break;
        case ' ':
          e.preventDefault();
          // Hard drop
          const { piece: droppedPiece, distance } = hardDrop(currentPiece, board, width, depth, height);
          setCurrentPiece(droppedPiece);
          setGameState(prev => ({ ...prev, score: prev.score + distance * 2 }));
          // Lock immediately after hard drop
          setTimeout(() => lockCurrentPiece(), 50);
          return;
        case 'Shift':
          e.preventDefault();
          softDropRef.current = true;
          break;
        default:
          break;
      }
      
      if (newPiece) {
        setCurrentPiece(newPiece);
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        softDropRef.current = false;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentPiece, board, width, depth, height, gameState.isPlaying, gameOver, isPaused, lockCurrentPiece, setGameState]);
  
  // Game loop - piece gravity
  useFrame(() => {
    if (!gameState.isPlaying || gameOver || isPaused || !currentPiece) return;
    if (clearingPlanes.length > 0) return; // Don't drop during clear animation
    
    const now = Date.now();
    const dropSpeed = softDropRef.current 
      ? Math.min(50, getDropSpeed(level, difficulty) / 10)
      : getDropSpeed(level, difficulty);
    
    if (now - lastDropRef.current >= dropSpeed) {
      dropPiece();
      lastDropRef.current = now;
    }
  });
  
  // Initialize/reset game
  useEffect(() => {
    if (gameState.isPlaying && !hasStartedRef.current) {
      // First start
      setBoard(createBoard(width, depth, height));
      setGameOver(false);
      setLevel(1);
      setLinesCleared(0);
      setClearingPlanes([]);
      pieceBagRef.current = new PieceBag();
      nextPieceRef.current = pieceBagRef.current.next();
      softDropRef.current = false;
      
      const piece = spawnPiece();
      setCurrentPiece(piece);
      
      setGameState(prev => ({
        ...prev,
        score: 0,
        level: 1,
        linesCleared: 0,
        gameWon: false,
        gameLost: false
      }));
      
      hasStartedRef.current = true;
    } else if (gameState.isPlaying && hasStartedRef.current && gameOver) {
      // Restart after game over
      setBoard(createBoard(width, depth, height));
      setGameOver(false);
      setLevel(1);
      setLinesCleared(0);
      setClearingPlanes([]);
      pieceBagRef.current = new PieceBag();
      nextPieceRef.current = pieceBagRef.current.next();
      softDropRef.current = false;
      
      const piece = spawnPiece();
      setCurrentPiece(piece);
      
      setGameState(prev => ({
        ...prev,
        score: 0,
        level: 1,
        linesCleared: 0,
        gameWon: false,
        gameLost: false
      }));
    } else if (!gameState.isPlaying && !hasStartedRef.current) {
      // Auto-start on first load
      setGameState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [gameState.isPlaying, gameOver, width, depth, height, spawnPiece, setGameState]);
  
  // Reset board when difficulty changes
  useEffect(() => {
    if (hasStartedRef.current) {
      setBoard(createBoard(width, depth, height));
      setCurrentPiece(null);
      setGameOver(false);
      hasStartedRef.current = false;
      setGameState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [difficulty, width, depth, height, setGameState]);
  
  // Get ghost piece
  const ghostPiece = useMemo(() => {
    if (!currentPiece || gameOver || isPaused) return null;
    return getGhostPiece(currentPiece, board, width, depth, height);
  }, [currentPiece, board, width, depth, height, gameOver, isPaused]);
  
  // Get occupied cells for rendering
  const occupiedCells = useMemo(() => {
    return getOccupiedCells(board, width, depth, height);
  }, [board, width, depth, height]);
  
  // Get current piece blocks
  const currentBlocks = useMemo(() => {
    if (!currentPiece) return [];
    return getPieceBlocks(currentPiece);
  }, [currentPiece]);
  
  // Get ghost piece blocks
  const ghostBlocks = useMemo(() => {
    if (!ghostPiece) return [];
    return getPieceBlocks(ghostPiece);
  }, [ghostPiece]);
  
  return (
    <group>
      {/* Well wireframe */}
      <Well 
        width={width} 
        depth={depth} 
        height={height} 
        spacing={spacing}
      />
      
      {/* Grid floor */}
      <GridFloor 
        width={width} 
        depth={depth} 
        spacing={spacing}
      />
      
      {/* Locked pieces */}
      {occupiedCells.map(({ x, y, z, color }, i) => {
        const isClearing = clearingPlanes.includes(y);
        return (
          <Cube
            key={`locked-${i}`}
            position={[
              x * spacing - centerX,
              y * spacing,
              z * spacing - centerZ
            ]}
            color={isClearing ? COLORS.clearing : color}
            opacity={isClearing ? 0.5 : 1}
          />
        );
      })}
      
      {/* Ghost piece */}
      {ghostBlocks.map(([x, y, z], i) => (
        <Cube
          key={`ghost-${i}`}
          position={[
            x * spacing - centerX,
            y * spacing,
            z * spacing - centerZ
          ]}
          color={COLORS.ghost}
          opacity={CUBE_CONFIG.ghostOpacity}
          edges={false}
        />
      ))}
      
      {/* Current piece */}
      {currentBlocks.map(([x, y, z], i) => (
        <Cube
          key={`current-${i}`}
          position={[
            x * spacing - centerX,
            y * spacing,
            z * spacing - centerZ
          ]}
          color={currentPiece?.color || '#ffffff'}
          opacity={CUBE_CONFIG.activeOpacity}
        />
      ))}
      
      {/* Next piece preview */}
      <NextPiecePreview 
        pieceType={nextPieceRef.current}
        position={[width * spacing + 2, height * spacing / 2, 0]}
      />
      
      {/* Game over text */}
      {gameOver && (
        <Text
          position={[0, height * spacing / 2, depth * spacing / 2 + 2]}
          fontSize={1}
          color="#ef4444"
          anchorX="center"
          anchorY="middle"
        >
          GAME OVER
        </Text>
      )}
      
      {/* Pause text */}
      {isPaused && !gameOver && (
        <Text
          position={[0, height * spacing / 2, depth * spacing / 2 + 2]}
          fontSize={0.8}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
        >
          PAUSED
        </Text>
      )}
    </group>
  );
}

export default Tetris3D;

