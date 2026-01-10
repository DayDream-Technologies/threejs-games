/**
 * Crossword 3D Controls Component
 */

import React from 'react';

const CrosswordControls = ({
  boardSize,
  onBoardSizeChange,
  selectedWordInfo,
  onHint,
  onCheck,
  hideFilledWords,
  onHideFilledWordsToggle,
  isPlaying,
  hintButtonRed
}) => {
  return (
    <div className="game-extra-controls">
      <div className="difficulty-control">
        <label htmlFor="board-size-select" className="difficulty-label">Board Size:</label>
        <select 
          id="board-size-select"
          value={boardSize}
          onChange={(e) => onBoardSizeChange(Number(e.target.value))}
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
        onClick={onHint}
        disabled={!isPlaying}
      >
        💡 Hint
      </button>
      <button 
        className="instructions-button"
        onClick={onCheck}
        disabled={!isPlaying}
      >
        ✓ Check
      </button>
      <button 
        className="instructions-button"
        onClick={onHideFilledWordsToggle}
      >
        {hideFilledWords ? 'Show Filled Words' : 'Hide Filled Words'}
      </button>
    </div>
  );
};

export default CrosswordControls;

