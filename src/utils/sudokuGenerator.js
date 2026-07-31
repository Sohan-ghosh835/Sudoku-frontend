export function createEmptyBoard() {
  return Array(9).fill(0).map(() => Array(9).fill(0));
}

export function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num && i !== col) return false;
    if (board[i][col] === num && i !== row) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
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

export function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export function countSolutions(board, limit = 2) {
  let count = 0;
  function solve(b) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (b[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(b, row, col, num)) {
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

export function generateSudoku(difficulty = 'medium') {
  const solution = createEmptyBoard();
  solveSudoku(solution);
  const puzzle = solution.map(r => [...r]);

  let cluesTarget = 32;
  if (difficulty === 'easy') cluesTarget = 40;
  if (difficulty === 'medium') cluesTarget = 32;
  if (difficulty === 'hard') cluesTarget = 27;
  if (difficulty === 'infinite' || difficulty === 'expert') cluesTarget = 24;

  const positions = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  const shuffledPositions = shuffle(positions);

  let currentClues = 81;
  for (const [r, c] of shuffledPositions) {
    if (currentClues <= cluesTarget) break;
    const temp = puzzle[r][c];
    puzzle[r][c] = 0;
    
    if (countSolutions(puzzle) !== 1) {
      puzzle[r][c] = temp;
    } else {
      currentClues--;
    }
  }

  return { puzzle, solution };
}

export function getCandidates(board, row, col) {
  if (board[row][col] !== 0) return [];
  const candidates = [];
  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) {
      candidates.push(num);
    }
  }
  return candidates;
}

export function generateAllCandidates(board) {
  const allCandidates = createEmptyBoard().map(() => Array(9).fill(null).map(() => []));
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        allCandidates[r][c] = getCandidates(board, r, c);
      }
    }
  }
  return allCandidates;
}
