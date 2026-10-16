import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useFreshSim } from './useFreshSim';

function createSession(difficulty) {
  return { score: 0, lives: 3, level: 1, aiScore: 0, difficulty };
}

function Harness() {
  const [playing, setPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState('Easy');
  const [header, setHeader] = useState({
    score: 9,
    lives: 1,
    level: 4,
    opponentScore: 2,
    gameWon: false,
    gameLost: true
  });
  const simRef = useFreshSim(playing, difficulty, createSession, setHeader);

  return (
    <div>
      <span data-testid="header">{`${header.score}|${header.lives}|${header.level}|${header.opponentScore}|${header.gameLost}`}</span>
      <span data-testid="sim">{simRef.current ? `${simRef.current.difficulty}|${simRef.current.score}` : 'none'}</span>
      <button type="button" onClick={() => setPlaying(true)}>play</button>
      <button type="button" onClick={() => setPlaying(false)}>stop</button>
      <button type="button" onClick={() => setDifficulty('Hard')}>hard</button>
      <button
        type="button"
        onClick={() => {
          simRef.current.score = 40;
          simRef.current.lives = 2;
        }}
      >
        score
      </button>
    </div>
  );
}

describe('useFreshSim', () => {
  test('starting play replaces the session and clears a stale header', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('score'));
    fireEvent.click(screen.getByText('play'));
    expect(screen.getByTestId('header').textContent).toBe('0|3|1|0|false');
    expect(screen.getByTestId('sim').textContent).toBe('Easy|0');
  });

  test('changing difficulty while playing starts a new session', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('play'));
    fireEvent.click(screen.getByText('score'));
    fireEvent.click(screen.getByText('hard'));
    expect(screen.getByTestId('sim').textContent).toBe('Hard|0');
    expect(screen.getByTestId('header').textContent).toBe('0|3|1|0|false');
  });
});
