import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Box, Text, Edges } from '@react-three/drei';
import { LAYER_COLORS, BOARD_CONFIG } from './config';
import { generatePuzzle } from './puzzleGenerator';
import {
  getConflictCells,
  isGridValid,
  getConstraintCells,
  isCellCompleted
} from './sudokuValidation';

const { size: SIZE, spacing, cellSize, layerSpacing } = BOARD_CONFIG;
const offset = (SIZE - 1) * spacing * 0.5;
const layerOffset = (SIZE - 1) * layerSpacing * 0.5;

function Sudoku3D({
  gameState,
  setGameState,
  difficulty = 'Medium',
  hintFunctionRef,
  checkFunctionRef,
  digitInputRef,
  hideCompletedCells = false
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
  const errorCells = useMemo(() => getConflictCells(grid), [grid]);
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
        return next;
      });
    },
    [selectedCell, selectedLayer, givens]
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
    return true;
  }, [grid, givens, solution]);

  useEffect(() => {
    if (gameState.gameWon) return;
    if (isGridValid(grid)) {
      setGameState((gs) => ({ ...gs, gameWon: true }));
    }
  }, [grid, gameState.gameWon, setGameState]);

  const constraintSet = useMemo(() => {
    if (selectedCell == null) return new Set();
    return getConstraintCells(selectedLayer, selectedCell.row, selectedCell.col);
  }, [selectedLayer, selectedCell]);

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
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedCell((prev) => {
          const row = prev ? prev.row : 0;
          const col = prev ? prev.col : 0;
          let nr = row;
          let nc = col;
          if (e.key === 'ArrowUp') nr = Math.max(0, row - 1);
          if (e.key === 'ArrowDown') nr = Math.min(8, row + 1);
          if (e.key === 'ArrowLeft') nc = Math.max(0, col - 1);
          if (e.key === 'ArrowRight') nc = Math.min(8, col + 1);
          return { row: nr, col: nc };
        });
      }
      if (e.key === 'PageUp' || e.key === 'PageDown') {
        e.preventDefault();
        setSelectedLayer((prev) => {
          if (e.key === 'PageUp') return Math.min(8, prev + 1);
          return Math.max(0, prev - 1);
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState.isPlaying, gameState.gameWon, placeDigit, clearCell]);

  const doCheck = useCallback(() => {
    // Conflicts are now shown automatically via errorCells derived from grid
  }, []);

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

  const onPointerDown = useCallback((e) => {
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

  const onCellClick = useCallback((e, layer, row, col) => {
    e.stopPropagation();
    if (isDraggingRef.current) return;
    setSelectedLayer(layer);
    setSelectedCell((prev) =>
      prev && prev.row === row && prev.col === col ? null : { row, col }
    );
  }, []);

  return (
    <group>
      {/* All 9 layers stacked along Z */}
      {Array.from({ length: SIZE }, (_, layer) => {
        const z = layer * layerSpacing - layerOffset;
        const layerColor = LAYER_COLORS[layer] || '#888';
        return (
          <group key={layer} position={[0, 0, z]}>
            {Array.from({ length: SIZE }, (_, row) =>
              Array.from({ length: SIZE }, (_, col) => {
                const cellKey = `${layer},${row},${col}`;
                if (hideCompletedCells && isCellCompleted(grid, layer, row, col)) {
                  return null;
                }
                const px = col * spacing - offset;
                const py = (SIZE - 1 - row) * spacing - offset;
                const val = grid[layer][row][col];
                const isGiven = givens[layer][row][col];
                const isSelected =
                  selectedCell &&
                  selectedLayer === layer &&
                  selectedCell.row === row &&
                  selectedCell.col === col;
                const isConstraint = constraintSet.has(cellKey);
                const isError = errorCells.has(cellKey);
                let cellColor = isGiven ? '#e5e7eb' : '#f9fafb';
                if (isError) cellColor = '#ef4444';
                else if (isSelected) cellColor = '#fbbf24';
                else if (isConstraint) cellColor = '#bfdbfe';
                return (
                  <group key={cellKey} position={[px, py, 0]}>
                    <Box
                      args={[cellSize, cellSize, 0.06]}
                      onClick={(e) => onCellClick(e, layer, row, col)}
                      onPointerDown={onPointerDown}
                      onPointerMove={onPointerMove}
                    >
                      <meshStandardMaterial color={cellColor} />
                      <Edges
                        scale={1.02}
                        color={isSelected ? '#b45309' : layerColor}
                        threshold={15}
                      />
                    </Box>
                    {isConstraint && !isSelected && (
                      <Box args={[cellSize * 1.02, cellSize * 1.02, 0.065]} position={[0, 0, 0.001]}>
                        <meshBasicMaterial color="#3b82f6" transparent opacity={0.25} />
                      </Box>
                    )}
                    {val !== 0 && (
                      <>
                        <Text
                          raycast={null}
                          position={[0, 0, 0.04]}
                          fontSize={0.28}
                          color={isError ? '#ffffff' : isGiven ? '#111827' : '#1d4ed8'}
                          anchorX="center"
                          anchorY="middle"
                        >
                          {String(val)}
                        </Text>
                        <Text
                          raycast={null}
                          position={[0, 0, -0.04]}
                          rotation={[0, Math.PI, 0]}
                          fontSize={0.28}
                          color={isError ? '#ffffff' : isGiven ? '#111827' : '#1d4ed8'}
                          anchorX="center"
                          anchorY="middle"
                        >
                          {String(val)}
                        </Text>
                      </>
                    )}
                  </group>
                );
              })
            )}
          </group>
        );
      })}

      {/* Layer label */}
      <Text
        position={[0, offset + 0.5, layerOffset + 0.5]}
        fontSize={0.28}
        color={LAYER_COLORS[selectedLayer] || '#888'}
        anchorX="center"
        anchorY="middle"
      >
        Layer {selectedLayer + 1} of 9
      </Text>

      {gameState.gameWon && (
        <Text
          position={[0, 0, 0]}
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
