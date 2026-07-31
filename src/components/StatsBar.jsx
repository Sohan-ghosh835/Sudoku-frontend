import React from 'react';
import { Timer, AlertCircle, Sparkles, Pause, Play } from 'lucide-react';
import { playClick } from '../utils/audioEngine';

export default function StatsBar({
  time,
  isPaused,
  togglePause,
  mistakes,
  hintsUsed
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <Timer size={16} />
        <span className="stat-value">{formatTime(time)}</span>
        <button
          onClick={() => {
            playClick();
            togglePause();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            marginLeft: '0.2rem',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {isPaused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      </div>

      <div className="stat-item">
        <AlertCircle size={16} />
        <span>Mistakes: </span>
        <span className="stat-value">{mistakes}</span>
      </div>

      <div className="stat-item">
        <Sparkles size={16} />
        <span>Hints: </span>
        <span className="stat-value">{hintsUsed}</span>
      </div>
    </div>
  );
}
