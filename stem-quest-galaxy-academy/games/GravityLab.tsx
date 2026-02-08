import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Star, Play } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface GravityLabProps {
  onExit: () => void;
}

const GravityLab: React.FC<GravityLabProps> = ({ onExit }) => {
  const { processGameResult } = useGame();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gravity, setGravity] = useState(0.5); 
  const [score, setScore] = useState(0);
  
  // Physics State
  const playerY = useRef(0);
  const velocityY = useRef(0);
  const obstacles = useRef<{x: number, h: number, type: 'HIGH'|'LOW'}[]>([]);
  const gameSpeed = useRef(4);
  const requestRef = useRef<number>();
  
  // Use ref to hold current gravity for game loop access
  const gravityRef = useRef(0.5);

  useEffect(() => {
      gravityRef.current = gravity;
  }, [gravity]);
  
  const PLAYER_SIZE = 30;

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    playerY.current = 0; // On ground
    velocityY.current = 0;
    obstacles.current = [];
    gameSpeed.current = 4;
    
    // Initial jump to start
    velocityY.current = -5;
    
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const gameLoop = () => {
    // Read fresh gravity value
    const gVal = gravityRef.current;
    
    // Physics Logic
    // Low gravity (0) = Floatier, Higher jump
    // High gravity (1) = Faster fall, Lower jump
    
    const gConstant = 0.15 + (gVal * 0.8); 
    const jumpPower = -5 - ((1-gVal) * 8); // -5 (High G) to -13 (Low G)

    playerY.current += velocityY.current;
    velocityY.current += gConstant;

    // Ground collision / Auto Jump
    if (playerY.current >= 0) {
        playerY.current = 0;
        velocityY.current = jumpPower; // Auto bounce
    }

    // Move Obstacles
    obstacles.current.forEach(obs => obs.x -= gameSpeed.current);
    obstacles.current = obstacles.current.filter(obs => obs.x > -50);

    // Spawn Obstacles
    const lastObs = obstacles.current[obstacles.current.length - 1];
    // Start easier: spacing is larger
    const spacing = 300 + (Math.random() * 200) + Math.max(0, 1000 - score); 
    
    if (!lastObs || (600 - lastObs.x > spacing)) {
        const type = Math.random() > 0.5 ? 'HIGH' : 'LOW';
        obstacles.current.push({
            x: 600, 
            h: type === 'HIGH' ? 120 : 40, 
            type
        });
    }

    // Collision
    const pRect = { 
        l: 80, 
        r: 80 + PLAYER_SIZE, 
        t: playerY.current - PLAYER_SIZE, 
        b: playerY.current 
    };

    let collided = false;
    obstacles.current.forEach(obs => {
        const obsL = obs.x;
        const obsR = obs.x + 30;
        let obsT, obsB;

        if (obs.type === 'LOW') {
            obsB = 0;
            obsT = -50;
        } else {
            obsB = -100;
            obsT = -150;
        }

        if (pRect.r > obsL && pRect.l < obsR && pRect.b > obsT && pRect.t < obsB) {
            collided = true;
        }
    });

    if (collided) {
        setIsGameOver(true);
        cancelAnimationFrame(requestRef.current!);
        return;
    }

    setScore(s => s + 1);
    gameSpeed.current += 0.0005;

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
      return () => {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
  }, []);

  useEffect(() => {
    if (isGameOver) {
      const stars = score >= 3000 ? 3 : score >= 1500 ? 2 : score >= 500 ? 1 : 0;
      processGameResult({
        gameId: 'gravity-lab',
        score,
        stars,
        xpEarned: Math.floor(score / 10)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver]);

  return (
    <div className="fixed inset-0 z-20 bg-slate-900 flex flex-col items-center justify-center">
       <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30">
        <button onClick={onExit} className="bg-slate-800 p-2 rounded-full border border-slate-600 text-white">
          <ArrowLeft />
        </button>
        <div className="text-xl font-bold text-blue-400">GRAVITY JUMP</div>
        <div className="w-10"></div>
      </div>

      {/* Game Container - Boxed */}
      <div className="relative w-full max-w-2xl aspect-[2/1] bg-slate-800 rounded-2xl overflow-hidden border-4 border-slate-700 shadow-2xl">
          {/* Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black"></div>
          
          {/* Ground */}
          <div className="absolute bottom-0 w-full h-8 bg-slate-600 border-t border-slate-500"></div>

          {!isPlaying && !isGameOver && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 backdrop-blur-sm">
                  <button onClick={startGame} className="bg-blue-500 hover:bg-blue-400 text-white text-2xl font-bold py-4 px-12 rounded-2xl shadow-lg flex items-center gap-2 transition-transform hover:scale-105">
                      <Play fill="white" /> START RUN
                  </button>
              </div>
          )}

          {/* Player */}
          <div 
            className="absolute left-[80px] w-8 h-8 bg-cyan-400 rounded-md border-2 border-white shadow-[0_0_15px_#22d3ee]"
            style={{ 
                bottom: '8px', 
                transform: `translateY(${playerY.current}px) rotate(${score % 360}deg)` 
            }}
          ></div>

          {/* Obstacles */}
          {obstacles.current.map((obs, i) => (
              <div
                key={i}
                className={`absolute w-8 border-2 ${obs.type === 'LOW' ? 'h-[50px] bottom-2 bg-red-500 border-red-300 rounded-t-md' : 'h-[50px] bottom-[108px] bg-yellow-500 border-yellow-300 rounded-full'}`}
                style={{ left: `${obs.x}px` }}
              ></div>
          ))}

          {/* Score HUD */}
          <div className="absolute top-4 right-6 text-4xl font-display font-black text-white/20 select-none">
              {score}
          </div>
      </div>

      {/* Controls Below */}
      <div className="w-full max-w-xl mt-8 px-8">
          <div className="flex justify-between text-cyan-300 font-bold mb-2 text-sm uppercase tracking-wider">
              <span>Moon (Low G)</span>
              <span>Earth</span>
              <span>Jupiter (High G)</span>
          </div>
          <input 
            type="range" 
            min="0" max="1" step="0.01"
            value={gravity}
            onChange={(e) => setGravity(parseFloat(e.target.value))}
            className="w-full h-4 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
          />
          <p className="text-center text-slate-400 mt-4 text-sm">
              Adjust gravity to control jump height. Avoid walls and drones!
          </p>
      </div>

      {isGameOver && (
        <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center p-4 z-50">
           <div className="bg-slate-800 p-8 rounded-2xl border-2 border-blue-500 max-w-sm w-full text-center">
               <h2 className="text-3xl font-bold text-white mb-2">CRASHED!</h2>
               <div className="text-5xl font-black text-yellow-400 mb-6">{score}</div>
               <div className="flex justify-center gap-2 mb-6">
                   {[...Array(3)].map((_, i) => {
                      const stars = score >= 3000 ? 3 : score >= 1500 ? 2 : score >= 500 ? 1 : 0;
                      return <Star key={i} className={`w-8 h-8 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}`} />;
                   })}
               </div>
               <button onClick={startGame} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mb-4">
                   TRY AGAIN
               </button>
               <button onClick={onExit} className="text-slate-400">Exit</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default GravityLab;
