import React from 'react';
import { useGame } from '../context/GameContext';
import { Star, Rocket } from 'lucide-react';

const LevelUpModal: React.FC = () => {
  const { userStats, showLevelUp, dismissLevelUp } = useGame();

  if (!showLevelUp) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-slate-900 border-2 border-yellow-400 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(250,204,21,0.5)] transform animate-in zoom-in-95 duration-300">
        
        {/* Glow effect behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl -z-10"></div>

        <div className="mb-6 inline-block p-4 bg-yellow-400/10 rounded-full border border-yellow-400/50">
           <Rocket className="w-16 h-16 text-yellow-400" />
        </div>

        <h2 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 mb-2">
          LEVEL UP!
        </h2>
        
        <p className="text-cyan-100 text-lg mb-6">
          You reached <span className="text-yellow-400 font-bold">Level {userStats.level}</span>
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
             <div className="text-xs text-slate-400 uppercase">Unlocks</div>
             <div className="text-white font-bold">New Avatar</div>
           </div>
           <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
             <div className="text-xs text-slate-400 uppercase">Bonus</div>
             <div className="text-yellow-400 font-bold">+500 Points</div>
           </div>
        </div>

        <button 
          onClick={dismissLevelUp}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-bold text-white shadow-lg hover:shadow-cyan-500/50 transition-all hover:scale-105 active:scale-95"
        >
          AWESOME!
        </button>
      </div>
    </div>
  );
};

export default LevelUpModal;