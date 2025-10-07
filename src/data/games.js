export const games = [
  {
    id: 'tetris-3d',
    title: '3D Tetris',
    description: 'Classic Tetris reimagined in stunning 3D. Stack blocks in three dimensions and clear layers to survive!',
    genre: 'Puzzle',
    difficulty: 'Medium',
    playTime: '5-15 min',
    image: '/images/tetris-3d.jpg',
    path: '/games/tetris-3d',
    tags: ['puzzle', '3d', 'classic', 'strategy']
  },
  {
    id: 'snake-3d',
    title: '3D Snake',
    description: 'Navigate through a 3D maze as a growing snake. Collect food and avoid hitting walls or yourself!',
    genre: 'Arcade',
    difficulty: 'Easy',
    playTime: '3-10 min',
    image: '/images/snake-3d.jpg',
    path: '/games/snake-3d',
    tags: ['arcade', '3d', 'classic', 'casual']
  },
  {
    id: 'pong-3d',
    title: '3D Pong',
    description: 'The original arcade classic gets a 3D makeover. Paddle your way through multiple dimensions!',
    genre: 'Sports',
    difficulty: 'Hard',
    playTime: '2-8 min',
    image: '/images/pong-3d.jpg',
    path: '/games/pong-3d',
    tags: ['sports', '3d', 'classic', 'competitive']
  },
  {
    id: 'breakout-3d',
    title: '3D Breakout',
    description: 'Break through layers of 3D blocks with your paddle. Multiple dimensions of brick-breaking action!',
    genre: 'Arcade',
    difficulty: 'Medium',
    playTime: '4-12 min',
    image: '/images/breakout-3d.jpg',
    path: '/games/breakout-3d',
    tags: ['arcade', '3d', 'classic', 'action']
  },
  {
    id: 'pacman-3d',
    title: '3D Pac-Man',
    description: 'Navigate through a 3D maze as Pac-Man. Collect dots and avoid ghosts in multiple dimensions!',
    genre: 'Arcade',
    difficulty: 'Medium',
    playTime: '5-15 min',
    image: '/images/pacman-3d.jpg',
    path: '/games/pacman-3d',
    tags: ['arcade', '3d', 'classic', 'maze']
  },
  {
    id: 'asteroids-3d',
    title: '3D Asteroids',
    description: 'Destroy 3D asteroids in space! Navigate through a three-dimensional asteroid field.',
    genre: 'Shooter',
    difficulty: 'Hard',
    playTime: '3-10 min',
    image: '/images/asteroids-3d.jpg',
    path: '/games/asteroids-3d',
    tags: ['shooter', '3d', 'classic', 'space']
  }
  ,
  {
    id: 'minesweeper-3d',
    title: '3D Minesweeper',
    description: 'Clear a 3D grid without detonating bombs. Flag suspects, reveal safe cubes, and flood empty regions.',
    genre: 'Puzzle',
    difficulty: 'Medium',
    playTime: '5-15 min',
    image: '/images/minesweeper-3d.jpg',
    path: '/games/minesweeper-3d',
    tags: ['puzzle', '3d', 'logic', 'minesweeper']
  }
];

export const getGameById = (id) => {
  return games.find(game => game.id === id);
};

export const searchGames = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return games.filter(game => 
    game.title.toLowerCase().includes(lowercaseQuery) ||
    game.description.toLowerCase().includes(lowercaseQuery) ||
    game.genre.toLowerCase().includes(lowercaseQuery) ||
    game.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}; 