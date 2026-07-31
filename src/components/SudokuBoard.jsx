import React from 'react';

export default function SudokuBoard({
  board,
  initialBoard,
  notes,
  selectedCell,
  onSelectCell,
  errorCells,
  solution,
  boardSize,
  cellFontSize,
  noteFontSize
}) {
  const selectedValue = selectedCell ? board[selectedCell[0]][selectedCell[1]] : null;

  return (
    <div className="board-wrapper">
      <div
        className="sudoku-board"
        style={{ width: boardSize, height: boardSize }}
      >
        {board.map((row, r) =>
          row.map((val, c) => {
            const isGiven = initialBoard[r][c] !== 0;
            const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
            const isSameRowOrCol = selectedCell && (selectedCell[0] === r || selectedCell[1] === c);
            const isSameBlock = selectedCell &&
              Math.floor(selectedCell[0] / 3) === Math.floor(r / 3) &&
              Math.floor(selectedCell[1] / 3) === Math.floor(c / 3);
            const isSameNum = selectedValue && val === selectedValue && val !== 0;
            const isError = errorCells.some(([er, ec]) => er === r && ec === c);
            const isBottomBorderThick = r === 2 || r === 5;

            let cellClasses = 'sudoku-cell';
            if (isGiven) cellClasses += ' given';
            if (isSelected) cellClasses += ' selected';
            else if (isSameNum) cellClasses += ' same-num';
            else if (isSameRowOrCol || isSameBlock) cellClasses += ' highlight';
            if (isError) cellClasses += ' error';
            if (isBottomBorderThick) cellClasses += ' border-bottom-thick';

            const cellNotes = notes[r]?.[c] || [];

            return (
              <div
                key={`${r}-${c}`}
                className={cellClasses}
                style={{ fontSize: cellFontSize }}
                onClick={() => onSelectCell(r, c)}
              >
                {val !== 0 ? (
                  val
                ) : cellNotes.length > 0 ? (
                  <div className="notes-grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <div key={n} className="note-num" style={{ fontSize: noteFontSize }}>
                        {cellNotes.includes(n) ? n : ''}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
