/**
 * Game Registrations
 * 
 * This module imports all games to trigger their registration with the game framework.
 * Import this file at app startup to ensure all games are registered.
 */

// Import all games to trigger registration
import './minesweeper';
import './connectfour';
import './crossword3d';
import './sudoku3d';
import './tetris';
import './three2048';
import './snake3d';
import './pong3d';
import './breakout3d';
import './pacman3d';
import './asteroids3d';

// Re-export registry functions for convenience
export { getGame, getAllGames, getGameIds, hasGame } from '../lib/game';

