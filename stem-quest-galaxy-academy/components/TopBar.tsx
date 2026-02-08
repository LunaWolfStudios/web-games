import React from 'react';
import { useGame } from '../context/GameContext';
import { Star, Trophy, User, Medal } from 'lucide-react';

const RANKS = [
  { maxLvl: 3, title: "Cadet" },
  { maxLvl: 6, title: "Junior Explorer" },
  { maxLvl: 9, title: "Space Explorer" },
  { maxLvl: 12, title: "Star Pilot" },
  { maxLvl: 15, title: "Cosmic Navigator" },
  { maxLvl: 18, title: "Astro Specialist" },
  { maxLvl: 21, title: "Galactic Officer" },
  { maxLvl: 24, title: "Space Commander" },
  { maxLvl: 27, title: "Star Captain" },
  { maxLvl: 30, title: "Galaxy Guardian" },
  { maxLvl: 33, title: "Cosmic Champion" },
  { maxLvl: 36, title: "Stellar Legend" },
  { maxLvl: 40, title: "Astral Master" },
  { maxLvl: 45, title: "Universal Hero" },
  { maxLvl: 999, title: "Supreme Star Scholar" },
];

const TopBar: React.FC = () => {
  const { userStats } = useGame();

  // Calculate percentage for XP bar
  const prevThreshold = userStats.level === 1 ? 0 : 500; // Simplified logic for demo
  const currentThreshold = userStats.xpToNextLevel;
  const progress = Math.min(100, Math.max(0, ((userStats.xp - prevThreshold) / (currentThreshold - prevThreshold)) * 100));

  const currentRank = RANKS.find(r => userStats.level <= r.maxLvl) || RANKS[RANKS.length - 1];

  return (
    <div className="fixed top-0 left-0 w-full h-24 z-50 px-4 md:px-8 flex items-center justify-between bg-slate-900/80 backdrop-blur-md border-b border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
      
      {/* Left: User Avatar & Level */}
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center border-2 border-white shadow-lg shadow-cyan-500/50">
           <User className="text-white w-8 h-8" />
           <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-xs font-bold text-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
             {userStats.level}
           </div>
        </div>
        
        <div className="flex flex-col w-40 md:w-56">
          <div className="flex flex-col mb-1">
            <span className="text-sm font-display font-bold text-yellow-400 uppercase tracking-wide flex items-center gap-1">
               <Medal className="w-3 h-3" /> {currentRank.title}
            </span>
            <span className="text-xs text-cyan-300/80">{userStats.xp} XP</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
             <div className="absolute inset-0 bg-slate-800 w-full h-full"></div>
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500 ease-out relative z-10"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right: Stats */}
      <div className="flex items-center gap-4 md:gap-8">
        <div className="flex flex-col items-end">
             <div className="flex items-center gap-2 text-yellow-400">
                <Star className="w-6 h-6 fill-yellow-400 animate-pulse drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                <span className="font-display font-bold text-2xl">{userStats.totalStars}</span>
             </div>
             <div className="text-[10px] text-slate-400 uppercase tracking-widest mr-1">Stars</div>
        </div>
        
        <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center gap-2 text-purple-400">
                <Trophy className="w-5 h-5" />
                <span className="font-display font-bold text-xl">{userStats.totalPoints}</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest mr-1">Score</div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
