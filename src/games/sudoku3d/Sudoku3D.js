import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Box, Text, Edges } from '@react-three/drei';
import { LAYER_COLORS, BOARD_CONFIG } from './config';
import { generatePuzzle } from './puzzleGenerator';
import {
  getConflictCells,
  getWrongCells,
  getSectionCompleteCells,
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
  hideCompletedCells = false,
  notesMode = false
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
  const [mistakes, setMistakes] = useState(0);
  const [consecutiveMistakes, setConsecutiveMistakes] = useState(0);
  const [notes, setNotes] = useState(() =>
    Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()))
    )
  );
  const conflictCells = useMemo(() => getConflictCells(grid), [grid]);
  const wrongCells = useMemo(
    () => getWrongCells(grid, solution, givens),
    [grid, solution, givens]
  );
  const sectionCompleteCells = useMemo(
    () => getSectionCompleteCells(grid, solution),
    [grid, solution]
  );
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
    setMistakes(0);
    setConsecutiveMistakes(0);
    setNotes(() =>
      Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()))
      )
    );
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
      if (notesMode) {
        setNotes((prev) => {
          const next = prev.map((l) => l.map((r) => r.map((s) => new Set(s))));
          const s = next[selectedLayer][row][col];
          if (s.has(digit)) s.delete(digit);
          else s.add(digit);
          return next;
        });
        return;
      }
      const isWrong = solution[selectedLayer][row][col] !== digit;
      if (isWrong) {
        setMistakes((m) => m + 1);
        setConsecutiveMistakes((c) => c + 1);
      } else {
        setConsecutiveMistakes(0);
      }
      setNotes((prev) => {
        const next = prev.map((l) => l.map((r) => r.map((s) => new Set(s))));
        next[selectedLayer][row][col] = new Set();
        return next;
      });
      setGrid((prev) => {
        const next = prev.map((layer) => layer.map((row) => [...row]));
        next[selectedLayer][row][col] = digit;
        return next;
      });
    },
    [selectedCell, selectedLayer, givens, solution, notesMode]
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
    setMistakes((m) => m + 2);
    setNotes((prev) => {
      const next = prev.map((la) => la.map((ro) => ro.map((se) => new Set(se))));
      next[l][r][c] = new Set();
      return next;
    });
    setGrid((prev) => {
      const next = prev.map((layer) => layer.map((row) => [...row]));
      next[l][r][c] = solution[l][r][c];
      return next;
    });
    setSelectedLayer(l);
    setSelectedCell({ row: r, col: c });
    return true;
  }, [grid, givens, solution]);

  const isGridFilled = useMemo(() => {
    for (let l = 0; l < SIZE; l++)
      for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++) if (grid[l][r][c] === 0) return false;
    return true;
  }, [grid]);

  useEffect(() => {
    if (gameState.gameWon) return;
    if (isGridFilled) {
      setGameState((gs) => ({ ...gs, gameWon: true }));
    }
  }, [isGridFilled, gameState.gameWon, setGameState]);

  const constraintSet = useMemo(() => {
    if (selectedCell == null) return new Set();
    return getConstraintCells(selectedLayer, selectedCell.row, selectedCell.col);
  }, [selectedLayer, selectedCell]);

  const selectedValue =
    selectedCell != null && selectedLayer != null
      ? grid[selectedLayer][selectedCell.row][selectedCell.col]
      : 0;
  const highlightSameNumber = useMemo(() => {
    if (selectedValue === 0) return new Set();
    const set = new Set();
    for (let l = 0; l < SIZE; l++) {
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          if (grid[l][r][c] === selectedValue) set.add(`${l},${r},${c}`);
        }
      }
    }
    return set;
  }, [grid, selectedValue]);

  const isDigitComplete = useCallback(
    (digit) => {
      let count = 0;
      for (let l = 0; l < SIZE; l++) {
        for (let r = 0; r < SIZE; r++) {
          for (let c = 0; c < SIZE; c++) {
            if (solution[l][r][c] === digit && grid[l][r][c] === digit) count++;
          }
        }
      }
      return count === 9;
    },
    [grid, solution]
  );

  const completedDigits = useMemo(
    () => Array.from({ length: 10 }, (_, d) => d >= 1 && isDigitComplete(d)),
    [isDigitComplete]
  );

  useEffect(() => {
    setGameState((prev) => ({ ...prev, mistakes, consecutiveMistakes, completedDigits }));
  }, [mistakes, consecutiveMistakes, completedDigits, setGameState]);

  useEffect(() => {
    if (digitInputRef) {
      digitInputRef.current = {
        placeDigit,
        clearCell,
        consecutiveMistakes,
        mistakes,
        showHint: consecutiveMistakes >= 3
      };
    }
    return () => {
      if (digitInputRef) digitInputRef.current = null;
    };
  }, [digitInputRef, placeDigit, clearCell, consecutiveMistakes, mistakes]);

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
                const isWrong = wrongCells.has(cellKey);
                const isConflict = !isGiven && !isWrong && conflictCells.has(cellKey);
                const isHighlightSame = highlightSameNumber.has(cellKey);
                const isSectionComplete = sectionCompleteCells.has(cellKey);
                let cellColor = isGiven ? '#e5e7eb' : '#f9fafb';
                if (isWrong) cellColor = '#ef4444';
                else if (isConflict) cellColor = '#fdba74';
                else if (isSelected) cellColor = '#93c5fd';
                else if (isSectionComplete) cellColor = '#86efac';
                else if (isHighlightSame) cellColor = '#bfdbfe';
                else if (isConstraint) cellColor = '#dbeafe';
                const digitColor = isWrong
                  ? '#ffffff'
                  : isConflict
                    ? '#9a3412'
                    : isGiven
                      ? '#111827'
                      : '#0d9488';
                const cellNotes = notes[layer][row][col];
                const hasNotes = cellNotes && cellNotes.size > 0;
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
                        color={isSelected ? '#2563eb' : layerColor}
                        threshold={15}
                      />
                    </Box>
                    {isConstraint && !isSelected && !isWrong && !isConflict && (
                      <Box args={[cellSize * 1.02, cellSize * 1.02, 0.065]} position={[0, 0, 0.001]}>
                        <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} />
                      </Box>
                    )}
                    {val !== 0 ? (
                      <>
                        <Text
                          raycast={null}
                          position={[0, 0, 0.04]}
                          fontSize={0.28}
                          color={digitColor}
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
                          color={digitColor}
                          anchorX="center"
                          anchorY="middle"
                        >
                          {String(val)}
                        </Text>
                      </>
                    ) : hasNotes ? (
                      <group raycast={null} position={[0, 0, 0.04]}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                          if (!cellNotes.has(n)) return null;
                          const rn = Math.floor((n - 1) / 3);
                          const cn = (n - 1) % 3;
                          const nx = (cn - 1) * 0.12;
                          const ny = (1 - rn) * 0.12;
                          return (
                            <Text
                              key={n}
                              position={[nx, ny, 0]}
                              fontSize={0.14}
                              color={isSelected ? '#1e3a5f' : '#0d9488'}
                              anchorX="center"
                              anchorY="middle"
                            >
                              {String(n)}
                            </Text>
                          );
                        })}
                      </group>
                    ) : null}
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
