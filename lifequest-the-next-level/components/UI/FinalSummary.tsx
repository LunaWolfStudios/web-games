import React, { useEffect, useState } from 'react';
import { PlayerStats } from '../../types';
import { Button } from './Button';
import { Star, Trophy, RefreshCw, Book } from 'lucide-react';

interface FinalSummaryProps {
  stats: PlayerStats;
  onPlayAgain: () => void;
  onOpenJournal: () => void;
}

export const FinalSummary: React.FC<FinalSummaryProps> = ({ stats, onPlayAgain, onOpenJournal }) => {
  const [displayedStars, setDisplayedStars] = useState(0);

  // Animate stars filling up one by one
  useEffect(() => {
    setDisplayedStars(0);
    let current = 0;
    const timer = setInterval(() => {
      if (current < stats.stars) {
        current++;
        setDisplayedStars(current);
      } else {
        clearInterval(timer);
      }
    }, 600);
    return () => clearInterval(timer);
  }, [stats.stars]);

  const getRank = () => {
    if (stats.stars === 3) return "Ultimate Life Hero";
    if (stats.stars === 2) return "Independent Explorer";
    return "Beginner Adult";
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden animate-slide-up">
      
      {/* Background FX */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-white/10 animate-float"><Star size={120} /></div>
        <div className="absolute bottom-20 right-10 text-white/10 animate-float" style={{ animationDelay: '1s' }}><Trophy size={140} /></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,_rgba(255,255,255,0.2)_0%,_transparent_70%)] animate-pulse"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 text-center overflow-y-auto">
        
        <div className="mb-4">
          <div className="inline-block p-4 bg-white/20 backdrop-blur-md rounded-full mb-6 shadow-xl animate-pop">
            <Trophy size={64} className="text-yellow-300 drop-shadow-lg" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-2 text-white drop-shadow-md">Quest Complete!</h1>
          <p className="text-indigo-200 text-lg">You are ready for the next level.</p>
        </div>

        {/* Stars Container */}
        <div className="flex gap-4 mb-8 bg-black/20 p-6 rounded-3xl backdrop-blur-sm shadow-inner">
          {[1, 2, 3].map((starIdx) => (
            <div key={starIdx} className="relative">
              {/* Base Star (Empty or Filled) */}
              <Star 
                size={64} 
                className={`transition-all duration-500 transform 
                  ${starIdx <= displayedStars 
                    ? 'fill-yellow-400 text-yellow-400 scale-110 rotate-12 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]' 
                    : 'text-gray-500/50'
                  }`} 
              />
              {/* Burst Effect (Only plays once when star appears) */}
              {starIdx === displayedStars && starIdx <= stats.stars && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="absolute inset-0 animate-ping rounded-full bg-yellow-400 opacity-75"></span>
                 </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-md border border-white/20 mb-8">
            <div className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-1">Total Score</div>
            <div className="text-6xl font-display font-bold text-white mb-4">{stats.score}</div>
            <div className="h-px bg-white/20 w-full mb-4"></div>
            <div className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-1">Rank Achieved</div>
            <div className="text-2xl font-bold text-yellow-300">{getRank()}</div>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm">
            <Button 
                onClick={onPlayAgain}
                className="bg-white text-indigo-600 hover:bg-indigo-50 border-transparent shadow-xl hover:scale-105 active:scale-95 w-full"
                size="lg"
            >
                <RefreshCw className="mr-2" /> Play Again
            </Button>
            <button 
                onClick={onOpenJournal}
                className="text-indigo-200 hover:text-white flex items-center justify-center gap-2 py-3 font-bold transition-colors"
            >
                <Book size={20} /> Review My Journal
            </button>
        </div>
      </div>
    </div>
  );
};
