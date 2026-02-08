import React from 'react';

export type Screen = 
  | 'HOME' 
  | 'GAME_METEOR_MATH' 
  | 'GAME_FRACTION_FACTORY' 
  | 'GAME_CIRCUIT_HERO'
  | 'GAME_GRAVITY_LAB'
  | 'GAME_ECOSYSTEM_BUILDER'
  | 'GAME_MULTIPLICATION_RACER'
  | 'PROFILE';

export interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalStars: number;
  totalPoints: number;
  unlockedCosmetics: string[];
}

export interface GameSpecificProgress {
  stars: number;
  highScore: number;
  played: boolean;
}

export interface GameResult {
  gameId: string;
  score: number;
  stars: number; // 0-3
  xpEarned: number;
}

export interface PlanetData {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlockLevel: number;
  screenTarget: Screen;
  color: string;
}

export interface Meteor {
  id: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  value: number;
  equation: string;
  speed: number;
  type: 'ADD' | 'SUB' | 'MUL';
}
