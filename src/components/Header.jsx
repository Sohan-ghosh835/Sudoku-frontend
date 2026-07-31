import React from 'react';
import { Volume2, VolumeX, Palette, Lock, RefreshCw, Heart } from 'lucide-react';
import { playClick } from '../utils/audioEngine';

export default function Header({
  theme,
  setTheme,
  isMuted,
  toggleMute,
  difficulty,
  setDifficulty,
  gridSize,
  setGridSize,
  onNewGame,
  onLock
}) {
  const themes = ['pink', 'obsidian', 'emerald', 'cyber'];

  const cycleTheme = () => {
    playClick();
    const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIdx]);
  };

  return (
    <header className="header-bar">
      <div className="header-top-row">
        <div className="brand-title">
          <Heart size={20} fill="currentColor" />
          <span>SudoBunny</span>
        </div>

        <div className="header-icons">
          <button className="icon-btn" onClick={onNewGame} title="New Game">
            <RefreshCw size={16} />
          </button>
          <button className="icon-btn" onClick={cycleTheme} title="Change Theme">
            <Palette size={16} />
          </button>
          <button className="icon-btn" onClick={toggleMute} title="Toggle Audio">
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button className="icon-btn" onClick={onLock} title="Lock App">
            <Lock size={16} />
          </button>
        </div>
      </div>

      <div className="header-bottom-row">
        <div className="grid-size-toggle">
          <button
            className={`size-toggle-btn ${gridSize === 6 ? 'active' : ''}`}
            onClick={() => { playClick(); setGridSize(6); }}
          >
            6×6
          </button>
          <button
            className={`size-toggle-btn ${gridSize === 9 ? 'active' : ''}`}
            onClick={() => { playClick(); setGridSize(9); }}
          >
            9×9
          </button>
        </div>

        <select
          className="difficulty-select"
          value={difficulty}
          onChange={(e) => {
            playClick();
            setDifficulty(e.target.value);
          }}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="expert">Expert</option>
          <option value="infinite">Infinite</option>
        </select>
      </div>
    </header>
  );
}
