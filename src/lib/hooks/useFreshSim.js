/**
 * Keep a mutable sim for realtime games.
 * A new session is created when play starts or the difficulty changes mid-run,
 * and the header is reset to match.
 */

import { useEffect, useRef } from 'react';

export function useFreshSim(isPlaying, difficulty, createSession, setGameState) {
  const simRef = useRef(null);
  const playingRef = useRef(false);
  const difficultyRef = useRef(difficulty);

  if (simRef.current === null) {
    simRef.current = createSession(difficulty);
  }

  const playStarted = isPlaying && !playingRef.current;
  const difficultyChanged = isPlaying && difficultyRef.current !== difficulty;
  if (playStarted || difficultyChanged) {
    simRef.current = createSession(difficulty);
  }
  playingRef.current = isPlaying;
  difficultyRef.current = difficulty;

  useEffect(() => {
    if (!isPlaying) return;
    const sim = simRef.current;
    setGameState((prev) => {
      const next = {
        ...prev,
        score: sim.score ?? 0,
        lives: sim.lives ?? prev.lives,
        level: sim.level ?? 1,
        opponentScore: sim.aiScore ?? 0,
        gameWon: false,
        gameLost: false
      };
      if (
        next.score === prev.score &&
        next.lives === prev.lives &&
        next.level === prev.level &&
        next.opponentScore === prev.opponentScore &&
        next.gameWon === prev.gameWon &&
        next.gameLost === prev.gameLost
      ) {
        return prev;
      }
      return next;
    });
  }, [isPlaying, difficulty, setGameState]);

  return simRef;
}
