import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Text, Edges } from '@react-three/drei';
import { LAYER_COLORS, BOARD_CONFIG } from './config';
import { generatePuzzle } from './puzzleGenerator';
import { getConflictCells, isGridValid } from './sudokuValidation';

const { size: SIZE, spacing, cellSize } = BOARD_CONFIG;
const offset = (SIZE - 1) * spacing * 0.5;

function Sudoku3D({
  gameState,
  setGameState,
  difficulty = 'Medium',
  hintFunctionRef,
  checkFunctionRef,
  digitInputRef
}) {
  const [grid, setGrid] = useState(() =>
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => Array(9).fill(0)))
  );
  const [givens, setGivens] = useState(() =>
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => Array(9).fill(false)))
  );
  const [solution, setSolution] = useState(() =>
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => Array(9).fill(0)))
  );
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [selectedCell, setSelectedCell] = useState(null);
  const [errorCells, setErrorCells] = useState(new Set());
  const isDraggingRef = useRef(false);
  const pointerDownRef = useRef([0, 0]);
  const DRAG_THRESHOLD = 6;

  const loadNewPuzzle = useCallback(() => {
    const { grid: newGrid, givens: newGivens, solution: newSolution } = generatePuzzle(difficulty);
    setGrid(newGrid);
    setGivens(newGivens);
    setSolution(newSolution);
    setSelectedLayer(0);
    setSelectedCell(null);
    setErrorCells(new Set());
    setGameState((prev) => ({ ...prev, gameWon: false, gameLost: false }));
  }, [difficulty, setGameState]);

  useEffect(() => {
    if (gameState.isPlaying) {
      loadNewPuzzle();
    }
  }, [gameState.isPlaying, loadNewPuzzle]);

  const placeDigit = useCallback(
    (digit) => {
      if (selectedCell == null || digit < 1 || digit > 9) return;
      const { row, col } = selectedCell;
      if (givens[selectedLayer][row][col]) return;
      setGrid((prev) => {
        const next = prev.map((layer) => layer.map((row) => [...row]));
        next[selectedLayer][row][col] = digit;
        if (isGridValid(next)) {
          setGameState((gs) => ({ ...gs, gameWon: true }));
        }
        return next;
      });
      setErrorCells(new Set());
    },
    [selectedCell, selectedLayer, givens, setGameState]
  );

  const clearCell = useCallback(() => {
    if (selectedCell == null) return;
    const { row, col } = selectedCell;
    if (givens[selectedLayer][row][col]) return;
    setGrid((prev) => {
      const next = prev.map((layer) => layer.map((r) => [...r]));
      next[selectedLayer][row][col] = 0;
      return next;
    });
    setErrorCells(new Set());
  }, [selectedCell, selectedLayer, givens]);

  useEffect(() => {
    if (digitInputRef) {
      digitInputRef.current = { placeDigit, clearCell };
    }
    return () => {
      if (digitInputRef) digitInputRef.current = null;
    };
  }, [digitInputRef, placeDigit, clearCell]);

  const doHint = useCallback(() => {
    const empty = [];
    for (let l = 0; l < 9; l++) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (!givens[l][r][c] && grid[l][r][c] === 0) empty.push([l, r, c]);
        }
      }
    }
    if (empty.length === 0) return false;
    const [l, r, c] = empty[Math.floor(Math.random() * empty.length)];
    setGrid((prev) => {
      const next = prev.map((layer) => layer.map((row) => [...row]));
      next[l][r][c] = solution[l][r][c];
      return next;
    });
    setSelectedLayer(l);
    setSelectedCell({ row: r, col: c });
    setErrorCells(new Set());
    return true;
  }, [grid, givens, solution]);

  useEffect(() => {
    if (gameState.gameWon) return;
    if (isGridValid(grid)) {
      setGameState((gs) => ({ ...gs, gameWon: true }));
    }
  }, [grid, gameState.gameWon, setGameState]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!gameState.isPlaying || gameState.gameWon) return;
      const n = e.key >= '1' && e.key <= '9' ? parseInt(e.key, 10) : 0;
      if (n) {
        e.preventDefault();
        placeDigit(n);
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        clearCell();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState.isPlaying, gameState.gameWon, placeDigit, clearCell]);

  const doCheck = useCallback(() => {
    const conflicts = getConflictCells(grid);
    setErrorCells(conflicts);
  }, [grid]);

  useEffect(() => {
    if (hintFunctionRef) hintFunctionRef.current = doHint;
    return () => {
      if (hintFunctionRef) hintFunctionRef.current = null;
    };
  }, [hintFunctionRef, doHint]);

  useEffect(() => {
    if (checkFunctionRef) checkFunctionRef.current = doCheck;
    return () => {
      if (checkFunctionRef) checkFunctionRef.current = null;
    };
  }, [checkFunctionRef, doCheck]);

  const onPointerDown = useCallback((e, row, col) => {
    e.stopPropagation();
    pointerDownRef.current = [e.pointer?.x ?? 0, e.pointer?.y ?? 0];
    isDraggingRef.current = false;
  }, []);

  const onPointerMove = useCallback((e) => {
    const [sx, sy] = pointerDownRef.current;
    const cx = e.pointer?.x ?? sx;
    const cy = e.pointer?.y ?? sy;
    if (Math.abs(cx - sx) > DRAG_THRESHOLD || Math.abs(cy - sy) > DRAG_THRESHOLD) {
      isDraggingRef.current = true;
    }
  }, []);

  const onCellClick = useCallback(
    (e, row, col) => {
      e.stopPropagation();
      if (isDraggingRef.current) return;
      if (givens[selectedLayer][row][col]) return;
      setSelectedCell((prev) =>
        prev && prev.row === row && prev.col === col ? null : { row, col }
      );
    },
    [selectedLayer, givens]
  );

  const onLayerClick = useCallback((e, layerIndex) => {
    e.stopPropagation();
    if (isDraggingRef.current) return;
    setSelectedLayer(layerIndex);
  }, []);

  const layerColor = LAYER_COLORS[selectedLayer] || '#888';

  return (
    <group>
      {/* Current layer: 9×9 board */}
      <group position={[0, 0, 0]}>
        {Array.from({ length: SIZE }, (_, row) =>
          Array.from({ length: SIZE }, (_, col) => {
            const px = col * spacing - offset;
            const py = (SIZE - 1 - row) * spacing - offset;
            const val = grid[selectedLayer][row][col];
            const isGiven = givens[selectedLayer][row][col];
            const isSelected =
              selectedCell && selectedCell.row === row && selectedCell.col === col;
            const errKey = `${selectedLayer},${row},${col}`;
            const isError = errorCells.has(errKey);
            const cellColor = isError
              ? '#ef4444'
              : isSelected
                ? '#fbbf24'
                : isGiven
                  ? '#e5e7eb'
                  : '#f9fafb';
            return (
              <group key={`${row}-${col}`} position={[px, py, 0]}>
                <Box
                  args={[cellSize, cellSize, 0.08]}
                  onClick={(e) => onCellClick(e, row, col)}
                  onPointerDown={(e) => onPointerDown(e, row, col)}
                  onPointerMove={onPointerMove}
                >
                  <meshStandardMaterial color={cellColor} />
                  <Edges scale={1.02} color={layerColor} threshold={15} />
                </Box>
                {val !== 0 && (
                  <Text
                    raycast={null}
                    position={[0, 0, 0.05]}
                    fontSize={0.35}
                    color={isGiven ? '#111827' : '#1d4ed8'}
                    anchorX="center"
                    anchorY="middle"
                  >
                    {String(val)}
                  </Text>
                )}
              </group>
            );
          })
        )}
      </group>

      {/* Layer selector: 9 colored segments */}
      <group position={[0, -offset - 1.2, 0]}>
        {LAYER_COLORS.map((color, i) => (
          <group
            key={i}
            position={[(i - 4) * 0.5, 0, 0]}
            onClick={(e) => onLayerClick(e, i)}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={onPointerMove}
          >
            <Box args={[0.4, 0.25, 0.15]}>
              <meshStandardMaterial color={color} />
              <Edges scale={1.02} color="#333" threshold={15} />
            </Box>
            {selectedLayer === i && (
              <Box args={[0.42, 0.27, 0.06]} position={[0, 0, 0.12]}>
                <meshStandardMaterial color="#fbbf24" transparent opacity={0.9} />
              </Box>
            )}
          </group>
        ))}
      </group>

      {/* Layer label */}
      <Text
        position={[0, offset + 0.6, 0]}
        fontSize={0.3}
        color={layerColor}
        anchorX="center"
        anchorY="middle"
      >
        Layer {selectedLayer + 1} of 9
      </Text>

      {gameState.gameWon && (
        <Text
          position={[0, 0, 1.5]}
          fontSize={0.5}
          color="#10b981"
          anchorX="center"
          anchorY="middle"
        >
          You win!
        </Text>
      )}
    </group>
  );
}

export default Sudoku3D;
