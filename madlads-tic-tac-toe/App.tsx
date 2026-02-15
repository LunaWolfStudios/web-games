import React, { useState, useEffect, useCallback, useRef } from 'react';
import Board from './components/Board';
import ControlPanel from './components/ControlPanel';
import GameInfo from './components/GameInfo';
import { 
  GameState, 
  Player, 
  PieceType, 
  ActionType, 
  ActionConfig, 
  CellData,
  Coordinates,
  HistoryEntry,
  GameStateSnapshot
} from './types';
import { INITIAL_GRID, MOVES, MAX_HEALTH, CELL_SIZE, createEmptyCell } from './constants';
import { expandGrid, checkWin, getAIMove } from './utils/gameLogic';
import { Info, RotateCcw, Users, Bot, Expand, ZoomIn, ZoomOut, Maximize, Undo2 } from 'lucide-react';

type GameMode = 'PvAI' | '2P' | '3P' | '4P' | '5P' | '6P' | '7P' | '8P';

const App: React.FC = () => {
  // Game Configuration
  const [gameMode, setGameMode] = useState<GameMode>('PvAI');
  
  // Game State
  const [grid, setGrid] = useState<CellData[][]>(INITIAL_GRID);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [turnCount, setTurnCount] = useState(1);
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningCells, setWinningCells] = useState<Coordinates[]>([]);
  
  // Stats & History
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [sessionWins, setSessionWins] = useState<Record<Player, number>>({ 
      X: 0, O: 0, Z: 0, A: 0, M: 0, S: 0, T: 0, K: 0 
  });

  // Turn State
  const [remainingActions, setRemainingActions] = useState<Partial<Record<ActionType, number>>>({});
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);
  const [currentActionType, setCurrentActionType] = useState<ActionType | null>(null);
  const [hasActedInTurn, setHasActedInTurn] = useState(false);

  // Undo Stack
  const undoStackRef = useRef<GameStateSnapshot[]>([]);

  // View State
  const [zoomLevel, setZoomLevel] = useState(1);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [turnNotification, setTurnNotification] = useState<{player: Player, text: string} | null>(null);

  // UI State
  const [showTutorial, setShowTutorial] = useState(true);

  // --- Helpers ---

  const getInitialGridSize = (mode: GameMode) => {
    if (['PvAI', '2P', '3P'].includes(mode)) return 3;
    if (['4P', '5P'].includes(mode)) return 4;
    if (['6P', '7P'].includes(mode)) return 5;
    return 6; // 8P
  };

  const getNextPlayer = (curr: Player, mode: GameMode): Player => {
      if (mode === 'PvAI' || mode === '2P') return curr === 'X' ? 'O' : 'X';
      
      const order: Player[] = ['X', 'O', 'Z'];
      if (mode === '4P') order.push('A');
      if (mode === '5P') order.push('A', 'M');
      if (mode === '6P') order.push('A', 'M', 'S');
      if (mode === '7P') order.push('A', 'M', 'S', 'T');
      if (mode === '8P') order.push('A', 'M', 'S', 'T', 'K');
      
      const idx = order.indexOf(curr);
      return order[(idx + 1) % order.length];
  };

  const getNotificationColor = (p: Player) => {
      switch(p) {
          case 'X': return 'text-neon-blue drop-shadow-[0_0_10px_rgba(0,243,255,0.8)] border-neon-blue';
          case 'O': return 'text-neon-pink drop-shadow-[0_0_10px_rgba(255,0,255,0.8)] border-neon-pink';
          case 'Z': return 'text-neon-orange drop-shadow-[0_0_10px_rgba(255,85,0,0.8)] border-neon-orange';
          case 'A': return 'text-neon-purple drop-shadow-[0_0_10px_rgba(191,0,255,0.8)] border-neon-purple';
          case 'M': return 'text-neon-m drop-shadow-[0_0_10px_rgba(41,98,255,0.8)] border-neon-m';
          case 'S': return 'text-neon-s drop-shadow-[0_0_10px_rgba(0,230,118,0.8)] border-neon-s';
          case 'T': return 'text-neon-t drop-shadow-[0_0_10px_rgba(255,0,64,0.8)] border-neon-t';
          case 'K': return 'text-neon-k drop-shadow-[0_0_10px_rgba(226,232,240,0.8)] border-neon-k';
          default: return 'text-white border-white';
      }
  };

  const saveStateForUndo = () => {
      if (undoStackRef.current.length > 50) {
          undoStackRef.current.shift(); // Limit stack size
      }
      
      const snapshot: GameStateSnapshot = {
          grid: grid.map(row => row.map(c => ({...c}))), // Deep copy
          currentPlayer,
          turnCount,
          winner,
          winningCells: [...winningCells],
          remainingActions: {...remainingActions},
          currentConfigId,
          currentActionType,
          hasActedInTurn,
          history: [...history],
          sessionWins: {...sessionWins}
      };
      undoStackRef.current.push(snapshot);
  };

  const handleUndo = () => {
      if (undoStackRef.current.length === 0) return;
      
      let stepsToPop = 1;
      
      if (gameMode === 'PvAI' && currentPlayer === 'X' && !hasActedInTurn) {
         if (undoStackRef.current.length >= 2) {
             stepsToPop = 2; 
         }
      }

      let targetState: GameStateSnapshot | undefined;
      
      for(let i=0; i<stepsToPop; i++) {
          targetState = undoStackRef.current.pop();
      }

      if (targetState) {
          setGrid(targetState.grid);
          setCurrentPlayer(targetState.currentPlayer);
          setTurnCount(targetState.turnCount);
          setWinner(targetState.winner);
          setWinningCells(targetState.winningCells);
          setRemainingActions(targetState.remainingActions);
          setCurrentConfigId(targetState.currentConfigId);
          setCurrentActionType(targetState.currentActionType);
          setHasActedInTurn(targetState.hasActedInTurn);
          setHistory(targetState.history);
          setSessionWins(targetState.sessionWins);
      }
  };

  const setDefaultAction = () => {
      const tokenMove = MOVES.find(m => m.id === 'basic-token');
      if (tokenMove) {
          setCurrentConfigId(tokenMove.id);
          setRemainingActions({ ...tokenMove.cost });
          setCurrentActionType(ActionType.PLACE_TOKEN);
      }
  };

  const switchTurn = () => {
    setCurrentPlayer(prev => getNextPlayer(prev, gameMode));
    setTurnCount(prev => prev + 1);
    
    // Default to Place Token for smooth gameplay
    setDefaultAction();
    
    setHasActedInTurn(false);
  };

  const logAction = (description: string) => {
      setHistory(prev => [...prev, {
          turn: turnCount,
          player: currentPlayer,
          description
      }]);
  };

  const updateActionState = (type: ActionType) => {
    setHasActedInTurn(true); 

    setRemainingActions(prev => {
      const next = { ...prev };
      if (next[type] && next[type]! > 0) {
        next[type]!--;
      }
      return next;
    });
  };

  // Monitor Action State for Auto-Switching or Turn End
  useEffect(() => {
    if (winner) return;

    if (hasActedInTurn) {
        const hasRemaining = Object.values(remainingActions).some(count => count && count > 0);
        
        if (!hasRemaining) {
            // No actions left, end turn after delay
            const timer = setTimeout(switchTurn, 200);
            return () => clearTimeout(timer);
        } else {
            // Actions left, check if we need to switch active sub-tool
            if (currentActionType && (!remainingActions[currentActionType] || remainingActions[currentActionType] === 0)) {
                const nextTool = Object.keys(remainingActions).find(k => remainingActions[k as ActionType]! > 0) as ActionType;
                if (nextTool) setCurrentActionType(nextTool);
            }
        }
    }
  }, [remainingActions, hasActedInTurn, winner]);

  // Turn Notification Trigger
  useEffect(() => {
     if (winner) {
         setTurnNotification(null);
         return;
     }
     
     // Set notification for new turn
     setTurnNotification({
         player: currentPlayer,
         text: `${currentPlayer}'s TURN`
     });

     // Clear it after animation finishes
     const timer = setTimeout(() => {
         setTurnNotification(null);
     }, 1500); 

     return () => clearTimeout(timer);
  }, [currentPlayer, turnCount, winner]);


  const triggerErrorFlash = (r: number, c: number) => {
    setGrid(prev => {
        const newGrid = prev.map(row => row.map(cell => ({...cell})));
        if (newGrid[r] && newGrid[r][c]) {
            newGrid[r][c].flashError = true;
        }
        return newGrid;
    });

    setTimeout(() => {
        setGrid(prev => {
            const newGrid = prev.map(row => row.map(cell => ({...cell})));
            if (newGrid[r] && newGrid[r][c]) {
                newGrid[r][c].flashError = false;
            }
            return newGrid;
        });
    }, 500);
  };

  const adjustZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(Math.max(prev + delta, 0.2), 2.0));
  };

  const fitToScreen = () => {
    if (!boardContainerRef.current) return;

    const rows = grid.length;
    const cols = grid[0].length;
    
    const boardWidthPx = 30 + (cols * CELL_SIZE) + (cols * 4) + 60; 
    const boardHeightPx = 30 + (rows * CELL_SIZE) + (rows * 4) + 60;

    const containerWidth = boardContainerRef.current.clientWidth;
    const containerHeight = boardContainerRef.current.clientHeight;

    const scaleX = containerWidth / boardWidthPx;
    const scaleY = containerHeight / boardHeightPx;
    
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.2), 1.5);

    setZoomLevel(newZoom);
    
    setTimeout(() => {
        if(boardContainerRef.current) {
             const { scrollWidth, scrollHeight, clientWidth, clientHeight } = boardContainerRef.current;
             boardContainerRef.current.scrollTo({
                 left: (scrollWidth - clientWidth) / 2,
                 top: (scrollHeight - clientHeight) / 2,
                 behavior: 'smooth'
             });
        }
    }, 50);
  };

  useEffect(() => {
      setTimeout(fitToScreen, 100);
      setDefaultAction(); // Initial game start default
  }, []);

  // --- Interaction Handlers ---

  const handleSelectAction = (config: ActionConfig) => {
    if (hasActedInTurn) return; 
    
    setCurrentConfigId(config.id);
    setRemainingActions({ ...config.cost });
    const firstType = Object.keys(config.cost)[0] as ActionType;
    setCurrentActionType(firstType);
  };

  const handleSetActionType = (type: ActionType) => {
      if (remainingActions[type] && remainingActions[type]! > 0) {
          setCurrentActionType(type);
      }
  };

  const handleEndTurn = () => {
      saveStateForUndo(); 
      if (!hasActedInTurn) {
          logAction("Passed Turn");
      }
      switchTurn();
  };

  const handleCellClick = (r: number, c: number) => {
    if (winner || !currentActionType) return;
    if (gameMode === 'PvAI' && currentPlayer === 'O') return; 
    
    // VALIDATION: Prevent rapid clicking if action is already consumed
    if (!remainingActions[currentActionType] || remainingActions[currentActionType]! <= 0) return;

    const cell = grid[r][c];
    let actionSuccess = false;
    let error = false;
    let logMsg = '';
    const newGrid = grid.map(row => row.map(c => ({...c})));

    switch (currentActionType) {
      case ActionType.PLACE_TOKEN:
        if (turnCount === 1 && currentPlayer === 'X' && r === 1 && c === 1 && grid.length === 3 && grid[0].length === 3) {
            triggerErrorFlash(r, c);
            error = true;
        } else if (cell.type === PieceType.EMPTY) {
            let pType = PieceType.X;
            if (currentPlayer === 'O') pType = PieceType.O;
            if (currentPlayer === 'Z') pType = PieceType.Z;
            if (currentPlayer === 'A') pType = PieceType.A;
            if (currentPlayer === 'M') pType = PieceType.M;
            if (currentPlayer === 'S') pType = PieceType.S;
            if (currentPlayer === 'T') pType = PieceType.T;
            if (currentPlayer === 'K') pType = PieceType.K;
            
            newGrid[r][c].type = pType;
            actionSuccess = true;
            logMsg = `Placed Token at (${r+1},${c+1})`;
        }
        break;

      case ActionType.PLACE_TRIANGLE:
        if (cell.isDotProtected) {
            triggerErrorFlash(r, c);
            error = true;
        } else if (cell.type === PieceType.EMPTY) {
            newGrid[r][c].type = PieceType.TRIANGLE;
            actionSuccess = true;
            logMsg = `Placed Triangle at (${r+1},${c+1})`;
        }
        break;

      case ActionType.PLACE_RECTANGLE:
        if (cell.isDotProtected) {
            triggerErrorFlash(r, c);
            error = true;
        } else if (cell.type === PieceType.EMPTY) {
            newGrid[r][c].type = PieceType.RECTANGLE;
            newGrid[r][c].health = MAX_HEALTH;
            actionSuccess = true;
            logMsg = `Placed Rect at (${r+1},${c+1})`;
        }
        break;
        
      case ActionType.PLACE_DOT:
        if (cell.type === PieceType.EMPTY) {
             newGrid[r][c].isDotProtected = true; 
             actionSuccess = true;
             logMsg = `Placed Dot at (${r+1},${c+1})`;
        }
        break;

      case ActionType.DESTROY:
        if (cell.type === PieceType.RECTANGLE) {
            newGrid[r][c].health -= 1; 
            if (newGrid[r][c].health <= 0) {
                newGrid[r][c].type = PieceType.EMPTY;
                newGrid[r][c].health = 0;
                logMsg = `Crushed Rect at (${r+1},${c+1})`;
            } else {
                logMsg = `Damaged Rect at (${r+1},${c+1})`;
            }
            actionSuccess = true;
        }
        break;

      default:
        break;
    }

    if (error) return; 

    if (actionSuccess) {
        saveStateForUndo(); 
        setGrid(newGrid);
        logAction(logMsg);
        
        if (currentActionType === ActionType.PLACE_TOKEN) {
            const winResult = checkWin(newGrid);
            if (winResult.winner) {
                setWinner(winResult.winner);
                setWinningCells(winResult.winningCells);
                setSessionWins(prev => ({ ...prev, [winResult.winner!]: prev[winResult.winner!] + 1 }));
                setRemainingActions({}); 
                return; 
            }
        }
        
        updateActionState(currentActionType);
    }
  };

  const handleLineClick = (index: number, isRow: boolean) => {
      if (winner || currentActionType !== ActionType.DRAW_LINE) return;
      if (gameMode === 'PvAI' && currentPlayer === 'O') return;

      // VALIDATION
      if (!remainingActions[ActionType.DRAW_LINE] || remainingActions[ActionType.DRAW_LINE]! <= 0) return;

      saveStateForUndo();
      const newGrid = expandGrid(grid, index, isRow);
      setGrid(newGrid);
      logAction(`Drew Line ${isRow ? 'Row' : 'Col'} ${index + 1}`);
      
      const winResult = checkWin(newGrid);
      if (winResult.winner) {
         setWinner(winResult.winner);
         setWinningCells(winResult.winningCells);
         setSessionWins(prev => ({ ...prev, [winResult.winner!]: prev[winResult.winner!] + 1 }));
         setRemainingActions({});
         return;
      }

      updateActionState(ActionType.DRAW_LINE);
  };

  // --- AI Loop ---
  useEffect(() => {
    // AI only plays as 'O' in PvAI mode
    if (gameMode === 'PvAI' && currentPlayer === 'O' && !winner) {
        const timer = setTimeout(() => {
            const aiMove = getAIMove(grid, 'O', MOVES);
            const config = MOVES.find(m => m.id === aiMove.moveId);
            if (!config) return;

            // Save state before AI moves so we can Undo it
            saveStateForUndo();

            let currentGrid = grid.map(row => row.map(c => ({...c})));
            let won = false;
            let winCells: Coordinates[] = [];
            const aiLog: string[] = [];

            aiMove.actions.forEach(act => {
                if (won) return;

                const { r, c } = act.target || {r:0, c:0};

                if (act.type === ActionType.PLACE_TOKEN) {
                    currentGrid[r][c].type = PieceType.O;
                    aiLog.push(`Placed Token (${r+1},${c+1})`);
                } else if (act.type === ActionType.PLACE_TRIANGLE) {
                    if (act.target && currentGrid[r][c].type === PieceType.EMPTY) {
                        currentGrid[r][c].type = PieceType.TRIANGLE;
                        aiLog.push(`Placed Triangle (${r+1},${c+1})`);
                    }
                } else if (act.type === ActionType.PLACE_RECTANGLE) {
                    if (act.target && currentGrid[r][c].type === PieceType.EMPTY) {
                        currentGrid[r][c].type = PieceType.RECTANGLE;
                        currentGrid[r][c].health = MAX_HEALTH;
                        aiLog.push(`Placed Rect (${r+1},${c+1})`);
                    }
                } else if (act.type === ActionType.DRAW_LINE) {
                    const { index, isRow } = act.target;
                    currentGrid = expandGrid(currentGrid, index, isRow);
                    aiLog.push(`Drew Line`);
                }

                const w = checkWin(currentGrid);
                if (w.winner) {
                    won = true;
                    setWinner(w.winner);
                    winCells = w.winningCells;
                    setSessionWins(prev => ({ ...prev, [w.winner!]: prev[w.winner!] + 1 }));
                }
            });

            setGrid(currentGrid);
            setHistory(prev => [...prev, ...aiLog.map(desc => ({ turn: turnCount, player: 'O' as Player, description: desc }))]);

            if (won) {
                setWinningCells(winCells);
            } else {
                switchTurn();
            }

        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameMode, winner, grid]);

  // --- Reset ---
  const resetGame = (mode?: GameMode) => {
    const targetMode = mode || gameMode;
    const size = getInitialGridSize(targetMode);
    
    setGrid(Array(size).fill(null).map(() => Array(size).fill(null).map(() => createEmptyCell())));
    setCurrentPlayer('X');
    setTurnCount(1);
    setWinner(null);
    setWinningCells([]);
    setRemainingActions({});
    setCurrentConfigId(null);
    setHasActedInTurn(false);
    setHistory([]);
    undoStackRef.current = [];
    setTimeout(fitToScreen, 100);
    setDefaultAction();
  };

  const toggleGameMode = () => {
      const modes: GameMode[] = ['PvAI', '2P', '3P', '4P', '5P', '6P', '7P', '8P'];
      const idx = modes.indexOf(gameMode);
      const newMode = modes[(idx + 1) % modes.length];
      setGameMode(newMode);
      resetGame(newMode);
  };

  return (
    <div className="relative w-screen h-[100dvh] bg-gray-950 overflow-hidden flex flex-col font-sans">
      
      {/* Turn Notification Popup */}
      {turnNotification && !winner && (
        <div key={turnNotification.text} className="fixed inset-x-0 top-[60%] z-50 flex justify-center pointer-events-none">
            <div className={`
                text-3xl md:text-6xl font-black tracking-tighter italic border-2 md:border-4 p-4 md:p-6 rounded-xl bg-black/80 backdrop-blur-sm
                animate-popup shadow-[0_0_30px_rgba(0,0,0,0.5)]
                ${getNotificationColor(turnNotification.player)}
            `}>
                {turnNotification.text}
            </div>
        </div>
      )}

      {/* Header / HUD */}
      <header className="absolute top-0 left-0 w-full p-2 md:p-4 flex justify-between items-center z-40 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter italic drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                MADLADS <span className="text-neon-blue">TIC</span> <span className="text-neon-pink">TAC</span> <span className="text-neon-green">TOE</span>
            </h1>
        </div>
        <div className="flex gap-2 md:gap-4 pointer-events-auto">
             <button onClick={handleUndo} className="flex items-center gap-2 bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700 border border-gray-600 text-xs md:text-sm active:scale-95 transition-transform" title="Undo">
                <Undo2 size={16} />
                <span className="hidden sm:inline">UNDO</span>
             </button>
             <button onClick={toggleGameMode} className="flex items-center gap-2 bg-gray-800 text-white px-2 py-1 md:px-3 md:py-1 rounded hover:bg-gray-700 border border-gray-600 text-xs md:text-sm min-w-[70px] justify-center">
                {gameMode === 'PvAI' ? <Bot size={14}/> : <Users size={14}/>}
                {gameMode}
             </button>
             <button onClick={() => resetGame()} className="bg-gray-800 text-white p-2 rounded hover:bg-gray-700 border border-gray-600">
                <RotateCcw size={16} />
             </button>
             <button onClick={() => setShowTutorial(true)} className="bg-gray-800 text-white p-2 rounded hover:bg-gray-700 border border-gray-600">
                <Info size={16} />
             </button>
        </div>
      </header>

      <GameInfo 
        turnCount={turnCount}
        sessionWins={sessionWins}
        history={history}
        currentPlayer={currentPlayer}
      />

      {/* Manual Zoom Controls */}
      <div className="fixed top-20 left-4 z-40 flex flex-col gap-2 pointer-events-auto">
          <button onClick={() => adjustZoom(0.1)} className="bg-gray-900/80 text-white p-2 rounded border border-gray-700 hover:bg-gray-800">
              <ZoomIn size={20} />
          </button>
          <button onClick={fitToScreen} className="bg-gray-900/80 text-white p-2 rounded border border-gray-700 hover:bg-gray-800" title="Fit Board to Screen">
              <Maximize size={20} />
          </button>
          <button onClick={() => adjustZoom(-0.1)} className="bg-gray-900/80 text-white p-2 rounded border border-gray-700 hover:bg-gray-800">
              <ZoomOut size={20} />
          </button>
      </div>

      {/* Main Game Area */}
      <main 
         ref={boardContainerRef}
         className="flex-1 overflow-auto bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] relative flex items-center justify-center cursor-move"
         onMouseDown={(e) => {
             const ele = boardContainerRef.current;
             if (!ele) return;
             let pos = { left: ele.scrollLeft, top: ele.scrollTop, x: e.clientX, y: e.clientY };
             const mouseMoveHandler = (e: MouseEvent) => {
                 const dx = e.clientX - pos.x;
                 const dy = e.clientY - pos.y;
                 ele.scrollTop = pos.top - dy;
                 ele.scrollLeft = pos.left - dx;
             };
             const mouseUpHandler = () => {
                 document.removeEventListener('mousemove', mouseMoveHandler);
                 document.removeEventListener('mouseup', mouseUpHandler);
                 ele.style.cursor = 'grab';
             };
             ele.style.cursor = 'grabbing';
             document.addEventListener('mousemove', mouseMoveHandler);
             document.addEventListener('mouseup', mouseUpHandler);
         }}
      >
         <div 
            className="p-20 transition-transform duration-200 ease-out origin-center"
            style={{ 
                transform: `scale(${zoomLevel})`,
            }}
         >
            <Board 
                grid={grid} 
                onCellClick={handleCellClick} 
                onLineClick={handleLineClick}
                selectedAction={currentActionType}
                winningCells={winningCells}
            />
         </div>
      </main>

      {/* Controls */}
      <ControlPanel 
         currentPlayer={currentPlayer}
         onSelectAction={handleSelectAction}
         onSetActionType={handleSetActionType}
         onEndTurn={handleEndTurn}
         remainingActions={remainingActions}
         currentTurnConfigId={currentConfigId}
         currentActionType={currentActionType}
         turnCount={turnCount}
         hasActed={hasActedInTurn}
      />

      {/* Winner Overlay */}
      {winner && (
        <div className="absolute inset-x-0 bottom-0 z-[60] flex flex-col items-center justify-end pointer-events-none">
            <div className="w-full max-w-lg mb-20 p-6 bg-gray-900/90 border-t-4 border-neon-green backdrop-blur-md rounded-t-3xl text-center shadow-[0_-10px_50px_rgba(0,0,0,0.8)] pointer-events-auto animate-in slide-in-from-bottom-20 duration-500">
                <h2 className="text-5xl font-black mb-2 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    {winner === 'X' ? <span className="text-neon-blue">PLAYER X</span> : 
                     winner === 'O' ? <span className="text-neon-pink">PLAYER O</span> :
                     winner === 'Z' ? <span className="text-neon-orange">PLAYER Z</span> :
                     winner === 'A' ? <span className="text-neon-purple">PLAYER A</span> :
                     winner === 'M' ? <span className="text-neon-m">PLAYER M</span> :
                     winner === 'S' ? <span className="text-neon-s">PLAYER S</span> :
                     winner === 'T' ? <span className="text-neon-t">PLAYER T</span> :
                     <span className="text-neon-k">PLAYER K</span>}
                </h2>
                <h3 className="text-3xl text-neon-green mb-6 font-bold tracking-widest">VICTORY</h3>
                <div className="flex justify-center gap-4">
                    <button onClick={() => resetGame()} className="px-8 py-3 bg-neon-green text-black font-bold text-xl rounded hover:bg-white transition-colors hover:scale-105 transform duration-100">
                        PLAY AGAIN
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
             <div className="max-w-2xl bg-gray-900 border border-gray-700 rounded-lg p-6 text-gray-300 shadow-2xl">
                 <h2 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-2">How to Play</h2>
                 <div className="space-y-4 mb-6 h-96 overflow-y-auto pr-2 custom-scrollbar">
                     <p><strong>Objective:</strong> Get 3 Win Tokens in a row.</p>
                     
                     <div className="p-3 bg-gray-800 rounded">
                        <h4 className="text-neon-blue font-bold">Game Modes</h4>
                        <p className="text-sm">
                            <ul className="list-disc pl-4 mt-1 space-y-1">
                                <li><strong>PvAI:</strong> X (Human) vs O (Bot)</li>
                                <li><strong>2P:</strong> X vs O (Hotseat)</li>
                                <li><strong>3P:</strong> X vs O vs Z</li>
                                <li><strong>4P - 8P:</strong> Multi-player Mayhem!</li>
                            </ul>
                        </p>
                     </div>

                     <div className="p-3 bg-gray-800 rounded">
                        <h4 className="text-neon-yellow font-bold">Blocking & Expansion</h4>
                        <p className="text-sm mb-2">Use the Expand tool to add rows/cols. Place blockers to stop opponents:</p>
                        <ul className="list-disc pl-4 text-xs space-y-1">
                            <li><strong className="text-neon-yellow">Triangles:</strong> Permanent blocks. Cannot be destroyed.</li>
                            <li><strong className="text-neon-green">Rectangles:</strong> Destructible blocks. Have 2 HP.</li>
                        </ul>
                     </div>

                     <div className="p-3 bg-gray-800 rounded">
                        <h4 className="text-red-400 font-bold">Crush & Defense</h4>
                         <ul className="list-disc pl-4 text-xs space-y-1 mt-1">
                            <li><strong className="text-red-400">Crush Tool:</strong> Deals 1 damage per click. You get 5 clicks. It takes 2 hits to destroy a Rectangle.</li>
                            <li><strong className="text-indigo-400">Dots:</strong> Place on empty cells to protect them. Cells with Dots CANNOT have blockers placed on them, but can accept Win Tokens.</li>
                        </ul>
                     </div>

                     <div className="p-3 bg-gray-800 rounded border border-gray-600">
                        <h4 className="text-white font-bold">Undo</h4>
                        <p className="text-sm">Misclick? Use the Undo button in the top bar to revert the previous action.</p>
                     </div>
                 </div>
                 <button onClick={() => setShowTutorial(false)} className="w-full py-3 bg-white text-black font-bold rounded hover:bg-gray-200">
                     GOT IT
                 </button>
             </div>
        </div>
      )}
    </div>
  );
};

export default App;