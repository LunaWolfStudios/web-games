import React, { useEffect, useState } from 'react';
import { useGameStore } from '../game/store';

export const TurnNotification: React.FC = () => {
  const { turn, round, activePlayerId, players, phase } = useGameStore();
  const [show, setShow] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  const activePlayer = players.find(p => p.id === activePlayerId);

  useEffect(() => {
    if (phase === 'START') {
      setShow(true);
      setIsFadingOut(false);
      
      const fadeTimer = setTimeout(() => {
          setIsFadingOut(true);
      }, 1500);

      const removeTimer = setTimeout(() => {
          setShow(false);
      }, 2000);

      return () => {
          clearTimeout(fadeTimer);
          clearTimeout(removeTimer);
      };
    } else {
        setShow(false);
    }
  }, [phase, activePlayerId]);

  if (!show) return null;

  return (
    <div 
        className={`absolute inset-0 flex items-center justify-center pointer-events-none z-50 transition-opacity duration-500 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <div
        className="bg-slate-900/90 border-2 border-blue-500 p-8 rounded-2xl shadow-2xl text-center backdrop-blur-sm animate-zoom-in"
      >
        <h2 className="text-4xl font-bold text-white mb-2">Round {round}</h2>
        <div className="text-2xl" style={{ color: activePlayer?.color }}>
          {activePlayer?.name}'s Turn
        </div>
        <div className="text-slate-400 mt-2 text-sm uppercase tracking-widest">
            {activePlayer?.role}
        </div>
      </div>
    </div>
  );
};
