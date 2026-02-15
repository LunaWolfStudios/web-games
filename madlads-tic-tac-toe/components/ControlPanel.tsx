import React from 'react';
import { MOVES } from '../constants';
import { ActionConfig, ActionType, Player } from '../types';
import { Shield, Expand, MousePointer2, Hammer, Dot, Zap, SkipForward } from 'lucide-react';

interface ControlPanelProps {
  currentPlayer: Player;
  onSelectAction: (config: ActionConfig) => void;
  onSetActionType: (type: ActionType) => void;
  onEndTurn: () => void;
  remainingActions: Partial<Record<ActionType, number>>;
  currentTurnConfigId: string | null;
  currentActionType: ActionType | null;
  turnCount: number;
  hasActed: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  currentPlayer, 
  onSelectAction, 
  onSetActionType,
  onEndTurn,
  remainingActions,
  currentTurnConfigId,
  currentActionType,
  turnCount,
  hasActed
}) => {
  const isActionActive = (configId: string) => currentTurnConfigId === configId;
  const isMidTurn = currentTurnConfigId !== null;

  const getPlayerColor = (p: Player) => {
      switch(p) {
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

  const getIcon = (id: string) => {
    switch (id) {
      case 'basic-token': return <MousePointer2 size={20} />;
      case 'block-triangle': return <Shield size={20} />;
      case 'block-rect': return <Shield size={20} className="fill-current" />;
      case 'place-dots': return <Dot size={20} strokeWidth={4} />;
      case 'expand': return <Expand size={20} />;
      case 'destroy': return <Hammer size={20} />;
      default: return <Zap size={20} />; // Combos
    }
  };

  const getSubToolIcon = (type: ActionType) => {
    switch (type) {
        case ActionType.PLACE_TOKEN: return <MousePointer2 size={16} />;
        case ActionType.PLACE_TRIANGLE: return <Shield size={16} />;
        case ActionType.PLACE_RECTANGLE: return <Shield size={16} className="fill-current" />;
        case ActionType.PLACE_DOT: return <Dot size={16} strokeWidth={4} />;
        case ActionType.DRAW_LINE: return <Expand size={16} />;
        case ActionType.DESTROY: return <Hammer size={16} />;
        default: return <Zap size={16} />;
    }
  };

  const getSubToolLabel = (type: ActionType) => {
    switch (type) {
        case ActionType.PLACE_TOKEN: return "Token";
        case ActionType.PLACE_TRIANGLE: return "Tri";
        case ActionType.PLACE_RECTANGLE: return "Rect";
        case ActionType.PLACE_DOT: return "Dot";
        case ActionType.DRAW_LINE: return "Line";
        case ActionType.DESTROY: return "Crush";
        default: return "Act";
    }
  };

  const availableSubActions = Object.entries(remainingActions)
    .filter(([_, count]) => (count as number) > 0)
    .map(([type]) => type as ActionType);

  return (
    <div className="relative w-full bg-black/95 border-t border-neon-blue/30 p-2 pb-4 md:p-4 backdrop-blur-md z-50 transition-all duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="max-w-6xl mx-auto flex flex-col gap-2 md:gap-3">
        
        {/* Status Bar / Sub Tools */}
        <div className="flex justify-between items-center min-h-[36px]">
            {isMidTurn ? (
                <div className="flex items-center gap-2 md:gap-4 w-full justify-between animate-in fade-in slide-in-from-bottom-2 duration-300">
                     {/* Horizontal list of remaining actions. Wraps ONLY on large screens (XL), scrolls on others to save height. */}
                     <div 
                        className="flex items-center gap-2 overflow-x-auto xl:overflow-visible xl:flex-wrap w-full custom-scrollbar"
                     >
                        <span className="text-gray-400 text-xs md:text-sm font-mono whitespace-nowrap hidden sm:inline">REMAINING:</span>
                        {availableSubActions.map((type) => (
                            <button
                                key={type}
                                onClick={() => onSetActionType(type)}
                                className={`
                                    flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 rounded border text-xs md:text-sm font-bold
                                    transition-all duration-200 whitespace-nowrap shrink-0
                                    ${currentActionType === type 
                                        ? 'bg-neon-blue text-black border-neon-blue scale-105 shadow-[0_0_10px_rgba(0,243,255,0.5)]' 
                                        : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-400'
                                    }
                                `}
                            >
                                {getSubToolIcon(type)}
                                {getSubToolLabel(type)}: {remainingActions[type]}
                            </button>
                        ))}
                        {availableSubActions.length === 0 && <span className="text-gray-500 italic text-xs">No actions remaining</span>}
                     </div>
                     
                     <button 
                        onClick={onEndTurn}
                        className="flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-700 rounded text-xs md:text-sm font-bold transition-colors whitespace-nowrap shrink-0"
                     >
                        <SkipForward size={14} className="md:w-4 md:h-4" /> END
                     </button>
                </div>
            ) : (
                <div className="flex justify-between w-full items-center">
                    <div className={`text-lg md:text-xl font-bold font-mono ${getPlayerColor(currentPlayer)}`}>
                        PLAYER {currentPlayer}
                    </div>
                    <button 
                        onClick={onEndTurn}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600 rounded text-xs font-bold transition-colors"
                     >
                        <SkipForward size={14} /> PASS
                     </button>
                </div>
            )}
        </div>

        {/* Main Actions List 
            Default: Single Scrollable Row (flex)
            Large Screens (XL+): Grid to see all at once
        */}
        <div 
            className={`
                flex gap-2 overflow-x-auto pb-2 pt-1 w-full
                xl:grid xl:grid-cols-10 xl:overflow-visible xl:pb-0
                transition-opacity duration-300
                ${hasActed ? 'opacity-40 pointer-events-none' : 'opacity-100'}
            `}
        >
            {MOVES.map((move) => {
                const isActive = isActionActive(move.id);
                const isCombo = move.combo;

                return (
                    <button
                        key={move.id}
                        onClick={() => onSelectAction(move)}
                        className={`
                            relative flex flex-col items-center justify-center p-2 rounded-md border 
                            transition-all duration-200 
                            min-w-[70px] h-[70px] md:min-w-[80px] md:h-[80px] shrink-0
                            ${isActive 
                                ? 'bg-neon-blue/20 border-neon-blue text-white shadow-[0_0_15px_rgba(0,243,255,0.4)] scale-105' 
                                : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                            }
                            ${isCombo ? 'border-neon-pink/50' : ''}
                        `}
                    >
                        {getIcon(move.id)}
                        <span className="text-[9px] md:text-[10px] text-center mt-1 leading-tight w-full break-words">{move.label}</span>
                    </button>
                );
            })}
        </div>
        
        {/* Turn hint */}
        {turnCount === 1 && currentPlayer === 'X' && !isMidTurn && (
            <div className="text-center text-[10px] md:text-xs text-gray-400">
                P1 cannot start Center (1,1).
            </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;