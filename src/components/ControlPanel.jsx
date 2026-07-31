import React from 'react';
import { Edit3, Eraser, RotateCcw, RotateCw, Wand2, Sparkles } from 'lucide-react';
import { playClick } from '../utils/audioEngine';

export default function ControlPanel({
  onInputNumber,
  onErase,
  notesMode,
  toggleNotesMode,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onAutoNotes,
  onRequestAIHint,
  actionHeight = 42,
  actionFontSize = 11,
  numHeight = 44,
  numFontSize = 18,
}) {
  const iconSize = Math.max(14, Math.floor(actionHeight * 0.38));

  return (
    <div className="control-panel">
      <div className="action-row">
        <button
          className="action-btn"
          onClick={() => { playClick(); onUndo(); }}
          disabled={!canUndo}
          style={{ height: actionHeight, fontSize: actionFontSize, opacity: canUndo ? 1 : 0.4 }}
        >
          <RotateCcw size={iconSize} />
          <span>Undo</span>
        </button>

        <button
          className="action-btn"
          onClick={() => { playClick(); onRedo(); }}
          disabled={!canRedo}
          style={{ height: actionHeight, fontSize: actionFontSize, opacity: canRedo ? 1 : 0.4 }}
        >
          <RotateCw size={iconSize} />
          <span>Redo</span>
        </button>

        <button
          className="action-btn"
          onClick={() => { playClick(); onErase(); }}
          style={{ height: actionHeight, fontSize: actionFontSize }}
        >
          <Eraser size={iconSize} />
          <span>Erase</span>
        </button>

        <button
          className={`action-btn ${notesMode ? 'active' : ''}`}
          onClick={toggleNotesMode}
          style={{ height: actionHeight, fontSize: actionFontSize }}
        >
          <Edit3 size={iconSize} />
          <span>Notes</span>
        </button>

        <button
          className="action-btn"
          onClick={() => { playClick(); onAutoNotes(); }}
          style={{ height: actionHeight, fontSize: actionFontSize }}
        >
          <Wand2 size={iconSize} />
          <span>Auto</span>
        </button>

        <button
          className="action-btn"
          onClick={() => { playClick(); onRequestAIHint(); }}
          style={{ height: actionHeight, fontSize: actionFontSize, background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }}
        >
          <Sparkles size={iconSize} />
          <span>AI Hint</span>
        </button>
      </div>

      <div className="numpad-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            className="num-btn"
            style={{ height: numHeight, fontSize: numFontSize }}
            onClick={() => onInputNumber(num)}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}
