import React, { useState } from 'react';
import { games, searchGames } from '../../data/games';
import SearchBar from '../shared/SearchBar';
import GameCard from '../shared/GameCard';
import './LandingPage.css';

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGames, setFilteredGames] = useState(games);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredGames(games);
    } else {
      setFilteredGames(searchGames(query));
    }
  };

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="header-content">
          <h1 className="site-title">
            <span className="title-main">ARCADE</span>
            <span className="title-sub">3D GAMES</span>
          </h1>
          <p className="site-subtitle">Classic arcade games reimagined in stunning 3D</p>
        </div>
      </header>

      <main className="landing-main">
        <div className="search-section">
          <SearchBar 
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search games by title, genre, or description..."
          />
        </div>

        <div className="games-section">
          <h2 className="section-title">
            {searchQuery ? `Search Results (${filteredGames.length})` : 'Available Games'}
          </h2>
          
          {filteredGames.length === 0 ? (
            <div className="no-results">
              <p>No games found matching "{searchQuery}"</p>
              <button 
                className="clear-search-btn"
                onClick={() => handleSearch('')}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="games-grid">
              {filteredGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} <a href="https://daydreamtechnologies.net" target="_blank" rel="noopener noreferrer">DayDream Technologies</a>. All rights reserved. Classic games, modern experience.</p>
      </footer>
    </div>
  );
};

export default LandingPage; 