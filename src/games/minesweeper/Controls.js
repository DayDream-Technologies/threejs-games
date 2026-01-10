/**
 * Minesweeper 3D Controls Component
 * 
 * Game-specific UI controls rendered below the game canvas.
 */

import React from 'react';

const MinesweeperControls = ({
  difficulty,
  onDifficultyChange,
  flagMode,
  onFlagModeToggle,
  onHint,
  isPlaying,
  hintButtonRed
}) => {
  return (
    <div className="game-extra-controls">
      <div className="difficulty-control">
        <label htmlFor="difficulty-select" className="difficulty-label">Difficulty:</label>
        <select 
          id="difficulty-select"
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="difficulty-select"
        >
          <option value="Easy">Easy (5×5×5)</option>
          <option value="Medium">Medium (7×7×7)</option>
          <option value="Hard">Hard (9×9×9)</option>
        </select>
      </div>
      <button 
        className="instructions-button"
        onClick={onFlagModeToggle}
      >
        {flagMode ? 'Flag: ON (F)' : 'Flag: OFF (F)'}
      </button>
      <button 
        className={`instructions-button ${hintButtonRed ? 'hint-button-red' : ''}`}
        onClick={onHint}
        disabled={!isPlaying}
      >
        💡 Hint
      </button>
    </div>
  );
};

export default MinesweeperControls;

