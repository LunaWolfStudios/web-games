import React, { useState, useEffect } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface CircuitHeroProps {
  onExit: () => void;
}

type TileType = 'STRAIGHT' | 'ELBOW' | 'START' | 'END' | 'EMPTY';

interface Tile {
  id: number;
  row: number;
  col: number;
  type: TileType;
  rotation: number; // 0, 90, 180, 270
  powered: boolean;
}

const GRID_SIZE = 4;

// Define "SOLVED" configurations (rotation is the correct rotation to solve it)
// We will simply randomize rotations at start
interface SolvedTile {
  type: TileType;
  solvedRot: number;
}

const createSolvedGrid = (layout: string[]): SolvedTile[] => {
  return layout.map((char) => {
    // Basic types, we will refine rotations below manually for each level logic
    // S=Straight, E=Elbow, A=Start, Z=End
    if (char === '0') return { type: 'EMPTY', solvedRot: 0 };
    if (char === 'A') return { type: 'START', solvedRot: 0 }; // Default pointing Right
    if (char === 'Z') return { type: 'END', solvedRot: 180 }; // Default pointing Left (Input)
    if (char === 'S') return { type: 'STRAIGHT', solvedRot: 0 };
    if (char === 'E') return { type: 'ELBOW', solvedRot: 0 };
    return { type: 'EMPTY', solvedRot: 0 };
  });
};

