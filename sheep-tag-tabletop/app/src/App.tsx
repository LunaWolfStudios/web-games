import React, { useEffect } from 'react';
import GameBoard from './components/GameBoard';
import GameUI from './components/GameUI';
import { GameSetup } from './components/GameSetup';
import { useGameStore } from './game/store';
import { useAi } from './hooks/useAi';

export default function App() {
  const phase = useGameStore((state) => state.phase);
  useAi();

  if (phase === 'SETUP') {
    return <GameSetup />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans">
      <GameBoard />
      <GameUI />
    </div>
  );
}
