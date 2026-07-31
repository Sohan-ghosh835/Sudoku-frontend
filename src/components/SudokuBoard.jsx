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
  noteFontSize,
  gridSize = 9
}) {
  const selectedValue = selectedCell ? board[selectedCell[0]][selectedCell[1]] : null;
  const { boxRows, boxCols } = gridSize === 6 ? { boxRows: 2, boxCols: 3 } : { boxRows: 3, boxCols: 3 };

  // For notes grid in 6x6: 2 rows x 3 cols matching box shape
  const noteNums = [];
  for (let i = 1; i <= gridSize; i++) noteNums.push(i);

  const notesGridCols = boxCols; // 3 for both 6 and 9
  const notesGridRows = boxRows; // 2 for 6x6, 3 for 9x9

  return (
    <div className="board-wrapper">
      <div
        className={`sudoku-board ${gridSize === 6 ? 'board-6x6' : ''}`}
        style={{
          width: boardSize,
          height: boardSize,
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {board.map((row, r) =>
          row.map((val, c) => {
            const isGiven = initialBoard[r][c] !== 0;
            const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
            const isSameRowOrCol = selectedCell && (selectedCell[0] === r || selectedCell[1] === c);
            const isSameBlock = selectedCell &&
              Math.floor(selectedCell[0] / boxRows) === Math.floor(r / boxRows) &&
              Math.floor(selectedCell[1] / boxCols) === Math.floor(c / boxCols);
            const isSameNum = selectedValue && val === selectedValue && val !== 0;
            const isError = errorCells.some(([er, ec]) => er === r && ec === c);

            // Thick borders: at box boundaries
            const isBottomBorderThick = (r + 1) % boxRows === 0 && r < gridSize - 1;
            const isRightBorderThick = (c + 1) % boxCols === 0 && c < gridSize - 1;

            let cellClasses = 'sudoku-cell';
            if (isGiven) cellClasses += ' given';
            if (isSelected) cellClasses += ' selected';
            else if (isSameNum) cellClasses += ' same-num';
            else if (isSameRowOrCol || isSameBlock) cellClasses += ' highlight';
            if (isError) cellClasses += ' error';
            if (isBottomBorderThick) cellClasses += ' border-bottom-thick';
            if (isRightBorderThick) cellClasses += ' border-right-thick';

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
                  <div
                    className="notes-grid"
                    style={{
                      gridTemplateColumns: `repeat(${notesGridCols}, 1fr)`,
                      gridTemplateRows: `repeat(${notesGridRows}, 1fr)`,
                    }}
                  >
                    {noteNums.map((n) => (
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
