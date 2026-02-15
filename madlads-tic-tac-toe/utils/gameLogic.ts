import { Grid, PieceType, Player, Coordinates, CellData, ActionType } from '../types';
import { createEmptyCell, MAX_HEALTH } from '../constants';

// --- Board Manipulation ---

export const expandGrid = (grid: Grid, index: number, isRow: boolean): Grid => {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell }))); // Deep copy

  if (isRow) {
    // Add a new row at index
    const cols = newGrid[0].length;
    const newRow = Array(cols).fill(null).map(() => createEmptyCell());
    newGrid.splice(index, 0, newRow);
  } else {
    // Add a new column at index for every row
    newGrid.forEach(row => {
      row.splice(index, 0, createEmptyCell());
    });
  }

  return newGrid;
};

// --- Win Detection ---

const DIRECTIONS = [
  [0, 1],   // Horizontal
  [1, 0],   // Vertical
  [1, 1],   // Diagonal Down-Right
  [1, -1]   // Diagonal Down-Left
];

export const checkWin = (grid: Grid): { winner: Player | null, winningCells: Coordinates[] } => {
  const rows = grid.length;
  if (rows === 0) return { winner: null, winningCells: [] };
  const cols = grid[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      
      // Check if the piece is a Player Piece
      if (
          cell.type === PieceType.X || 
          cell.type === PieceType.O || 
          cell.type === PieceType.Z || 
          cell.type === PieceType.A ||
          cell.type === PieceType.M ||
          cell.type === PieceType.S ||
          cell.type === PieceType.T ||
          cell.type === PieceType.K
      ) {
        const player = cell.type as Player;

        for (const [dr, dc] of DIRECTIONS) {
          // Check for 3 in a row
          const p1 = { r, c };
          const p2 = { r: r + dr, c: c + dc };
          const p3 = { r: r + 2 * dr, c: c + 2 * dc };

          if (isValid(p2, rows, cols) && isValid(p3, rows, cols)) {
            const cell2 = grid[p2.r][p2.c];
            const cell3 = grid[p3.r][p3.c];

            if (cell2.type === player && cell3.type === player) {
              return {
                winner: player,
                winningCells: [p1, p2, p3]
              };
            }
          }
        }
      }
    }
  }

  return { winner: null, winningCells: [] };
};

const isValid = (p: Coordinates, rows: number, cols: number): boolean => {
  return p.r >= 0 && p.r < rows && p.c >= 0 && p.c < cols;
};

// --- AI Logic (Advanced) ---

