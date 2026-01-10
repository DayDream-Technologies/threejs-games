/**
 * Connect Four 3D Controls Component
 */

import React from 'react';

const ConnectFourControls = ({
  boardSize,
  onBoardSizeChange,
  numPlayers,
  onNumPlayersChange,
  showGrid,
  onShowGridToggle,
  colorFilters,
  onColorFilterToggle
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
      <div className="difficulty-control">
        <label htmlFor="players-select" className="difficulty-label">Players:</label>
        <select 
          id="players-select"
          value={numPlayers}
          onChange={(e) => onNumPlayersChange(Number(e.target.value))}
          className="difficulty-select"
          style={{ minWidth: '80px' }}
        >
          {[2, 3, 4, 5, 6, 7, 8].map(n => (
            <option key={n} value={n}>{n} Players</option>
          ))}
        </select>
      </div>
      <button 
        className="instructions-button"
        onClick={onShowGridToggle}
      >
        {showGrid ? 'Grid: ON' : 'Grid: OFF'}
      </button>
      
      {/* Color filter buttons */}
      {numPlayers >= 1 && (
        <button 
          className="instructions-button"
          onClick={() => onColorFilterToggle('red')}
        >
          {colorFilters.red ? 'Show Red: ON (R)' : 'Show Red: OFF (R)'}
        </button>
      )}
      {numPlayers >= 2 && (
        <button 
          className="instructions-button"
          onClick={() => onColorFilterToggle('blue')}
        >
          {colorFilters.blue ? 'Show Blue: ON (B)' : 'Show Blue: OFF (B)'}
        </button>
      )}
      {numPlayers >= 3 && (
        <button 
          className="instructions-button"
          onClick={() => onColorFilterToggle('yellow')}
        >
          {colorFilters.yellow ? 'Show Yellow: ON (Y)' : 'Show Yellow: OFF (Y)'}
        </button>
      )}
      {numPlayers >= 4 && (
        <button 
          className="instructions-button"
          onClick={() => onColorFilterToggle('green')}
        >
          {colorFilters.green ? 'Show Green: ON (G)' : 'Show Green: OFF (G)'}
        </button>
      )}
      {numPlayers >= 5 && (
        <button 
          className="instructions-button"
          onClick={() => onColorFilterToggle('orange')}
        >
          {colorFilters.orange ? 'Show Orange: ON (O)' : 'Show Orange: OFF (O)'}
        </button>
      )}
      {numPlayers >= 6 && (
        <button 
          className="instructions-button"
          onClick={() => onColorFilterToggle('pink')}
        >
          {colorFilters.pink ? 'Show Pink: ON (P)' : 'Show Pink: OFF (P)'}
        </button>
      )}
      {numPlayers >= 7 && (
        <button 
          className="instructions-button"
          onClick={() => onColorFilterToggle('white')}
        >
          {colorFilters.white ? 'Show White: ON (W)' : 'Show White: OFF (W)'}
        </button>
      )}
      {numPlayers >= 8 && (
        <button 
          className="instructions-button"
          onClick={() => onColorFilterToggle('black')}
        >
          {colorFilters.black ? 'Show Black: ON (K)' : 'Show Black: OFF (K)'}
        </button>
      )}
    </div>
  );
};

export default ConnectFourControls;

