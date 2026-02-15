
export type Player = 'X' | 'O' | 'Z' | 'A' | 'M' | 'S' | 'T' | 'K';

export enum PieceType {
  EMPTY = 'EMPTY',
  X = 'X',
  O = 'O',
  Z = 'Z',
  A = 'A',
  M = 'M',
  S = 'S',
  T = 'T',
  K = 'K',
  TRIANGLE = 'TRIANGLE', // Permanent blocker
  RECTANGLE = 'RECTANGLE', // Destructible blocker
}

export interface CellData {
  type: PieceType;
  id: string; // Unique ID for React keys
  health: number; // For Rectangles (starts at 100, can be damaged)
  isDotProtected: boolean; // "Dot" logic: prevents neutral blocks
  highlight?: boolean; // For winning line
  flashError?: boolean; // Visual feedback for invalid moves
}

export type Grid = CellData[][];

export enum ActionType {
  PLACE_TOKEN = 'PLACE_TOKEN',
  PLACE_TRIANGLE = 'PLACE_TRIANGLE',
  PLACE_RECTANGLE = 'PLACE_RECTANGLE',
  PLACE_DOT = 'PLACE_DOT',
  DRAW_LINE = 'DRAW_LINE',
  DESTROY = 'DESTROY'
}

export interface ActionConfig {
  id: string;
  label: string;
  description: string;
  cost: Partial<Record<ActionType, number>>; // How many of each sub-action
  combo?: boolean;
}

export interface HistoryEntry {
  turn: number;
  player: Player;
  description: string;
}

export interface GameState {
  grid: Grid;
  currentPlayer: Player;
  turnCount: number;
  winner: Player | 'DRAW' | null;
  remainingActions: Partial<Record<ActionType, number>>; // Actions left in current turn
  selectedAction: ActionType | null; // Currently active tool
  history: HistoryEntry[]; // Log
  isTutorialActive: boolean;
  tutorialStep: number;
  hasActedInTurn: boolean; // Tracks if user has committed to a move
  sessionWins: Record<Player, number>;
}

export interface Coordinates {
  r: number; // Row
  c: number; // Col
}

// Snapshot for Undo functionality
export interface GameStateSnapshot {
    grid: Grid;
    currentPlayer: Player;
    turnCount: number;
    winner: Player | null;
    winningCells: Coordinates[];
    remainingActions: Partial<Record<ActionType, number>>;
    currentConfigId: string | null;
    currentActionType: ActionType | null;
    hasActedInTurn: boolean;
    history: HistoryEntry[];
    sessionWins: Record<Player, number>;
}
