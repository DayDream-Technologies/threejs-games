import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Text, Edges } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const spacing = 1.0;

const colors = {
  empty: '#6b7280', // darker gray for wireframe
  player1: '#dc2626', // darker red
  player2: '#3b82f6', // blue
  player3: '#eab308', // yellow
  player4: '#22c55e', // green
  player5: '#fb923c', // orange
  player6: '#f9a8d4', // lighter pink
  player7: '#ffffff', // white
  player8: '#1f2937', // black/dark gray
  preview: '#ffffff', // white
  highlight: '#10b981' // green for winning pieces (deprecated - we keep original colors now)
};

function getEmptyPosition(board, column, depth, gridSize) {
  // Find the lowest available position in the column/depth combination
  // Safety check
  if (!board || !board[column]) return 0;
  
  let height = 0;
  while (height < gridSize && board[column][height] && board[column][height][depth] !== null) {
    height++;
  }
  return height < gridSize ? height : null; // Return null if column is full
}

function checkWin(board, column, height, depth, player, gridSize) {
  // Safety check
  if (!board || !board[column] || !board[column][height]) return null;
  
  const directions = [
    // Horizontal (in same plane) - along Z axis
    [[0, 0, 1], [0, 0, -1]],
    // Vertical (in same plane) - along Y axis  
    [[0, 1, 0], [0, -1, 0]],
    // Along X axis (forward/backward)
    [[1, 0, 0], [-1, 0, 0]],
    // Diagonals in XY plane
    [[1, 1, 0], [-1, -1, 0]],
    [[1, -1, 0], [-1, 1, 0]],
    // Diagonals in XZ plane
    [[1, 0, 1], [-1, 0, -1]],
    [[1, 0, -1], [-1, 0, 1]],
    // Diagonals in YZ plane
    [[0, 1, 1], [0, -1, -1]],
    [[0, 1, -1], [0, -1, 1]],
    // Space diagonals (3D)
    [[1, 1, 1], [-1, -1, -1]],
    [[1, 1, -1], [-1, -1, 1]],
    [[1, -1, 1], [-1, 1, -1]],
    [[-1, -1, 1], [1, 1, -1]],
  ];

  for (const [dir1, dir2] of directions) {
    let count = 1; // Count the current piece
    const winningPieces = [[column, height, depth]]; // Track all winning pieces
    
    // Count in direction 1
    let [dx1, dy1, dz1] = dir1;
    let newCol = column + dx1;
    let newHeight = height + dy1;
    let newDepth = depth + dz1;
    
    while (
      newCol >= 0 && newCol < gridSize &&
      newHeight >= 0 && newHeight < gridSize &&
      newDepth >= 0 && newDepth < gridSize &&
      board[newCol][newHeight][newDepth] === player
    ) {
      count++;
      winningPieces.push([newCol, newHeight, newDepth]);
      newCol += dx1;
      newHeight += dy1;
      newDepth += dz1;
    }
    
    // Count in direction 2
    let [dx2, dy2, dz2] = dir2;
    newCol = column + dx2;
    newHeight = height + dy2;
    newDepth = depth + dz2;
    
    while (
      newCol >= 0 && newCol < gridSize &&
      newHeight >= 0 && newHeight < gridSize &&
      newDepth >= 0 && newDepth < gridSize &&
      board[newCol][newHeight][newDepth] === player
    ) {
      count++;
      winningPieces.push([newCol, newHeight, newDepth]);
      newCol += dx2;
      newHeight += dy2;
      newDepth += dz2;
    }
    
    if (count >= 4) {
      return winningPieces;
    }
  }
  
  return null;
}

