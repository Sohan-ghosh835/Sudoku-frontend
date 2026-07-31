import React, { useState, useEffect, useCallback } from 'react';
import LockScreen from './components/LockScreen';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import SudokuBoard from './components/SudokuBoard';
import ControlPanel from './components/ControlPanel';
import VictoryModal from './components/VictoryModal';
import { generateSudoku, createEmptyBoard, generateAllCandidates } from './utils/sudokuGenerator';
import { playClick, playNoteToggle, playErase, playIncorrect, setMuted } from './utils/audioEngine';
import { getAIHint } from './utils/aiHintEngine';
import { Sparkles, CheckCircle2 } from 'lucide-react';

function useBoardSize() {
  const [size, setSize] = useState({ board: 320, cellFont: 18, noteFont: 7, actionHeight: 42, actionFontSize: 11, numHeight: 44, numFontSize: 18 });

  useEffect(() => {
    function compute() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isDesktop = w >= 768;

      if (isDesktop) {
        const available = Math.min(h * 0.60, w * 0.55, 580);
        const board = Math.floor(available / 9) * 9;
        setSize({
          board,
          cellFont: Math.floor(board / 9 * 0.55),
          noteFont: Math.floor(board / 9 * 0.24),
          actionHeight: 48,
          actionFontSize: 12,
          numHeight: 52,
          numFontSize: 20,
        });
      } else {
        const available = Math.min(w - 20, h * 0.48);
        const board = Math.floor(available / 9) * 9;
        const cellSize = board / 9;
        const actionHeight = Math.max(34, Math.min(42, h * 0.045));
        const numHeight = Math.max(38, Math.min(48, h * 0.052));
        setSize({
          board,
          cellFont: Math.floor(cellSize * 0.54),
          noteFont: Math.floor(cellSize * 0.23),
          actionHeight,
          actionFontSize: Math.max(9, Math.floor(actionHeight * 0.24)),
          numHeight,
          numFontSize: Math.max(14, Math.floor(numHeight * 0.45)),
        });
      }
    }
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  return size;
}

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [theme, setTheme] = useState('pink');
  const [isMuted, setIsMutedState] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');

  const [initialBoard, setInitialBoard] = useState(createEmptyBoard());
  const [board, setBoard] = useState(createEmptyBoard());
  const [solution, setSolution] = useState(createEmptyBoard());
  const [notes, setNotes] = useState(createEmptyBoard().map(() => Array(9).fill(null).map(() => [])));

  const [selectedCell, setSelectedCell] = useState(null);
  const [notesMode, setNotesMode] = useState(false);
  const [errorCells, setErrorCells] = useState([]);

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isVictory, setIsVictory] = useState(false);

  const [aiHint, setAiHint] = useState(null);
  const [isAILoading, setIsAILoading] = useState(false);

  const sizes = useBoardSize();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const initGame = useCallback((diff = difficulty) => {
    const { puzzle, solution: sol } = generateSudoku(diff);
    const emptyNotes = createEmptyBoard().map(() => Array(9).fill(null).map(() => []));
    setInitialBoard(puzzle.map(r => [...r]));
    setBoard(puzzle.map(r => [...r]));
    setSolution(sol.map(r => [...r]));
    setNotes(emptyNotes);
    setSelectedCell(null);
    setErrorCells([]);
    setHistory([{ board: puzzle.map(r => [...r]), notes: emptyNotes }]);
    setHistoryIndex(0);
    setTime(0);
    setMistakes(0);
    setHintsUsed(0);
    setIsVictory(false);
    setIsPaused(false);
    setAiHint(null);
  }, [difficulty]);

  useEffect(() => {
    if (isUnlocked) initGame(difficulty);
  }, [isUnlocked, difficulty, initGame]);

  useEffect(() => {
    let interval = null;
    if (isUnlocked && !isPaused && !isVictory) {
      interval = setInterval(() => setTime(prev => prev + 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isUnlocked, isPaused, isVictory]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMutedState(next);
    setMuted(next);
  };

  const pushHistory = (newBoard, newNotes) => {
    const sliced = history.slice(0, historyIndex + 1);
    const updated = [...sliced, { board: newBoard.map(r => [...r]), notes: JSON.parse(JSON.stringify(newNotes)) }];
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
  };

  const checkVictory = (b) => {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (b[r][c] !== solution[r][c]) return false;
    return true;
  };

  const handleInputNumber = (num) => {
    if (!selectedCell || isPaused || isVictory) return;
    const [r, c] = selectedCell;
    if (initialBoard[r][c] !== 0) return;

    if (notesMode) {
      playNoteToggle();
      const cellNotes = notes[r][c] || [];
      const newCellNotes = cellNotes.includes(num)
        ? cellNotes.filter(n => n !== num)
        : [...cellNotes, num].sort();
      const newNotes = JSON.parse(JSON.stringify(notes));
      newNotes[r][c] = newCellNotes;
      setNotes(newNotes);
      pushHistory(board, newNotes);
    } else {
      if (board[r][c] === num) return;
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = num;
      if (num !== solution[r][c]) {
        playIncorrect();
        setMistakes(prev => prev + 1);
        setErrorCells([[r, c]]);
        setTimeout(() => setErrorCells([]), 800);
      } else {
        playClick();
      }
      const newNotes = JSON.parse(JSON.stringify(notes));
      newNotes[r][c] = [];
      setBoard(newBoard);
      setNotes(newNotes);
      pushHistory(newBoard, newNotes);
      if (checkVictory(newBoard)) setIsVictory(true);
    }
  };

  const handleErase = () => {
    if (!selectedCell || isPaused || isVictory) return;
    const [r, c] = selectedCell;
    if (initialBoard[r][c] !== 0) return;
    playErase();
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = 0;
    const newNotes = JSON.parse(JSON.stringify(notes));
    newNotes[r][c] = [];
    setBoard(newBoard);
    setNotes(newNotes);
    pushHistory(newBoard, newNotes);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setBoard(prev.board.map(r => [...r]));
      setNotes(JSON.parse(JSON.stringify(prev.notes)));
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setBoard(next.board.map(r => [...r]));
      setNotes(JSON.parse(JSON.stringify(next.notes)));
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleAutoNotes = () => {
    const generated = generateAllCandidates(board);
    setNotes(generated);
    pushHistory(board, generated);
  };

  const handleRequestAIHint = async () => {
    setIsAILoading(true);
    setHintsUsed(prev => prev + 1);
    const hint = await getAIHint({ board, solution, selectedCell, candidatesMap: notes });
    setAiHint(hint);
    setIsAILoading(false);
  };

  const handleApplyAIHint = (cell, val) => {
    const [r, c] = cell;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = val;
    const newNotes = JSON.parse(JSON.stringify(notes));
    newNotes[r][c] = [];
    setBoard(newBoard);
    setNotes(newNotes);
    pushHistory(newBoard, newNotes);
    if (checkVictory(newBoard)) setIsVictory(true);
  };

  const handleKeyDown = useCallback((e) => {
    if (!isUnlocked || isPaused || isVictory) return;
    if (e.key >= '1' && e.key <= '9') {
      handleInputNumber(parseInt(e.key, 10));
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      handleErase();
    } else if (e.key === 'n' || e.key === 'N') {
      playNoteToggle();
      setNotesMode(prev => !prev);
    } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      setSelectedCell(prev => {
        if (!prev) return [0, 0];
        let [r, c] = prev;
        if (e.key === 'ArrowUp') r = Math.max(0, r - 1);
        if (e.key === 'ArrowDown') r = Math.min(8, r + 1);
        if (e.key === 'ArrowLeft') c = Math.max(0, c - 1);
        if (e.key === 'ArrowRight') c = Math.min(8, c + 1);
        return [r, c];
      });
    }
  }, [isUnlocked, isPaused, isVictory, selectedCell, notesMode, board, initialBoard, notes, solution]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isUnlocked) {
    return <LockScreen onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="app-container">
      <div className="bg-particles">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="floating-sparkle"
            style={{
              left: `${(i * 13) % 100}%`,
              animationDelay: `${i * 1.1}s`,
              color: 'var(--accent)'
            }}
          >
            {i % 2 === 0 ? '✦' : '*'}
          </div>
        ))}
      </div>

      <Header
        theme={theme}
        setTheme={setTheme}
        isMuted={isMuted}
        toggleMute={toggleMute}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onNewGame={() => initGame(difficulty)}
        onLock={() => setIsUnlocked(false)}
      />

      <StatsBar
        time={time}
        isPaused={isPaused}
        togglePause={() => setIsPaused(prev => !prev)}
        mistakes={mistakes}
        hintsUsed={hintsUsed}
      />

      <SudokuBoard
        board={board}
        initialBoard={initialBoard}
        notes={notes}
        selectedCell={selectedCell}
        onSelectCell={(r, c) => {
          playClick();
          setSelectedCell([r, c]);
        }}
        errorCells={errorCells}
        solution={solution}
        boardSize={sizes.board}
        cellFontSize={sizes.cellFont}
        noteFontSize={sizes.noteFont}
      />

      <ControlPanel
        onInputNumber={handleInputNumber}
        onErase={handleErase}
        notesMode={notesMode}
        toggleNotesMode={() => {
          playNoteToggle();
          setNotesMode(prev => !prev);
        }}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onAutoNotes={handleAutoNotes}
        onRequestAIHint={handleRequestAIHint}
        actionHeight={sizes.actionHeight}
        actionFontSize={sizes.actionFontSize}
        numHeight={sizes.numHeight}
        numFontSize={sizes.numFontSize}
      />

      <div className="embedded-ai-card">
        <div className="ai-card-header">
          <div className="ai-card-title">
            <Sparkles size={16} />
            <span>AI Assistant Companion</span>
          </div>
          <button
            className="ai-card-trigger"
            onClick={() => { playClick(); handleRequestAIHint(); }}
            disabled={isAILoading}
          >
            {isAILoading ? 'Thinking...' : 'Ask Hint'}
          </button>
        </div>

        <div className="ai-card-body">
          {isAILoading ? (
            <div>Analyzing logical strategies...</div>
          ) : aiHint ? (
            <div>
              {aiHint.technique && (
                <div className="ai-strategy-tag">{aiHint.technique}</div>
              )}
              <div>{aiHint.text}</div>
              {aiHint.suggestedCell && aiHint.suggestedValue && (
                <button
                  className="ai-apply-inline"
                  onClick={() => {
                    playClick();
                    handleApplyAIHint(aiHint.suggestedCell, aiHint.suggestedValue);
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>Fill {aiHint.suggestedValue} in R{aiHint.suggestedCell[0] + 1} C{aiHint.suggestedCell[1] + 1}</span>
                </button>
              )}
            </div>
          ) : (
            <div>
              {selectedCell
                ? `Cell R${selectedCell[0] + 1} C${selectedCell[1] + 1} selected. Tap 'Ask Hint' for logical strategy.`
                : "Select any cell on the board or tap 'Ask Hint' to get logical strategy assistance!"}
            </div>
          )}
        </div>
      </div>

      <VictoryModal
        isOpen={isVictory}
        onNextPuzzle={() => initGame(difficulty)}
        time={time}
        mistakes={mistakes}
        hintsUsed={hintsUsed}
        difficulty={difficulty}
      />
    </div>
  );
}
