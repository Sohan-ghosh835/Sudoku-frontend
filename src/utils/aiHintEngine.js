import { getCandidates } from './sudokuGenerator';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function getAIHint({ board, solution, selectedCell, candidatesMap, gridSize = 9 }) {
  const localHint = getLocalLogicalHint(board, solution, selectedCell, candidatesMap, gridSize);

  if (BACKEND_URL) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/hint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedCell, solution, localHint })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          return {
            text: data.text,
            technique: data.technique || localHint.technique,
            suggestedCell: data.suggestedCell || localHint.suggestedCell,
            suggestedValue: data.suggestedValue || localHint.suggestedValue
          };
        }
      }
    } catch (e) {
    }
  }

  if (OPENAI_API_KEY) {
    try {
      const prompt = `You are a warm, thoughtful Sudoku assistant helping someone you care about.
Selected cell: ${selectedCell ? `Row ${selectedCell[0] + 1}, Column ${selectedCell[1] + 1}` : 'None selected'}.
Rule-based analysis: ${localHint.technique} — ${localHint.explanation}
Target digit for selected cell: ${selectedCell ? solution[selectedCell[0]][selectedCell[1]] : 'N/A'}
Grid size: ${gridSize}x${gridSize}

Write a short, clear hint (2-3 sentences). Be warm and encouraging but do not use emojis or excessive affection. Explain the logical step without revealing the answer outright. Address them as "you" naturally.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a calm, intelligent Sudoku coach. Give clear, logical hints in 2-3 sentences without emojis. Be warm but not over-enthusiastic." },
            { role: "user", content: prompt }
          ],
          max_tokens: 130,
          temperature: 0.65
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiText = data.choices?.[0]?.message?.content?.trim();
        if (aiText) {
          return {
            text: aiText,
            technique: localHint.technique,
            suggestedCell: localHint.suggestedCell,
            suggestedValue: localHint.suggestedValue
          };
        }
      }
    } catch (e) {
    }
  }

  return {
    text: localHint.explanation,
    technique: localHint.technique,
    suggestedCell: localHint.suggestedCell,
    suggestedValue: localHint.suggestedValue
  };
}

export function getLocalLogicalHint(board, solution, selectedCell, candidatesMap, gridSize = 9) {
  if (selectedCell) {
    const [r, c] = selectedCell;
    if (board[r][c] !== 0) {
      return {
        technique: "Cell Already Filled",
        explanation: `Row ${r + 1}, Column ${c + 1} already has ${board[r][c]} placed. Try selecting an empty cell.`,
        suggestedCell: [r, c],
        suggestedValue: board[r][c]
      };
    }

    const cands = getCandidates(board, r, c, gridSize);
    const correctVal = solution[r][c];

    if (cands.length === 1) {
      return {
        technique: "Naked Single",
        explanation: `Row ${r + 1}, Column ${c + 1} has only one possible digit. Every other number is already present in its row, column, or box. The answer is ${cands[0]}.`,
        suggestedCell: [r, c],
        suggestedValue: cands[0]
      };
    }

    if (cands.length > 1) {
      const boxLabel = gridSize === 6 ? '2×3 box' : '3×3 box';
      return {
        technique: "Candidate Elimination",
        explanation: `Row ${r + 1}, Column ${c + 1} can hold: [${cands.join(', ')}]. Look at which numbers already appear in the same row, column, and ${boxLabel} to narrow it down further.`,
        suggestedCell: [r, c],
        suggestedValue: correctVal
      };
    }
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (board[r][c] === 0) {
        const cands = getCandidates(board, r, c, gridSize);
        if (cands.length === 1) {
          return {
            technique: "Naked Single",
            explanation: `Row ${r + 1}, Column ${c + 1} has only one valid digit: ${cands[0]}. All others are blocked by its row, column, or box.`,
            suggestedCell: [r, c],
            suggestedValue: cands[0]
          };
        }
      }
    }
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (board[r][c] === 0) {
        return {
          technique: "Suggested Cell",
          explanation: `Try Row ${r + 1}, Column ${c + 1}. Scan the intersecting row, column, and box to find which digits are already placed there.`,
          suggestedCell: [r, c],
          suggestedValue: solution[r][c]
        };
      }
    }
  }

  return {
    technique: "Complete",
    explanation: "The puzzle is fully solved.",
    suggestedCell: null,
    suggestedValue: null
  };
}
