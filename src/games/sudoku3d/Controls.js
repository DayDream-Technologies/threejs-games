/**
 * 3D Sudoku Controls
 *
 * Difficulty, New Game, Hint, Check, layer navigation, and number input 1–9 + Clear.
 */

import React from 'react';
import { LAYER_COLORS } from './config';

const SudokuControls = ({
  difficulty,
  onDifficultyChange,
  onNewGame,
  onHint,
  onCheck,
  onNumberInput,
  onClear,
  hideCompletedCells,
  onHideCompletedToggle,
  notesMode,
  onNotesToggle,
  mistakes,
  showHint,
  completedDigits,
  viewOnlyLayer,
  onLayerClick,
  isPlaying,
  hintButtonRed
}) => {
  const completed = Array.isArray(completedDigits) ? completedDigits : [];
  return (
    <div className="game-extra-controls">
      <p className="sudoku-layer-hint" style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '10px', maxWidth: '320px' }}>
        Click a layer below to show only that 2D plane; click again to show all. Use <strong>arrow keys</strong> and <strong>Page Up/Down</strong>. Wrong = red, conflict = orange.
      </p>
      <div style={{ marginBottom: '10px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, marginRight: '8px' }}>Layers:</span>
        {(LAYER_COLORS || []).map((color, i) => (
          <button
            key={i}
            type="button"
            className="instructions-button"
            style={{
              width: 28,
              height: 28,
              minWidth: 28,
              padding: 0,
              margin: '2px',
              backgroundColor: color,
              border: viewOnlyLayer === i ? '3px solid #1f2937' : '2px solid #9ca3af',
              borderRadius: 4
            }}
            onClick={() => onLayerClick && onLayerClick(i)}
            title={viewOnlyLayer === i ? `Layer ${i + 1} (click to show all)` : `Show only layer ${i + 1}`}
          />
        ))}
        {viewOnlyLayer != null && (
          <button
            type="button"
            className="instructions-button"
            style={{ marginLeft: '6px', fontSize: '0.75rem' }}
            onClick={() => onLayerClick && onLayerClick(null)}
          >
            Show all
          </button>
        )}
      </div>
      <div className="difficulty-control">
        <label htmlFor="sudoku-difficulty" className="difficulty-label">Difficulty:</label>
        <select
          id="sudoku-difficulty"
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="difficulty-select"
          style={{ minWidth: '110px' }}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
          <option value="Very Hard">Very Hard</option>
          <option value="Insane">Insane</option>
        </select>
      </div>

      {mistakes !== undefined && (
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Mistakes: {mistakes}</span>
      )}

      <button
        className="instructions-button"
        onClick={onNewGame}
        disabled={!isPlaying}
      >
        New Game
      </button>

      <button
        className={`instructions-button ${hintButtonRed ? 'hint-button-red' : ''}`}
        onClick={onHint}
        disabled={!isPlaying || !showHint}
        style={showHint ? { background: '#f59e0b', color: '#fff' } : {}}
      >
        Hint {!showHint ? '(3 mistakes)' : ''}
      </button>
      <button
        className="instructions-button"
        onClick={onCheck}
        disabled={!isPlaying}
      >
        Check
      </button>

      <button
        type="button"
        className="instructions-button"
        onClick={() => onNotesToggle && onNotesToggle()}
        style={notesMode ? { background: '#f97316', color: '#fff' } : {}}
      >
        Notes {notesMode ? 'ON' : ''}
      </button>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={!!hideCompletedCells}
          onChange={() => onHideCompletedToggle && onHideCompletedToggle()}
        />
        <span>Hide completed cells</span>
      </label>

      <div className="sudoku-number-pad" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px', maxWidth: '180px' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            className="instructions-button"
            style={{
              minWidth: '44px',
              margin: 0,
              opacity: completed[n] ? 0.5 : 1
            }}
            onClick={() => onNumberInput && onNumberInput(n)}
            disabled={!isPlaying || !!completed[n]}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          className="instructions-button"
          style={{ minWidth: '44px', margin: 0 }}
          onClick={() => onClear && onClear()}
          disabled={!isPlaying}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default SudokuControls;
