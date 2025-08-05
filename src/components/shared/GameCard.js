import React from 'react';
import { Link } from 'react-router-dom';
import './GameCard.css';

const GameCard = ({ game }) => {
  return (
    <div className="game-card">
      <div className="game-card-inner">
        <div className="game-image-container">
          <div className="game-image-placeholder">
            <span className="game-image-text">{game.title}</span>
          </div>
        </div>
        
        <div className="game-info">
          <h3 className="game-title">{game.title}</h3>
          <p className="game-description">{game.description}</p>
          
          <div className="game-meta">
            <span className="game-genre">{game.genre}</span>
            <span className="game-difficulty">{game.difficulty}</span>
            <span className="game-time">{game.playTime}</span>
          </div>
          
          <div className="game-tags">
            {game.tags.slice(0, 3).map(tag => (
              <span key={tag} className="game-tag">{tag}</span>
            ))}
          </div>
        </div>
        
        <div className="game-actions">
          <Link to={game.path} className="play-button">
            <span className="play-text">PLAY NOW</span>
            <div className="play-arrow">→</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameCard; 