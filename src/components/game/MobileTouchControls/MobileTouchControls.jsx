import React from 'react';
import './MobileTouchControls.css';

const stop = (e) => {
  e.stopPropagation();
};

function TouchBtn({ children, onClick, className = '', title, ...rest }) {
  return (
    <button
      type="button"
      className={`mobile-touch-btn ${className}`.trim()}
      title={title}
      onClick={(e) => {
        stop(e);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

function Game2048Controls({ mobileActionRef }) {
  const run = (dir) => () => {
    mobileActionRef.current?.applyDirection?.(dir);
  };
  return (
    <>
      <div className="mobile-touch-controls__cluster">
        <div className="mobile-touch-pad mobile-touch-pad--4way">
          <div className="mobile-touch-pad__spacer" />
          <TouchBtn title="Up (+Z)" onClick={run('posZ')}>
            ↑
          </TouchBtn>
          <div className="mobile-touch-pad__spacer" />
          <TouchBtn title="Left (−X)" onClick={run('negX')}>
            ←
          </TouchBtn>
          <div className="mobile-touch-pad__spacer" />
          <TouchBtn title="Right (+X)" onClick={run('posX')}>
            →
          </TouchBtn>
          <div className="mobile-touch-pad__spacer" />
          <TouchBtn title="Down (−Z)" onClick={run('negZ')}>
            ↓
          </TouchBtn>
          <div className="mobile-touch-pad__spacer" />
        </div>
      </div>
      <div className="mobile-touch-controls__cluster mobile-touch-controls__cluster--right">
        <TouchBtn title="Y+ (Space)" onClick={run('posY')} className="mobile-touch-btn--wide">
          Y+ ␣
        </TouchBtn>
        <TouchBtn title="Y− (Shift)" onClick={run('negY')} className="mobile-touch-btn--wide">
          Y− ⇧
        </TouchBtn>
      </div>
    </>
  );
}

function GameTetrisControls({ mobileActionRef }) {
  return (
    <>
      <div className="mobile-touch-controls__cluster">
        <div className="mobile-touch-pad mobile-touch-pad--wasd">
          <div className="mobile-touch-pad__spacer" />
          <TouchBtn className="mobile-touch-btn--small" title="W" onClick={() => mobileActionRef.current?.moveW?.()}>
            W
          </TouchBtn>
          <div className="mobile-touch-pad__spacer" />
          <TouchBtn className="mobile-touch-btn--small" title="A" onClick={() => mobileActionRef.current?.moveA?.()}>
            A
          </TouchBtn>
          <TouchBtn className="mobile-touch-btn--small" title="S" onClick={() => mobileActionRef.current?.moveS?.()}>
            S
          </TouchBtn>
          <TouchBtn className="mobile-touch-btn--small" title="D" onClick={() => mobileActionRef.current?.moveD?.()}>
            D
          </TouchBtn>
        </div>
      </div>
      <div className="mobile-touch-controls__cluster mobile-touch-controls__cluster--right">
        <div className="mobile-touch-tetris-extra">
          <TouchBtn className="mobile-touch-btn--small" title="Q" onClick={() => mobileActionRef.current?.rotateQ?.()}>
            Q
          </TouchBtn>
          <TouchBtn className="mobile-touch-btn--small" title="E" onClick={() => mobileActionRef.current?.rotateE?.()}>
            E
          </TouchBtn>
          <TouchBtn className="mobile-touch-btn--small" title="Rotate X +" onClick={() => mobileActionRef.current?.rotateXUp?.()}>
            ↻X
          </TouchBtn>
          <TouchBtn className="mobile-touch-btn--small" title="Rotate X −" onClick={() => mobileActionRef.current?.rotateXDown?.()}>
            ↺X
          </TouchBtn>
        </div>
        <TouchBtn title="Hard drop (Space)" onClick={() => mobileActionRef.current?.hardDrop?.()}>
          Drop
        </TouchBtn>
        <button
          type="button"
          className="mobile-touch-btn"
          title="Soft drop (hold Shift)"
          onPointerDown={(e) => {
            stop(e);
            mobileActionRef.current?.setSoftDrop?.(true);
          }}
          onPointerUp={(e) => {
            stop(e);
            mobileActionRef.current?.setSoftDrop?.(false);
          }}
          onPointerCancel={(e) => {
            stop(e);
            mobileActionRef.current?.setSoftDrop?.(false);
          }}
          onPointerLeave={() => {
            mobileActionRef.current?.setSoftDrop?.(false);
          }}
        >
          Soft
        </button>
      </div>
    </>
  );
}

const CROSSWORD_ROWS = [
  'ABCDEFGHIJKLM'.split(''),
  'NOPQRSTUVWXYZ'.split('')
];

function GameCrosswordControls({ mobileActionRef }) {
  return (
    <div className="mobile-touch-crossword">
      {CROSSWORD_ROWS.map((row, ri) => (
        <div key={ri} className="mobile-touch-crossword__row">
          {row.map((ch) => (
            <TouchBtn
              key={ch}
              className="mobile-touch-btn--small"
              title={ch}
              onClick={() => mobileActionRef.current?.typeLetter?.(ch)}
            >
              {ch}
            </TouchBtn>
          ))}
        </div>
      ))}
      <div className="mobile-touch-crossword__row">
        <TouchBtn title="Backspace" onClick={() => mobileActionRef.current?.backspace?.()}>
          ⌫ Back
        </TouchBtn>
      </div>
    </div>
  );
}

function GameSudokuControls({ mobileActionRef }) {
  return (
    <>
      <div className="mobile-touch-controls__cluster">
        <div className="mobile-touch-sudoku-pad">
          <span className="mobile-touch-pad__spacer" aria-hidden />
          <TouchBtn title="Cell up" onClick={() => mobileActionRef.current?.moveSelection?.(-1, 0)}>
            ↑
          </TouchBtn>
          <span className="mobile-touch-pad__spacer" aria-hidden />
          <TouchBtn title="Cell left" onClick={() => mobileActionRef.current?.moveSelection?.(0, -1)}>
            ←
          </TouchBtn>
          <span className="mobile-touch-pad__spacer" aria-hidden />
          <TouchBtn title="Cell right" onClick={() => mobileActionRef.current?.moveSelection?.(0, 1)}>
            →
          </TouchBtn>
          <span className="mobile-touch-pad__spacer" aria-hidden />
          <TouchBtn title="Cell down" onClick={() => mobileActionRef.current?.moveSelection?.(1, 0)}>
            ↓
          </TouchBtn>
          <span className="mobile-touch-pad__spacer" aria-hidden />
        </div>
      </div>
      <div className="mobile-touch-controls__cluster mobile-touch-controls__cluster--right">
        <div className="mobile-touch-sudoku-layers">
          <TouchBtn title="Layer up (Page Up)" onClick={() => mobileActionRef.current?.bumpLayer?.(1)}>
            L+
          </TouchBtn>
          <TouchBtn title="Layer down (Page Down)" onClick={() => mobileActionRef.current?.bumpLayer?.(-1)}>
            L−
          </TouchBtn>
        </div>
      </div>
    </>
  );
}

const TOUCH_GAME_IDS = new Set(['2048-3d', 'tetris-3d', 'crossword-3d', 'sudoku-3d']);

/**
 * Renders fixed touch targets that call into `mobileActionRef` (populated by each game).
 */
export default function MobileTouchControls({ gameId, mobileActionRef, visible, isPlaying }) {
  if (!visible || !isPlaying || !TOUCH_GAME_IDS.has(gameId)) return null;

  if (gameId === 'crossword-3d') {
    return (
      <div className="mobile-touch-controls mobile-touch-controls--crossword">
        <GameCrosswordControls mobileActionRef={mobileActionRef} />
      </div>
    );
  }

  return (
    <div className="mobile-touch-controls">
      {gameId === '2048-3d' && <Game2048Controls mobileActionRef={mobileActionRef} />}
      {gameId === 'tetris-3d' && <GameTetrisControls mobileActionRef={mobileActionRef} />}
      {gameId === 'sudoku-3d' && <GameSudokuControls mobileActionRef={mobileActionRef} />}
    </div>
  );
}
