import React, { useState } from 'react';
import { Grid, CellData, PieceType, ActionType, Coordinates } from '../types';
import { MAX_HEALTH, CELL_SIZE } from '../constants';
import { Square, Triangle, Circle, X } from 'lucide-react';

interface BoardProps {
  grid: Grid;
  onCellClick: (r: number, c: number) => void;
  onLineClick: (index: number, isRow: boolean) => void;
  selectedAction: ActionType | null;
  winningCells: Coordinates[];
}

const Board: React.FC<BoardProps> = ({ 
  grid, 
  onCellClick, 
  onLineClick, 
  selectedAction,
  winningCells 
}) => {
  const [hoveredLine, setHoveredLine] = useState<{index: number, isRow: boolean} | null>(null);

  const rows = grid.length;
  const cols = grid[0].length;
  
  // Constants for layout math
  const GAP_SIZE = 4;
  const LABEL_SIZE = 30; // Width/Height of coordinate labels

  const isWinCell = (r: number, c: number) => {
    return winningCells.some(wc => wc.r === r && wc.c === c);
  };

  const renderCellContent = (cell: CellData) => {
    switch (cell.type) {
      case PieceType.X:
        return <X size={40} className="text-neon-blue drop-shadow-[0_0_8px_rgba(0,243,255,0.8)]" />;
      case PieceType.O:
        return <Circle size={36} className="text-neon-pink drop-shadow-[0_0_8px_rgba(255,0,255,0.8)]" />;
      case PieceType.Z:
        return (
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-neon-orange drop-shadow-[0_0_8px_rgba(255,85,0,0.8)]">
            <path d="M4 4h16l-16 16h16" />
          </svg>
        );
      case PieceType.A:
        return (
           <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-neon-purple drop-shadow-[0_0_8px_rgba(191,0,255,0.8)]">
            <path d="M3 21l9-18 9 18M5 13h14" />
          </svg>
        );
      case PieceType.M:
        return (
           <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-neon-m drop-shadow-[0_0_8px_rgba(41,98,255,0.8)]">
            <path d="M4 21V4l8 8 8-8v17" />
          </svg>
        );
      case PieceType.S:
        return (
           <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-neon-s drop-shadow-[0_0_8px_rgba(0,230,118,0.8)]">
             <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        );
      case PieceType.T:
        return (
           <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-neon-t drop-shadow-[0_0_8px_rgba(255,0,64,0.8)]">
            <path d="M4 6h16M12 6v14" />
          </svg>
        );
      case PieceType.K:
        return (
           <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-neon-k drop-shadow-[0_0_8px_rgba(226,232,240,0.8)]">
            <path d="M4 4v16M20 4l-12 8 12 8M4 12h4" />
          </svg>
        );
      case PieceType.TRIANGLE:
        return <Triangle size={36} className="text-neon-yellow fill-neon-yellow drop-shadow-[0_0_8px_rgba(252,238,10,0.5)]" />;
      case PieceType.RECTANGLE:
        const damage = 1 - (cell.health / MAX_HEALTH);
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <Square 
              size={36} 
              className={`text-neon-green fill-neon-green transition-opacity duration-300`}
              style={{ opacity: 0.5 + (cell.health / MAX_HEALTH) * 0.5 }}
            />
            {damage > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-8 h-[2px] bg-black rotate-45 opacity-60"></div>
                 {damage > 0.5 && <div className="w-8 h-[2px] bg-black -rotate-45 opacity-60"></div>}
              </div>
            )}
            <span className="absolute text-[10px] text-black font-bold">{cell.health}/{MAX_HEALTH}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative p-4 transition-all duration-500 ease-in-out inline-block">
      {/* Grid Container with Labels */}
      <div 
        className="grid gap-1 bg-neon-grid/30 p-1 rounded-lg border border-neon-blue/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        style={{
          gridTemplateColumns: `${LABEL_SIZE}px repeat(${cols}, ${CELL_SIZE}px)`,
          gridTemplateRows: `${LABEL_SIZE}px repeat(${rows}, ${CELL_SIZE}px)`,
        }}
      >
        {/* Top-Left Empty Corner */}
        <div className="flex items-center justify-center text-gray-600 font-mono text-xs">#</div>

        {/* Column Labels */}
        {Array.from({ length: cols }).map((_, i) => (
          <div key={`col-label-${i}`} className="flex items-center justify-center text-gray-500 font-mono font-bold text-sm">
            {i + 1}
          </div>
        ))}

        {grid.map((row, r) => (
          <React.Fragment key={`row-wrapper-${r}`}>
            {/* Row Label */}
            <div className="flex items-center justify-center text-gray-500 font-mono font-bold text-sm">
              {r + 1}
            </div>

            {/* Cells */}
            {row.map((cell, c) => {
              const isWinning = isWinCell(r, c);
              const isDotProtected = cell.isDotProtected;
              const isFlashing = cell.flashError;
              
              return (
                <div
                  key={cell.id}
                  onClick={() => onCellClick(r, c)}
                  className={`
                    relative border border-white/5 bg-black/40 
                    flex items-center justify-center cursor-pointer 
                    hover:bg-white/10 transition-colors duration-200
                    ${isWinning ? 'animate-pulse bg-neon-green/30 border-neon-green z-20 shadow-[0_0_20px_rgba(10,255,0,0.6)]' : ''}
                    ${isDotProtected ? 'bg-indigo-900/20' : ''}
                    ${isFlashing ? 'bg-red-500/50 animate-pulse border-red-500' : ''}
                  `}
                  style={{ width: CELL_SIZE, height: CELL_SIZE }}
                >
                  {/* Dot Indicator */}
                  {isDotProtected && (
                     <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                  )}
                  
                  {renderCellContent(cell)}

                  {/* Line Draw Triggers */}
                  {selectedAction === ActionType.DRAW_LINE && (
                    <>
                       {/* Right Edge Click Area */}
                       <div 
                          className="absolute right-[-6px] top-0 bottom-0 w-[12px] z-30 hover:bg-neon-blue/30 cursor-crosshair group flex flex-col justify-center items-center"
                          onMouseEnter={() => setHoveredLine({index: c + 1, isRow: false})}
                          onMouseLeave={() => setHoveredLine(null)}
                          onClick={(e) => { e.stopPropagation(); onLineClick(c + 1, false); }}
                       >
                          <div className="w-[2px] h-full bg-neon-blue/0 group-hover:bg-neon-blue/50 transition-colors"></div>
                       </div>
                       
                       {/* Bottom Edge Click Area */}
                       <div 
                          className="absolute bottom-[-6px] left-0 right-0 h-[12px] z-30 hover:bg-neon-blue/30 cursor-crosshair group flex justify-center items-center"
                          onMouseEnter={() => setHoveredLine({index: r + 1, isRow: true})}
                          onMouseLeave={() => setHoveredLine(null)}
                          onClick={(e) => { e.stopPropagation(); onLineClick(r + 1, true); }}
                       >
                          <div className="h-[2px] w-full bg-neon-blue/0 group-hover:bg-neon-blue/50 transition-colors"></div>
                       </div>
                       
                       {/* First Row Top Edge */}
                       {r === 0 && (
                         <div 
                            className="absolute top-[-6px] left-0 right-0 h-[12px] z-30 hover:bg-neon-blue/30 cursor-crosshair group flex justify-center items-center"
                            onMouseEnter={() => setHoveredLine({index: 0, isRow: true})}
                            onMouseLeave={() => setHoveredLine(null)}
                            onClick={(e) => { e.stopPropagation(); onLineClick(0, true); }}
                         >
                            <div className="h-[2px] w-full bg-neon-blue/0 group-hover:bg-neon-blue/50 transition-colors"></div>
                         </div>
                       )}

                       {/* First Col Left Edge */}
                       {c === 0 && (
                          <div 
                            className="absolute left-[-6px] top-0 bottom-0 w-[12px] z-30 hover:bg-neon-blue/30 cursor-crosshair group flex flex-col justify-center items-center"
                            onMouseEnter={() => setHoveredLine({index: 0, isRow: false})}
                            onMouseLeave={() => setHoveredLine(null)}
                            onClick={(e) => { e.stopPropagation(); onLineClick(0, false); }}
                          >
                             <div className="w-[2px] h-full bg-neon-blue/0 group-hover:bg-neon-blue/50 transition-colors"></div>
                          </div>
                       )}
                    </>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Board;