import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { PlinkoBoard } from './PlinkoBoard';

/**
 * Plinko3D - React component wrapper for PlinkoBoard
 * Integrates a 3D Plinko arcade game into a Three.js scene
 */
const Plinko3D = ({ gameState, setGameState }) => {
  const groupRef = useRef(null);
  const plinkoRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const dropIntervalRef = useRef(null);

  // Initialize Plinko board
  useEffect(() => {
    if (!groupRef.current || isInitialized) return;

    try {
      const config = {
        parent: groupRef.current,
        boardWidth: 9,
        boardHeight: 13,
        boardDepth: 1.2,
        rows: 14,
        pegRadius: 0.12,
        pegType: 'sphere',
        pegSpacingX: 0.6,
        pegSpacingY: 0.6,
        pegJitter: 0.05,
        ballRadius: 0.16,
        ballMass: 0.4,
        ballRestitution: 0.65,
        boxCount: 8,
        sideWallOpacity: 0.5,
        maxBalls: 150,
        despawnAfterSeconds: 60,
        enableShadows: true,
        useCannon: true
      };

      plinkoRef.current = new PlinkoBoard(config);
      plinkoRef.current.init();
      setIsInitialized(true);

      // Update game state
      setGameState(prev => ({
        ...prev,
        isPlaying: gameState.isPlaying !== undefined ? gameState.isPlaying : true
      }));
    } catch (error) {
      console.error('Failed to initialize Plinko board:', error);
    }

    return () => {
      if (plinkoRef.current) {
        plinkoRef.current.dispose();
        plinkoRef.current = null;
      }
    };
  }, [isInitialized, gameState, setGameState]);

  // Auto-drop balls when playing
  useEffect(() => {
    if (!isInitialized || !plinkoRef.current) return;

    if (gameState.isPlaying) {
      // Drop a ball immediately
      plinkoRef.current.dropBall();

      // Then drop balls at intervals
      dropIntervalRef.current = setInterval(() => {
        if (plinkoRef.current && gameState.isPlaying) {
          plinkoRef.current.dropBall();
        }
      }, 500); // Drop a ball every 500ms

      return () => {
        if (dropIntervalRef.current) {
          clearInterval(dropIntervalRef.current);
        }
      };
    } else {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
        dropIntervalRef.current = null;
      }
    }
  }, [gameState.isPlaying, isInitialized]);

  // Update physics in render loop
  useFrame((state, delta) => {
    if (plinkoRef.current && isInitialized) {
      plinkoRef.current.update(delta);
    }
  });

  // Expose dropBall function via gameState if needed
  useEffect(() => {
    if (plinkoRef.current && gameState) {
      // Make dropBall available through a callback
      window.plinkoDropBall = () => {
        if (plinkoRef.current) {
          plinkoRef.current.dropBall();
        }
      };
    }

    return () => {
      window.plinkoDropBall = null;
    };
  }, [gameState]);

  return <group ref={groupRef} />;
};

export default Plinko3D;

