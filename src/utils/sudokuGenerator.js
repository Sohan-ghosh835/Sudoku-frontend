// gridSize: 6 => 2x3 boxes, 9 => 3x3 boxes
function getBoxDims(gridSize) {
  if (gridSize === 6) return { boxRows: 2, boxCols: 3 };
  return { boxRows: 3, boxCols: 3 };
}

export function createEmptyBoard(gridSize = 9) {
  return Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
}

export function isValid(board, row, col, num, gridSize = 9) {
  for (let i = 0; i < gridSize; i++) {
    if (board[row][i] === num && i !== col) return false;
    if (board[i][col] === num && i !== row) return false;
  }
  const { boxRows, boxCols } = getBoxDims(gridSize);
  const startRow = Math.floor(row / boxRows) * boxRows;
  const startCol = Math.floor(col / boxCols) * boxCols;
  for (let r = 0; r < boxRows; r++) {
    for (let c = 0; c < boxCols; c++) {
      const curR = startRow + r;
      const curC = startCol + c;
      if (board[curR][curC] === num && (curR !== row || curC !== col)) return false;
    }
  }
  return true;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function solveSudoku(board, gridSize = 9) {
  const nums = [];
  for (let i = 1; i <= gridSize; i++) nums.push(i);

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (board[row][col] === 0) {
        const shuffled = shuffle(nums);
        for (const num of shuffled) {
          if (isValid(board, row, col, num, gridSize)) {
            board[row][col] = num;
            if (solveSudoku(board, gridSize)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export function countSolutions(board, gridSize = 9, limit = 2) {
  let count = 0;
  function solve(b) {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (b[row][col] === 0) {
          for (let num = 1; num <= gridSize; num++) {
            if (isValid(b, row, col, num, gridSize)) {
              b[row][col] = num;
              solve(b);
              b[row][col] = 0;
              if (count >= limit) return;
            }
          }
          return;
        }
      }
    }
    count++;
  }
  const copy = board.map(r => [...r]);
  solve(copy);
  return count;
}

export function generateSudoku(difficulty = 'medium', gridSize = 9) {
  const solution = createEmptyBoard(gridSize);
  solveSudoku(solution, gridSize);
  const puzzle = solution.map(r => [...r]);

  const totalCells = gridSize * gridSize;
  let cluesTarget;

  if (gridSize === 6) {
    // 6x6 has 36 cells
    if (difficulty === 'easy') cluesTarget = 24;
    else if (difficulty === 'medium') cluesTarget = 19;
    else if (difficulty === 'hard') cluesTarget = 15;
    else cluesTarget = 13; // expert/infinite
  } else {
    // 9x9 has 81 cells
    if (difficulty === 'easy') cluesTarget = 40;
    else if (difficulty === 'medium') cluesTarget = 32;
    else if (difficulty === 'hard') cluesTarget = 27;
    else cluesTarget = 24; // expert/infinite
  }

  const positions = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      positions.push([r, c]);
    }
  }
  const shuffledPositions = shuffle(positions);

  let currentClues = totalCells;
  for (const [r, c] of shuffledPositions) {
    if (currentClues <= cluesTarget) break;
    const temp = puzzle[r][c];
    puzzle[r][c] = 0;

    if (countSolutions(puzzle, gridSize) !== 1) {
      puzzle[r][c] = temp;
    } else {
      currentClues--;
    }
  }

  return { puzzle, solution };
}

export function getCandidates(board, row, col, gridSize = 9) {
  if (board[row][col] !== 0) return [];
  const candidates = [];
  for (let num = 1; num <= gridSize; num++) {
    if (isValid(board, row, col, num, gridSize)) {
      candidates.push(num);
    }
  }
  return candidates;
}

export function generateAllCandidates(board, gridSize = 9) {
  const allCandidates = createEmptyBoard(gridSize).map(() => Array(gridSize).fill(null).map(() => []));
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (board[r][c] === 0) {
        allCandidates[r][c] = getCandidates(board, r, c, gridSize);
      }
    }
  }
  return allCandidates;
}