// Manually define Solved States for guaranteed connectivity
const GET_LEVEL_SOLVED_STATE = (level: number): SolvedTile[] => {
  const i = (level - 1) % 10;
  
  // Helper to make code concise
  const T = (type: TileType, rot: number) => ({ type, solvedRot: rot });
  const _ = T('EMPTY', 0);
  const A = T('START', 0); // Output Right
  const Z = T('END', 180); // Input Left (visually)

  switch (i) {
    case 0: // Lvl 1: Straight
      return [
        A, T('STRAIGHT', 0), T('STRAIGHT', 0), Z,
        _, _, _, _,
        _, _, _, _,
        _, _, _, _
      ];
    case 1: // Lvl 2: Curve Down-Right
      return [
        A, T('ELBOW', 0), _, _,
        _, T('ELBOW', 180), T('ELBOW', 0), Z,
        _, _, _, _,
        _, _, _, _
      ]; // A(R) -> E(0: D+R? No wait. 0 is D+R. 
         // A points right. Next tile must accept Left.
         // Elbow 0: Bottom-Right. Connects Bottom and Right.
         // So A -> [Left-Input?]. Elbow 0 has Right+Bottom. No Left.
         // Wait, my rotation logic:
         // 0: Bottom-Right.
         // 90: Bottom-Left.
         // 180: Top-Left.
         // 270: Top-Right.
         
         // Path: A(0,0) -> (0,1). A sends Right. (0,1) needs Left connection.
         // Elbows with Left: 90 (Bottom-Left), 180 (Top-Left).
         // We want to go Down? Use 90 (Bottom-Left).
         // So (0,1) is 90. It sends Down.
         // (1,1) needs Top.
         // Elbows with Top: 180 (Top-Left), 270 (Top-Right).
         // We want to go Right? Use 270 (Top-Right).
         // So (1,1) is 270. Sends Right.
         // (1,2) needs Left. We want to go Right to Z.
         // Straight 0.
         // Z at (1,3).
         
      // Let's redefine layouts carefully.
      
    case 1: // Level 2 Corrected
      return [
        A, T('ELBOW', 90), _, _,      // A->R. E(90) takes L, sends D.
        _, T('ELBOW', 270), T('STRAIGHT', 0), Z, // (1,1) E(270) takes U, sends R. S(0) takes L, sends R. Z takes L.
        _, _, _, _,
        _, _, _, _
      ];

    case 2: // Level 3: U-Shape
      // A(0,0) -> R. (0,1) needs L, send D. -> E(90)
      // (1,1) needs U, send D. -> S(90)
      // (2,1) needs U, send R. -> E(270)
      // (2,2) needs L, send U. -> E(180) - Wait, we want to go up?
      // (1,2) needs D, send U. -> S(90)
      // (0,2) needs D, send R. -> E(0)? No, needs D input. E(0) is D+R. Yes.
      // (0,3) Z.
      return [
        A, T('ELBOW', 90), T('ELBOW', 0), Z,
        _, T('STRAIGHT', 90), T('STRAIGHT', 90), _,
        _, T('ELBOW', 270), T('ELBOW', 180), _,
        _, _, _, _
      ];

    case 3: // Zig Zag
      // (1,0) A -> R. E(90) -> D.
      // (2,1) needs U, send R. -> E(270)
      // (2,2) needs L, send D. -> E(90)
      // (3,2) needs U, send R. -> E(270)
      // (3,3) Z.
      return [
        _, _, _, _,
        A, T('ELBOW', 90), _, _,
        _, T('ELBOW', 270), T('ELBOW', 90), _,
        _, _, T('ELBOW', 270), Z
      ];

    case 4: // Long Path
      // (0,0) A->R. S(0). E(90)->D.
      // (1,2) U->D. S(90).
      // (2,2) U->L. E(180).
      // (2,1) R->L. S(0).
      // (2,0) R->D. E(0).
      // (3,0) U->R. E(270).
      // (3,3) Z.
      // (3,1) L->R. S(0). (3,2) L->R S(0).
      return [
        A, T('STRAIGHT', 0), T('ELBOW', 90), _,
        _, _, T('STRAIGHT', 90), _,
        T('ELBOW', 0), T('STRAIGHT', 0), T('ELBOW', 180), _,
        T('ELBOW', 270), T('STRAIGHT', 0), T('STRAIGHT', 0), Z
      ];
      
    case 5: // Loop-ish
        // A -> R
        // (0,1) L->D E(90)
        // (1,1) U->R E(270)
        // (1,2) L->D E(90)
        // (2,2) U->L E(180)
        // (2,1) R->D E(0)
        // (3,1) U->R E(270)
        // (3,2) L->R S(0)
        // (3,3) Z
       return [
         A, T('ELBOW', 90), _, _,
         _, T('ELBOW', 270), T('ELBOW', 90), _,
         _, T('ELBOW', 0), T('ELBOW', 180), _,
         _, T('ELBOW', 270), T('STRAIGHT', 0), Z
       ];

    case 6: // Corners
        // A(0,0). (0,3) Z.
        // Path: (0,0) -> (1,0) -> (1,1) -> (2,1) -> (2,2) -> (1,2) -> (1,3) -> (0,3)
        // A -> D (E 0? No A is fixed Right). 
        // We need A to point Down? A rotation is usually fixed 0.
        // Let's assume A is always Right output.
        // (0,1) L->D E(90)
        // (1,1) U->R E(270)
        // (1,2) L->D E(90)
        // (2,2) U->R E(270)
        // (2,3) L->U E(180)
        // (1,3) D->U S(90)
        // (0,3) D->L (Z is fixed Left Input). E(90)? No Z is end.
        // Let's put Z at (0,3). (0,2) needs to feed it.
        // Okay let's do:
        // A(0,0)->R. S(0). S(0). (0,3) Z. (Straight line lvl 1 equivalent).
        // Let's make it wind.
        // A->(0,1) L->D E(90).
        // (1,1) U->R E(270).
        // (1,2) L->U E(180).
        // (0,2) D->R E(0).
        // (0,3) Z.
        return [
            A, T('ELBOW', 90), T('ELBOW', 0), Z,
            _, T('ELBOW', 270), T('ELBOW', 180), _,
            _, _, _, _,
            _, _, _, _
        ];

    case 7: // Snake
        return [
            A, T('ELBOW', 90), T('ELBOW', 0), T('ELBOW', 90),
            _, T('STRAIGHT', 90), T('STRAIGHT', 90), T('STRAIGHT', 90),
            _, T('ELBOW', 270), T('ELBOW', 180), T('ELBOW', 270),
            _, _, _, Z
        ]; // A->(0,1)D->(1,1)D->(2,1)R->(2,2)U->(1,2)U->(0,2)R->(0,3)D->(1,3)D->(2,3)R(Z)
           // (0,1) E(90). (1,1) S(90). (2,1) E(270). (2,2) E(180). (1,2) S(90). (0,2) E(0). (0,3) E(90). (1,3) S(90). (2,3) E(270)... Z needs input Left.
           // Let's simplify Snake.
           // A->S->E(90)
           // (1,2) U->L E(180)
           // (1,1) R->D E(0)
           // (2,1) U->R E(270)
           // (2,2) L->R S(0)
           // (2,3) L->D E(90)
           // (3,3) U->L Z(rotated?) Z is fixed 180 (Input Left). 
           // Need Z to accept Up? Z accepts all connections logic-wise but visually 180.
           // Let's place Z at (3,3) pointing Left.
           // (3,2) needs to feed R.
           // (3,2) L->R S(0).
           // Previous was (2,3) E(90) -> (3,3). 
           // Let's just do simple:
           // A, S, S, E(90)
           //          S(90)
           //          E(180) -> Z (at 1,2? no)
           // Just verify connectivity:
           // A(0,0)->(0,1)S->(0,2)S->(0,3)E(90)
           // (1,3) S(90)
           // (2,3) E(180) -> (2,2) E(0) -> (3,2) E(270) -> (3,3) Z
           return [
               A, T('STRAIGHT', 0), T('STRAIGHT', 0), T('ELBOW', 90),
               _, _, _, T('STRAIGHT', 90),
               _, _, T('ELBOW', 0), T('ELBOW', 180),
               _, _, T('ELBOW', 270), Z
           ];

    case 8: // Tight Squeeze
        // (1,0) A -> R.
        // (1,1) E(270) -> U
        // (0,1) E(0) -> R
        // (0,2) E(90) -> D
        // (1,2) E(180) -> L (Loop?) No.
        // (1,2) needs U input.
        // Let's do:
        // (1,0)A->R. (1,1)S. (1,2)E(270)->U. (0,2)E(180)->L. (0,1)E(0)->D. (1,1) Collision.
        // Okay:
        // (1,0)A -> (1,1)E(270) -> (0,1)E(0) -> (0,2)S -> (0,3)E(90) -> (1,3)E(180) -> (1,2)Z.
        return [
            _, T('ELBOW', 0), T('STRAIGHT', 0), T('ELBOW', 90),
            A, T('ELBOW', 270), Z, T('ELBOW', 180),
            _, _, _, _,
            _, _, _, _
        ];

    case 9: // Full Grid
        // A(0,0) -> R
        // Row 0: A, S, S, E(90)
        // Row 1: E(0), S, S, E(180) (Right to Left?)
        // (1,3) U->L E(180). (1,2) R->L S(0). (1,1) R->L S(0). (1,0) R->D E(0).
        // (2,0) U->R E(270). (2,1) L->R S(0). (2,2) L->R S(0). (2,3) L->D E(90).
        // (3,3) U->L Z.
        // Let's modify Z to be at (3,2) if possible? No Z is last.
        // (3,3) Z. Input Top? (2,3) sends Down. 
        // Z visually is Left Input. 
        // Let's make Z at (3,0)?
        // (2,3) -> (3,3) E(180) -> (3,2) S -> (3,1) S -> (3,0) Z.
        return [
            A, T('STRAIGHT', 0), T('STRAIGHT', 0), T('ELBOW', 90),
            T('ELBOW', 0), T('STRAIGHT', 0), T('STRAIGHT', 0), T('ELBOW', 180),
            T('ELBOW', 270), T('STRAIGHT', 0), T('STRAIGHT', 0), T('ELBOW', 90),
            Z, T('STRAIGHT', 0), T('STRAIGHT', 0), T('ELBOW', 180)
        ];
        
    default:
        return [A, T('STRAIGHT', 0), T('STRAIGHT', 0), Z, _, _, _, _, _, _, _, _, _, _, _, _];
  }
};

