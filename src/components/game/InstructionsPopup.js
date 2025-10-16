import React from 'react';
import './InstructionsPopup.css';

const InstructionsPopup = ({ game, onClose, onStart }) => {
  const getInstructions = (gameId) => {
    const instructions = {
      'tetris-3d': {
        objective: 'Stack blocks in 3D to clear layers and survive!',
        controls: [
          'Arrow Keys: Move blocks',
          'Space: Rotate block',
          'Shift: Drop block faster',
          'R: Reset game'
        ],
        tips: [
          'Plan your moves in 3D space',
          'Clear layers from bottom to top',
          'Watch for gaps in your structure'
        ]
      },
      'snake-3d': {
        objective: 'Navigate through 3D space as a growing snake!',
        controls: [
          'Arrow Keys: Move snake',
          'WASD: Rotate camera',
          'Space: Jump to different level',
          'R: Reset game'
        ],
        tips: [
          'Don\'t hit walls or yourself',
          'Collect food to grow longer',
          'Use 3D movement to your advantage'
        ]
      },
      'pong-3d': {
        objective: 'Paddle your way through multiple dimensions!',
        controls: [
          'W/S: Move paddle up/down',
          'A/D: Move paddle left/right',
          'Q/E: Rotate paddle',
          'Space: Serve ball'
        ],
        tips: [
          'Predict ball trajectory in 3D',
          'Use paddle rotation for tricky shots',
          'Watch for ball speed changes'
        ]
      },
      'breakout-3d': {
        objective: 'Break through layers of 3D blocks!',
        controls: [
          'Arrow Keys: Move paddle',
          'Space: Launch ball',
          'Mouse: Rotate camera',
          'R: Reset game'
        ],
        tips: [
          'Aim for weak spots in blocks',
          'Use paddle edges for better angles',
          'Watch for power-ups'
        ]
      },
      'pacman-3d': {
        objective: 'Collect dots and avoid ghosts in 3D!',
        controls: [
          'Arrow Keys: Move Pac-Man',
          'WASD: Rotate camera',
          'Space: Jump between levels',
          'R: Reset game'
        ],
        tips: [
          'Plan your route through the maze',
          'Use power pellets to eat ghosts',
          'Watch for ghost patterns'
        ]
      },
      'asteroids-3d': {
        objective: 'Destroy 3D asteroids in space!',
        controls: [
          'Arrow Keys: Move ship',
          'Space: Shoot',
          'Shift: Thrust',
          'R: Reset game'
        ],
        tips: [
          'Aim carefully in 3D space',
          'Watch for asteroid trajectories',
          'Use thrust sparingly'
        ]
      },
      'minesweeper-3d': {
        objective: 'Reveal all safe cubes in a 3D grid without clicking a bomb.',
        controls: [
          'Left Click: Reveal cube / flood reveal if zero',
          'Right Click: Flag/unflag suspected bomb (turns blue)',
          'Double Click on revealed number: Remove that cube from scene',
          'Mouse/Wheel: Orbit and zoom camera',
          'F: Toggle flag mode (left click becomes right click)',
          'R: Reset game'
        ],
        tips: [
          'Numbers show count of adjacent bombs in 26-neighborhood',
          'Use flags to track bombs; bombs remaining updates as you flag',
          'Zoom in/out to inspect deeper layers',
          'Scoring: Outer layer cubes = 10 points, Second layer = 100 points, Center cube = 250 points',
          'Difficulty: Easy (5×5×5), Medium (7×7×7), Hard (9×9×9) - bomb count scales proportionally'
        ]
      }
    };

    return instructions[gameId] || {
      objective: 'Complete the game objectives!',
      controls: ['Use arrow keys to move', 'Space to interact', 'R to reset'],
      tips: ['Have fun!', 'Try different strategies', 'Practice makes perfect']
    };
  };

  const instructions = getInstructions(game.id);

  return (
    <div className="instructions-overlay">
      <div className="instructions-popup">
        <div className="popup-header">
          <h2 className="popup-title">How to Play {game.title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="popup-content">
          <div className="instruction-section">
            <h3 className="section-title">Objective</h3>
            <p className="objective-text">{instructions.objective}</p>
          </div>

          <div className="instruction-section">
            <h3 className="section-title">Controls</h3>
            <ul className="controls-list">
              {instructions.controls.map((control, index) => (
                <li key={index} className="control-item">{control}</li>
              ))}
            </ul>
          </div>

          <div className="instruction-section">
            <h3 className="section-title">Tips</h3>
            <ul className="tips-list">
              {instructions.tips.map((tip, index) => (
                <li key={index} className="tip-item">{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="popup-actions">
          <button className="start-game-btn" onClick={onStart}>
            Start Game
          </button>
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsPopup; 