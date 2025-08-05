import React, { useState, useEffect } from 'react';
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
  const [gameState, setGameState] = useState({
    score: 0,
    lives: 3,
    level: 1,
    isPlaying: false
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
          </div>
        </div>
      </header>

      <main className="game-main">
        <div className="game-container">
          <div className="game-canvas-container">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 75 }}
              frameloop="demand"
              gl={{ antialias: true }}
            >
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <GameScene gameId={gameId} gameState={gameState} setGameState={setGameState} />
              <OrbitControls enableZoom={false} />
            </Canvas>
          </div>
        </div>

        <div className="game-controls">
          <button 
            className="start-button"
            onClick={handleStartGame}
            disabled={gameState.isPlaying}
          >
            {gameState.isPlaying ? 'Playing...' : 'Start Game'}
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