import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, Pizza, Star, Minus, Plus } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface FractionFactoryProps {
  onExit: () => void;
}

const FractionFactory: React.FC<FractionFactoryProps> = ({ onExit }) => {
  const { processGameResult } = useGame();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  
  // Question State
  const [targetNumerator, setTargetNumerator] = useState(1);
  const [targetDenominator, setTargetDenominator] = useState(2);
  const [currentCuts, setCurrentCuts] = useState(1); // 1 = whole, 2 = halves, etc.
  const [selectedSegments, setSelectedSegments] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const previousQuestionRef = useRef<string>('');

  useEffect(() => {
    let timer: number;
    if (isPlaying && !isGameOver && timeLeft > 0) {
      timer = window.setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsGameOver(true);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, timeLeft]);

  const generateQuestion = () => {
    // Generate denominator (2, 3, 4, 6, 8)
    const denoms = [2, 3, 4, 6, 8];
    let d = 2;
    let n = 1;
    let attempts = 0;
    
    // Simple logic to prevent duplicate
    do {
       d = denoms[Math.floor(Math.random() * denoms.length)];
       n = Math.floor(Math.random() * (d - 1)) + 1; // 1 to d-1
       attempts++;
    } while (`${n}/${d}` === previousQuestionRef.current && attempts < 10);

    previousQuestionRef.current = `${n}/${d}`;
    
    setTargetNumerator(n);
    setTargetDenominator(d);
    setCurrentCuts(1); // Reset to whole pizza
    setSelectedSegments([]);
    setIsCorrect(null);
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setTimeLeft(90);
    generateQuestion();
  };

  const adjustCuts = (delta: number) => {
    if (isCorrect !== null) return;
    const allowedCuts = [1, 2, 3, 4, 6, 8];
    const currentIndex = allowedCuts.indexOf(currentCuts);
    let newIndex = currentIndex + delta;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= allowedCuts.length) newIndex = allowedCuts.length - 1;
    
    setCurrentCuts(allowedCuts[newIndex]);
    setSelectedSegments([]); // Reset selection on cut change
  };

  const toggleSegment = (index: number) => {
    if (isCorrect !== null) return;
    if (currentCuts === 1) return; // Can't select whole pizza in this game logic easily without cutting
    
    if (selectedSegments.includes(index)) {
      setSelectedSegments(prev => prev.filter(i => i !== index));
    } else {
      setSelectedSegments(prev => [...prev, index]);
    }
  };

  const servePizza = () => {
    // Check if denominator matches cuts
    const cutsCorrect = currentCuts === targetDenominator;
    const slicesCorrect = selectedSegments.length === targetNumerator;

    if (cutsCorrect && slicesCorrect) {
      setScore(s => s + 150);
      setIsCorrect(true);
      setTimeout(generateQuestion, 1000);
    } else {
      setIsCorrect(false);
      setScore(s => Math.max(0, s - 50)); // Penalty
      setTimeout(() => {
        setIsCorrect(null);
        setSelectedSegments([]);
      }, 800);
    }
  };

  useEffect(() => {
    if (isGameOver) {
      const stars = score >= 3000 ? 3 : score >= 1500 ? 2 : score >= 500 ? 1 : 0;
      processGameResult({
        gameId: 'fraction-factory',
        score,
        stars,
        xpEarned: Math.floor(score / 5)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver]);

  // Helpers to draw circle segments
  const getPath = (index: number, total: number) => {
    const center = 100;
    const radius = 90;
    
    if (total === 1) {
        return `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center - 0.1} ${center - radius} Z`; 
    }

    const startAngle = (index * 360) / total;
    const endAngle = ((index + 1) * 360) / total;

    // Convert to radians, subtract 90deg to start at top
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="fixed inset-0 z-20 bg-slate-900 flex flex-col">
       {/* HUD */}
       <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30 pointer-events-none">
        <button onClick={onExit} className="pointer-events-auto bg-slate-800 p-2 rounded-full border border-slate-600 text-white">
          <ArrowLeft />
        </button>
        <div className="flex gap-8 pointer-events-auto">
            <div className="text-center">
                <div className="text-xs text-slate-400">SCORE</div>
                <div className="text-2xl font-bold text-yellow-400">{score}</div>
            </div>
            <div className="text-center">
                <div className="text-xs text-slate-400">TIME</div>
                <div className={`text-2xl font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {timeLeft}s
                </div>
            </div>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-900 overflow-y-auto">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 text-center mt-12">
             Order: <span className="text-orange-400 text-6xl mx-2 drop-shadow-lg">{targetNumerator}/{targetDenominator}</span>
          </h2>

          <div className="relative w-64 h-64 md:w-80 md:h-80 mb-6">
             {/* Plate */}
             <div className="absolute inset-0 rounded-full bg-slate-800 border-4 border-slate-700 shadow-2xl scale-110"></div>

             <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 drop-shadow-xl transition-all duration-300">
                {[...Array(currentCuts)].map((_, i) => (
                    <g key={i} onClick={() => toggleSegment(i)} className="cursor-pointer hover:opacity-90">
                        <path
                          d={getPath(i, currentCuts)}
                          fill={selectedSegments.includes(i) ? '#fbbf24' : '#9a3412'} // Cheese vs Sauce
                          stroke="#7c2d12"
                          strokeWidth="2"
                        />
                        {/* Pepperoni details if cheese (selected) */}
                        {selectedSegments.includes(i) && (
                            <circle cx={100 + 40 * Math.cos(((i + 0.5) * 360 / currentCuts - 90) * Math.PI / 180)} cy={100 + 40 * Math.sin(((i + 0.5) * 360 / currentCuts - 90) * Math.PI / 180)} r="5" fill="#ef4444" opacity="0.8" />
                        )}
                    </g>
                ))}
             </svg>
             
             {/* Feedback Overlay */}
             {isCorrect !== null && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                 {isCorrect ? (
                    <div className="bg-green-500/90 rounded-full p-4 animate-[popIn_0.3s_ease-out_forwards]">
                        <Check className="w-16 h-16 text-white" />
                    </div>
                 ) : (
                    <div className="bg-red-500/90 rounded-full p-4 animate-[popIn_0.3s_ease-out_forwards]">
                        <span className="text-4xl font-bold text-white">X</span>
                    </div>
                 )}
               </div>
             )}
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
              <div className="flex items-center justify-center gap-6 bg-slate-800 p-4 rounded-xl border border-slate-700 w-full">
                  <button onClick={() => adjustCuts(-1)} className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 active:scale-95">
                      <Minus className="w-6 h-6 text-white" />
                  </button>
                  <div className="text-center w-24">
                      <div className="text-xs text-slate-400 uppercase">Slices</div>
                      <div className="text-3xl font-bold text-white">{currentCuts}</div>
                  </div>
                  <button onClick={() => adjustCuts(1)} className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 active:scale-95">
                      <Plus className="w-6 h-6 text-white" />
                  </button>
              </div>

              <button 
                onClick={servePizza}
                disabled={isCorrect !== null}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-xl font-bold py-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                SERVE ORDER
              </button>
          </div>
      </div>

      {(!isPlaying || isGameOver) && (
        <div className="absolute inset-0 bg-slate-900/95 flex items-center justify-center p-4 z-50">
           <div className="bg-slate-800 p-8 rounded-3xl border-2 border-orange-500 max-w-sm w-full text-center">
             <div className="flex justify-center mb-4">
               <Pizza className="w-16 h-16 text-orange-400" />
             </div>
             <h2 className="text-3xl font-display font-bold text-white mb-2">
                 {isGameOver ? 'SHIFT COMPLETE' : 'SPACE PIZZA'}
             </h2>
             
             {isGameOver ? (
               <div className="mb-6">
                 <div className="text-4xl font-bold text-yellow-400 mb-2">{score}</div>
                 <div className="flex justify-center gap-2">
                   {[...Array(3)].map((_, i) => {
                      const stars = score >= 3000 ? 3 : score >= 1500 ? 2 : score >= 500 ? 1 : 0;
                      return <Star key={i} className={`w-8 h-8 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}`} />;
                   })}
                 </div>
               </div>
             ) : (
               <div className="text-slate-300 mb-6 text-left space-y-2">
                 <p>1. Use <b>+</b> and <b>-</b> to cut the pizza into the correct number of slices (Denominator).</p>
                 <p>2. Tap slices to add toppings (Numerator).</p>
                 <p>3. Serve the order!</p>
               </div>
             )}

             <button onClick={startGame} className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl transition-colors mb-4 shadow-lg">
               {isGameOver ? 'PLAY AGAIN' : 'START SHIFT'}
             </button>
             <button onClick={onExit} className="text-slate-400 hover:text-white">Exit</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default FractionFactory;