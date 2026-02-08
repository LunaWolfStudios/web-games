import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserStats, GameResult, GameSpecificProgress } from '../types';

interface GameContextType {
  userStats: UserStats;
  gameProgress: Record<string, GameSpecificProgress>;
  processGameResult: (result: GameResult) => void;
  showLevelUp: boolean;
  dismissLevelUp: () => void;
  resetProgress: () => void;
}

// Faster progression for early levels
const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 1800, 3000, 5000, 8000];

const INITIAL_STATS: UserStats = {
  level: 1,
  xp: 0,
  xpToNextLevel: LEVEL_THRESHOLDS[1],
  totalStars: 0,
  totalPoints: 0,
  unlockedCosmetics: ['default_robot'],
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const STORAGE_KEY = 'stem-quest-v1';

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_STATS);
  const [gameProgress, setGameProgress] = useState<Record<string, GameSpecificProgress>>({});
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserStats(parsed.userStats || INITIAL_STATS);
        setGameProgress(parsed.gameProgress || {});
      } catch (e) {
        console.error("Failed to load save data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userStats, gameProgress }));
  }, [userStats, gameProgress, isLoaded]);

  const processGameResult = (result: GameResult) => {
    // Update per-game progress
    setGameProgress((prev) => {
      const current = prev[result.gameId] || { stars: 0, highScore: 0, played: false };
      return {
        ...prev,
        [result.gameId]: {
          stars: Math.max(current.stars, result.stars),
          highScore: Math.max(current.highScore, result.score),
          played: true,
        },
      };
    });

    // Update global stats
    setUserStats((prev) => {
      let newXp = prev.xp + result.xpEarned;
      let newLevel = prev.level;
      let leveledUp = false;

      // Check for level up
      while (newLevel < LEVEL_THRESHOLDS.length && newXp >= LEVEL_THRESHOLDS[newLevel]) {
        newLevel++;
        leveledUp = true;
      }

      // Calculate XP to next level
      let newXpToNext = 999999;
      if (newLevel < LEVEL_THRESHOLDS.length) {
         newXpToNext = LEVEL_THRESHOLDS[newLevel];
      }

      if (leveledUp) {
        setShowLevelUp(true);
      }

      // Calculate total stars dynamically from gameProgress + new result
      // Ideally we sum up all gameProgress stars, but here we just add difference if new star record
      // For simplicity in this demo, we accumulate generic stars
      const starsEarnedNow = result.stars; 

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: newXpToNext,
        totalStars: prev.totalStars + starsEarnedNow, 
        totalPoints: prev.totalPoints + result.score,
      };
    });
  };

  const dismissLevelUp = () => setShowLevelUp(false);

  const resetProgress = () => {
    setUserStats(INITIAL_STATS);
    setGameProgress({});
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  return (
    <GameContext.Provider value={{ userStats, gameProgress, processGameResult, showLevelUp, dismissLevelUp, resetProgress }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
