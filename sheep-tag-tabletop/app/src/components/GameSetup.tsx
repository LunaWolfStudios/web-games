import React, { useState } from 'react';
import { useGameStore } from '../game/store';
import { PlayerRole } from '../game/types';
import { Users, Bot, Play } from 'lucide-react';

interface PlayerConfig {
  name: string;
  role: PlayerRole;
  isAi: boolean;
  color: string;
}

export const GameSetup: React.FC = () => {
  const initGame = useGameStore(state => state.initGame);
  const [sheepCount, setSheepCount] = useState(3);
  const [wolfCount, setWolfCount] = useState(1);
  
  const [players, setPlayers] = useState<PlayerConfig[]>([
    { name: 'Sheep 1', role: 'SHEEP', isAi: false, color: '#4ade80' },
    { name: 'Sheep 2', role: 'SHEEP', isAi: true, color: '#22c55e' },
    { name: 'Sheep 3', role: 'SHEEP', isAi: true, color: '#16a34a' },
    { name: 'Wolf 1', role: 'WOLF', isAi: true, color: '#f87171' },
  ]);

  const handleStart = () => {
    initGame({ players });
  };

  const updatePlayer = (index: number, field: keyof PlayerConfig, value: any) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const addPlayer = (role: PlayerRole) => {
      const count = players.filter(p => p.role === role).length + 1;
      setPlayers([...players, {
          name: `${role === 'SHEEP' ? 'Sheep' : 'Wolf'} ${count}`,
          role,
          isAi: true,
          color: role === 'SHEEP' ? '#4ade80' : '#f87171'
      }]);
  };

  const removePlayer = (index: number) => {
      if (players.length <= 2) return; // Min 2 players
      setPlayers(players.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-8">
      <div 
        className="bg-slate-800 p-8 rounded-2xl shadow-xl max-w-2xl w-full animate-slide-up"
      >
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Sheep Tag Tabletop
        </h1>

        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" /> Players
            </h2>
            
            <div className="grid gap-4">
              {players.map((player, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-slate-700/50 p-3 rounded-lg">
                  <div className={`w-2 h-12 rounded-full ${player.role === 'SHEEP' ? 'bg-green-500' : 'bg-red-500'}`} />
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => updatePlayer(idx, 'name', e.target.value)}
                      className="bg-slate-600 rounded px-3 py-1 text-sm"
                      placeholder="Name"
                    />
                    
                    <select
                      value={player.role}
                      onChange={(e) => updatePlayer(idx, 'role', e.target.value as PlayerRole)}
                      className="bg-slate-600 rounded px-3 py-1 text-sm"
                    >
                      <option value="SHEEP">Sheep</option>
                      <option value="WOLF">Wolf</option>
                    </select>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={player.isAi}
                        onChange={(e) => updatePlayer(idx, 'isAi', e.target.checked)}
                        className="rounded bg-slate-600 border-slate-500"
                      />
                      <span className="text-sm flex items-center gap-1">
                        <Bot className="w-4 h-4" /> AI Controlled
                      </span>
                    </label>
                  </div>

                  <button 
                    onClick={() => removePlayer(idx)}
                    className="text-slate-400 hover:text-red-400"
                    disabled={players.length <= 2}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-4">
                <button onClick={() => addPlayer('SHEEP')} className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 text-sm">
                    + Add Sheep
                </button>
                <button onClick={() => addPlayer('WOLF')} className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 text-sm">
                    + Add Wolf
                </button>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-8"
          >
            <Play className="w-5 h-5" /> Start Game
          </button>
        </div>
      </div>
    </div>
  );
};
