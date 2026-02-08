import React, { useState, useEffect } from 'react';
import { ArrowLeft, Leaf, Rabbit, Skull, Coins, Star } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface EcosystemBuilderProps {
  onExit: () => void;
}

const EcosystemBuilder: React.FC<EcosystemBuilderProps> = ({ onExit }) => {
  const { processGameResult } = useGame();
  
  const [plants, setPlants] = useState(20);
  const [rabbits, setRabbits] = useState(5);
  const [foxes, setFoxes] = useState(1);
  const [day, setDay] = useState(1);
  const [credits, setCredits] = useState(100);
  const [message, setMessage] = useState('Build a stable ecosystem.');
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<'WIN'|'LOSE'|null>(null);

  const TARGET_DAYS = 20;

  const advanceDay = () => {
    // Logic
    let newPlants = plants * 1.5;
    let newRabbits = rabbits;
    let newFoxes = foxes;

    // Eating
    const eatenPlants = rabbits * 2;
    newPlants -= eatenPlants;
    if (newPlants < 0) {
        newRabbits -= Math.floor(Math.abs(newPlants)); // Starvation
        newPlants = 0;
    }

    if (plants > rabbits * 3) newRabbits *= 1.3; // Abundance
    
    const eatenRabbits = foxes * 1;
    newRabbits -= eatenRabbits;
    if (newRabbits < 0) {
        newFoxes -= 1; // Starvation
        newRabbits = 0;
    }

    if (rabbits > foxes * 4) newFoxes *= 1.1;

    setPlants(Math.floor(newPlants));
    setRabbits(Math.floor(newRabbits));
    setFoxes(Math.floor(newFoxes));
    
    // Daily income
    const income = 50 + (newRabbits * 2) + (newFoxes * 5);
    setCredits(c => c + income);

    setDay(d => d + 1);
    
    // Win/Lose Check
    if (newRabbits <= 0 && newFoxes <= 0 && newPlants <= 0) {
        setIsGameOver(true);
        setGameResult('LOSE');
        setMessage('Your ecosystem collapsed!');
    } else if (day >= TARGET_DAYS) {
        setIsGameOver(true);
        setGameResult('WIN');
        setMessage('Ecosystem Stabilized!');
    } else {
        setMessage(`Day ${day + 1} started. Income: +${income}`);
    }
  };

  const buy = (type: 'PLANT'|'RABBIT'|'FOX') => {
      if (type === 'PLANT' && credits >= 10) {
          setCredits(c => c - 10);
          setPlants(p => p + 10);
      } else if (type === 'RABBIT' && credits >= 30) {
          setCredits(c => c - 30);
          setRabbits(r => r + 2);
      } else if (type === 'FOX' && credits >= 50) {
          setCredits(c => c - 50);
          setFoxes(f => f + 1);
      }
  };

  useEffect(() => {
      if (isGameOver) {
          const score = day * 100 + (plants + rabbits * 10 + foxes * 20);
          const stars = score >= 3000 ? 3 : score >= 1500 ? 2 : score >= 500 ? 1 : 0;
          processGameResult({
            gameId: 'ecosystem-builder',
            score,
            stars,
            xpEarned: Math.floor(score / 10)
          });
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver]);

  return (
    <div className="fixed inset-0 z-20 bg-slate-900 flex flex-col">
       <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30">
        <button onClick={onExit} className="bg-slate-800 p-2 rounded-full border border-slate-600 text-white">
          <ArrowLeft />
        </button>
        <div className="text-xl font-bold text-green-400">ECOSYSTEM</div>
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-1 rounded-full border border-yellow-500/30">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="font-mono font-bold text-yellow-400">{credits}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-md border border-slate-700">
              <div className="text-center mb-6">
                  <div className="flex justify-between items-end mb-2">
                      <div className="text-4xl font-bold text-white">Day {day}</div>
                      <div className="text-slate-400 text-sm">Goal: Day {TARGET_DAYS}</div>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(day/TARGET_DAYS)*100}%` }}></div>
                  </div>
                  <div className="text-green-400 text-sm mt-2 min-h-[20px]">{message}</div>
              </div>

              <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-green-900">
                      <div className="flex items-center gap-3">
                          <Leaf className="text-green-500" />
                          <div className="flex flex-col">
                            <span className="font-bold">Plants</span>
                            <span className="text-[10px] text-slate-400">Food for Rabbits</span>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className="text-2xl font-mono">{plants}</span>
                          <button onClick={() => buy('PLANT')} disabled={credits < 10} className="px-3 py-1 bg-green-900 text-green-200 text-xs rounded hover:bg-green-800 disabled:opacity-30 border border-green-700">
                              +10 ($10)
                          </button>
                      </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-700">
                      <div className="flex items-center gap-3">
                          <Rabbit className="text-white" />
                          <div className="flex flex-col">
                            <span className="font-bold">Rabbits</span>
                            <span className="text-[10px] text-slate-400">Eat plants, food for Foxes</span>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className="text-2xl font-mono">{rabbits}</span>
                          <button onClick={() => buy('RABBIT')} disabled={credits < 30} className="px-3 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-600 disabled:opacity-30 border border-slate-500">
                              +2 ($30)
                          </button>
                      </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-red-900">
                      <div className="flex items-center gap-3">
                          <Skull className="text-red-500" />
                          <div className="flex flex-col">
                            <span className="font-bold">Foxes</span>
                            <span className="text-[10px] text-slate-400">Eat Rabbits</span>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className="text-2xl font-mono">{foxes}</span>
                          <button onClick={() => buy('FOX')} disabled={credits < 50} className="px-3 py-1 bg-red-900 text-red-200 text-xs rounded hover:bg-red-800 disabled:opacity-30 border border-red-700">
                              +1 ($50)
                          </button>
                      </div>
                  </div>
              </div>

              <button onClick={advanceDay} className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition-all text-xl">
                  NEXT DAY
              </button>
          </div>
      </div>

      {isGameOver && (
        <div className="absolute inset-0 bg-slate-900/95 flex items-center justify-center p-4 z-50">
           <div className={`bg-slate-800 p-8 rounded-3xl border-2 ${gameResult === 'WIN' ? 'border-green-500' : 'border-red-500'} max-w-sm w-full text-center`}>
               <h2 className="text-3xl font-bold text-white mb-2">{gameResult === 'WIN' ? 'SUCCESS!' : 'FAILURE'}</h2>
               <p className="text-slate-300 mb-6">{message}</p>
               <button onClick={onExit} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg">
                   Return to Map
               </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default EcosystemBuilder;