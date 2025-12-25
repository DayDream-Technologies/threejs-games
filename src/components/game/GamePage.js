import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const checkFunctionRef = useRef(null);
  const [difficulty, setDifficulty] = useState('Easy');
  const [showOnlyBlue, setShowOnlyBlue] = useState(false);
  const [showOnlyRed, setShowOnlyRed] = useState(false);
  const [showOnlyYellow, setShowOnlyYellow] = useState(false);
  const [showOnlyGreen, setShowOnlyGreen] = useState(false);
  const [showOnlyOrange, setShowOnlyOrange] = useState(false);
  const [showOnlyPink, setShowOnlyPink] = useState(false);
  const [showOnlyWhite, setShowOnlyWhite] = useState(false);
  const [showOnlyBlack, setShowOnlyBlack] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [numPlayers, setNumPlayers] = useState(2);
  const [boardSize, setBoardSize] = useState(5);
  const [hideFilledWords, setHideFilledWords] = useState(false);
  const [selectedWordInfo, setSelectedWordInfo] = useState(null); // { word, definition, wordId }
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
    setSelectedWordInfo(null); // Clear selected word when starting new game
  };

  const handleWordSelected = useCallback((wordInfo) => {
    setSelectedWordInfo(wordInfo); // wordInfo can be null to clear the selection
  }, []);

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
    if (gameId === 'connectfour-3d' || gameId === 'crossword-3d') {
      // Adjust camera based on board size
      switch(boardSize) {
        case 5: return [0, 0, 8];
        case 7: return [0, 0, 12];
        case 9: return [0, 0, 16];
        default: return [0, 0, 12];
      }
    }
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
      if (gameId === 'minesweeper-3d' && (e.key === 'f' || e.key === 'F')) {
        setFlagMode(prev => !prev);
      }
      if (gameId === 'connectfour-3d') {
        if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          setShowOnlyBlue(prev => {
            const newValue = !prev;
            if (newValue) setShowOnlyRed(false); // Disable red if enabling blue
            return newValue;
          });
        }
        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          setShowOnlyRed(prev => {
            const newValue = !prev;
            if (newValue) {
              setShowOnlyBlue(false); // Disable blue if enabling red
              setShowOnlyYellow(false); // Disable yellow if enabling red
            }
            return newValue;
          });
        }
        if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          setShowOnlyYellow(prev => {
            const newValue = !prev;
            if (newValue) {
              setShowOnlyBlue(false); // Disable blue if enabling yellow
              setShowOnlyRed(false); // Disable red if enabling yellow
            }
            return newValue;
          });
        }
        if (e.key === 'g' || e.key === 'G') {
          e.preventDefault();
          setShowOnlyGreen(prev => {
            const newValue = !prev;
            if (newValue) {
              setShowOnlyBlue(false);
              setShowOnlyRed(false);
              setShowOnlyYellow(false);
              setShowOnlyOrange(false);
              setShowOnlyPink(false);
              setShowOnlyWhite(false);
              setShowOnlyBlack(false);
            }
            return newValue;
          });
        }
        if (e.key === 'o' || e.key === 'O') {
          e.preventDefault();
          setShowOnlyOrange(prev => {
            const newValue = !prev;
            if (newValue) {
              setShowOnlyBlue(false);
              setShowOnlyRed(false);
              setShowOnlyYellow(false);
              setShowOnlyGreen(false);
              setShowOnlyPink(false);
              setShowOnlyWhite(false);
              setShowOnlyBlack(false);
            }
            return newValue;
          });
        }
        if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          setShowOnlyPink(prev => {
            const newValue = !prev;
            if (newValue) {
              setShowOnlyBlue(false);
              setShowOnlyRed(false);
              setShowOnlyYellow(false);
              setShowOnlyGreen(false);
              setShowOnlyOrange(false);
              setShowOnlyWhite(false);
              setShowOnlyBlack(false);
            }
            return newValue;
          });
        }
        if (e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          setShowOnlyWhite(prev => {
            const newValue = !prev;
            if (newValue) {
              setShowOnlyBlue(false);
              setShowOnlyRed(false);
              setShowOnlyYellow(false);
              setShowOnlyGreen(false);
              setShowOnlyOrange(false);
              setShowOnlyPink(false);
              setShowOnlyBlack(false);
            }
            return newValue;
          });
        }
        if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          setShowOnlyBlue(prev => {
            const newValue = !prev;
            if (newValue) {
              setShowOnlyRed(false);
              setShowOnlyYellow(false);
              setShowOnlyGreen(false);
              setShowOnlyOrange(false);
              setShowOnlyPink(false);
              setShowOnlyWhite(false);
              setShowOnlyBlack(false);
            }
            return newValue;
          });
        }
        if (e.key === 'k' || e.key === 'K') {
          e.preventDefault();
          setShowOnlyBlack(prev => {
            const newValue = !prev;
            if (newValue) {
              setShowOnlyBlue(false);
              setShowOnlyRed(false);
              setShowOnlyYellow(false);
              setShowOnlyGreen(false);
              setShowOnlyOrange(false);
              setShowOnlyPink(false);
              setShowOnlyWhite(false);
            }
            return newValue;
          });
        }
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
            {gameId === 'connectfour-3d' ? (
              <>
                <div className="stat">
                  <span className="stat-label">Current Player</span>
                <span className="stat-value" style={{ 
                  color: gameState.currentPlayer === 1 ? '#dc2626' : 
                         gameState.currentPlayer === 2 ? '#3b82f6' : 
                         gameState.currentPlayer === 3 ? '#eab308' : 
                         gameState.currentPlayer === 4 ? '#22c55e' : 
                         gameState.currentPlayer === 5 ? '#fb923c' : 
                         gameState.currentPlayer === 6 ? '#f9a8d4' : 
                         gameState.currentPlayer === 7 ? '#ffffff' : 
                         '#1f2937'
                }}>
                  {gameState.currentPlayer === 1 ? 'Player 1 (Red)' : 
                   gameState.currentPlayer === 2 ? 'Player 2 (Blue)' : 
                   gameState.currentPlayer === 3 ? 'Player 3 (Yellow)' : 
                   gameState.currentPlayer === 4 ? 'Player 4 (Green)' : 
                   gameState.currentPlayer === 5 ? 'Player 5 (Orange)' : 
                   gameState.currentPlayer === 6 ? 'Player 6 (Pink)' : 
                   gameState.currentPlayer === 7 ? 'Player 7 (White)' : 
                   'Player 8 (Black)'}
                </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Players</span>
                  <span className="stat-value">{numPlayers}</span>
                </div>
              </>
            ) : (
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
              <GameScene gameId={gameId} gameState={gameState} setGameState={setGameState} flagMode={flagMode} hintFunctionRef={hintFunctionRef} checkFunctionRef={checkFunctionRef} difficulty={difficulty} showOnlyBlue={showOnlyBlue} showOnlyRed={showOnlyRed} showOnlyYellow={showOnlyYellow} showOnlyGreen={showOnlyGreen} showOnlyOrange={showOnlyOrange} showOnlyPink={showOnlyPink} showOnlyWhite={showOnlyWhite} showOnlyBlack={showOnlyBlack} showGrid={showGrid} numPlayers={numPlayers} boardSize={boardSize} onWordSelected={gameId === 'crossword-3d' ? handleWordSelected : undefined} hideFilledWords={gameId === 'crossword-3d' ? hideFilledWords : false} />
              <OrbitControls enableZoom={gameId === 'minesweeper-3d' || gameId === 'connectfour-3d' || gameId === 'crossword-3d'} />
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
          {gameId === 'connectfour-3d' && (
            <div className="game-extra-controls">
              <div className="difficulty-control">
                <label htmlFor="board-size-select" className="difficulty-label">Board Size:</label>
                <select 
                  id="board-size-select"
                  value={boardSize}
                  onChange={(e) => {
                    setBoardSize(Number(e.target.value));
                    // Reset the game by temporarily stopping and restarting
                    setGameState(prev => ({ ...prev, isPlaying: false }));
                    setGameState(prev => ({ ...prev, isPlaying: true }));
                  }}
                  className="difficulty-select"
                  style={{ minWidth: '100px' }}
                >
                  <option value={5}>5×5×5</option>
                  <option value={7}>7×7×7</option>
                  <option value={9}>9×9×9</option>
                </select>
              </div>
              <div className="difficulty-control">
                <label htmlFor="players-select" className="difficulty-label">Players:</label>
                <select 
                  id="players-select"
                  value={numPlayers}
                  onChange={(e) => {
                    setNumPlayers(Number(e.target.value));
                    // Reset the game by temporarily stopping and restarting
                    setGameState(prev => ({ ...prev, isPlaying: false }));
                    setGameState(prev => ({ ...prev, isPlaying: true }));
                  }}
                  className="difficulty-select"
                  style={{ minWidth: '80px' }}
                >
                  <option value={2}>2 Players</option>
                  <option value={3}>3 Players</option>
                  <option value={4}>4 Players</option>
                  <option value={5}>5 Players</option>
                  <option value={6}>6 Players</option>
                  <option value={7}>7 Players</option>
                  <option value={8}>8 Players</option>
                </select>
              </div>
              <button 
                className="instructions-button"
                onClick={() => setShowGrid(prev => !prev)}
              >
                {showGrid ? 'Grid: ON' : 'Grid: OFF'}
              </button>
              {numPlayers >= 1 && (
                <button 
                  className="instructions-button"
                  onClick={() => {
                    setShowOnlyRed(prev => {
                      const newValue = !prev;
                      if (newValue) {
                        setShowOnlyBlue(false);
                        setShowOnlyYellow(false);
                        setShowOnlyGreen(false);
                        setShowOnlyOrange(false);
                        setShowOnlyPink(false);
                        setShowOnlyWhite(false);
                        setShowOnlyBlack(false);
                      }
                      return newValue;
                    });
                  }}
                >
                  {showOnlyRed ? 'Show Red: ON (R)' : 'Show Red: OFF (R)'}
                </button>
              )}
              {numPlayers >= 2 && (
                <button 
                  className="instructions-button"
                  onClick={() => {
                    setShowOnlyBlue(prev => {
                      const newValue = !prev;
                      if (newValue) {
                        setShowOnlyRed(false);
                        setShowOnlyYellow(false);
                        setShowOnlyGreen(false);
                        setShowOnlyOrange(false);
                        setShowOnlyPink(false);
                        setShowOnlyWhite(false);
                        setShowOnlyBlack(false);
                      }
                      return newValue;
                    });
                  }}
                >
                  {showOnlyBlue ? 'Show Blue: ON (B)' : 'Show Blue: OFF (B)'}
                </button>
              )}
              {numPlayers >= 3 && (
                <button 
                  className="instructions-button"
                  onClick={() => {
                    setShowOnlyYellow(prev => {
                      const newValue = !prev;
                      if (newValue) {
                        setShowOnlyBlue(false);
                        setShowOnlyRed(false);
                        setShowOnlyGreen(false);
                        setShowOnlyOrange(false);
                        setShowOnlyPink(false);
                        setShowOnlyWhite(false);
                        setShowOnlyBlack(false);
                      }
                      return newValue;
                    });
                  }}
                >
                  {showOnlyYellow ? 'Show Yellow: ON (Y)' : 'Show Yellow: OFF (Y)'}
                </button>
              )}
              {numPlayers >= 4 && (
                <button 
                  className="instructions-button"
                  onClick={() => {
                    setShowOnlyGreen(prev => {
                      const newValue = !prev;
                      if (newValue) {
                        setShowOnlyBlue(false);
                        setShowOnlyRed(false);
                        setShowOnlyYellow(false);
                        setShowOnlyOrange(false);
                        setShowOnlyPink(false);
                        setShowOnlyWhite(false);
                        setShowOnlyBlack(false);
                      }
                      return newValue;
                    });
                  }}
                >
                  {showOnlyGreen ? 'Show Green: ON (G)' : 'Show Green: OFF (G)'}
                </button>
              )}
              {numPlayers >= 5 && (
                <button 
                  className="instructions-button"
                  onClick={() => {
                    setShowOnlyOrange(prev => {
                      const newValue = !prev;
                      if (newValue) {
                        setShowOnlyBlue(false);
                        setShowOnlyRed(false);
                        setShowOnlyYellow(false);
                        setShowOnlyGreen(false);
                        setShowOnlyPink(false);
                        setShowOnlyWhite(false);
                        setShowOnlyBlack(false);
                      }
                      return newValue;
                    });
                  }}
                >
                  {showOnlyOrange ? 'Show Orange: ON (O)' : 'Show Orange: OFF (O)'}
                </button>
              )}
              {numPlayers >= 6 && (
                <button 
                  className="instructions-button"
                  onClick={() => {
                    setShowOnlyPink(prev => {
                      const newValue = !prev;
                      if (newValue) {
                        setShowOnlyBlue(false);
                        setShowOnlyRed(false);
                        setShowOnlyYellow(false);
                        setShowOnlyGreen(false);
                        setShowOnlyOrange(false);
                        setShowOnlyWhite(false);
                        setShowOnlyBlack(false);
                      }
                      return newValue;
                    });
                  }}
                >
                  {showOnlyPink ? 'Show Pink: ON (P)' : 'Show Pink: OFF (P)'}
                </button>
              )}
              {numPlayers >= 7 && (
                <button 
                  className="instructions-button"
                  onClick={() => {
                    setShowOnlyWhite(prev => {
                      const newValue = !prev;
                      if (newValue) {
                        setShowOnlyBlue(false);
                        setShowOnlyRed(false);
                        setShowOnlyYellow(false);
                        setShowOnlyGreen(false);
                        setShowOnlyOrange(false);
                        setShowOnlyPink(false);
                        setShowOnlyBlack(false);
                      }
                      return newValue;
                    });
                  }}
                >
                  {showOnlyWhite ? 'Show White: ON (W)' : 'Show White: OFF (W)'}
                </button>
              )}
              {numPlayers >= 8 && (
                <button 
                  className="instructions-button"
                  onClick={() => {
                    setShowOnlyBlack(prev => {
                      const newValue = !prev;
                      if (newValue) {
                        setShowOnlyBlue(false);
                        setShowOnlyRed(false);
                        setShowOnlyYellow(false);
                        setShowOnlyGreen(false);
                        setShowOnlyOrange(false);
                        setShowOnlyPink(false);
                        setShowOnlyWhite(false);
                      }
                      return newValue;
                    });
                  }}
                >
                  {showOnlyBlack ? 'Show Black: ON (K)' : 'Show Black: OFF (K)'}
                </button>
              )}
            </div>
          )}
          {gameId === 'crossword-3d' && (
            <div className="game-extra-controls">
              <div className="difficulty-control">
                <label htmlFor="board-size-select" className="difficulty-label">Board Size:</label>
                <select 
                  id="board-size-select"
                  value={boardSize}
                  onChange={(e) => {
                    setBoardSize(Number(e.target.value));
                    // Reset the game by temporarily stopping and restarting
                    setGameState(prev => ({ ...prev, isPlaying: false }));
                    setGameState(prev => ({ ...prev, isPlaying: true }));
                    setSelectedWordInfo(null); // Clear selected word when changing board size
                  }}
                  className="difficulty-select"
                  style={{ minWidth: '100px' }}
                >
                  <option value={5}>5×5×5</option>
                  <option value={7}>7×7×7</option>
                  <option value={9}>9×9×9</option>
                </select>
              </div>
              {selectedWordInfo && (
                <div className="word-hint-display" style={{
                  padding: '10px 15px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  border: '2px solid #3b82f6',
                  minWidth: '200px',
                  maxWidth: '400px'
                }}>
                  <div style={{ fontSize: '0.9em', color: '#4b5563' }}>
                    {selectedWordInfo.definition}
                  </div>
                </div>
              )}
              <button 
                className={`instructions-button ${hintButtonRed ? 'hint-button-red' : ''}`}
                onClick={() => {
                  if (hintFunctionRef.current && gameState.isPlaying) {
                    const result = hintFunctionRef.current();
                    if (result === false) {
                      setHintButtonRed(true);
                      setTimeout(() => setHintButtonRed(false), 500);
                    }
                  }
                }}
                disabled={!gameState.isPlaying}
              >
                💡 Hint
              </button>
              <button 
                className="instructions-button"
                onClick={() => {
                  if (checkFunctionRef.current && gameState.isPlaying) {
                    checkFunctionRef.current();
                  }
                }}
                disabled={!gameState.isPlaying}
              >
                ✓ Check
              </button>
              <button 
                className="instructions-button"
                onClick={() => setHideFilledWords(prev => !prev)}
              >
                {hideFilledWords ? 'Show Filled Words' : 'Hide Filled Words'}
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