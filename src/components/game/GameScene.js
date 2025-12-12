import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder } from '@react-three/drei';
import Minesweeper3D from '../../games/minesweeper/Minesweeper3D';
import ConnectFour3D from '../../games/connectfour/ConnectFour3D';
import Crossword3D from '../../games/crossword3d/Crossword3D';
import Plinko3D from '../../games/plinko/Plinko3D';

const GameScene = ({ gameId, gameState, setGameState, flagMode, hintFunctionRef, checkFunctionRef, difficulty, showOnlyBlue, showOnlyRed, showOnlyYellow, showOnlyGreen, showOnlyOrange, showOnlyPink, showOnlyWhite, showOnlyBlack, showGrid, numPlayers, boardSize }) => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  const renderGameScene = () => {
    switch (gameId) {
      case 'minesweeper-3d':
        return (
          <Minesweeper3D gameState={gameState} setGameState={setGameState} flagMode={flagMode} hintFunctionRef={hintFunctionRef} difficulty={difficulty} />
        );
      case 'connectfour-3d':
        return (
          <ConnectFour3D gameState={gameState} setGameState={setGameState} showOnlyBlue={showOnlyBlue} showOnlyRed={showOnlyRed} showOnlyYellow={showOnlyYellow} showOnlyGreen={showOnlyGreen} showOnlyOrange={showOnlyOrange} showOnlyPink={showOnlyPink} showOnlyWhite={showOnlyWhite} showOnlyBlack={showOnlyBlack} showGrid={showGrid} numPlayers={numPlayers} boardSize={boardSize} />
        );
      case 'crossword-3d':
        return (
          <Crossword3D gameState={gameState} setGameState={setGameState} showGrid={showGrid} boardSize={boardSize} hintFunctionRef={hintFunctionRef} checkFunctionRef={checkFunctionRef} />
        );
      case 'plinko-3d':
        return (
          <Plinko3D gameState={gameState} setGameState={setGameState} />
        );
      case 'tetris-3d':
        return (
          <group>
            <Box args={[1, 1, 1]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#ff6b6b" />
            </Box>
            <Box args={[1, 1, 1]} position={[1.2, 0, 0]}>
              <meshStandardMaterial color="#4ecdc4" />
            </Box>
            <Box args={[1, 1, 1]} position={[-1.2, 0, 0]}>
              <meshStandardMaterial color="#45b7d1" />
            </Box>
          </group>
        );
      
      case 'snake-3d':
        return (
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
        );
      
      case 'pong-3d':
        return (
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
        );
      
      case 'breakout-3d':
        return (
          <group>
            <Box args={[0.8, 0.3, 0.3]} position={[0, -1.5, 0]}>
              <meshStandardMaterial color="#ffd93d" />
            </Box>
            {[...Array(6)].map((_, i) => (
              <Box 
                key={i}
                args={[0.8, 0.3, 0.3]} 
                position={[0, 1 + i * 0.4, 0]}
              >
                <meshStandardMaterial color="#ff6b6b" />
              </Box>
            ))}
          </group>
        );
      
      case 'pacman-3d':
        return (
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
        );
      
      case 'asteroids-3d':
        return (
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
        );
      
      default:
        return (
          <Box ref={meshRef} args={[1, 1, 1]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#ff6b6b" />
          </Box>
        );
    }
  };

  return (
    <>
      {renderGameScene()}
    </>
  );
};

export default GameScene; 