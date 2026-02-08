import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Meteor } from '../types';
import { ArrowLeft, Heart, Star } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface MeteorMathProps {
  onExit: () => void;
}

interface Explosion {
  id: number;
  x: number;
  y: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
}

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
}

interface Laser {
    id: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    color: string;
}

const MeteorMath: React.FC<MeteorMathProps> = ({ onExit }) => {
  const { processGameResult } = useGame();
  
  // Game State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [lasers, setLasers] = useState<Laser[]>([]);
  const [targetMeteorId, setTargetMeteorId] = useState<number | null>(null);

  // Refs for loop to avoid closure staleness
  const requestRef = useRef<number>();
  const lastSpawnTime = useRef<number>(0);
  const lastStarTime = useRef<number>(0);
  const scoreRef = useRef(0);
  
  // Difficulty Scaling
  const SPAWN_RATE = Math.max(1200, 3000 - level * 300); 
  const METEOR_SPEED = 0.1 + (level * 0.03); 

  // Audio (Mock)
  const playSound = (type: 'laser' | 'explosion' | 'error' | 'heal') => {
    // Audio logic would go here
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    scoreRef.current = 0;
    setLives(3);
    setMeteors([]);
    setShootingStars([]);
    setCombo(0);
    setLevel(1);
    setExplosions([]);
    setFloatingTexts([]);
    setLasers([]);
    lastSpawnTime.current = performance.now();
    lastStarTime.current = performance.now();
  };

  const generateMeteor = (id: number): Meteor => {
    const types: ('ADD' | 'SUB' | 'MUL')[] = ['ADD', 'SUB'];
    if (level > 2) types.push('MUL');
    
    const type = types[Math.floor(Math.random() * types.length)];
    let val1 = 0, val2 = 0, answer = 0, equation = '';

    // Logic to ensure single digit answers (0-9)
    switch (type) {
      case 'ADD':
        // Result must be < 10
        val1 = Math.floor(Math.random() * 9); 
        val2 = Math.floor(Math.random() * (10 - val1)); 
        answer = val1 + val2;
        equation = `${val1} + ${val2}`;
        break;
      case 'SUB':
        val1 = Math.floor(Math.random() * 10);
        val2 = Math.floor(Math.random() * (val1 + 1)); 
        answer = val1 - val2;
        equation = `${val1} - ${val2}`;
        break;
      case 'MUL':
         val1 = Math.floor(Math.random() * 4); 
         if (val1 === 0) val2 = Math.floor(Math.random() * 10);
         else if (val1 === 1) val2 = Math.floor(Math.random() * 10);
         else if (val1 === 2) val2 = Math.floor(Math.random() * 5); 
         else val2 = Math.floor(Math.random() * 4); 
         
         answer = val1 * val2;
         equation = `${val1} × ${val2}`;
         break;
    }

    return {
      id,
      x: Math.random() * 80 + 10, 
      y: -15, // Start further up
      value: answer,
      equation,
      speed: METEOR_SPEED * (Math.random() * 0.3 + 0.8),
      type
    };
  };

  const spawnExplosion = (x: number, y: number) => {
    const now = Date.now();
    setExplosions(prev => [...prev, { id: now, x, y }]);
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== now));
    }, 800);
  };

  // Game Loop
  const gameLoop = useCallback((time: number) => {
    if (!isPlaying || isGameOver) return;

    // Spawn Meteor
    if (time - lastSpawnTime.current > SPAWN_RATE) {
      setMeteors(prev => [...prev, generateMeteor(time)]);
      lastSpawnTime.current = time;
    }

    // Spawn Shooting Star (Rarely, if damaged)
    if (lives < 3 && time - lastStarTime.current > 12000) {
        if (Math.random() < 0.003) { // Lower chance
            setShootingStars(prev => [...prev, {
                id: time,
                x: -10,
                y: Math.random() * 40 + 10,
                speedX: 0.05, // Much Slower
                speedY: 0.02
            }]);
            lastStarTime.current = time;
        }
    }

    // Update Shooting Stars
    setShootingStars(prev => {
        return prev.map(s => ({
            ...s,
            x: s.x + s.speedX,
            y: s.y + s.speedY
        })).filter(s => s.x < 110);
    });

    // Update Meteors & Determine Target
    setMeteors(prevMeteors => {
      const nextMeteors: Meteor[] = [];
      let lifeLost = false;

      prevMeteors.forEach(m => {
        const nextY = m.y + m.speed;
        
        if (nextY > 85) { 
          lifeLost = true;
          setCombo(0); 
          playSound('error');
          spawnExplosion(m.x, 85);
        } else {
          nextMeteors.push({ ...m, y: nextY });
        }
      });

      if (lifeLost) {
        setLives(l => {
          const newLives = l - 1;
          if (newLives <= 0) setIsGameOver(true);
          return newLives;
        });
      }

      return nextMeteors;
    });

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, isGameOver, level, SPAWN_RATE, METEOR_SPEED, lives]);

  useEffect(() => {
    if (isPlaying && !isGameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isGameOver, gameLoop]);

  // Determine target based on lowest Y (highest value)
  useEffect(() => {
      if (meteors.length > 0) {
          // Find meteor with highest Y
          const target = meteors.reduce((prev, current) => (prev.y > current.y) ? prev : current);
          setTargetMeteorId(target.id);
      } else {
          setTargetMeteorId(null);
      }
  }, [meteors]);

  // Handle Input Logic
  const handleNumpad = (num: number) => {
    if (!targetMeteorId) return;

    const targetMeteor = meteors.find(m => m.id === targetMeteorId);
    
    if (targetMeteor) {
        // Create Laser Beam Visual
        const laserId = Date.now();
        setLasers(prev => [...prev, { 
            id: laserId, 
            startX: 50, startY: 85, 
            endX: targetMeteor.x, endY: targetMeteor.y,
            color: num === targetMeteor.value ? '#22d3ee' : '#ef4444' 
        }]);
        setTimeout(() => setLasers(prev => prev.filter(l => l.id !== laserId)), 200);

        if (num === targetMeteor.value) {
             // HIT!
            playSound('laser');
            
            const points = 100 + (combo * 10);
            setScore(s => {
                scoreRef.current = s + points;
                return s + points;
            });
            setCombo(c => c + 1);

            // Visual FX
            spawnExplosion(targetMeteor.x, targetMeteor.y);
            const now = Date.now();
            setFloatingTexts(prev => [...prev, { id: now, x: targetMeteor.x, y: targetMeteor.y, text: `+${points}` }]);
            setTimeout(() => {
                setFloatingTexts(prev => prev.filter(t => t.id !== now));
            }, 800);

            if (scoreRef.current > level * 800) {
                setLevel(l => l + 1);
            }

            // Remove Meteor immediately from state
            setMeteors(prev => prev.filter(m => m.id !== targetMeteorId));
        } else {
            // MISS!
            playSound('error');
            setCombo(0);
        }
    }
  };

  const tapStar = (id: number) => {
      if (lives < 3) {
          setLives(l => Math.min(l + 1, 3));
          playSound('heal');
          setShootingStars(prev => prev.filter(s => s.id !== id));
          const now = Date.now();
          setFloatingTexts(prev => [...prev, { id: now, x: 50, y: 50, text: `HEALTH UP!` }]);
          setTimeout(() => setFloatingTexts(prev => prev.filter(t => t.id !== now)), 800);
      }
  };

  // End Game handling
  useEffect(() => {
    if (isGameOver) {
      const stars = score > 3000 ? 3 : score > 1500 ? 2 : score > 500 ? 1 : 0;
      processGameResult({
        gameId: 'meteor-math',
        score,
        stars,
        xpEarned: Math.floor(score / 5) 
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver]);

  // Render
  return (
    <div className="fixed inset-0 z-20 bg-slate-900 flex flex-col">
      {/* Game HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-30 pointer-events-none">
        <button onClick={onExit} className="pointer-events-auto bg-slate-800 p-2 rounded-full border border-slate-600 hover:bg-slate-700 text-white">
          <ArrowLeft />
        </button>
        
        <div className="flex flex-col items-center">
            <div className="text-4xl font-display font-bold text-yellow-400 drop-shadow-lg tabular-nums">{score}</div>
            <div className="text-xs text-cyan-400 font-mono tracking-widest">LEVEL {level}</div>
            {combo > 1 && <div className="text-lg text-purple-400 font-black italic animate-bounce mt-2">{combo}x COMBO!</div>}
        </div>

        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <Heart key={i} className={`w-8 h-8 ${i < lives ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
          ))}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-slate-900/80"></div>
        
        {/* Shooting Stars */}
        {shootingStars.map(s => (
            <button
                key={s.id}
                onClick={() => tapStar(s.id)}
                className="absolute w-12 h-12 flex items-center justify-center animate-pulse z-20 cursor-pointer"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
                <Star className="w-10 h-10 text-yellow-300 fill-yellow-100 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]" />
                <div className="absolute top-1/2 right-full w-20 h-1 bg-gradient-to-r from-transparent to-yellow-200 blur-sm"></div>
            </button>
        ))}

        {/* Lasers */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {lasers.map(l => (
                <line 
                    key={l.id} 
                    x1={`${l.startX}%`} y1={`${l.startY}%`} 
                    x2={`${l.endX}%`} y2={`${l.endY}%`} 
                    stroke={l.color} strokeWidth="6" 
                    strokeLinecap="round"
                    className="animate-pulse"
                    style={{ filter: `drop-shadow(0 0 5px ${l.color})`}}
                />
            ))}
        </svg>

        {/* Meteors */}
        {meteors.map(m => {
            const isTarget = m.id === targetMeteorId;
            return (
                <div 
                  key={m.id}
                  className="absolute transform -translate-x-1/2 flex items-center justify-center w-24 h-24 transition-transform duration-75 ease-linear will-change-transform"
                  style={{ left: `${m.x}%`, top: `${m.y}%`, scale: isTarget ? '1.2' : '1', zIndex: isTarget ? 20 : 10 }}
                >
                   {/* Target Reticle */}
                   {isTarget && (
                       <div className="absolute inset-[-15px] border-2 border-red-500 rounded-full animate-pulse opacity-100 shadow-[0_0_15px_#ef4444]"></div>
                   )}

                   <div className="relative w-full h-full flex items-center justify-center animate-spin-slow">
                     <div className="absolute inset-2 bg-slate-700 rounded-full border-4 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.6)] z-10"></div>
                     <div className="absolute inset-4 border-2 border-slate-600 rounded-full z-10 opacity-50"></div>
                     <span className="relative z-20 font-display font-black text-2xl text-white drop-shadow-md">{m.equation}</span>
                   </div>
                   <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-4 h-24 bg-gradient-to-t from-orange-500 to-transparent blur-md"></div>
                </div>
            );
        })}

        {/* Explosions */}
        {explosions.map(e => (
          <div 
            key={e.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-32 h-32 pointer-events-none z-30"
            style={{ left: `${e.x}%`, top: `${e.y}%` }}
          >
            <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-4 bg-yellow-400 rounded-full animate-ping delay-75 opacity-75"></div>
          </div>
        ))}

        {/* Floating Text */}
        {floatingTexts.map(t => (
          <div
            key={t.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl font-black text-yellow-300 pointer-events-none animate-float-up z-40 drop-shadow-md"
            style={{ left: `${t.x}%`, top: `${t.y}%` }}
          >
            {t.text}
          </div>
        ))}

        {/* Player Ship / Input Area */}
        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center z-30 pointer-events-none">
           {/* Ship Visual - More substantial */}
           <div className="mb-2 relative group pointer-events-auto transition-transform duration-100 scale-75 md:scale-100">
              {/* Wings */}
              <div className="absolute bottom-2 -left-8 w-8 h-12 bg-blue-800 skew-x-12 border-l-2 border-cyan-500"></div>
              <div className="absolute bottom-2 -right-8 w-8 h-12 bg-blue-800 -skew-x-12 border-r-2 border-cyan-500"></div>
              
              {/* Body */}
              <div className="w-16 h-20 bg-gradient-to-t from-blue-900 via-blue-700 to-cyan-600 border-2 border-cyan-400 relative z-10 rounded-t-full shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                  {/* Cockpit */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-black/50 rounded-full border border-cyan-300/50"></div>
              </div>

              {/* Engine Flames */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
                 <div className="w-4 h-10 bg-orange-500 blur-sm animate-pulse"></div>
                 <div className="w-2 h-8 bg-yellow-400 blur-sm animate-pulse delay-75"></div>
              </div>
           </div>

           {/* Numpad */}
           <div className="pointer-events-auto bg-slate-900/90 p-2 md:p-4 rounded-2xl backdrop-blur-xl border border-blue-500/30 mb-2 shadow-2xl">
               <div className="grid grid-cols-5 gap-1 md:gap-3 md:grid-cols-3">
                   {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                       <button
                           key={num}
                           onClick={() => handleNumpad(num)}
                           className="w-10 h-10 md:w-14 md:h-14 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-white font-display font-bold text-xl md:text-2xl rounded-lg md:rounded-xl shadow-[0_2px_0_#0f172a] md:shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 transition-all border-t border-white/10"
                       >
                           {num}
                       </button>
                   ))}
                   <div className="col-start-3 md:col-start-2">
                       <button
                           onClick={() => handleNumpad(0)}
                           className="w-10 h-10 md:w-14 md:h-14 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-white font-display font-bold text-xl md:text-2xl rounded-lg md:rounded-xl shadow-[0_2px_0_#0f172a] md:shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 transition-all border-t border-white/10"
                       >
                           0
                       </button>
                   </div>
               </div>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes float-up {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          20% { transform: translate(-50%, -80%) scale(1.5); opacity: 1; }
          100% { transform: translate(-50%, -150%) scale(1); opacity: 0; }
        }
        .animate-float-up {
          animation: float-up 0.8s ease-out forwards;
        }
      `}</style>

      {/* Start / Game Over Overlays */}
      {(!isPlaying || isGameOver) && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 p-8 rounded-3xl border-4 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.5)] max-w-sm w-full text-center relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"></div>

            <h2 className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2 uppercase tracking-tighter">
              {isGameOver ? 'MISSION END' : 'METEOR MATH'}
            </h2>
            
            {isGameOver && (
               <div className="mb-8 bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
                 <div className="text-sm text-slate-400 uppercase tracking-widest mb-1">Final Score</div>
                 <div className="text-5xl font-black text-white mb-4">{score}</div>
                 <div className="flex justify-center gap-3">
                    {[...Array(3)].map((_, i) => {
                       const stars = score >= 3000 ? 3 : score >= 1500 ? 2 : score >= 500 ? 1 : 0;
                       return <Star key={i} className={`w-10 h-10 ${i < stars ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'text-slate-700'}`} />;
                    })}
                 </div>
               </div>
            )}

            {!isGameOver && (
              <div className="text-slate-300 mb-8 leading-relaxed">
                <p className="mb-2">Incoming asteroid field detected!</p>
                <p className="text-sm text-cyan-400">Tap the answer on your numpad to fire laser beams. Catch shooting stars for health!</p>
              </div>
            )}

            <button 
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-bold text-xl text-white shadow-lg hover:shadow-cyan-500/50 transition-all hover:scale-105 active:scale-95 border border-white/20"
            >
              {isGameOver ? 'RETRY MISSION' : 'LAUNCH SHIP'}
            </button>
            
            <button 
              onClick={onExit}
              className="mt-6 text-slate-500 hover:text-white text-sm font-bold uppercase tracking-widest hover:underline decoration-cyan-500 underline-offset-4 transition-all"
            >
              Exit to Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeteorMath;