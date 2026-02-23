import React, { useState } from 'react';
import { useGameStore } from '../game/store';
import { HexUtils } from '../game/hex';
import { Hex, Vertex, FarmType } from '../game/types';
import { clsx } from 'clsx';
import { TurnNotification } from './TurnNotification';
import { Undo2, History, LogOut, Trophy, Dices } from 'lucide-react';

const GameUI: React.FC = () => {
  const { 
    turn, 
    round, 
    phase, 
    activePlayerId, 
    players, 
    selectedUnitId, 
    units, 
    buildFarm, 
    endTurn,
    undo,
    history,
    initGame,
    selectedFarmType,
    setFarmType,
    exitGame,
    diceRoll,
    buyWolfUpgrade
  } = useGameStore();

  const [showHistory, setShowHistory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const activePlayer = players.find(p => p.id === activePlayerId);
  const selectedUnit = units.find(u => u.id === selectedUnitId);
  const isSheepTurn = activePlayer?.role === 'SHEEP';

  if (!activePlayer) return null;

  const farmTypes: { type: FarmType; label: string; cost: string; icon: string }[] = [
      { type: 'STRAW', label: 'Straw', cost: '1 Straw', icon: '🌾' },
      { type: 'STICK', label: 'Stick', cost: '1 Stick', icon: '🪵' },
      { type: 'STONE', label: 'Stone', cost: '1 Stone', icon: '🧱' },
      { type: 'AURA', label: 'Aura', cost: '5 Gold', icon: '🔮' },
      { type: 'TRANSLOCATE', label: 'Teleport', cost: '3 Gold', icon: '🌀' },
      { type: 'MONEY', label: 'Bank', cost: '2 Gold', icon: '🏦' },
  ];
  
  const wolfUpgrades = [
      { type: 'DAMAGE', label: 'Straw Claws', cost: '5 Straw', icon: '🗡️', desc: '+10 Dmg' },
      { type: 'MOVE', label: 'Speed', cost: '5 Stick', icon: '👢', desc: '+10 Move' },
      { type: 'ATTACK_SPEED', label: 'Frenzy', cost: '5 Stone', icon: '⚡', desc: '+10 AtkSpd' },
      { type: 'COMPANION', label: 'Companion', cost: '10 Gold', icon: '🐺', desc: 'New Wolf' },
  ];

  return (
    <>
    <TurnNotification />
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
      {/* Top Bar */}
      <div className="flex justify-between items-start pointer-events-auto w-full">
        <div className="flex gap-2">
            <div className="bg-slate-900/90 text-white p-4 rounded-xl border border-slate-700 shadow-lg backdrop-blur-md">
                <h1 className="text-xl font-bold text-amber-400 mb-1">Round {round}</h1>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="font-mono">Turn {turn}</span>
                    <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                    <span className={clsx(
                    "font-bold uppercase tracking-wider",
                    phase === 'MOVEMENT' ? "text-blue-400" : "text-emerald-400"
                    )}>
                    {phase} Phase
                    </span>
                </div>
            </div>
            
            {/* Dice Roll Display */}
            {diceRoll !== null && (
                <div className="bg-slate-900/90 text-white p-4 rounded-xl border border-slate-700 shadow-lg backdrop-blur-md flex flex-col items-center justify-center min-w-[80px]">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Rolled</div>
                    <div className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                        <Dices className="w-5 h-5" /> {diceRoll}
                    </div>
                </div>
            )}
            
            <div className="flex flex-col gap-2">
                {/* Undo Button */}
                <button 
                    onClick={undo}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl border border-slate-700 transition-colors"
                    title="Undo Last Move"
                >
                    <Undo2 className="w-5 h-5" />
                </button>

                {/* History Toggle */}
                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className={clsx(
                        "bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl border border-slate-700 transition-colors",
                        showHistory && "bg-slate-700 text-white"
                    )}
                    title="Move History"
                >
                    <History className="w-5 h-5" />
                </button>

                {/* Leaderboard Toggle */}
                <button 
                    onClick={() => setShowLeaderboard(!showLeaderboard)}
                    className={clsx(
                        "bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl border border-slate-700 transition-colors",
                        showLeaderboard && "bg-slate-700 text-white"
                    )}
                    title="Leaderboard"
                >
                    <Trophy className="w-5 h-5" />
                </button>
                
                {/* Exit Game */}
                <button 
                    onClick={() => {
                        if (confirm('Are you sure you want to exit to the main menu?')) {
                            exitGame();
                        }
                    }}
                    className="bg-red-900/50 hover:bg-red-900/80 text-red-200 p-3 rounded-xl border border-red-800 transition-colors"
                    title="Exit Game"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Player Info */}
        <div className="bg-slate-900/90 text-white p-4 rounded-xl border border-slate-700 shadow-lg backdrop-blur-md min-w-[240px]">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Active Player</div>
          <div className={clsx(
            "text-lg font-bold flex items-center gap-2",
            activePlayer.role === 'SHEEP' ? "text-green-400" : "text-red-400"
          )}>
            {activePlayer.role === 'SHEEP' ? '🐑' : '🐺'} {activePlayer.name}
          </div>
          
          {/* Resources Grid */}
          {(activePlayer.role === 'SHEEP' || activePlayer.role === 'WOLF') && (
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-800 rounded p-1 border border-slate-700">
                <div className="text-[10px] text-amber-200 uppercase">Straw</div>
                <div className="font-mono font-bold text-amber-100 flex items-center justify-center gap-1">
                    <span>🌾</span> {activePlayer.resources.straw}
                </div>
              </div>
              <div className="bg-slate-800 rounded p-1 border border-slate-700">
                <div className="text-[10px] text-amber-700 uppercase">Stick</div>
                <div className="font-mono font-bold text-amber-600 flex items-center justify-center gap-1">
                    <span>🪵</span> {activePlayer.resources.stick}
                </div>
              </div>
              <div className="bg-slate-800 rounded p-1 border border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase">Stone</div>
                <div className="font-mono font-bold text-slate-300 flex items-center justify-center gap-1">
                    <span>🧱</span> {activePlayer.resources.stone}
                </div>
              </div>
              <div className="bg-slate-800 rounded p-1 border border-slate-700">
                <div className="text-[10px] text-yellow-400 uppercase">Gold</div>
                <div className="font-mono font-bold text-yellow-300 flex items-center justify-center gap-1">
                    <span>💰</span> {activePlayer.resources.gold}
                </div>
              </div>
            </div>
          )}
          
          {/* Wolf Stats */}
          {activePlayer.role === 'WOLF' && (
              <div className="mt-2 text-xs text-slate-400 flex justify-between px-1">
                  <div>Dmg: <span className="text-red-400">{activePlayer.stats?.damage}</span></div>
                  <div>Spd: <span className="text-blue-400">{activePlayer.stats?.moveSpeed}</span></div>
                  <div>AtkSpd: <span className="text-yellow-400">{activePlayer.stats?.attackSpeed}</span></div>
              </div>
          )}
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
          <div className="absolute top-24 left-20 w-64 max-h-64 overflow-y-auto bg-slate-900/95 border border-slate-700 rounded-xl p-4 pointer-events-auto shadow-xl backdrop-blur-md z-20">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                  <History className="w-4 h-4" /> Move History
              </h3>
              <div className="space-y-2">
                  {history.map((record, i) => (
                      <div key={i} className="text-xs text-slate-300 border-b border-slate-800 pb-1 last:border-0">
                          <span className="text-slate-500 mr-2">T{record.turn}</span>
                          {record.description}
                      </div>
                  ))}
                  {history.length === 0 && <div className="text-xs text-slate-600 italic">No moves yet.</div>}
              </div>
          </div>
      )}

      {/* Leaderboard Panel */}
      {showLeaderboard && (
          <div className="absolute top-24 left-20 w-64 max-h-64 overflow-y-auto bg-slate-900/95 border border-slate-700 rounded-xl p-4 pointer-events-auto shadow-xl backdrop-blur-md z-20">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4" /> Leaderboard
              </h3>
              <div className="space-y-3">
                  {players.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-xs border-b border-slate-800 pb-2 last:border-0">
                          <div className="flex items-center gap-2">
                              <div className={clsx("w-2 h-2 rounded-full", p.role === 'SHEEP' ? "bg-green-500" : "bg-red-500")} />
                              <span className="font-bold text-slate-200">{p.name}</span>
                          </div>
                          <div className="text-right">
                              {p.role === 'SHEEP' ? (
                                  <div className="text-slate-400">
                                      <div>Farms: <span className="text-white">{p.stats?.farmsBuilt || 0}</span></div>
                                  </div>
                              ) : (
                                  <div className="text-slate-400">
                                      <div>Kills: <span className="text-red-400">{p.stats?.sheepCaptured || 0}</span></div>
                                  </div>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Bottom Bar */}
      <div className="flex justify-center items-end pointer-events-auto gap-4 w-full">
        {selectedUnit && (
          <div className="bg-slate-900/90 text-white p-4 rounded-xl border border-slate-700 shadow-lg backdrop-blur-md flex gap-4 items-center">
            <div className="flex items-center gap-3">
              <div className={clsx(
                "w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-slate-800 border-2",
                selectedUnit.type === 'SHEEP' ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
              )}>
                {selectedUnit.type === 'SHEEP' ? '🐑' : '🐺'}
              </div>
              <div>
                <div className="font-bold text-lg">{selectedUnit.type}</div>
                <div className="text-xs text-slate-400">HP: {selectedUnit.hp}/{selectedUnit.maxHp}</div>
              </div>
            </div>

            {/* Farm Building Actions */}
            {selectedUnit.type === 'SHEEP' && phase === 'ACTION' && activePlayerId === selectedUnit.ownerId && (
                <div className="flex gap-2 ml-4 border-l border-slate-700 pl-4">
                    {farmTypes.map(ft => (
                        <button
                            key={ft.type}
                            onClick={() => {
                                setFarmType(ft.type);
                            }}
                            className={clsx(
                                "flex flex-col items-center p-2 rounded hover:bg-slate-800 transition-colors min-w-[60px]",
                                selectedFarmType === ft.type ? "bg-slate-800 ring-1 ring-blue-500" : ""
                            )}
                            title={`Build ${ft.label} (${ft.cost})`}
                        >
                            <span className="text-xl mb-1">{ft.icon}</span>
                            <span className="text-[10px] font-bold">{ft.label}</span>
                            <span className="text-[9px] text-slate-400">{ft.cost}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Wolf Shop Actions */}
            {selectedUnit.type === 'WOLF' && phase === 'ACTION' && activePlayerId === selectedUnit.ownerId && (
                <div className="flex gap-2 ml-4 border-l border-slate-700 pl-4">
                    {wolfUpgrades.map(up => (
                        <button
                            key={up.type}
                            onClick={() => {
                                buyWolfUpgrade(up.type as any);
                            }}
                            className="flex flex-col items-center p-2 rounded hover:bg-slate-800 transition-colors min-w-[60px]"
                            title={`Buy ${up.label} (${up.cost})`}
                        >
                            <span className="text-xl mb-1">{up.icon}</span>
                            <span className="text-[10px] font-bold">{up.label}</span>
                            <span className="text-[9px] text-slate-400">{up.cost}</span>
                        </button>
                    ))}
                </div>
            )}
          </div>
        )}

        <div className="bg-slate-900/90 text-white p-4 rounded-xl border border-slate-700 shadow-lg backdrop-blur-md flex flex-col gap-2">
          <button 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-indigo-900/20"
            onClick={() => endTurn()}
          >
            End Turn
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default GameUI;
