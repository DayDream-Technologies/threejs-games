# 🎮 Arcade 3D Games Website

A modern, responsive video game website built with React.js and React Three Fiber (R3F) featuring classic arcade games reimagined in stunning 3D.

## 🌟 Features

- **Arcade-Style Design**: Neon colors, glowing effects, and retro typography
- **Responsive Layout**: Optimized for all devices and screen sizes
- **Search Functionality**: Find games by title, genre, description, or tags
- **3D Game Scenes**: Interactive Three.js scenes for each game
- **Performance Optimized**: On-demand rendering and efficient 3D graphics
- **Modular Architecture**: Easy to add new games and maintain

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd threes-games
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The website will be available at `http://localhost:3000`

## 🎯 Creating Your Own Three.js Games

### Game Structure

Each game follows this modular structure:

```
src/games/your-game-name/
├── YourGame.js          # Main game component
├── YourGameScene.js     # Three.js scene component
├── YourGameLogic.js     # Game logic and state management
└── YourGameAssets.js    # Game assets and constants
```

### Step-by-Step Guide

#### 1. Add Game Data

First, add your game to the centralized data file:

```javascript
// src/data/games.js
export const games = [
  // ... existing games
  {
    id: 'your-game-id',
    title: 'Your Game Title',
    description: 'Description of your game',
    genre: 'Your Genre',
    difficulty: 'Easy/Medium/Hard',
    playTime: '3-10 min',
    image: '/images/your-game.jpg',
    path: '/games/your-game-id',
    tags: ['your', 'tags', 'here']
  }
];
```

#### 2. Create Game Components

Create your game folder and components:

```javascript
// src/games/your-game/YourGame.js
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import YourGameScene from './YourGameScene';

const YourGame = ({ gameState, setGameState }) => {
  // Your game logic here
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <YourGameScene gameState={gameState} setGameState={setGameState} />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
};

export default YourGame;
```

#### 3. Create the 3D Scene

```javascript
// src/games/your-game/YourGameScene.js
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder } from '@react-three/drei';

const YourGameScene = ({ gameState, setGameState }) => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    // Animation loop
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
    }
  });

  return (
    <group>
      {/* Your 3D objects here */}
      <Box ref={meshRef} args={[1, 1, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ff6b6b" />
      </Box>
    </group>
  );
};

export default YourGameScene;
```

#### 4. Update GameScene Component

Add your game to the main GameScene component:

```javascript
// src/components/game/GameScene.js
const renderGameScene = () => {
  switch (gameId) {
    // ... existing cases
    case 'your-game-id':
      return <YourGameScene gameState={gameState} setGameState={setGameState} />;
    default:
      return <DefaultScene />;
  }
};
```

#### 5. Add Instructions

Update the InstructionsPopup component:

```javascript
// src/components/game/InstructionsPopup.js
const getInstructions = (gameId) => {
  const instructions = {
    // ... existing instructions
    'your-game-id': {
      objective: 'Your game objective',
      controls: [
        'Arrow Keys: Move',
        'Space: Action',
        'R: Reset game'
      ],
      tips: [
        'Your tip 1',
        'Your tip 2',
        'Your tip 3'
      ]
    }
  };
  return instructions[gameId] || defaultInstructions;
};
```

### Performance Best Practices

#### 1. On-Demand Rendering (Landing Page)
```javascript
<Canvas frameloop="demand">
  {/* Only renders when props change */}
</Canvas>
```

#### 2. Efficient Animation Loops
```javascript
useFrame((state, delta) => {
  // Use delta for smooth animations
  meshRef.current.rotation.x += delta * 0.5;
});
```

#### 3. Geometry Batching
```javascript
// Use instancing for repeated objects
import { Instances, Instance } from '@react-three/drei';

<Instances>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="#ff6b6b" />
  {items.map((item, i) => (
    <Instance key={i} position={item.position} />
  ))}
</Instances>
```

#### 4. Level of Detail (LOD)
```javascript
import { Detailed } from '@react-three/drei';

<Detailed distances={[0, 10, 20]}>
  <mesh>
    {/* High detail mesh */}
  </mesh>
  <mesh>
    {/* Medium detail mesh */}
  </mesh>
  <mesh>
    {/* Low detail mesh */}
  </mesh>
</Detailed>
```