function ConnectFour3D({ gameState, setGameState, showOnlyBlue, showOnlyRed, showOnlyYellow, showOnlyGreen, showOnlyOrange, showOnlyPink, showOnlyWhite, showOnlyBlack, showGrid, numPlayers = 2, boardSize = 7 }) {
  // Set the grid size dynamically based on boardSize prop
  const gridSize = boardSize;
  const offset = (gridSize - 1) * spacing * 0.5;
  
  // Helper function to create empty board
  const createEmptyBoard = (size) => {
    const b = [];
    for (let c = 0; c < size; c++) {
      b[c] = [];
      for (let h = 0; h < size; h++) {
        b[c][h] = [];
        for (let d = 0; d < size; d++) {
          b[c][h][d] = null; // null means empty
        }
      }
    }
    return b;
  };
  
  const [board, setBoard] = useState(() => createEmptyBoard(gridSize));
  
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [selectedColumn, setSelectedColumn] = useState(Math.floor(gridSize / 2)); // Start in middle
  const [selectedDepth, setSelectedDepth] = useState(Math.floor(gridSize / 2)); // Start in middle
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winningPieces, setWinningPieces] = useState([]);
  const { camera } = useThree();
  const hasGameStartedRef = useRef(false);

  const previousPlayingRef = useRef(false);
  const previousNumPlayersRef = useRef(numPlayers);
  const previousBoardSizeRef = useRef(boardSize);

  // Reset game when new game is started or player count changes
  useEffect(() => {
    const playerCountChanged = numPlayers !== previousNumPlayersRef.current;
    const boardSizeChanged = boardSize !== previousBoardSizeRef.current;
    previousNumPlayersRef.current = numPlayers;
    previousBoardSizeRef.current = boardSize;
    
    // Detect transition from not playing to playing (new game button clicked) or when player count/board size changes
    if ((gameState.isPlaying && !previousPlayingRef.current && (gameOver || hasGameStartedRef.current)) || 
        (gameState.isPlaying && (playerCountChanged || boardSizeChanged))) {
      // Reset the board when starting a new game
      setBoard(createEmptyBoard(gridSize));
      setCurrentPlayer(1);
      setSelectedColumn(Math.floor(gridSize / 2));
      setSelectedDepth(Math.floor(gridSize / 2));
      setGameOver(false);
      setWinner(null);
      setWinningPieces([]);
      setGameState({
        currentPlayer: 1,
        isPlaying: true,
        gameWon: false,
        gameLost: false
      });
      hasGameStartedRef.current = true;
      previousPlayingRef.current = true;
    } else if (gameState.isPlaying && !previousPlayingRef.current && !hasGameStartedRef.current) {
      // First time starting the game
      setGameState({
        currentPlayer: 1,
        isPlaying: true,
        gameWon: false,
        gameLost: false
      });
      hasGameStartedRef.current = true;
      previousPlayingRef.current = true;
    } else if (gameState.isPlaying && previousPlayingRef.current && !gameOver) {
      // Just update the current player state during normal gameplay
      setGameState({
        currentPlayer,
        isPlaying: true,
        gameWon: false,
        gameLost: false
      });
    }
    
    // Track previous state
    previousPlayingRef.current = gameState.isPlaying;
  }, [gameState.isPlaying, currentPlayer, gameOver, setGameState, numPlayers, boardSize, gridSize]);

  const handlePlacePiece = useCallback(() => {
    if (gameOver) return;
    
    const height = getEmptyPosition(board, selectedColumn, selectedDepth, gridSize);
    
    // Check if column is full
    if (height === null) {
      return; // Can't place in full column
    }
    
    setBoard(prev => {
      const newBoard = prev.map(col => col.map(row => row.map(cell => cell)));
      newBoard[selectedColumn][height][selectedDepth] = currentPlayer;
      
      // Check for win
      const winPieces = checkWin(newBoard, selectedColumn, height, selectedDepth, currentPlayer, gridSize);
      
      if (winPieces) {
        setWinner(currentPlayer);
        setGameOver(true);
        setGameState(prevGs => ({ ...prevGs, isPlaying: false, gameWon: true }));
        setWinningPieces(winPieces);
      } else {
        // Switch players based on number of players
        const nextPlayer = currentPlayer === numPlayers ? 1 : currentPlayer + 1;
        setCurrentPlayer(nextPlayer);
        setGameState(prevGs => ({ ...prevGs, currentPlayer: nextPlayer }));
      }
      
      return newBoard;
    });
  }, [board, selectedColumn, selectedDepth, currentPlayer, gameOver, setGameState, numPlayers, gridSize]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          setSelectedColumn(prev => Math.max(0, prev - 1));
          break;
      case 'ArrowRight':
        setSelectedColumn(prev => Math.min(gridSize - 1, prev + 1));
        break;
      case 'ArrowUp':
        setSelectedDepth(prev => Math.min(gridSize - 1, prev + 1));
        break;
        case 'ArrowDown':
          setSelectedDepth(prev => Math.max(0, prev - 1));
          break;
        case 'Enter':
        case ' ':
          handlePlacePiece();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, handlePlacePiece]);

  const handleColumnClick = useCallback((column, depth) => {
    if (gameOver) return;
    handlePlacePiece();
  }, [gameOver, handlePlacePiece]);

  const getPreviewHeight = () => {
    const height = getEmptyPosition(board, selectedColumn, selectedDepth, gridSize);
    return height === null ? null : height;
  };

  const renderCubes = () => {
    const cubes = [];
    
    // Safety check - ensure board has correct dimensions
    if (!board || !Array.isArray(board) || board.length !== gridSize) {
      return cubes;
    }
    
    // Render grid cells (empty slots)
    for (let c = 0; c < gridSize; c++) {
      for (let h = 0; h < gridSize; h++) {
        for (let d = 0; d < gridSize; d++) {
          const px = c * spacing - offset;
          const py = h * spacing - offset;
          const pz = d * spacing - offset;
          
          cubes.push({
            type: 'grid',
            x: c,
            y: h,
            z: d,
            px,
            py,
            pz,
            column: c,
            depth: d
          });
        }
      }
    }
    
    // Render placed pieces
    for (let c = 0; c < gridSize; c++) {
      for (let h = 0; h < gridSize; h++) {
        for (let d = 0; d < gridSize; d++) {
          if (!board[c] || !board[c][h]) continue;
          const piece = board[c][h][d];
          if (piece !== null) {
            const px = c * spacing - offset;
            const py = h * spacing - offset;
            const pz = d * spacing - offset;
            
            const isWinningPiece = winningPieces.some(([cx, cy, cz]) => 
              cx === c && cy === h && cz === d
            );
            
            // Keep original color for winning pieces
            let color;
            switch(piece) {
              case 1: color = colors.player1; break;
              case 2: color = colors.player2; break;
              case 3: color = colors.player3; break;
              case 4: color = colors.player4; break;
              case 5: color = colors.player5; break;
              case 6: color = colors.player6; break;
              case 7: color = colors.player7; break;
              case 8: color = colors.player8; break;
              default: color = colors.player1;
            }
            
            cubes.push({
              type: 'piece',
              x: c,
              y: h,
              z: d,
              px,
              py,
              pz,
              player: piece,
              color
            });
          }
        }
      }
    }
    
    return cubes;
  };

  const cubes = renderCubes();
  const previewHeight = getPreviewHeight();
  const showPreview = !gameOver && previewHeight !== null;

  return (
    <group>
      {/* Grid cells - only show outer faces that are empty */}
      {cubes.map((cube, idx) => {
        if (cube.type === 'grid') {
          // Safety check - ensure board has correct dimensions
          if (!board[cube.x] || !board[cube.x][cube.y] || board[cube.x][cube.y][cube.z] === undefined) return null;
          const isEmpty = board[cube.x][cube.y][cube.z] === null;
          
          // Don't render grid cells for placed pieces, or if game is over
          if (!isEmpty || gameOver || !showGrid) return null;
          
    // Only show cells on the outer faces of the cube
    const isOuterFace = 
      cube.x === 0 || cube.x === gridSize - 1 || // left/right faces
      cube.y === 0 || cube.y === gridSize - 1 || // back/front faces
      cube.z === 0 || cube.z === gridSize - 1;  // bottom/top faces
          
          // Don't render if not on outer face
          if (!isOuterFace) return null;
          
          const isSelected = cube.column === selectedColumn && cube.depth === selectedDepth && cube.y === 0;
          
          return (
            <Box
              key={`grid-${cube.x}-${cube.y}-${cube.z}`}
              args={[0.7, 0.7, 0.7]}
              position={[cube.px, cube.py, cube.pz]}
              onClick={(e) => {
                e.stopPropagation();
                handleColumnClick(cube.column, cube.depth);
              }}
              onPointerOver={() => {
                if (!gameOver) {
                  setSelectedColumn(cube.column);
                  setSelectedDepth(cube.depth);
                }
              }}
            >
              <meshBasicMaterial color={isSelected ? '#fbbf24' : colors.empty} transparent opacity={0.05} wireframe={false} />
              <Edges scale={1.001} color={isSelected ? '#fbbf24' : '#4b5563'} threshold={15} />
            </Box>
          );
        }
        return null;
      })}
      
      {/* Placed pieces */}
      {cubes.map((cube, idx) => {
        if (cube.type === 'piece') {
          const isWinningPiece = winningPieces.some(([cx, cy, cz]) => 
            cx === cube.x && cy === cube.y && cz === cube.z
          );
          
          // Hide all pieces except winning ones when game is over
          if (gameOver && !isWinningPiece) return null;
          
          // Filter by color based on filter mode
          if (showOnlyBlue && cube.player !== 2) return null;
          if (showOnlyRed && cube.player !== 1) return null;
          if (showOnlyYellow && cube.player !== 3) return null;
          if (showOnlyGreen && cube.player !== 4) return null;
          if (showOnlyOrange && cube.player !== 5) return null;
          if (showOnlyPink && cube.player !== 6) return null;
          if (showOnlyWhite && cube.player !== 7) return null;
          if (showOnlyBlack && cube.player !== 8) return null;
          
          return (
            <Box
              key={`piece-${cube.x}-${cube.y}-${cube.z}`}
              args={[0.8, 0.8, 0.8]}
              position={[cube.px, cube.py, cube.pz]}
            >
              <meshStandardMaterial color={cube.color} />
            </Box>
          );
        }
        return null;
      })}
      
      {/* Preview piece */}
      {showPreview && (
        <Box
          args={[0.8, 0.8, 0.8]}
          position={[
            selectedColumn * spacing - offset,
            previewHeight * spacing - offset,
            selectedDepth * spacing - offset
          ]}
        >
          <meshStandardMaterial color={colors.preview} opacity={0.7} transparent />
        </Box>
      )}
      
      {/* Game over message */}
      {gameOver && winner && (
        <Text position={[0, offset + 1.5, 0]} fontSize={0.5} color="#10b981" anchorX="center" anchorY="middle">
          Player {winner} Wins!
        </Text>
      )}
    </group>
  );
}

export default ConnectFour3D;