// Helper to check connections based on rotation
const getConnections = (type: TileType, rotation: number) => {
    // Returns [Right, Down, Left, Up] booleans
    if (type === 'STRAIGHT') {
        if (rotation % 180 === 0) return [true, false, true, false];
        else return [false, true, false, true];
    }
    if (type === 'ELBOW') {
        if (rotation === 0) return [true, true, false, false];
        if (rotation === 90) return [false, true, true, false];
        if (rotation === 180) return [false, false, true, true];
        if (rotation === 270) return [true, false, false, true];
    }
    if (type === 'START') {
        if (rotation === 0) return [true, false, false, false];
        if (rotation === 90) return [false, true, false, false];
        if (rotation === 180) return [false, false, true, false];
        if (rotation === 270) return [false, false, false, true];
    }
    if (type === 'END') {
        return [true, true, true, true]; 
    }
    return [false, false, false, false];
};

const CircuitHero: React.FC<CircuitHeroProps> = ({ onExit }) => {
  const { processGameResult } = useGame();
  
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState<Tile[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
      let timer: number;
      if (isPlaying && !isWon) {
          timer = window.setInterval(() => setTime(t => t + 1), 1000);
      }
      return () => clearInterval(timer);
  }, [isPlaying, isWon]);

  const generateLevel = (lvl: number) => {
    const solvedGrid = GET_LEVEL_SOLVED_STATE(lvl);

    const newGrid: Tile[] = solvedGrid.map((t, idx) => {
        // Randomize rotation if not empty/start/end
        let rot = t.solvedRot;
        if (t.type !== 'EMPTY' && t.type !== 'START' && t.type !== 'END') {
            // Ensure we don't accidentally start solved (unless probability says so)
            // But actually just random 0-3 * 90 is fine.
            rot = Math.floor(Math.random() * 4) * 90;
        }

        return {
            id: idx,
            row: Math.floor(idx / GRID_SIZE),
            col: idx % GRID_SIZE,
            type: t.type,
            rotation: rot,
            powered: t.type === 'START'
        };
    });

    setGrid(newGrid);
    setIsWon(false);
    setMoves(0);
    setTime(0);
    checkPower(newGrid);
  };

  const startGame = () => {
    setIsPlaying(true);
    generateLevel(1);
    setLevel(1);
  };

  const rotateTile = (id: number) => {
    if (isWon) return;
    setMoves(m => m + 1);
    const newGrid = grid.map(t => {
      if (t.id === id && t.type !== 'START' && t.type !== 'END' && t.type !== 'EMPTY') {
        return { ...t, rotation: (t.rotation + 90) % 360 };
      }
      return t;
    });
    setGrid(newGrid);
    checkPower(newGrid);
  };

  // BFS to check connectivity
  const checkPower = (currentGrid: Tile[]) => {
      const g = [...currentGrid];
      // Reset power
      g.forEach(t => {
          if (t.type !== 'START') t.powered = false;
      });

      const startTile = g.find(t => t.type === 'START');
      if (!startTile) return;

      const queue = [startTile.id];
      const visited = new Set<number>();
      visited.add(startTile.id);
      let endPowered = false;

      while (queue.length > 0) {
          const currId = queue.shift()!;
          const curr = g[currId];
          curr.powered = true;

          if (curr.type === 'END') {
              endPowered = true;
          }

          const connections = getConnections(curr.type, curr.rotation);
          // 0:Right, 1:Down, 2:Left, 3:Up

          const neighbors = [
              { id: currId + 1, dir: 0, opp: 2 }, // Right
              { id: currId + GRID_SIZE, dir: 1, opp: 3 }, // Down
              { id: currId - 1, dir: 2, opp: 0 }, // Left
              { id: currId - GRID_SIZE, dir: 3, opp: 1 } // Up
          ];

          neighbors.forEach(n => {
             if (connections[n.dir]) { 
                 const neighbor = g[n.id];
                 // Check bounds
                 const currCol = currId % GRID_SIZE;
                 const nextCol = n.id % GRID_SIZE;

                 if (n.dir === 0 && nextCol !== currCol + 1) return;
                 if (n.dir === 2 && nextCol !== currCol - 1) return;
                 if (n.id < 0 || n.id >= g.length) return;

                 if (neighbor && neighbor.type !== 'EMPTY' && !visited.has(n.id)) {
                     const neighborConns = getConnections(neighbor.type, neighbor.rotation);
                     if (neighborConns[n.opp]) {
                         visited.add(n.id);
                         queue.push(n.id);
                     }
                 }
             }
          });
      }

      setGrid(g);

      if (endPowered) {
         setIsWon(true);
         
         const baseScore = 1500;
         const movePenalty = moves * 25; 
         const timePenalty = time * 10;
         const finalScore = Math.max(0, baseScore - movePenalty - timePenalty);
         const stars = finalScore > 1000 ? 3 : finalScore > 600 ? 2 : 1;

         setTimeout(() => {
            processGameResult({
                gameId: 'circuit-hero',
                score: finalScore,
                stars: stars,
                xpEarned: 50 + (level * 10)
            });
         }, 500);
      }
  };

  const nextLevel = () => {
      if (level < 10) {
          const next = level + 1;
          setLevel(next);
          generateLevel(next);
      } else {
          onExit();
      }
  };

  return (
    <div className="fixed inset-0 z-20 bg-slate-900 flex flex-col">
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30 pointer-events-none">
        <button onClick={onExit} className="pointer-events-auto bg-slate-800 p-2 rounded-full border border-slate-600 text-white">
          <ArrowLeft />
        </button>
        <div className="text-xl font-bold text-purple-400">CIRCUIT HERO</div>
        <div className="flex gap-4">
             <div className="bg-slate-800/80 px-4 py-2 rounded-lg border border-purple-500/30 font-mono text-purple-300">
                 TIME: {time}s
             </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl border-4 border-slate-700 shadow-2xl">
           <div className="grid grid-cols-4 gap-0 bg-slate-900 p-1 border-2 border-slate-950">
              {grid.map(tile => (
                  <button
                    key={tile.id}
                    onClick={() => rotateTile(tile.id)}
                    disabled={tile.type === 'EMPTY' || tile.type === 'START' || tile.type === 'END' || isWon}
                    className={`
                        w-16 h-16 md:w-24 md:h-24 relative overflow-hidden transition-all
                        ${tile.type !== 'EMPTY' ? 'bg-slate-800' : 'bg-slate-900'}
                    `}
                  >
                      {/* Wire Visuals */}
                      <div 
                         className="w-full h-full flex items-center justify-center transition-transform duration-300"
                         style={{ transform: `rotate(${tile.rotation}deg)` }}
                      >
                         {tile.type === 'STRAIGHT' && (
                            <div className={`h-6 w-full ${tile.powered ? 'bg-purple-400 shadow-[0_0_15px_#a855f7] z-10' : 'bg-slate-600'}`}></div>
                         )}
                         {tile.type === 'ELBOW' && (
                             <div className="relative w-full h-full">
                                 {/* Horizontal part (Right half) */}
                                 <div className={`absolute top-1/2 left-1/2 w-1/2 h-6 -translate-y-1/2 ${tile.powered ? 'bg-purple-400 shadow-[0_0_15px_#a855f7]' : 'bg-slate-600'}`}></div>
                                 {/* Vertical part (Bottom half) */}
                                 <div className={`absolute top-1/2 left-1/2 w-6 h-1/2 -translate-x-1/2 ${tile.powered ? 'bg-purple-400 shadow-[0_0_15px_#a855f7]' : 'bg-slate-600'}`}></div>
                                 {/* Corner rounded */}
                                 <div className={`absolute top-1/2 left-1/2 w-6 h-6 -translate-x-1/2 -translate-y-1/2 ${tile.powered ? 'bg-purple-400' : 'bg-slate-600'} rounded-full`}></div>
                             </div>
                         )}
                         {tile.type === 'START' && (
                             <div className="w-full h-full flex items-center justify-center bg-slate-900 z-20">
                                {/* Battery Body - Fixed orientation logic. 
                                    If Tile Rot 0, points Right. Battery Positive should face Right.
                                    Parent div already rotates with tile.rotation.
                                    We just need to draw the battery so + is on Right.
                                */}
                                <div className="w-14 h-8 bg-yellow-500 rounded-sm border-2 border-yellow-300 relative flex items-center justify-center">
                                    {/* Positive Terminal on Right */}
                                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-4 bg-yellow-400 rounded-r-sm"></div>
                                    <Zap className={`w-5 h-5 ${tile.powered ? 'text-white animate-pulse' : 'text-yellow-800'}`} />
                                </div>
                                {/* Connector Wire - To the Right */}
                                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-6 ${tile.powered ? 'bg-purple-400' : 'bg-slate-600'} -z-10`}></div>
                             </div>
                         )}
                         {tile.type === 'END' && (
                             <div className="w-full h-full flex items-center justify-center bg-slate-900 z-20">
                                <div className={`w-10 h-10 rounded-full border-4 ${tile.powered ? 'bg-green-400 border-green-200 animate-pulse shadow-[0_0_30px_#4ade80]' : 'bg-slate-800 border-slate-600'}`}></div>
                                {/* Connector Wire - Left (Input) */}
                                <div className={`absolute left-0 top-1/2 -translate-x-1/4 -translate-y-1/2 w-1/2 h-6 ${tile.powered ? 'bg-purple-400' : 'bg-slate-600'} -z-10`}></div>
                             </div>
                         )}
                      </div>
                  </button>
              ))}
           </div>
        </div>
        <p className="mt-8 text-slate-400 font-bold">Level {level} / 10</p>
      </div>

      {(!isPlaying || isWon) && (
        <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center p-4 z-50">
           <div className="bg-slate-800 p-8 rounded-2xl border-2 border-purple-500 max-w-sm w-full text-center">
               <h2 className="text-3xl font-bold text-white mb-4">
                   {isWon ? 'SYSTEM ONLINE!' : 'CIRCUIT HERO'}
               </h2>
               {isWon && <div className="text-4xl mb-6">⚡⚡⚡</div>}
               {isWon && <p className="mb-4 text-purple-300">Score: {Math.max(0, 1500 - moves*25 - time*10)}</p>}
               
               <button onClick={isWon ? nextLevel : startGame} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg mb-4">
                   {isWon ? (level < 10 ? 'NEXT LEVEL' : 'COMPLETE MISSION') : 'START REPAIRS'}
               </button>
               <button onClick={onExit} className="text-slate-400">Exit</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default CircuitHero;