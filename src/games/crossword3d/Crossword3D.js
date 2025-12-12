import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Edges, Text } from '@react-three/drei';
import { generateCrossword3D } from './crosswordGenerator';

const spacing = 1.0;

const colors = {
  empty: '#6b7280', // darker gray for wireframe
  wordCell: '#e5e7eb', // light gray for word cells
  selected: '#fbbf24', // yellow for selected cell
  wordHighlight: '#3b82f6', // blue for other cells in selected word
  correct: '#10b981', // green for correct letters
  wrong: '#ef4444', // red for wrong letters
  hinted: '#10b981', // green for hinted letters (same as correct)
  letter: '#1f2937' // dark text for letters
};

function Crossword3D({ gameState, setGameState, showGrid, boardSize = 5, hintFunctionRef, checkFunctionRef }) {
  // Set the grid size dynamically based on boardSize prop
  const gridSize = boardSize;
  const offset = (gridSize - 1) * spacing * 0.5;
  
  // Helper function to create empty board
  const createEmptyBoard = (size) => {
    const b = [];
    for (let x = 0; x < size; x++) {
      b[x] = [];
      for (let y = 0; y < size; y++) {
        b[x][y] = [];
        for (let z = 0; z < size; z++) {
          b[x][y][z] = null; // null means empty
        }
      }
    }
    return b;
  };
  
  const [board, setBoard] = useState(() => createEmptyBoard(gridSize));
  const [selectedCell, setSelectedCell] = useState(null); // [x, y, z] or null
  const [selectedWordId, setSelectedWordId] = useState(null); // Which word is currently selected
  const [selectedWordPositions, setSelectedWordPositions] = useState([]); // Positions of cells in selected word
  const typingBufferRef = useRef(''); // Ref to track typing buffer for rapid typing
  const [crosswordData, setCrosswordData] = useState(null); // Stores word positions
  
  // Helper to create empty cell states
  const createEmptyCellStates = (size) => {
    const states = [];
    for (let x = 0; x < size; x++) {
      states[x] = [];
      for (let y = 0; y < size; y++) {
        states[x][y] = [];
        for (let z = 0; z < size; z++) {
          states[x][y][z] = null;
        }
      }
    }
    return states;
  };
  
  const [cellStates, setCellStates] = useState(() => createEmptyCellStates(gridSize));
  const hasGameStartedRef = useRef(false);
  const previousPlayingRef = useRef(false);
  const previousBoardSizeRef = useRef(boardSize);

  // Generate crossword when game starts or board size changes
  useEffect(() => {
    const boardSizeChanged = boardSize !== previousBoardSizeRef.current;
    previousBoardSizeRef.current = boardSize;
    
    // Detect transition from not playing to playing (new game button clicked) or when board size changes
    if ((gameState.isPlaying && !previousPlayingRef.current && hasGameStartedRef.current) || 
        (gameState.isPlaying && boardSizeChanged)) {
      // Generate new crossword
      const puzzle = generateCrossword3D(gridSize, 'medium');
      setBoard(puzzle.board);
      setCrosswordData(puzzle);
      setSelectedCell(null);
      setSelectedWordId(null);
      setSelectedWordPositions([]);
      typingBufferRef.current = '';
      setCellStates(createEmptyCellStates(gridSize));
      setGameState({
        isPlaying: true,
        gameWon: false,
        gameLost: false
      });
      hasGameStartedRef.current = true;
      previousPlayingRef.current = true;
    } else if (gameState.isPlaying && !previousPlayingRef.current && !hasGameStartedRef.current) {
      // First time starting the game - generate crossword
      const puzzle = generateCrossword3D(gridSize, 'medium');
      setBoard(puzzle.board);
      setCrosswordData(puzzle);
      setSelectedCell(null);
      setSelectedWordId(null);
      setSelectedWordPositions([]);
      typingBufferRef.current = '';
      setCellStates(createEmptyCellStates(gridSize));
      setGameState({
        isPlaying: true,
        gameWon: false,
        gameLost: false
      });
      hasGameStartedRef.current = true;
      previousPlayingRef.current = true;
    } else if (gameState.isPlaying && previousPlayingRef.current) {
      // Just update the state during normal gameplay
      setGameState({
        isPlaying: true,
        gameWon: false,
        gameLost: false
      });
    }
    
    // Track previous state
    previousPlayingRef.current = gameState.isPlaying;
  }, [gameState.isPlaying, setGameState, boardSize, gridSize]);

  // Get word positions for a given word ID
  const getWordPositions = useCallback((wordId) => {
    if (!crosswordData || !crosswordData.words) return [];
    const word = crosswordData.words.find(w => w.id === wordId);
    return word ? word.positions : [];
  }, [crosswordData]);

  // Find which word to select when clicking a cell
  const selectWordForCell = useCallback((x, y, z) => {
    if (!board[x][y][z] || !board[x][y][z].isWordCell) return null;
    
    const cell = board[x][y][z];
    const wordIds = cell.wordIds || [];
    
    if (wordIds.length === 0) return null;
    
    // If this cell is already selected, cycle to next word
    if (selectedCell && selectedCell[0] === x && selectedCell[1] === y && selectedCell[2] === z) {
      const currentIndex = wordIds.indexOf(selectedWordId);
      const nextIndex = (currentIndex + 1) % wordIds.length;
      return wordIds[nextIndex];
    }
    
    // Otherwise, select the first word
    return wordIds[0];
  }, [board, selectedCell, selectedWordId]);

  // Handle cell click - select cell and word
  const handleCellClick = useCallback((x, y, z, e) => {
    e.stopPropagation();
    if (!gameState.isPlaying) return;
    
    // Only allow selecting word cells
    if (board[x][y][z] && board[x][y][z].isWordCell) {
      const wordId = selectWordForCell(x, y, z);
      if (wordId !== null) {
        setSelectedCell([x, y, z]);
        setSelectedWordId(wordId);
        const positions = getWordPositions(wordId);
        setSelectedWordPositions(positions);
        typingBufferRef.current = ''; // Clear ref buffer too
      }
    }
  }, [board, gameState.isPlaying, selectWordForCell, getWordPositions]);

  // Check if a position is in the selected word
  const isInSelectedWord = useCallback((x, y, z) => {
    return selectedWordPositions.some(([px, py, pz]) => px === x && py === y && pz === z);
  }, [selectedWordPositions]);

  // Check if the puzzle is complete (all word cells have correct letters)
  const checkPuzzleComplete = useCallback((currentBoard) => {
    if (!crosswordData || !crosswordData.words) return false;
    
    // Check all word cells
    for (const word of crosswordData.words) {
      for (const [x, y, z] of word.positions) {
        const cell = currentBoard[x][y][z];
        if (!cell || !cell.isWordCell) continue;
        
        // If cell has no letter or letter is incorrect, puzzle is not complete
        if (!cell.letter || cell.letter !== cell.correctLetter) {
          return false;
        }
      }
    }
    
    return true;
  }, [crosswordData]);

  // Hint function - reveals a random unfilled cell
  const handleHint = useCallback(() => {
    if (!crosswordData || !crosswordData.words) return false;
    
    // Find all unfilled word cells
    const unfilledCells = [];
    for (const word of crosswordData.words) {
      for (const [x, y, z] of word.positions) {
        const cell = board[x][y][z];
        if (cell && cell.isWordCell && !cell.letter) {
          unfilledCells.push([x, y, z]);
        }
      }
    }
    
    if (unfilledCells.length === 0) {
      return false; // No unfilled cells
    }
    
    // Pick a random unfilled cell
    const randomIndex = Math.floor(Math.random() * unfilledCells.length);
    const [x, y, z] = unfilledCells[randomIndex];
    
    // Reveal the correct letter
    setBoard(prev => {
      const newBoard = prev.map(col => col.map(row => row.map(c => c ? { ...c } : null)));
      if (newBoard[x][y][z] && newBoard[x][y][z].isWordCell) {
        newBoard[x][y][z] = {
          ...newBoard[x][y][z],
          letter: newBoard[x][y][z].correctLetter
        };
      }
      
      // Check if puzzle is complete
      if (checkPuzzleComplete(newBoard)) {
        setGameState(prevGs => ({ ...prevGs, isPlaying: false, gameWon: true, gameLost: false }));
      }
      
      return newBoard;
    });
    
    // Mark as hinted (green)
    setCellStates(prev => {
      const newStates = prev.map(col => col.map(row => row.map(state => state)));
      newStates[x][y][z] = 'hinted';
      return newStates;
    });
    
    return true;
  }, [board, crosswordData, checkPuzzleComplete, setGameState]);

  // Check function - checks if selected cell has correct letter
  const handleCheck = useCallback(() => {
    if (!selectedCell) return false;
    
    const [x, y, z] = selectedCell;
    const cell = board[x][y][z];
    
    if (!cell || !cell.isWordCell || !cell.letter) {
      return false; // No letter to check
    }
    
    const isCorrect = cell.letter === cell.correctLetter;
    
    // Update cell state
    setCellStates(prev => {
      const newStates = prev.map(col => col.map(row => row.map(state => state)));
      newStates[x][y][z] = isCorrect ? 'correct' : 'wrong';
      return newStates;
    });
    
    // Check if puzzle is complete (only if the check was correct)
    if (isCorrect && checkPuzzleComplete(board)) {
      setGameState(prevGs => ({ ...prevGs, isPlaying: false, gameWon: true, gameLost: false }));
    }
    
    return true;
  }, [selectedCell, board, checkPuzzleComplete, setGameState]);

  // Expose hint and check functions via refs
  useEffect(() => {
    if (hintFunctionRef) {
      hintFunctionRef.current = handleHint;
    }
    if (checkFunctionRef) {
      checkFunctionRef.current = handleCheck;
    }
  }, [hintFunctionRef, checkFunctionRef, handleHint, handleCheck]);

  // Handle keyboard input - sequential typing
  useEffect(() => {
    if (!gameState.isPlaying || !selectedCell || !selectedWordId) return;

    const handleKeyDown = (e) => {
      // Only handle letter keys (A-Z)
      if (e.key.length === 1 && /[A-Za-z]/.test(e.key)) {
        e.preventDefault();
        const letter = e.key.toUpperCase();
        
        // Get word positions
        const positions = getWordPositions(selectedWordId);
        if (positions.length === 0) return;
        
        // Find the index of the selected cell in the word
        const selectedIndex = positions.findIndex(
          ([px, py, pz]) => 
            px === selectedCell[0] && 
            py === selectedCell[1] && 
            pz === selectedCell[2]
        );
        
        if (selectedIndex === -1) return;
        
        // Fill the currently selected cell with the letter
        setBoard(prevBoard => {
          const newBoard = prevBoard.map(col => col.map(row => row.map(cell => cell ? { ...cell } : null)));
          
          const [px, py, pz] = positions[selectedIndex];
          if (newBoard[px][py][pz] && newBoard[px][py][pz].isWordCell) {
            newBoard[px][py][pz] = {
              ...newBoard[px][py][pz],
              letter: letter
            };
          }
          
          // Check if puzzle is complete
          if (checkPuzzleComplete(newBoard)) {
            setGameState(prevGs => ({ ...prevGs, isPlaying: false, gameWon: true, gameLost: false }));
          }
          
          return newBoard;
        });
        
        // Update buffer
        typingBufferRef.current = typingBufferRef.current + letter;
        
        // Move selection to the next letter in the word
        const nextIndex = selectedIndex + 1;
        if (nextIndex < positions.length) {
          const [nextX, nextY, nextZ] = positions[nextIndex];
          setSelectedCell([nextX, nextY, nextZ]);
          setSelectedWordPositions(positions);
        }
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        
        // Get word positions
        const positions = getWordPositions(selectedWordId);
        if (positions.length === 0) return;
        
        const selectedIndex = positions.findIndex(
          ([px, py, pz]) => 
            px === selectedCell[0] && 
            py === selectedCell[1] && 
            pz === selectedCell[2]
        );
        
        if (selectedIndex === -1) return;
        
        // Move selection backwards first
        const prevIndex = selectedIndex - 1;
        if (prevIndex >= 0) {
          const [prevX, prevY, prevZ] = positions[prevIndex];
          setSelectedCell([prevX, prevY, prevZ]);
          setSelectedWordPositions(positions);
          
          // Clear the letter in the previous cell
          setBoard(prevBoard => {
            const newBoard = prevBoard.map(col => col.map(row => row.map(cell => cell ? { ...cell } : null)));
            
            const [px, py, pz] = positions[prevIndex];
            if (newBoard[px][py][pz] && newBoard[px][py][pz].isWordCell) {
              newBoard[px][py][pz] = {
                ...newBoard[px][py][pz],
                letter: null
              };
            }
            
            return newBoard;
          });
          
          // Update buffer
          typingBufferRef.current = typingBufferRef.current.slice(0, -1);
        } else {
          // If at the beginning, clear the current cell's letter
          setBoard(prevBoard => {
            const newBoard = prevBoard.map(col => col.map(row => row.map(cell => cell ? { ...cell } : null)));
            
            const [px, py, pz] = positions[selectedIndex];
            if (newBoard[px][py][pz] && newBoard[px][py][pz].isWordCell) {
              newBoard[px][py][pz] = {
                ...newBoard[px][py][pz],
                letter: null
              };
            }
            
            return newBoard;
          });
          
          // Update buffer
          typingBufferRef.current = typingBufferRef.current.slice(0, -1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, selectedWordId, gameState.isPlaying, getWordPositions, checkPuzzleComplete, setGameState]);

  const renderCubes = () => {
    const cubes = [];
    
    // Safety check - ensure board has correct dimensions
    if (!board || !Array.isArray(board) || board.length !== gridSize) {
      return cubes;
    }
    
    // Render all cubes
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const px = x * spacing - offset;
          const py = y * spacing - offset;
          const pz = z * spacing - offset;
          
          const cell = board[x][y][z];
          const isWordCell = cell && cell.isWordCell;
          const isSelected = selectedCell && selectedCell[0] === x && selectedCell[1] === y && selectedCell[2] === z;
          const inSelectedWord = isInSelectedWord(x, y, z) && !isSelected;
          const cellState = cellStates[x][y][z]; // 'correct', 'wrong', 'hinted', or null
          
          cubes.push({
            x,
            y,
            z,
            px,
            py,
            pz,
            isWordCell,
            isSelected,
            inSelectedWord,
            cellState,
            letter: cell && cell.letter ? cell.letter : null,
            isEmpty: cell === null
          });
        }
      }
    }
    
    return cubes;
  };

  const cubes = renderCubes();

  // Helper to render letter on all 6 faces of a cube
  const renderLetterOnAllFaces = (letter, px, py, pz) => {
    if (!letter) return null;
    
    const textSize = 0.4;
    const offset = 0.41;
    
    return (
      <>
        {/* Front face (Z+) */}
        <Text
          position={[px, py, pz + offset]}
          fontSize={textSize}
          color={colors.letter}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#ffffff"
        >
          {letter}
        </Text>
        {/* Back face (Z-) */}
        <Text
          position={[px, py, pz - offset]}
          fontSize={textSize}
          color={colors.letter}
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI, 0]}
          outlineWidth={0.02}
          outlineColor="#ffffff"
        >
          {letter}
        </Text>
        {/* Right face (X+) */}
        <Text
          position={[px + offset, py, pz]}
          fontSize={textSize}
          color={colors.letter}
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI / 2, 0]}
          outlineWidth={0.02}
          outlineColor="#ffffff"
        >
          {letter}
        </Text>
        {/* Left face (X-) */}
        <Text
          position={[px - offset, py, pz]}
          fontSize={textSize}
          color={colors.letter}
          anchorX="center"
          anchorY="middle"
          rotation={[0, -Math.PI / 2, 0]}
          outlineWidth={0.02}
          outlineColor="#ffffff"
        >
          {letter}
        </Text>
        {/* Top face (Y+) */}
        <Text
          position={[px, py + offset, pz]}
          fontSize={textSize}
          color={colors.letter}
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
          outlineWidth={0.02}
          outlineColor="#ffffff"
        >
          {letter}
        </Text>
        {/* Bottom face (Y-) */}
        <Text
          position={[px, py - offset, pz]}
          fontSize={textSize}
          color={colors.letter}
          anchorX="center"
          anchorY="middle"
          rotation={[Math.PI / 2, 0, 0]}
          outlineWidth={0.02}
          outlineColor="#ffffff"
        >
          {letter}
        </Text>
      </>
    );
  };

  return (
    <group>
      {/* Render word cells and empty cells */}
      {cubes.map((cube) => {
        // Only render word cells and cells on outer faces
        const isOuterFace = 
          cube.x === 0 || cube.x === gridSize - 1 || // left/right faces
          cube.y === 0 || cube.y === gridSize - 1 || // back/front faces
          cube.z === 0 || cube.z === gridSize - 1;  // bottom/top faces
        
        // Show word cells anywhere, or empty cells only on outer faces
        if (!cube.isWordCell && (!isOuterFace || !showGrid)) {
          return null;
        }
        
        let color = colors.empty;
        let edgeColor = '#4b5563';
        
        // Priority: cellState (correct/wrong/hinted) > selected > inSelectedWord > wordCell
        if (cube.cellState === 'correct' || cube.cellState === 'hinted') {
          color = colors.correct;
          edgeColor = '#059669';
        } else if (cube.cellState === 'wrong') {
          color = colors.wrong;
          edgeColor = '#dc2626';
        } else if (cube.isSelected) {
          color = colors.selected;
          edgeColor = '#f59e0b';
        } else if (cube.inSelectedWord) {
          color = colors.wordHighlight;
          edgeColor = '#2563eb';
        } else if (cube.isWordCell) {
          color = colors.wordCell;
          edgeColor = '#4b5563';
        }
        
        const opacity = cube.isWordCell ? 0.9 : 0.05;
        
        return (
          <group key={`cube-${cube.x}-${cube.y}-${cube.z}`}>
            <Box
              args={[0.8, 0.8, 0.8]}
              position={[cube.px, cube.py, cube.pz]}
              onClick={(e) => handleCellClick(cube.x, cube.y, cube.z, e)}
              onPointerOver={(e) => {
                if (cube.isWordCell) {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                }
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'default';
              }}
            >
              <meshStandardMaterial 
                color={color} 
                transparent 
                opacity={opacity}
                emissive={cube.isSelected ? color : cube.inSelectedWord ? colors.wordHighlight : '#000000'}
                emissiveIntensity={cube.isSelected ? 0.3 : cube.inSelectedWord ? 0.2 : 0}
              />
              {cube.isWordCell && (
                <Edges scale={1.001} color={edgeColor} threshold={15} />
              )}
            </Box>
            
            {/* Display letter on all 6 faces */}
            {cube.isWordCell && renderLetterOnAllFaces(cube.letter, cube.px, cube.py, cube.pz)}
          </group>
        );
      })}
      
      {/* Game won message */}
      {gameState.gameWon && (
        <Text 
          position={[0, offset + 1.5, 0]} 
          fontSize={0.5} 
          color="#10b981" 
          anchorX="center" 
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#ffffff"
        >
          Puzzle Complete!
        </Text>
      )}
    </group>
  );
}

export default Crossword3D;
