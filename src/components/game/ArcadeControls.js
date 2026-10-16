/**
 * Shared difficulty and pause controls for the realtime arcade games.
 */

import React from 'react';

function ArcadeControls({
  difficulty,
  onDifficultyChange,
  isPaused,
  onPauseToggle,
  isPlaying,
  label = 'Difficulty',
  options
}) {
  return (
    <div className="game-extra-controls">
      <div className="difficulty-control">
        <label htmlFor="arcade-difficulty" className="difficulty-label">{label}</label>
        <select
          id="arcade-difficulty"
          value={difficulty}
          onChange={(event) => onDifficultyChange(event.target.value)}
          className="difficulty-select"
          disabled={isPlaying && !isPaused}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <button
        type="button"
        className="instructions-button"
        onClick={onPauseToggle}
        disabled={!isPlaying}
      >
        {isPaused ? '▶ Resume (P)' : '⏸ Pause (P)'}
      </button>
    </div>
  );
}

export default ArcadeControls;
