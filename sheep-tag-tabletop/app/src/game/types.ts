
export type PlayerRole = 'SHEEP' | 'WOLF';

export interface Hex {
  q: number;
  r: number;
  s: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Vertex {
  q: number;
  r: number;
  s: number;
  corner: number; // 0-5
}

export type UnitType = 'SHEEP' | 'WOLF' | 'SPIRIT';

export interface Unit {
  id: string;
  type: UnitType;
  ownerId: string; // Player ID
  position: Hex | Vertex; // Wolves on Hex, Sheep on Vertex
  hp: number;
  maxHp: number;
  status: 'ALIVE' | 'CAPTURED' | 'DEAD';
}

export type FarmType = 'STRAW' | 'STICK' | 'STONE' | 'AURA' | 'TRANSLOCATE' | 'MONEY';

export interface Farm {
  id: string;
  type: FarmType;
  position: Hex;
  hp: number;
  maxHp: number;
  ownerId: string;
}

export interface Player {
  id: string;
  role: PlayerRole;
  name: string;
  color: string;
  resources: {
    straw: number;
    stick: number;
    stone: number;
    gold: number;
  };
  stats: {
    farmsBuilt: number;
    sheepCaptured: number;
    // Wolf Stats
    damage: number;
    moveSpeed: number;
    attackSpeed: number;
  };
  isAi: boolean;
}

export type GamePhase = 'SETUP' | 'START' | 'MOVEMENT' | 'ACTION' | 'END';

export type ResourceType = 'STRAW' | 'STICK' | 'STONE' | 'GOLD';

export interface ResourceNode {
  position: Hex;
  type: ResourceType;
  amount: number;
}

export interface MoveRecord {
  turn: number;
  round: number;
  playerId: string;
  description: string;
  timestamp: number;
}

export interface GameState {
  turn: number;
  round: number;
  activePlayerId: string;
  phase: GamePhase;
  players: Player[];
  units: Unit[];
  farms: Farm[];
  resourceNodes: ResourceNode[];
  boardRadius: number;
  winner: PlayerRole | null;
  history: MoveRecord[];
  snapshots: string[];
  diceRoll: number | null;
  movesLeft: number;
  actionsLeft: number;
}
