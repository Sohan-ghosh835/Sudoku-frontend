import React, { useState } from 'react';
import { Heart, Lock, Sparkles, Delete } from 'lucide-react';
import { playClick, playIncorrect, playUnlock } from '../utils/audioEngine';

export default function LockScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (digit) => {
    if (pin.length < 6) {
      playClick();
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 6) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    playClick();
    setPin(prev => prev.slice(0, -1));
  };

  const verifyPin = (code) => {
    if (code === '221204') {
      playUnlock();
      setTimeout(() => {
        onUnlock();
      }, 300);
    } else {
      playIncorrect();
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 600);
    }
  };

  return (
    <div className="lock-screen">
      <div className={`lock-card ${error ? 'shake' : ''}`}>
        <div className="gift-badge">
          <Heart size={16} fill="currentColor" />
          <span>A Gift For You</span>
        </div>

        <div className="lock-title">Hello Baby! 💕</div>
        <div className="lock-subtitle">Enter your 6-digit passcode to begin</div>

        <div className="pin-dots">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`pin-dot ${index < pin.length ? 'filled' : ''}`}
            />
          ))}
        </div>

        <div className="keypad-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              className="keypad-btn"
              onClick={() => handleKeyPress(num.toString())}
            >
              {num}
            </button>
          ))}
          <button className="keypad-btn" style={{ visibility: 'hidden' }} />
          <button
            className="keypad-btn"
            onClick={() => handleKeyPress('0')}
          >
            0
          </button>
          <button
            className="keypad-btn"
            onClick={handleDelete}
          >
            <Delete size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
