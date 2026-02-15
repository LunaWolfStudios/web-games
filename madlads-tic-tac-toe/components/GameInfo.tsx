import React, { useRef, useEffect, useState } from 'react';
import { HistoryEntry, Player } from '../types';
import { ScrollText, Hash, ChevronDown, ChevronUp } from 'lucide-react';

interface GameInfoProps {
  turnCount: number;
  sessionWins: Record<Player, number>;
  history: HistoryEntry[];
  currentPlayer: Player;
}

const GameInfo: React.FC<GameInfoProps> = ({ turnCount, sessionWins, history, currentPlayer }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false);

  // Auto-scroll history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isHistoryCollapsed]);

  const getPlayerColor = (p: Player) => {
    switch (p) {
      case 'X': return 'text-neon-blue';
      case 'O': return 'text-neon-pink';
      case 'Z': return 'text-neon-orange';
      case 'A': return 'text-neon-purple';
      case 'M': return 'text-neon-m';
      case 'S': return 'text-neon-s';
      case 'T': return 'text-neon-t';
      case 'K': return 'text-neon-k';
      default: return 'text-white';
    }
  };

  return (
    <div className="fixed top-16 right-4 z-30 flex flex-col gap-2 w-64 pointer-events-none md:pointer-events-auto opacity-90 hover:opacity-100 transition-opacity">
      
      {/* Stats Card */}
      <div className="bg-black/80 backdrop-blur-md border border-neon-blue/30 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden transition-all duration-300">
         <button 
            onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
            className="flex items-center justify-between p-3 bg-gray-900/50 hover:bg-gray-800 text-gray-300 w-full border-b border-gray-800"
         >
            <div className="flex items-center gap-2 text-neon-yellow">
                <Hash size={14} /> 
                <span className="font-mono font-bold text-xs">
                    TURN {turnCount} - <span className={getPlayerColor(currentPlayer)}>PLAYER {currentPlayer}</span>
                </span>
            </div>
            {isStatsCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
         </button>
         
         {!isStatsCollapsed && (
            <div className="p-3">
                <div className="grid grid-cols-4 gap-x-2 gap-y-1 text-sm">
                    <div className="flex items-center gap-1"><span className="text-neon-blue font-bold">X:</span>{sessionWins.X}</div>
                    <div className="flex items-center gap-1"><span className="text-neon-pink font-bold">O:</span>{sessionWins.O}</div>
                    <div className="flex items-center gap-1"><span className="text-neon-orange font-bold">Z:</span>{sessionWins.Z}</div>
                    <div className="flex items-center gap-1"><span className="text-neon-purple font-bold">A:</span>{sessionWins.A}</div>
                    
                    <div className="flex items-center gap-1"><span className="text-neon-m font-bold">M:</span>{sessionWins.M}</div>
                    <div className="flex items-center gap-1"><span className="text-neon-s font-bold">S:</span>{sessionWins.S}</div>
                    <div className="flex items-center gap-1"><span className="text-neon-t font-bold">T:</span>{sessionWins.T}</div>
                    <div className="flex items-center gap-1"><span className="text-neon-k font-bold">K:</span>{sessionWins.K}</div>
                </div>
            </div>
         )}
      </div>

      {/* History Feed */}
      <div className="bg-black/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto overflow-hidden transition-all duration-300">
         <button 
            onClick={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
            className="flex items-center justify-between p-3 bg-gray-900/50 hover:bg-gray-800 text-gray-400 uppercase tracking-wider font-bold text-xs w-full"
         >
            <div className="flex items-center gap-2">
                <ScrollText size={12} /> Match Log
            </div>
            {isHistoryCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
         </button>
         
         {!isHistoryCollapsed && (
             <div ref={scrollRef} className="overflow-y-auto p-3 space-y-1 max-h-[30vh] custom-scrollbar border-t border-gray-800">
                {history.length === 0 && <div className="text-gray-600 italic text-xs">Game started...</div>}
                {history.map((entry, idx) => (
                    <div key={idx} className="flex gap-2 text-xs">
                        <span className="text-gray-500 font-mono w-4">{entry.turn}.</span>
                        <span className={`font-bold ${getPlayerColor(entry.player)}`}>
                            {entry.player}
                        </span>
                        <span className="text-gray-300 break-words flex-1 leading-tight">{entry.description}</span>
                    </div>
                ))}
             </div>
         )}
      </div>
    </div>
  );
};

export default GameInfo;