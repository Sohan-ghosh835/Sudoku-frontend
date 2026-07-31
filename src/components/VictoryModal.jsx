import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Trophy, RefreshCw, Timer, Sparkles, AlertCircle } from 'lucide-react';
import { playWin, playClick } from '../utils/audioEngine';

export default function VictoryModal({
  isOpen,
  onNextPuzzle,
  time,
  mistakes,
  hintsUsed,
  difficulty
}) {
  useEffect(() => {
    if (isOpen) {
      playWin();
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay">
      <div className="victory-card">
        <div style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
          <Trophy size={56} />
        </div>

        <h2 style={{ fontSize: '1.7rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
          Puzzle Solved, Baby!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.3rem' }}>
          You completed this {difficulty.toUpperCase()} Sudoku.
        </p>

        <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '1rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <Timer size={18} style={{ color: 'var(--accent)' }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Time</div>
            <div style={{ fontWeight: '700', fontSize: '1rem' }}>{formatTime(time)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <AlertCircle size={18} style={{ color: 'var(--accent)' }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mistakes</div>
            <div style={{ fontWeight: '700', fontSize: '1rem' }}>{mistakes}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Sparkles size={18} style={{ color: 'var(--accent)' }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hints</div>
            <div style={{ fontWeight: '700', fontSize: '1rem' }}>{hintsUsed}</div>
          </div>
        </div>

        <button
          className="primary-btn"
          onClick={() => {
            playClick();
            onNextPuzzle();
          }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={18} />
          <span>Next Puzzle</span>
        </button>
      </div>
    </div>
  );
}