## 📚 Libraries and Resources

### Core Libraries

#### React Three Fiber (@react-three/fiber)
- **Purpose**: React renderer for Three.js
- **Key Features**: 
  - Declarative Three.js components
  - Automatic cleanup and memory management
  - React state integration
- **Documentation**: https://docs.pmnd.rs/react-three-fiber

#### React Three Drei (@react-three/drei)
- **Purpose**: Useful helpers and abstractions for R3F
- **Key Components**:
  - `OrbitControls`: Camera controls
  - `Box`, `Sphere`, `Cylinder`: Basic geometries
  - `Instances`: Geometry instancing
  - `Detailed`: Level of detail
  - `Text`: 3D text rendering
- **Documentation**: https://docs.pmnd.rs/drei

#### Three.js
- **Purpose**: 3D graphics library
- **Key Concepts**:
  - Scene, Camera, Renderer
  - Geometries and Materials
  - Lighting and Shadows
  - Animation and Interactivity
- **Documentation**: https://threejs.org/docs

### Additional Resources

#### Performance Optimization
- **React Three Fiber Performance**: https://docs.pmnd.rs/react-three-fiber/advanced/performance
- **Three.js Performance**: https://discoverthreejs.com/tips-and-tricks/
- **Geometry Batching**: https://threejs.org/docs/#api/en/objects/InstancedMesh

#### 3D Modeling and Assets
- **Blender**: Free 3D modeling software
- **Sketchfab**: 3D model marketplace
- **Three.js Editor**: Online 3D scene editor
- **GLTF Format**: Standard 3D asset format

#### Game Development Resources
- **Three.js Examples**: https://threejs.org/examples/
- **React Three Fiber Examples**: https://docs.pmnd.rs/react-three-fiber/getting-started/examples
- **Game Physics**: Consider libraries like `cannon-es` for physics

### Styling and UI

#### CSS Variables (Custom Properties)
The project uses CSS variables for consistent theming:

```css
:root {
  --neon-pink: #ff6b9d;
  --neon-cyan: #4ecdc4;
  --neon-yellow: #ffd93d;
  --neon-purple: #a855f7;
  --neon-blue: #3b82f6;
  --neon-green: #10b981;
  --dark-bg: #0f0f23;
  --darker-bg: #0a0a1a;
}
```

#### Responsive Design
- Mobile-first approach
- CSS Grid and Flexbox
- Media queries for different screen sizes
- Touch-friendly interactions

## 🎨 Design System

### Color Palette
- **Primary**: Neon pink (#ff6b9d)
- **Secondary**: Neon cyan (#4ecdc4)
- **Accent**: Neon yellow (#ffd93d)
- **Background**: Dark gradients (#0f0f23 to #0a0a1a)

### Typography
- **Display Font**: Orbitron (headings)
- **Body Font**: Courier New (monospace)

### Animations
- **Neon Glow**: Text shadow animations
- **Hover Effects**: Transform and shadow changes
- **Float Animation**: Subtle movement effects
- **Pulse**: Attention-grabbing elements

## 🚀 Deployment

### GitHub Pages (Recommended)

This project is configured for automatic deployment to GitHub Pages.

#### Automatic Deployment (GitHub Actions)
1. Push your changes to the `main` branch
2. GitHub Actions will automatically build and deploy your site
3. Your site will be available at `https://daydream-technologies.github.io/threes-games`

#### Manual Deployment
```bash
# Install dependencies (if not already done)
npm install

# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

#### GitHub Pages Setup
1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "GitHub Actions"
4. The workflow will automatically deploy on every push to main

**Note**: This project uses HashRouter instead of BrowserRouter for GitHub Pages compatibility. URLs will include a `#` symbol (e.g., `https://daydream-technologies.github.io/threes-games/#/games/minesweeper-3d`).

### Other Deploy Options
- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your GitHub repository
- **Firebase Hosting**: Use Firebase CLI

### Build for Production
```bash
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your game following the structure above
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Roadmap

- [ ] Add more classic arcade games
- [ ] Implement multiplayer functionality
- [ ] Add sound effects and music
- [ ] Create game leaderboards
- [ ] Add user accounts and progress tracking
- [ ] Implement game achievements
- [ ] Add VR support for compatible games

---

**Happy coding! 🎮✨**
