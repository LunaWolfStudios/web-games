export type ViewState = 'INTRO' | 'CHARACTER_SELECT' | 'CHAT' | 'MINIGAME' | 'AAR' | 'JOURNAL' | 'SUMMARY';

export enum GameType {
  BINARY_SORT_WORK = 'BINARY_SORT_WORK',
  BINARY_SORT_EMOTIONS = 'BINARY_SORT_EMOTIONS',
  BINARY_SORT_SOCIAL = 'BINARY_SORT_SOCIAL',
  DROP_SORT_HOME = 'DROP_SORT_HOME',
  MATCHING_MONEY = 'MATCHING_MONEY',
  DROP_SORT_FOOD = 'DROP_SORT_FOOD',
  DROP_SORT_TIME = 'DROP_SORT_TIME',
}

export type BackgroundType = 'HOME' | 'BANK' | 'KITCHEN' | 'PARK' | 'OFFICE' | 'BEDROOM' | 'CITY';

export interface Mentor {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  category: 'MONEY' | 'HOME' | 'HEALTH' | 'WORK' | 'SOCIAL' | 'SELF';
}

export interface PlayerStats {
  score: number;
  stars: number; // 0-3
  insights: string[]; // IDs of unlocked insights
}

export interface DialogueOption {
  text: string;
  nextId: string;
  triggerGame?: GameType;
  sentiment?: 'positive' | 'neutral' | 'curious';
}

export interface DialogueNode {
  id: string;
  text: string;
  speaker: 'MENTOR' | 'PLAYER';
  background: BackgroundType;
  options: DialogueOption[];
  unlockInsightId?: string; // If reaching this node unlocks an insight
}

// --- Generic Game Item ---
export interface GameItem {
  id: string;
  text: string;
  icon?: string;
  explanation: string; // Used for AAR
}

// --- Drop Sort (Falling Items) ---
export interface DropSortItem extends GameItem {
  category: string; // The correct bucket ID
}

export interface DropSortLevel {
  type: 'DROP_SORT';
  title: string;
  buckets: {
    id: string;
    label: string;
    color: string;
  }[];
  items: DropSortItem[];
  targetScore: number;
  insightRewardId: string;
  nextDialogueId: string;
}

// --- Binary Sort (Card Swipe) ---
export interface BinarySortItem extends GameItem {
  isTrue: boolean; // True = Right, False = Left
}

export interface BinarySortLevel {
  type: 'BINARY_SORT';
  title: string;
  leftLabel: string; // e.g. "No" or "Unprofessional"
  rightLabel: string; // e.g. "Yes" or "Professional"
  items: BinarySortItem[];
  insightRewardId: string;
  nextDialogueId: string;
}

// --- Matching (Stickers) ---
export interface MatchingPair extends GameItem {
  matchText: string; // The text it matches to
}

export interface MatchingLevel {
  type: 'MATCHING';
  title: string;
  pairs: MatchingPair[];
  insightRewardId: string;
  nextDialogueId: string;
}

export type GameLevel = DropSortLevel | BinarySortLevel | MatchingLevel;

// --- After Action Report ---
export interface GameResult {
  score: number;
  maxScore: number;
  correctItems: GameItem[];
  wrongItems: GameItem[];
  nextDialogueId: string;
  insightRewardId?: string;
}
