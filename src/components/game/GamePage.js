/**
 * GamePage Component
 * 
 * Generic game page that uses the registry to load game-specific
 * components, controls, and configurations.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { getGameById } from '../../data/games';
import { getGame } from '../../lib/game';
import InstructionsPopup from './InstructionsPopup';
import GameScene from './GameScene';
import './GamePage.css';

const GamePage = () => {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [hintButtonRed, setHintButtonRed] = useState(false);
  const hintFunctionRef = useRef(null);
  const checkFunctionRef = useRef(null);
  const [selectedWordInfo, setSelectedWordInfo] = useState(null);
  
  // Get game config from registry
  const gameConfig = getGame(gameId);
  
  // Initialize game state from registry or defaults
  const [gameState, setGameState] = useState(() => {
    if (gameConfig?.getDefaultState) {
      return gameConfig.getDefaultState();
    }
    return {
      score: 0,
      lives: 1,
      level: 'Easy',
      isPlaying: false,
      gameWon: false,
      gameLost: false
    };
  });
  
  // Initialize game options from registry or defaults
  const [gameOptions, setGameOptions] = useState(() => {
    if (gameConfig?.getDefaultOptions) {
      return gameConfig.getDefaultOptions();
    }
    return {};
  });

  useEffect(() => {
    const foundGame = getGameById(gameId);
    if (foundGame) {
      setGame(foundGame);
    }
  }, [gameId]);

  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: true }));
    setShowInstructions(false);
    setSelectedWordInfo(null);
  };

  const handleWordSelected = useCallback((wordInfo) => {
    setSelectedWordInfo(wordInfo);
  }, []);

  const handleCloseInstructions = () => {
    setShowInstructions(false);
  };

  // Get camera configuration from registry
  const getCameraConfig = () => {
    if (gameConfig?.getCameraConfig) {
      return gameConfig.getCameraConfig(gameOptions);
    }
    // Fallback for unregistered games
    return { position: [0, 0, 5], fov: 75, enableZoom: false };
  };

  const cameraConfig = getCameraConfig();

  // Handle hint button
  const handleHint = () => {
    if (hintFunctionRef.current && gameState.isPlaying) {
      const result = hintFunctionRef.current();
      if (result === false) {
        setHintButtonRed(true);
        setTimeout(() => setHintButtonRed(false), 500);
      }
    }
  };

  // Handle check button (for crossword)
  const handleCheck = () => {
    if (checkFunctionRef.current && gameState.isPlaying) {
      checkFunctionRef.current();
    }
  };

  // Update game option helper
  const updateGameOption = (key, value) => {
    setGameOptions(prev => ({ ...prev, [key]: value }));
  };

  // Handle color filter toggle for Connect Four
  const handleColorFilterToggle = (color) => {
    setGameOptions(prev => {
      const newFilters = { ...prev.colorFilters };
      // Turn off all other filters when enabling one
      if (!newFilters[color]) {
        Object.keys(newFilters).forEach(k => { newFilters[k] = false; });
      }
      newFilters[color] = !prev.colorFilters[color];
      return { ...prev, colorFilters: newFilters };
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      // Minesweeper flag mode toggle
      if (gameId === 'minesweeper-3d' && (e.key === 'f' || e.key === 'F')) {
        setGameOptions(prev => ({ ...prev, flagMode: !prev.flagMode }));
      }
      
      // Connect Four color filters
      if (gameId === 'connectfour-3d') {
        const keyMap = {
          'b': 'blue', 'B': 'blue',
          'r': 'red', 'R': 'red',
          'y': 'yellow', 'Y': 'yellow',
          'g': 'green', 'G': 'green',
          'o': 'orange', 'O': 'orange',
          'p': 'pink', 'P': 'pink',
          'w': 'white', 'W': 'white',
          'k': 'black', 'K': 'black'
        };
        if (keyMap[e.key]) {
          e.preventDefault();
          handleColorFilterToggle(keyMap[e.key]);
        }
      }
      
      // Tetris pause toggle
      if (gameId === 'tetris-3d' && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setGameOptions(prev => ({ ...prev, isPaused: !prev.isPaused }));
      }
    };
    
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameId]);

  // Render game-specific controls
  const renderControls = () => {
    if (!gameConfig?.ControlsComponent) return null;
    
    const ControlsComponent = gameConfig.ControlsComponent;
    
    // Build props based on game type
    const controlProps = {
      isPlaying: gameState.isPlaying,
      hintButtonRed
    };
    
    // Minesweeper controls
    if (gameId === 'minesweeper-3d') {
      Object.assign(controlProps, {
        difficulty: gameOptions.difficulty || 'Easy',
        onDifficultyChange: (d) => {
          updateGameOption('difficulty', d);
          setGameState(prev => ({ ...prev, isPlaying: true, level: d }));
        },
        flagMode: gameOptions.flagMode || false,
        onFlagModeToggle: () => updateGameOption('flagMode', !gameOptions.flagMode),
        onHint: handleHint
      });
    }
    
    // Connect Four controls
    if (gameId === 'connectfour-3d') {
      Object.assign(controlProps, {
        boardSize: gameOptions.boardSize || 5,
        onBoardSizeChange: (size) => {
          updateGameOption('boardSize', size);
          setGameState(prev => ({ ...prev, isPlaying: false }));
          setTimeout(() => setGameState(prev => ({ ...prev, isPlaying: true })), 0);
        },
        numPlayers: gameOptions.numPlayers || 2,
        onNumPlayersChange: (n) => {
          updateGameOption('numPlayers', n);
          setGameState(prev => ({ ...prev, isPlaying: false }));
          setTimeout(() => setGameState(prev => ({ ...prev, isPlaying: true })), 0);
        },
        showGrid: gameOptions.showGrid !== false,
        onShowGridToggle: () => updateGameOption('showGrid', !gameOptions.showGrid),
        colorFilters: gameOptions.colorFilters || {},
        onColorFilterToggle: handleColorFilterToggle
      });
    }
    
    // Crossword controls
    if (gameId === 'crossword-3d') {
      Object.assign(controlProps, {
        boardSize: gameOptions.boardSize || 5,
        onBoardSizeChange: (size) => {
          updateGameOption('boardSize', size);
          setGameState(prev => ({ ...prev, isPlaying: false }));
          setTimeout(() => setGameState(prev => ({ ...prev, isPlaying: true })), 0);
          setSelectedWordInfo(null);
        },
        selectedWordInfo,
        onHint: handleHint,
        onCheck: handleCheck,
        hideFilledWords: gameOptions.hideFilledWords || false,
        onHideFilledWordsToggle: () => updateGameOption('hideFilledWords', !gameOptions.hideFilledWords)
      });
    }
    
    // Tetris controls
    if (gameId === 'tetris-3d') {
      Object.assign(controlProps, {
        difficulty: gameOptions.difficulty || 'Easy',
        onDifficultyChange: (d) => {
          updateGameOption('difficulty', d);
          setGameState(prev => ({ ...prev, isPlaying: false }));
          setTimeout(() => setGameState(prev => ({ ...prev, isPlaying: true })), 0);
        },
        isPaused: gameOptions.isPaused || false,
        onPauseToggle: () => updateGameOption('isPaused', !gameOptions.isPaused),
        level: gameState.level || 1,
        linesCleared: gameState.linesCleared || 0
      });
    }
    
    return <ControlsComponent {...controlProps} />;
  };

  // Render header stats based on game type
  const renderStats = () => {
    if (gameId === 'connectfour-3d') {
      return (
        <>
          <div className="stat">
            <span className="stat-label">Current Player</span>
            <span className="stat-value" style={{ 
              color: getPlayerColor(gameState.currentPlayer)
            }}>
              {getPlayerLabel(gameState.currentPlayer)}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Players</span>
            <span className="stat-value">{gameOptions.numPlayers || 2}</span>
          </div>
        </>
      );
    }
    
    if (gameId === 'tetris-3d') {
      return (
        <>
          <div className="stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{gameState.score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Level</span>
            <span className="stat-value">{gameState.level || 1}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Lines</span>
            <span className="stat-value">{gameState.linesCleared || 0}</span>
          </div>
        </>
      );
    }
    
    return (
      <>
        <div className="stat">
          <span className="stat-label">Score</span>
          <span className="stat-value">{gameState.score}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Lives</span>
          <span className="stat-value">{gameState.lives}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Level</span>
          <span className="stat-value">{gameState.level}</span>
        </div>
        {gameId === 'minesweeper-3d' && (
          <div className="stat">
            <span className="stat-label">Bombs Remaining</span>
            <span className="stat-value">{gameState.bombsRemaining ?? '-'}</span>
          </div>
        )}
      </>
    );
  };

  if (!game) {
    return (
      <div className="game-page error">
        <div className="error-content">
          <h2>Game Not Found</h2>
          <p>The game you're looking for doesn't exist.</p>
          <Link to="/" className="back-button">Back to Games</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="game-page">
      <header className="game-header">
        <div className="header-content">
          <Link to="/" className="back-link">← Back to Games</Link>
          <h1 className="game-title">{game.title}</h1>
          <div className="game-stats">
            {renderStats()}
          </div>
        </div>
      </header>

      <main className="game-main">
        <div className="game-container">
          <div className={`game-canvas-container ${gameState.gameWon ? 'game-won' : ''} ${gameState.gameLost ? 'game-lost' : ''}`}>
            <Canvas
              camera={{ position: cameraConfig.position, fov: cameraConfig.fov }}
              frameloop={gameId === 'tetris-3d' ? 'always' : 'demand'}
              gl={{ antialias: true }}
            >
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <GameScene 
                gameId={gameId} 
                gameState={gameState} 
                setGameState={setGameState} 
                gameOptions={gameOptions}
                setGameOptions={setGameOptions}
                hintFunctionRef={hintFunctionRef} 
                checkFunctionRef={checkFunctionRef}
                onWordSelected={gameId === 'crossword-3d' ? handleWordSelected : undefined}
              />
              <OrbitControls enableZoom={cameraConfig.enableZoom} />
            </Canvas>
          </div>
          
          {renderControls()}
        </div>

        <div className="game-controls">
          <button 
            className="start-button"
            onClick={handleStartGame}
            disabled={gameState.isPlaying}
          >
            {gameState.isPlaying ? 'Playing...' : 'New Game'}
          </button>
          <button 
            className="instructions-button"
            onClick={() => setShowInstructions(true)}
          >
            Instructions
          </button>
        </div>
      </main>

      {showInstructions && (
        <InstructionsPopup 
          game={game}
          onClose={handleCloseInstructions}
          onStart={handleStartGame}
        />
      )}
    </div>
  );
};

// Helper functions for Connect Four player display
const getPlayerColor = (player) => {
  const colors = {
    1: '#dc2626', 2: '#3b82f6', 3: '#eab308', 4: '#22c55e',
    5: '#fb923c', 6: '#f9a8d4', 7: '#ffffff', 8: '#1f2937'
  };
  return colors[player] || colors[1];
};

const getPlayerLabel = (player) => {
  const labels = {
    1: 'Player 1 (Red)', 2: 'Player 2 (Blue)', 3: 'Player 3 (Yellow)',
    4: 'Player 4 (Green)', 5: 'Player 5 (Orange)', 6: 'Player 6 (Pink)',
    7: 'Player 7 (White)', 8: 'Player 8 (Black)'
  };
  return labels[player] || labels[1];
};

export default GamePage;
