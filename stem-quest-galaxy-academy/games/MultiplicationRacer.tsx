import React, { useState, useEffect } from 'react';
import { ArrowLeft, Timer, Trophy, Star, Rocket, MapPin } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface MultiplicationRacerProps {
  onExit: () => void;
}

const MultiplicationRacer: React.FC<MultiplicationRacerProps> = ({ onExit }) => {
  const { processGameResult } = useGame();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const [question, setQuestion] = useState({ a: 1, b: 1 });
  const [options, setOptions] = useState<number[]>([]);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  
  const [progress, setProgress] = useState(0); // 0 to 100%
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Background stars for parallax
  const [stars, setStars] = useState<{id:number, top:number, left:number, speed:number}[]>([]);

  useEffect(() => {
      // Init stars
      setStars(Array.from({length: 20}).map((_, i) => ({
          id: i,
          top: Math.random() * 100,
          left: Math.random() * 100,
          speed: Math.random() * 0.5 + 0.2
      })));
  }, []);

  useEffect(() => {
      let timer: number;
      if (isPlaying && !isGameOver && timeLeft > 0) {
          timer = window.setInterval(() => {
              setTimeLeft(t => t - 1);
          }, 1000);
      } else if (timeLeft === 0 && isPlaying) {
          endGame();
      }
      return () => clearInterval(timer);
  }, [isPlaying, isGameOver, timeLeft]);

  // Animation Loop for Stars/Movement
  useEffect(() => {
      let frame: number;
      if (isPlaying && !isGameOver) {
          const loop = () => {
             setStars(prev => prev.map(s => ({
                 ...s,
                 left: s.left - s.speed < 0 ? 100 : s.left - s.speed
             })));
             frame = requestAnimationFrame(loop);
          };
          frame = requestAnimationFrame(loop);
      }
      return () => cancelAnimationFrame(frame);
  }, [isPlaying, isGameOver]);

  const generateQuestion = () => {
      const a = Math.floor(Math.random() * 9) + 2;
      const b = Math.floor(Math.random() * 9) + 2;
      const ans = a * b;
      
      const opts = new Set<number>();
      opts.add(ans);
      while(opts.size < 3) {
          const offset = Math.floor(Math.random() * 10) - 5;
          const fake = ans + offset;
          if (fake > 0 && fake !== ans) opts.add(fake);
      }
      
      setQuestion({ a, b });
      setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
      setDisabledOptions([]);
  };

  const startGame = () => {
      setIsPlaying(true);
      setIsGameOver(false);
      setProgress(0);
      setScore(0);
      setStreak(0);
      setTimeLeft(60);
      generateQuestion();
  };

  const endGame = () => {
      setIsGameOver(true);
      setIsPlaying(false);
  };

  const handleAnswer = (ans: number) => {
      if (disabledOptions.includes(ans)) return;

      if (ans === question.a * question.b) {
          // Correct
          setStreak(s => s + 1);
          setScore(s => s + 100 + (streak * 20));
          
          // Move Ship
          setProgress(p => {
              const newP = p + 5; // 20 correct answers to finish
              if (newP >= 100) endGame();
              return newP;
          });

          generateQuestion();
      } else {
          // Wrong
          setStreak(0);
          setDisabledOptions(prev => [...prev, ans]);
          // Penalty speed/progress? No, just time lost and score streak reset
      }
  };

  useEffect(() => {
      if (isGameOver) {
          const finishBonus = progress >= 100 ? timeLeft * 50 : 0;
          const totalScore = Math.floor(score + finishBonus);
          const stars = totalScore >= 3000 ? 3 : totalScore >= 1500 ? 2 : totalScore >= 500 ? 1 : 0;
          processGameResult({
            gameId: 'multi-racer',
            score: totalScore,
            stars,
            xpEarned: Math.floor(totalScore / 5)
          });
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver]);

  // Visual Distance calculation
  const distanceKm = Math.floor(progress * 3844); // 384,400km is moon distance / 100 scale factor

  return (
    <div className="fixed inset-0 z-20 bg-slate-900 flex flex-col">
       <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30 pointer-events-none">
        <button onClick={onExit} className="pointer-events-auto bg-slate-800 p-2 rounded-full border border-slate-600 text-white">
          <ArrowLeft />
        </button>
        
        {/* Distance Tracker */}
        <div className="bg-slate-900/80 px-4 py-1 rounded-full border border-blue-500/50 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="font-mono text-blue-300">{distanceKm.toLocaleString()} km</span>
        </div>

        <div className="flex gap-4">
             <div className="bg-slate-800/80 px-4 py-2 rounded-lg border border-yellow-500/30 flex items-center gap-2">
                 <Trophy className="w-4 h-4 text-yellow-400" />
                 <span className="font-bold text-yellow-400">{Math.floor(score)}</span>
             </div>
             <div className="bg-slate-800/80 px-4 py-2 rounded-lg border border-cyan-500/30 flex items-center gap-2">
                 <Timer className="w-4 h-4 text-cyan-400" />
                 <span className="font-bold text-cyan-400">{timeLeft}s</span>
             </div>
        </div>
      </div>

      {/* Horizontal Race View */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center">
          {/* Moving Stars Background */}
          {stars.map(s => (
              <div 
                key={s.id} 
                className="absolute w-1 h-1 bg-white rounded-full opacity-70"
                style={{ top: `${s.top}%`, left: `${s.left}%` }}
              ></div>
          ))}

          {/* Earth (Start) */}
          <div 
            className="absolute left-[-100px] w-[300px] h-[300px] rounded-full bg-blue-500 shadow-[0_0_50px_#3b82f6]"
            style={{ transform: `translateX(${-progress * 5}px)` }} // Earth moves away
          >
              <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/1200px-The_Earth_seen_from_Apollo_17.jpg')] bg-cover opacity-80 rounded-full mix-blend-overlay"></div>
          </div>

          {/* Moon (Finish) */}
          <div 
            className="absolute right-[-100px] w-[200px] h-[200px] rounded-full bg-slate-200 shadow-[0_0_50px_#e2e8f0]"
            style={{ transform: `translateX(${(100 - progress) * 10}px)` }} // Moon comes closer
          >
             <div className="absolute inset-0 bg-slate-400 opacity-20 rounded-full bg-[radial-gradient(circle_at_30%_30%,_transparent_50%,_black_100%)]"></div>
          </div>

          {/* Player Ship */}
          <div 
            className="absolute transition-all duration-500 ease-out z-10"
            style={{ left: `calc(15% + ${progress * 0.6}%)` }} // Ship moves visually from 15% to 75% screen width
          >
              <div className="relative rotate-45 scale-150">
                  <Rocket className="w-12 h-12 text-white fill-white drop-shadow-[0_0_15px_#facc15]" />
                  {/* Engine Trail */}
                  <div className="absolute top-[40px] left-[-10px] w-5 h-20 bg-gradient-to-b from-orange-500 to-transparent blur-md rotate-45"></div>
              </div>
          </div>
      </div>

      {/* Control Deck */}
      <div className="h-1/3 bg-slate-900 border-t border-slate-700 p-4 flex flex-col items-center justify-center relative z-20">
         {isPlaying && !isGameOver ? (
             <div className="w-full max-w-2xl animate-[fadeIn_0.5s_ease-out_forwards]">
                 <div className="text-center mb-6">
                     <span className="text-6xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                         {question.a} × {question.b} = ?
                     </span>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                     {options.map((opt, i) => {
                         const isDisabled = disabledOptions.includes(opt);
                         return (
                             <button 
                                key={i}
                                onClick={() => handleAnswer(opt)}
                                disabled={isDisabled}
                                className={`
                                    h-20 border-b-4 text-3xl font-bold rounded-xl transition-all shadow-lg
                                    ${isDisabled 
                                        ? 'bg-slate-800 border-red-900 text-red-500 cursor-not-allowed opacity-50 ring-2 ring-red-500' 
                                        : 'bg-slate-800 hover:bg-slate-700 border-slate-950 active:border-b-0 active:translate-y-1 text-cyan-400'}
                                `}
                             >
                                 {opt}
                             </button>
                         );
                     })}
                 </div>
             </div>
         ) : !isGameOver && (
             <button onClick={startGame} className="bg-yellow-500 hover:bg-yellow-400 text-black font-black text-2xl py-4 px-12 rounded-full shadow-[0_0_30px_#eab308] animate-pulse transition-all transform hover:scale-105">
                 LAUNCH MISSION
             </button>
         )}
      </div>

      {isGameOver && (
        <div className="absolute inset-0 bg-slate-900/95 flex items-center justify-center p-4 z-50">
           <div className="bg-slate-800 p-8 rounded-3xl border-2 border-yellow-500 max-w-sm w-full text-center">
             <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
             <h2 className="text-3xl font-bold text-white mb-2">
                 MISSION COMPLETE
             </h2>
             <div className="text-5xl font-black text-white mb-4">{Math.floor(score)}</div>
             <div className="flex justify-center gap-2 mb-6">
                {[...Array(3)].map((_, i) => {
                   const s = score >= 3000 ? 3 : score >= 1500 ? 2 : score >= 500 ? 1 : 0;
                   return <Star key={i} className={`w-8 h-8 ${i < s ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}`} />;
                })}
             </div>
             
             <button onClick={startGame} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-colors mb-4">
               RACE AGAIN
             </button>
             <button onClick={onExit} className="text-slate-400 hover:text-white">Exit</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default MultiplicationRacer;