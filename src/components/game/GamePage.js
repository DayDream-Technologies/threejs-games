import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { getGameById } from '../../data/games';
import InstructionsPopup from './InstructionsPopup';
import GameScene from './GameScene';
import './GamePage.css';

const GamePage = () => {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [flagMode, setFlagMode] = useState(false);
  const [hintButtonRed, setHintButtonRed] = useState(false);
  const hintFunctionRef = useRef(null);
  const [difficulty, setDifficulty] = useState('Easy');
  const [gameState, setGameState] = useState({
    score: 0,
    lives: 1,
    level: 'Easy',
    isPlaying: false,
    gameWon: false,
    gameLost: false
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
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
  };

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setGameState(prev => ({ ...prev, level: newDifficulty }));
    // Start a new game when difficulty changes
    setGameState(prev => ({ ...prev, isPlaying: true }));
  };

  const getCameraPosition = (gameId, difficulty) => {
    if (gameId !== 'minesweeper-3d') return [0, 0, 5];
    
    switch (difficulty) {
      case 'Easy': return [0, 0, 8];    // 5x5x5 grid
      case 'Medium': return [0, 0, 12];  // 7x7x7 grid - zoom out more
      case 'Hard': return [0, 0, 16];     // 9x9x9 grid - zoom out even more
      default: return [0, 0, 8];
    }
  };

  const handleHint = () => {
    if (hintFunctionRef.current && gameState.isPlaying) {
      const result = hintFunctionRef.current();
      // If hint function returns false, it means no hints were available
      if (result === false) {
        setHintButtonRed(true);
        setTimeout(() => setHintButtonRed(false), 500); // Flash for 500ms
      }
    }
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.key === 'f' || e.key === 'F') && gameId === 'minesweeper-3d') {
        setFlagMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameId]);

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
          </div>
        </div>
      </header>

      <main className="game-main">
        <div className="game-container">
          <div className={`game-canvas-container ${gameState.gameWon ? 'game-won' : ''} ${gameState.gameLost ? 'game-lost' : ''}`}>
            <Canvas
              camera={{ position: getCameraPosition(gameId, difficulty), fov: 75 }}
              frameloop="demand"
              gl={{ antialias: true }}
            >
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <GameScene gameId={gameId} gameState={gameState} setGameState={setGameState} flagMode={flagMode} hintFunctionRef={hintFunctionRef} difficulty={difficulty} />
              <OrbitControls enableZoom={gameId === 'minesweeper-3d'} />
            </Canvas>
          </div>
          {gameId === 'minesweeper-3d' && (
            <div className="game-extra-controls">
              <div className="difficulty-control">
                <label htmlFor="difficulty-select" className="difficulty-label">Difficulty:</label>
                <select 
                  id="difficulty-select"
                  value={difficulty}
                  onChange={(e) => handleDifficultyChange(e.target.value)}
                  className="difficulty-select"
                >
                  <option value="Easy">Easy (5×5×5)</option>
                  <option value="Medium">Medium (7×7×7)</option>
                  <option value="Hard">Hard (9×9×9)</option>
                </select>
              </div>
              <button 
                className="instructions-button"
                onClick={() => setFlagMode(prev => !prev)}
              >
                {flagMode ? 'Flag: ON (F)' : 'Flag: OFF (F)'}
              </button>
              <button 
                className={`instructions-button ${hintButtonRed ? 'hint-button-red' : ''}`}
                onClick={handleHint}
                disabled={!gameState.isPlaying}
              >
                💡 Hint
              </button>
            </div>
          )}
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

export default GamePage; 