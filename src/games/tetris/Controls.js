/**
 * Tetris 3D Controls Component
 */

import React from 'react';

const TetrisControls = ({
  difficulty,
  onDifficultyChange,
  isPaused,
  onPauseToggle,
  isPlaying,
  level,
  linesCleared
}) => {
  return (
    <div className="game-extra-controls">
      <div className="difficulty-control">
        <label htmlFor="difficulty-select" className="difficulty-label">Grid Size:</label>
        <select 
          id="difficulty-select"
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="difficulty-select"
          disabled={isPlaying && !isPaused}
        >
          <option value="Easy">Easy (4×4×10)</option>
          <option value="Medium">Medium (5×5×12)</option>
          <option value="Hard">Hard (6×6×15)</option>
        </select>
      </div>
      
      <div className="stat-display" style={{
        padding: '8px 12px',
        backgroundColor: '#1f2937',
        borderRadius: '6px',
        color: '#e5e7eb',
        fontSize: '0.9em'
      }}>
        <span>Level: {level}</span>
        <span style={{ marginLeft: '15px' }}>Lines: {linesCleared}</span>
      </div>
      
      <button 
        className="instructions-button"
        onClick={onPauseToggle}
        disabled={!isPlaying}
      >
        {isPaused ? '▶ Resume (P)' : '⏸ Pause (P)'}
      </button>
    </div>
  );
};

export default TetrisControls;

