/**
 * Push a sim status into the page-level game state.
 * Returns the previous object when nothing changed so React can bail out.
 */

export function commitStatus(setGameState, status) {
  setGameState((prev) => {
    const gameWon = !!status.gameWon;
    const gameLost = !!status.gameLost;
    const next = {
      ...prev,
      score: status.score,
      lives: status.lives,
      level: status.level,
      gameWon,
      gameLost,
      isPlaying: gameWon || gameLost ? false : prev.isPlaying
    };

    if (status.opponentScore !== undefined) {
      next.opponentScore = status.opponentScore;
    }

    if (
      next.score === prev.score &&
      next.lives === prev.lives &&
      next.level === prev.level &&
      next.gameWon === prev.gameWon &&
      next.gameLost === prev.gameLost &&
      next.isPlaying === prev.isPlaying &&
      next.opponentScore === prev.opponentScore
    ) {
      return prev;
    }

    return next;
  });
}