export const getAIMove = (grid: Grid, player: Player, availableMoves: typeof import('../constants').MOVES): { moveId: string, actions: { type: ActionType, target: any }[] } => {
  const rows = grid.length;
  const cols = grid[0].length;
  
  // AI targets whoever is NOT itself. For simplicity in multi-agent contexts, it treats anyone not-self as opponent.
  // But strictly for PvAI, AI is O, Player is X.
  const opponent = 'X'; 

  const emptyCells: Coordinates[] = [];
  for(let r=0; r<rows; r++){
      for(let c=0; c<cols; c++){
          if(grid[r][c].type === PieceType.EMPTY) emptyCells.push({r,c});
      }
  }

  // 0. Fallback: If board is completely full, we MUST expand.
  if (emptyCells.length === 0) {
      return {
          moveId: 'expand',
          actions: [{ type: ActionType.DRAW_LINE, target: { index: Math.floor(rows/2), isRow: true } }]
      };
  }

  // Helper: Check if placing a piece at (r,c) results in a win for 'who'
  const simulatesWin = (r: number, c: number, who: Player): boolean => {
      const cell = grid[r][c];
      if (cell.type !== PieceType.EMPTY) return false;
      const originalType = cell.type;
      
      // Map Player to PieceType
      let pType = PieceType.EMPTY;
      switch(who) {
        case 'X': pType = PieceType.X; break;
        case 'O': pType = PieceType.O; break;
        case 'Z': pType = PieceType.Z; break;
        case 'A': pType = PieceType.A; break;
        case 'M': pType = PieceType.M; break;
        case 'S': pType = PieceType.S; break;
        case 'T': pType = PieceType.T; break;
        case 'K': pType = PieceType.K; break;
      }

      cell.type = pType; // Direct mutation for check
      const result = checkWin(grid).winner === who;
      cell.type = originalType; // Revert
      return result;
  };

  // 1. PRIORITY: Immediate Win (Self)
  for (const {r, c} of emptyCells) {
      if (simulatesWin(r, c, player)) {
          return {
              moveId: 'basic-token',
              actions: [{ type: ActionType.PLACE_TOKEN, target: { r, c } }]
          };
      }
  }

  // 2. Identify Threats (Opponent wins next turn)
  const threats: Coordinates[] = [];
  for (const {r, c} of emptyCells) {
      if (simulatesWin(r, c, opponent)) {
          threats.push({r, c});
      }
  }

  // Helper: Heuristic Score for Offense/Strategy
  const getScore = (r: number, c: number) => {
      let score = Math.random() * 5; // Little noise to vary games
      
      // Center bias
      const centerR = rows / 2;
      const centerC = cols / 2;
      score -= (Math.abs(r - centerR) + Math.abs(c - centerC)); 

      for (const [dr, dc] of DIRECTIONS) {
          // Check Self (Offense Potential)
          let myCount = 0;
          let emptyCount = 0;
          
          const myPiece = player === 'X' ? PieceType.X : PieceType.O; // Simplified for PvAI

          if (isValid({r: r+dr, c: c+dc}, rows, cols)) {
              if (grid[r+dr][c+dc].type === myPiece) myCount++;
              else if (grid[r+dr][c+dc].type === PieceType.EMPTY) emptyCount++;
          }
          if (isValid({r: r-dr, c: c-dc}, rows, cols)) {
              if (grid[r-dr][c-dc].type === myPiece) myCount++;
              else if (grid[r-dr][c-dc].type === PieceType.EMPTY) emptyCount++;
          }
          
          if (myCount >= 1) score += 20; // Extend chain
          if (myCount === 1 && emptyCount === 1) score += 30; // Open-ended 2-in-a-row (Kill shot setup)

          // Check Opponent (Disruption Potential)
          // Just check X for now since AI is O
          let opCount = 0;
          if (isValid({r: r+dr, c: c+dc}, rows, cols) && grid[r+dr][c+dc].type === PieceType.X) opCount++;
          if (isValid({r: r-dr, c: c-dc}, rows, cols) && grid[r-dr][c-dc].type === PieceType.X) opCount++;
          
          if (opCount >= 1) score += 15; // Block potential chain
      }
      return score;
  };

  // 3. PRIORITY: Handle Threats (Defense)
  if (threats.length > 0) {
      // Sort all empty cells by heuristic value to find best "filler" spots
      const sortedEmpty = [...emptyCells].sort((a, b) => getScore(b.r, b.c) - getScore(a.r, a.c));

      // Strategy Selection based on number of threats
      const useRects = threats.length > 2; // Need 3 blocks
      const useTriangles = threats.length === 2 || (threats.length === 1 && Math.random() > 0.4); // Prefer Triangles for defense unless feeling aggressive
      
      if (useRects) {
          // Use Rectangles (3 blocks available)
          const actions = [];
          // Prioritize blocking known threats
          for(let i=0; i<3; i++) {
              let target = threats[i];
              if (!target) {
                   // If we blocked all threats, put remaining blocks on best heuristic spots
                   target = sortedEmpty.find(c => !actions.some(a => a.target.r === c.r && a.target.c === c.c))!;
              }
              if (target) actions.push({ type: ActionType.PLACE_RECTANGLE, target });
          }
          return { moveId: 'block-rect', actions };

      } else if (useTriangles) {
          // Use Triangles (2 blocks available)
          const actions = [];
          
          // 1st Triangle: Block primary threat
          actions.push({ type: ActionType.PLACE_TRIANGLE, target: threats[0] });
          
          // 2nd Triangle: Block secondary threat OR Best Strategic spot
          let secondTarget = threats[1];
          if (!secondTarget) {
              // Find best empty spot that isn't the first target
              secondTarget = sortedEmpty.find(c => !(c.r === threats[0].r && c.c === threats[0].c))!;
          }
          actions.push({ type: ActionType.PLACE_TRIANGLE, target: secondTarget });
          
          return { moveId: 'block-triangle', actions };

      } else {
          // Single threat, aggressive block with Token?
          // This blocks the win AND places our piece.
          return {
              moveId: 'basic-token',
              actions: [{ type: ActionType.PLACE_TOKEN, target: threats[0] }]
          };
      }
  }

  // 4. PRIORITY: Offense (No immediate threats)
  let bestSpot = emptyCells[0];
  let bestVal = -Infinity;
  for (const cell of emptyCells) {
      const val = getScore(cell.r, cell.c);
      if (val > bestVal) {
          bestVal = val;
          bestSpot = cell;
      }
  }

  // Occasional Expansion if board is stale or no good moves (score < 5), but rare (5%)
  if (bestVal < 5 && Math.random() < 0.05) {
       const isRow = Math.random() < 0.5;
       const index = Math.floor(Math.random() * (isRow ? rows : cols));
       return {
            moveId: 'expand',
            actions: [{ type: ActionType.DRAW_LINE, target: { index, isRow } }] 
       };
  }

  return {
      moveId: 'basic-token',
      actions: [{ type: ActionType.PLACE_TOKEN, target: bestSpot }]
  };
};