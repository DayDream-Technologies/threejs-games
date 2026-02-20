/**
 * GameScene Component
 * 
 * Renders the appropriate game component based on the gameId.
 * Uses the game registry to dynamically load registered games.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder } from '@react-three/drei';
import { getGame } from '../../lib/game';

// Placeholder component for unregistered/placeholder games
const PlaceholderScene = ({ gameId }) => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  // Different placeholder visuals based on game type
  const placeholderScenes = {
    'snake-3d': (
      <group>
        <Sphere args={[0.3, 16, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#a8e6cf" />
        </Sphere>
        <Sphere args={[0.3, 16, 16]} position={[0.6, 0, 0]}>
          <meshStandardMaterial color="#a8e6cf" />
        </Sphere>
        <Sphere args={[0.3, 16, 16]} position={[1.2, 0, 0]}>
          <meshStandardMaterial color="#a8e6cf" />
        </Sphere>
      </group>
    ),
    'pong-3d': (
      <group>
        <Box args={[0.2, 2, 0.1]} position={[-2, 0, 0]}>
          <meshStandardMaterial color="#ffd93d" />
        </Box>
        <Box args={[0.2, 2, 0.1]} position={[2, 0, 0]}>
          <meshStandardMaterial color="#ff6b6b" />
        </Box>
        <Sphere args={[0.1, 16, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ffffff" />
        </Sphere>
      </group>
    ),
    'breakout-3d': (
      <group>
        <Box args={[0.8, 0.3, 0.3]} position={[0, -1.5, 0]}>
          <meshStandardMaterial color="#ffd93d" />
        </Box>
        {[...Array(6)].map((_, i) => (
          <Box key={i} args={[0.8, 0.3, 0.3]} position={[0, 1 + i * 0.4, 0]}>
            <meshStandardMaterial color="#ff6b6b" />
          </Box>
        ))}
      </group>
    ),
    'pacman-3d': (
      <group>
        <Sphere args={[0.5, 16, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ffd93d" />
        </Sphere>
        {[...Array(8)].map((_, i) => (
          <Sphere 
            key={i}
            args={[0.05, 8, 8]} 
            position={[
              Math.cos(i * Math.PI / 4) * 2,
              Math.sin(i * Math.PI / 4) * 2,
              0
            ]}
          >
            <meshStandardMaterial color="#ffffff" />
          </Sphere>
        ))}
      </group>
    ),
    'asteroids-3d': (
      <group>
        <Cylinder args={[0.3, 0.3, 0.1, 8]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#4ecdc4" />
        </Cylinder>
        {[...Array(5)].map((_, i) => (
          <Cylinder 
            key={i}
            args={[0.2, 0.2, 0.1, 6]} 
            position={[
              Math.cos(i * Math.PI / 2.5) * 3,
              Math.sin(i * Math.PI / 2.5) * 3,
              0
            ]}
          >
            <meshStandardMaterial color="#ff6b6b" />
          </Cylinder>
        ))}
      </group>
    )
  };

  return placeholderScenes[gameId] || (
    <Box ref={meshRef} args={[1, 1, 1]} position={[0, 0, 0]}>
      <meshStandardMaterial color="#ff6b6b" />
    </Box>
  );
};

const GameScene = ({ gameId, gameState, setGameState, gameOptions, setGameOptions, hintFunctionRef, checkFunctionRef, digitInputRef, onWordSelected }) => {
  // Try to get the game from registry
  const gameConfig = getGame(gameId);
  
  if (gameConfig && gameConfig.Component) {
    const GameComponent = gameConfig.Component;
    
    // Build props based on what the game needs
    const gameProps = {
      gameState,
      setGameState,
      hintFunctionRef,
      checkFunctionRef
    };
    
    // Add game-specific options as props
    if (gameOptions) {
      // Minesweeper
      if (gameOptions.difficulty !== undefined) gameProps.difficulty = gameOptions.difficulty;
      if (gameOptions.flagMode !== undefined) gameProps.flagMode = gameOptions.flagMode;
      
      // Connect Four
      if (gameOptions.boardSize !== undefined) gameProps.boardSize = gameOptions.boardSize;
      if (gameOptions.numPlayers !== undefined) gameProps.numPlayers = gameOptions.numPlayers;
      if (gameOptions.showGrid !== undefined) gameProps.showGrid = gameOptions.showGrid;
      if (gameOptions.colorFilters) {
        gameProps.showOnlyRed = gameOptions.colorFilters.red;
        gameProps.showOnlyBlue = gameOptions.colorFilters.blue;
        gameProps.showOnlyYellow = gameOptions.colorFilters.yellow;
        gameProps.showOnlyGreen = gameOptions.colorFilters.green;
        gameProps.showOnlyOrange = gameOptions.colorFilters.orange;
        gameProps.showOnlyPink = gameOptions.colorFilters.pink;
        gameProps.showOnlyWhite = gameOptions.colorFilters.white;
        gameProps.showOnlyBlack = gameOptions.colorFilters.black;
      }
      
      // Crossword
      if (gameOptions.hideFilledWords !== undefined) gameProps.hideFilledWords = gameOptions.hideFilledWords;
      if (onWordSelected) gameProps.onWordSelected = onWordSelected;
      
      // Tetris
      if (gameOptions.isPaused !== undefined) gameProps.isPaused = gameOptions.isPaused;

      // 3D Sudoku
      if (gameOptions.difficulty !== undefined) gameProps.difficulty = gameOptions.difficulty;
      if (digitInputRef) gameProps.digitInputRef = digitInputRef;
      if (gameOptions.hideCompletedCells !== undefined) gameProps.hideCompletedCells = gameOptions.hideCompletedCells;
    }
    
    return <GameComponent {...gameProps} />;
  }
  
  // Fall back to placeholder for unregistered games
  return <PlaceholderScene gameId={gameId} />;
};

export default GameScene;
