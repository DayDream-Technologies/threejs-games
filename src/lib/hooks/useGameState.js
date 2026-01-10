/**
 * useGameState Hook
 * 
 * Provides standard game state management with common game lifecycle methods.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * @typedef {Object} GameStateConfig
 * @property {function} [onGameStart] - Called when game starts
 * @property {function} [onGameEnd] - Called when game ends (win or lose)
 * @property {function} [onScoreChange] - Called when score changes
 * @property {Object} [initialState] - Initial state override
 */

/**
 * Custom hook for managing game state
 * @param {GameStateConfig} config
 * @returns {Object} Game state and control functions
 */
export const useGameState = (config = {}) => {
  const {
    onGameStart,
    onGameEnd,
    onScoreChange,
    initialState = {}
  } = config;
  
  const [state, setState] = useState({
    score: 0,
    lives: 1,
    level: 'Easy',
    isPlaying: false,
    gameWon: false,
    gameLost: false,
    ...initialState
  });
  
  const hasStartedRef = useRef(false);
  const previousPlayingRef = useRef(false);
  
  // Start game
  const startGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: true,
      gameWon: false,
      gameLost: false,
      score: 0
    }));
    
    if (onGameStart) {
      onGameStart();
    }
    
    hasStartedRef.current = true;
  }, [onGameStart]);
  
  // End game with win
  const winGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      gameWon: true,
      gameLost: false
    }));
    
    if (onGameEnd) {
      onGameEnd({ won: true, score: state.score });
    }
  }, [onGameEnd, state.score]);
  
  // End game with loss
  const loseGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      gameWon: false,
      gameLost: true
    }));
    
    if (onGameEnd) {
      onGameEnd({ won: false, score: state.score });
    }
  }, [onGameEnd, state.score]);
  
  // Add to score
  const addScore = useCallback((points) => {
    setState(prev => {
      const newScore = prev.score + points;
      if (onScoreChange) {
        onScoreChange(newScore, points);
      }
      return { ...prev, score: newScore };
    });
  }, [onScoreChange]);
  
  // Set score directly
  const setScore = useCallback((score) => {
    setState(prev => {
      if (onScoreChange) {
        onScoreChange(score, score - prev.score);
      }
      return { ...prev, score };
    });
  }, [onScoreChange]);
  
  // Lose a life
  const loseLife = useCallback(() => {
    setState(prev => {
      const newLives = prev.lives - 1;
      if (newLives <= 0) {
        // Trigger game over
        setTimeout(() => loseGame(), 0);
      }
      return { ...prev, lives: newLives };
    });
  }, [loseGame]);
  
  // Set level/difficulty
  const setLevel = useCallback((level) => {
    setState(prev => ({ ...prev, level }));
  }, []);
  
  // Update custom state
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);
  
  // Reset game
  const resetGame = useCallback(() => {
    setState({
      score: 0,
      lives: initialState.lives || 1,
      level: initialState.level || 'Easy',
      isPlaying: false,
      gameWon: false,
      gameLost: false,
      ...initialState
    });
    hasStartedRef.current = false;
  }, [initialState]);
  
  // Auto-start effect
  useEffect(() => {
    if (state.isPlaying && !previousPlayingRef.current) {
      if (hasStartedRef.current) {
        // Restart
        if (onGameStart) onGameStart();
      }
    }
    previousPlayingRef.current = state.isPlaying;
  }, [state.isPlaying, onGameStart]);
  
  return {
    state,
    setState,
    startGame,
    winGame,
    loseGame,
    addScore,
    setScore,
    loseLife,
    setLevel,
    updateState,
    resetGame,
    isPlaying: state.isPlaying,
    isGameOver: state.gameWon || state.gameLost
  };
};

export default useGameState;

