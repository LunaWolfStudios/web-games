import { ActionConfig, ActionType, Grid, CellData, PieceType } from './types';

export const INITIAL_GRID_SIZE = 3;

// Visual scaling
export const CELL_SIZE = 60;
export const MAX_HEALTH = 2; // Rectangle HP. 2.5 rectangles = 5 HP damage deals.

export const createEmptyCell = (): CellData => ({
  type: PieceType.EMPTY,
  id: Math.random().toString(36).substr(2, 9),
  health: 0,
  isDotProtected: false,
});

export const INITIAL_GRID: Grid = Array(INITIAL_GRID_SIZE).fill(null).map(() => 
  Array(INITIAL_GRID_SIZE).fill(null).map(() => createEmptyCell())
);

// Define the available moves/combos
export const MOVES: ActionConfig[] = [
  {
    id: 'basic-token',
    label: 'Place Token',
    description: 'Place 1 Win Token (X or O).',
    cost: { [ActionType.PLACE_TOKEN]: 1 }
  },
  {
    id: 'block-triangle',
    label: '2 Triangles',
    description: 'Place 2 Permanent Blockers.',
    cost: { [ActionType.PLACE_TRIANGLE]: 2 }
  },
  {
    id: 'block-rect',
    label: '3 Rectangles',
    description: 'Place 3 Destructible Blockers.',
    cost: { [ActionType.PLACE_RECTANGLE]: 3 }
  },
  {
    id: 'place-dots',
    label: '4 Dots',
    description: 'Protect 4 cells from blockers.',
    cost: { [ActionType.PLACE_DOT]: 4 }
  },
  {
    id: 'expand',
    label: 'Expand Board',
    description: 'Draw 2 Lines to add rows or columns.',
    cost: { [ActionType.DRAW_LINE]: 2 }
  },
  {
    id: 'destroy',
    label: 'Crush',
    description: 'Deal 5 damage to Rectangles (Crush 2.5).',
    cost: { [ActionType.DESTROY]: 5 } // 1 damage per click, 2 HP per rect = 2.5 rects
  },
  // Combos
  {
    id: 'combo-tri-line',
    label: 'Combo: Tri + Line',
    description: '1 Triangle + 1 Line.',
    cost: { [ActionType.PLACE_TRIANGLE]: 1, [ActionType.DRAW_LINE]: 1 },
    combo: true
  },
  {
    id: 'combo-rect-line',
    label: 'Combo: Rect + Line',
    description: '2 Rectangles + 1 Line.',
    cost: { [ActionType.PLACE_RECTANGLE]: 2, [ActionType.DRAW_LINE]: 1 },
    combo: true
  },
  {
    id: 'combo-dot-line',
    label: 'Combo: Dot + Line',
    description: '2 Dots + 1 Line.',
    cost: { [ActionType.PLACE_DOT]: 2, [ActionType.DRAW_LINE]: 1 },
    combo: true
  },
  {
    id: 'combo-dest-dot',
    label: 'Combo: Crush + Dot',
    description: 'Crush 2 Rectangles + 1 Dot.',
    cost: { [ActionType.DESTROY]: 4, [ActionType.PLACE_DOT]: 1 },
    combo: true
  }
];