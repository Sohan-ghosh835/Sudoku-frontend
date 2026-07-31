import React from 'react';
import { Sparkles, X, Heart, CheckCircle2 } from 'lucide-react';
import { playClick } from '../utils/audioEngine';

export default function AIAssistant({
  isOpen,
  onClose,
  aiHint,
  isLoading,
  onApplyHint
}) {
  if (!isOpen) return null;

  return (
    <div className="ai-modal">
      <div className="ai-header">
        <div className="ai-avatar">
          <Heart size={20} fill="currentColor" />
          <span>Sudoku AI Companion</span>
        </div>
        <button
          className="icon-btn"
          style={{ width: '28px', height: '28px' }}
          onClick={() => { playClick(); onClose(); }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="ai-content">
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)' }}>
            <Sparkles size={18} />
            <span>Thinking...</span>
          </div>
        ) : aiHint ? (
          <div>
            {aiHint.technique && (
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Strategy: {aiHint.technique}
              </div>
            )}
            <div>{aiHint.text}</div>
          </div>
        ) : (
          <div>Tap a cell and I'll walk you through the logic step by step.</div>
        )}
      </div>

      {aiHint && aiHint.suggestedCell && aiHint.suggestedValue && !isLoading && (
        <button
          className="primary-btn"
          style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          onClick={() => {
            playClick();
            onApplyHint(aiHint.suggestedCell, aiHint.suggestedValue);
            onClose();
          }}
        >
          <CheckCircle2 size={16} />
          <span>Auto Fill {aiHint.suggestedValue} in Row {aiHint.suggestedCell[0] + 1}, Col {aiHint.suggestedCell[1] + 1}</span>
        </button>
      )}
    </div>
  );
}
