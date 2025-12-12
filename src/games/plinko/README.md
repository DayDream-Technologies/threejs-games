# 3D Plinko Game

A modern arcade-style 3D Plinko board game built with Three.js and Cannon-es physics engine for the browser.

## Overview

This is a fully integrated 3D Plinko game that can be played directly in the arcade games collection. Watch colorful balls cascade down through pegs in a fun, relaxing arcade experience. The game uses realistic physics simulation and arcade-inspired visuals.

## Features

- **Full 3D Physics Simulation**: Using Cannon-es for accurate ball dynamics and peg collisions
- **Arcade Aesthetic**: Bright, glossy materials with emissive highlights
- **Automatic Ball Dropping**: Balls drop at regular intervals when playing
- **Multiple Ball Colors**: Random color selection from a vibrant arcade palette
- **Performance Optimized**: 
  - Instanced peg rendering to reduce draw calls
  - Ball pooling/despawning to manage memory
  - Shadow mapping for depth perception
- **Configurable Board**: Easily adjustable board dimensions, peg counts, and physics parameters
- **Clean Integration**: Modular design that fits seamlessly into the existing game framework

## Game Mechanics

1. **Starting Play**: Click "New Game" to start. Balls will automatically drop every 500ms
2. **Ball Physics**: Balls fall under gravity, bounce off pegs and walls, and land in collection boxes at the bottom
3. **Natural Behavior**: Each ball's path is unique due to slight variations in peg placement and physics simulation
4. **Auto-Cleanup**: Balls that fall below the board or exceed the time limit are automatically removed

## Technical Architecture

### File Structure
```
src/games/plinko/
├── PlinkoBoard.js    # ES module class with physics and rendering
└── Plinko3D.js       # React component wrapper for Three.js integration
```

### Core Classes and Methods

#### `PlinkoBoard` (ES Module)

Main class handling physics, rendering, and game logic.

**Constructor Parameters:**
```javascript
{
  boardWidth: 9,              // Width of the board in units
  boardHeight: 13,            // Height of the board in units
  boardDepth: 1.2,            // Depth (thickness) of the board
  rows: 14,                   // Number of peg rows
  pegRadius: 0.12,            // Radius of each peg
  pegType: 'sphere',          // 'sphere' or 'cylinder'
  pegSpacingX: 0.6,           // Horizontal spacing between pegs
  pegSpacingY: 0.6,           // Vertical spacing between pegs
  pegJitter: 0.05,            // Random jitter to avoid perfect symmetry
  ballRadius: 0.16,           // Radius of dropped balls
  ballMass: 0.4,              // Mass of each ball (kg)
  ballRestitution: 0.65,      // Bounciness (0-1)
  ballColorPalette: [...],    // Array of hex colors for balls
  boxCount: 8,                // Number of collection boxes at bottom
  sideWallOpacity: 0.5,       // Transparency of side walls (0-1)
  maxBalls: 150,              // Maximum simultaneous balls
  despawnAfterSeconds: 60,    // Auto-remove balls after this time
  enableShadows: true,        // Enable shadow mapping
  useCannon: true,            // Use Cannon-es physics (fallback available)
  parent: null                // THREE.Group to attach board to
}
```

**Public Methods:**

- `init()` - Initialize board, materials, physics, and lights
- `dropBall()` - Spawn a new ball at the top with random x position
- `update(delta)` - Update physics and sync mesh positions (call each frame)
- `dispose()` - Clean up all meshes, bodies, and resources

### `Plinko3D` (React Component)

Wrapper component integrating PlinkoBoard into React Three Fiber.

**Props:**
- `gameState` - Current game state object
- `setGameState` - Function to update game state

**Features:**
- Auto-drops balls when `gameState.isPlaying` is true
- Handles initialization and cleanup
- Exposes `window.plinkoDropBall()` for manual ball dropping

## Physics Configuration

The board uses the following physics tuning:

**Gravity**: -9.82 m/s² (realistic Earth gravity)

**Materials & Restitution**:
- Balls: 0.65 (satisfying bounce)
- Pegs: 0.3-0.4 (controlled ricochet)
- Walls: 0.2-0.4 (edge bounce)

**Friction**: ~0.3 (moderate - prevents getting stuck)

**Time Step**: Fixed 60 FPS with up to 3 substeps per frame

**Sleeping**: Enabled for settled balls to reduce CPU usage

## Visual Design

### Materials
- **Pegs**: Bright magenta with high metalness (0.8), slight emissive glow
- **Balls**: 8-color palette, metallic (0.9 metalness), emissive highlights
- **Boxes**: Alternating bright colors (red, cyan, lime, yellow, orange, pink, purple, green)
- **Walls**: Semi-transparent blue (40-60% opacity)
- **Backplate**: Dark neutral (0x1a1a2e) for contrast

### Lighting
- **Directional Light**: From upper corner, casts shadows
- **Ambient Light**: Base illumination
- **Emissive Materials**: Ball colors add arcade glow effect

## Performance Optimization

1. **Instanced Mesh for Pegs**: All pegs rendered in single draw call
2. **Ball Despawning**: Automatic removal of out-of-bounds or old balls
3. **Shadow Map Size**: 2048x2048 optimized for desktop
4. **Object Pooling**: Ball meshes reused when possible
5. **Physics Sleeping**: Settled balls disabled for simulation

## Integration Steps

### 1. Already Integrated
The game is fully integrated into the existing framework:
- ✅ Added to `src/data/games.js`
- ✅ GameScene.js updated with case handler
- ✅ GamePage.js camera configured
- ✅ Route available at `/games/plinko-3d`

### 2. Manual Integration (if needed)
```javascript
// In your Three.js scene:
import { PlinkoBoard } from './PlinkoBoard.js';

const plinko = new PlinkoBoard({
  parent: myGroup,
  boardWidth: 9,
  boardHeight: 13,
  rows: 14,
  boxCount: 8
});

plinko.init();

// In render loop:
plinko.update(delta);

// Drop balls:
plinko.dropBall();

// Cleanup:
plinko.dispose();
```

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ⚠️ Mobile browsers (desktop-optimized, may be slow on mobile)

## Dependencies

- **Three.js** (^0.179.1) - 3D graphics
- **Cannon-es** (latest) - Physics engine
- **React Three Fiber** - React integration layer

## Future Enhancements

Possible improvements (currently out of scope):

1. Sound effects (ball drops, pegs, landing)
2. Scoring system with bonus multipliers
3. Board customization UI (peg colors, board size)
4. Ball trails/particle effects
5. Different peg patterns (star, zigzag, etc.)
6. Multiplayer leaderboard
7. Mobile optimization with touch controls

## Troubleshooting

### Balls falling through pegs?
- Increase `pegRadius` slightly
- Reduce ball velocity by decreasing `ballMass`
- Increase physics substeps in `update()` method

### Performance issues?
- Reduce `rows` and `pegSpacingX` to have fewer pegs
- Disable shadows with `enableShadows: false`
- Reduce `maxBalls` limit
- Lower shadow map resolution

### Physics feels wrong?
Adjust these parameters:
- `ballRestitution`: Higher = bouncier (0-1)
- `pegSpacingX/Y`: Tighter spacing = more collisions
- `boardDepth`: Smaller = more contained
- Friction in physics world configuration

## Code Quality

- ✅ JSDoc comments on all public methods
- ✅ Self-contained class with no global state
- ✅ Proper memory management and cleanup
- ✅ ES6 module syntax
- ✅ No external dependencies beyond Three.js and Cannon-es
- ✅ Error handling for initialization

## License

Same as parent project.

