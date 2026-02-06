import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DropSortLevel, DropSortItem, GameResult } from '../../types';
import { Pause, Play } from 'lucide-react';
import * as Icons from 'lucide-react';

interface DropSortGameProps {
  levelData: DropSortLevel;
  onComplete: (result: GameResult) => void;
}

export const DropSortGame: React.FC<DropSortGameProps> = ({ levelData, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [activeItem, setActiveItem] = useState<DropSortItem | null>(null);
  const [itemY, setItemY] = useState(0);
  const [itemX, setItemX] = useState(50); // percentage 0-100
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
  const [itemsQueue, setItemsQueue] = useState<DropSortItem[]>([]);
  const [gameOver, setGameOver] = useState(false);
  
  // FX
  const [floatingScore, setFloatingScore] = useState<{id: number, val: number} | null>(null);
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredBucketId, setHoveredBucketId] = useState<string | null>(null);
  
  // Stats
  const [correctItems, setCorrectItems] = useState<DropSortItem[]>([]);
  const [wrongItems, setWrongItems] = useState<DropSortItem[]>([]);

  // Refs
  const requestRef = useRef<number>(0);
  const speedRef = useRef<number>(0.06); 

  useEffect(() => {
    setItemsQueue([...levelData.items]); 
    setScore(0);
    setGameOver(false);
  }, [levelData]);

  // Game Loop
  const animate = useCallback(() => {
    if (!isPlaying || !activeItem || feedback || isDragging) return;

    setItemY(prev => {
      const next = prev + speedRef.current;
      if (next >= 100) {
        handleSortResult(false);
        return 100;
      }
      return next;
    });

    requestRef.current = requestAnimationFrame(animate);
  }, [isPlaying, activeItem, feedback, isDragging]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);

  // Spawn Item
  useEffect(() => {
    if (isPlaying && !activeItem && itemsQueue.length > 0 && !feedback && !gameOver) {
      const nextItem = itemsQueue[0];
      setItemsQueue(prev => prev.slice(1));
      setActiveItem(nextItem);
      setItemY(0);
      setItemX(50);
      speedRef.current = 0.06 + (score * 0.0005); 
    } else if (isPlaying && itemsQueue.length === 0 && !activeItem && !feedback) {
      endGame();
    }
  }, [isPlaying, activeItem, itemsQueue, feedback, gameOver, score]);

  const endGame = () => {
    setGameOver(true);
    setIsPlaying(false);
    setTimeout(() => {
      onComplete({
        score,
        maxScore: levelData.items.length * 100, 
        correctItems,
        wrongItems,
        nextDialogueId: levelData.nextDialogueId,
        insightRewardId: levelData.insightRewardId
      });
    }, 500);
  };

  // Unified Logic for Drag Release AND Click
  const handleSortAttempt = (bucketId: string) => {
    if (!activeItem || feedback) return;

    const isCorrect = activeItem.category === bucketId;
    handleSortResult(isCorrect);
  };

  const handleSortResult = (isCorrect: boolean) => {
    if (!activeItem) return;

    if (isCorrect) {
      setScore(s => s + 100);
      setFeedback('CORRECT');
      setCorrectItems(p => [...p, activeItem]);
      setFloatingScore({ id: Date.now(), val: 100 });
      setTimeout(() => setFloatingScore(null), 800);
    } else {
      setFeedback('WRONG');
      setWrongItems(p => [...p, activeItem]);
    }

    setIsDragging(false);
    setHoveredBucketId(null);
    setTimeout(() => {
      setFeedback(null);
      setActiveItem(null);
    }, 1000);
  };

  const checkCollision = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    
    // Find buckets
    const bucketElements = document.querySelectorAll('[data-bucket-id]');
    let collidedBucketId: string | null = null;

    bucketElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        collidedBucketId = el.getAttribute('data-bucket-id');
      }
    });

    if (collidedBucketId && activeItem) {
      handleSortAttempt(collidedBucketId);
    } else {
      // Released in empty space, resume falling
      setIsDragging(false);
    }
  };

  // --- Pointer Events for Dragging ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if(!activeItem || feedback) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    const yPct = ((e.clientY - containerRect.top) / containerRect.height) * 100;
    
    setItemX(xPct);
    setItemY(yPct);
    setDragPosition({ x: e.clientX, y: e.clientY });

    // Check hover state
    const bucketElements = document.querySelectorAll('[data-bucket-id]');
    let found = null;
    bucketElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        found = el.getAttribute('data-bucket-id');
      }
    });
    setHoveredBucketId(found);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    checkCollision(e.clientX, e.clientY);
  };

  // Helper to render icon
  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent size={48} /> : <span className="text-4xl">{iconName}</span>;
  };

  const startGame = () => setIsPlaying(true);

  if (gameOver) return <div className="flex items-center justify-center h-full">Finishing...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden select-none touch-none">
      {/* HUD */}
      <div className="flex justify-between items-center p-4 bg-white shadow-sm z-30">
        <div className="font-display font-bold text-xl text-gray-700">{levelData.title}</div>
        <div className="flex items-center gap-4">
          <div className="text-brand-primary font-bold">Score: {score}</div>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div 
        className="flex-1 relative bg-gradient-to-b from-blue-50 to-white" 
        ref={containerRef}
      >
        
        {/* Intro Overlay */}
        {!isPlaying && itemsQueue.length === levelData.items.length && !activeItem && (
           <div className="absolute inset-0 bg-black/40 z-40 flex items-center justify-center backdrop-blur-sm">
             <div className="bg-white p-8 rounded-3xl text-center max-w-sm mx-4 animate-pop shadow-2xl">
               <h3 className="text-2xl font-display font-bold mb-4">Drag to Sort!</h3>
               <p className="mb-6 text-gray-600">Catch the falling item and drag it (or click the buckets below) to sort!</p>
               <button 
                onClick={startGame} 
                className="bg-brand-primary text-white w-full py-4 rounded-xl font-bold text-xl hover:scale-105 transition-transform"
               >
                 Start!
               </button>
             </div>
           </div>
        )}

        {/* Falling Item */}
        {activeItem && (
          <div 
            className={`
              absolute w-40 z-50 cursor-grab active:cursor-grabbing will-change-transform
              ${isDragging ? 'scale-110 drop-shadow-[0_0_25px_rgba(79,70,229,0.5)] rotate-3' : 'drop-shadow-md'}
              transition-shadow duration-200
            `}
            style={{ 
              top: `${itemY}%`, 
              left: `${itemX}%`, 
              transform: 'translate(-50%, -50%)',
              touchAction: 'none'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div className={`
              bg-white border-4 border-gray-200 rounded-3xl p-4 text-center flex flex-col items-center gap-2 pointer-events-auto
              ${feedback === 'CORRECT' ? 'scale-0 transition-transform duration-300' : ''}
              ${feedback === 'WRONG' ? 'animate-shake border-red-500' : ''}
              ${isDragging ? 'border-brand-primary' : ''}
            `}>
              {renderIcon(activeItem.icon)}
              <span className="font-bold text-gray-800 text-lg leading-tight">{activeItem.text}</span>
            </div>
            
            {/* Floating Score FX */}
            {floatingScore && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 font-black text-2xl text-green-500 animate-slide-up whitespace-nowrap drop-shadow-sm">
                    +{floatingScore.val}
                </div>
            )}
          </div>
        )}

      </div>

      {/* Buckets */}
      <div className="h-48 flex z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {levelData.buckets.map((bucket) => {
            const isHovered = hoveredBucketId === bucket.id;
            return (
              <button
                key={bucket.id}
                data-bucket-id={bucket.id}
                onClick={() => handleSortAttempt(bucket.id)}
                className={`
                  flex-1 flex flex-col items-center justify-center gap-2 text-white transition-all relative overflow-hidden
                  ${bucket.color} 
                  opacity-90 hover:opacity-100 active:scale-95
                  ${isHovered ? 'brightness-125 scale-[1.05] z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]' : ''}
                `}
              >
                <span className="text-xl md:text-2xl font-display font-bold tracking-widest relative z-10 drop-shadow-md text-center px-2">{bucket.label}</span>
                <div className="absolute bottom-0 w-full h-4 bg-black/20"></div>
                {/* Glow hint when active item matches category? (Optional simplification) */}
              </button>
            )
        })}
      </div>
    </div>
  );
};