import React, { useState, useRef } from 'react';
import { BinarySortLevel, BinarySortItem, GameResult } from '../../types';
import { Button } from '../UI/Button';
import { Check, X, ArrowRight, ArrowLeft } from 'lucide-react';
import * as Icons from 'lucide-react';

interface BinarySortGameProps {
  levelData: BinarySortLevel;
  onComplete: (result: GameResult) => void;
}

export const BinarySortGame: React.FC<BinarySortGameProps> = ({ levelData, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctItems, setCorrectItems] = useState<BinarySortItem[]>([]);
  const [wrongItems, setWrongItems] = useState<BinarySortItem[]>([]);
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
  
  // Drag State
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const currentItem = levelData.items[currentIndex];
  const nextItem = levelData.items[currentIndex + 1]; // Look ahead
  const isFinished = currentIndex >= levelData.items.length;

  const handleDecision = (choiceIsTrue: boolean) => {
    if (isFinished || feedback) return;

    const isCorrect = choiceIsTrue === currentItem.isTrue;

    if (isCorrect) {
      setScore(s => s + 100);
      setFeedback('CORRECT');
      setCorrectItems(prev => [...prev, currentItem]);
    } else {
      setFeedback('WRONG');
      setWrongItems(prev => [...prev, currentItem]);
    }

    // Animate fly off
    if (dragX > 0 || choiceIsTrue) {
        setDragX(1000); // Fly right
    } else {
        setDragX(-1000); // Fly left
    }

    setTimeout(() => {
      setFeedback(null);
      setDragX(0); // Reset instantly (hidden behind new card logic or transition)
      
      if (currentIndex + 1 < levelData.items.length) {
        setCurrentIndex(c => c + 1);
      } else {
        // Finish
        setCurrentIndex(c => c + 1);
        onComplete({
          score: isCorrect ? score + 100 : score, // include last point
          maxScore: levelData.items.length * 100,
          correctItems: isCorrect ? [...correctItems, currentItem] : correctItems,
          wrongItems: isCorrect ? wrongItems : [...wrongItems, currentItem],
          nextDialogueId: levelData.nextDialogueId,
          insightRewardId: levelData.insightRewardId
        });
      }
    }, 200); // Fast transition to show next card
  };

  // --- Pointer Events ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if (feedback || isFinished) return;
    setIsDragging(true);
    startX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - startX.current;
    setDragX(delta);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 100; // px to trigger decision
    if (dragX > threshold) {
        handleDecision(true); // Right
    } else if (dragX < -threshold) {
        handleDecision(false); // Left
    } else {
        setDragX(0); // Snap back
    }
  };

  // Helper to render icon
  const renderIcon = (iconName?: string) => {
    if (!iconName) return <Icons.ThumbsUp size={48} className="text-brand-primary" />;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent size={48} className="text-brand-primary" /> : <Icons.ThumbsUp size={48} className="text-brand-primary" />;
  };

  const renderCard = (item: BinarySortItem, isTop: boolean) => {
      // Rotation based on drag if it's the top card
      const rotation = isTop ? dragX * 0.05 : 0;
      const opacity = isTop ? (1 - Math.abs(dragX) / 1000) : 1;
      const transform = isTop ? `translateX(${dragX}px) rotate(${rotation}deg)` : 'scale(0.95) translateY(10px)';
      
      // Dynamic glow based on drag direction
      let shadowClass = "shadow-2xl";
      if (isTop && dragX > 50) shadowClass = "shadow-[0_0_30px_rgba(34,197,94,0.6)]"; // Green
      if (isTop && dragX < -50) shadowClass = "shadow-[0_0_30px_rgba(239,68,68,0.6)]"; // Red

      return (
        <div 
          key={item.id}
          className={`
            absolute w-full max-w-sm aspect-[3/4] bg-white rounded-3xl flex flex-col items-center justify-center p-8 text-center border-4 border-white
            ${shadowClass}
            ${isTop ? 'cursor-grab active:cursor-grabbing z-20' : 'z-10 bg-gray-50 text-gray-400 opacity-80'}
          `}
          style={{ 
              transform: transform,
              opacity: isTop ? opacity : 0.5,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out, box-shadow 0.3s ease-out'
          }}
          onPointerDown={isTop ? handlePointerDown : undefined}
          onPointerMove={isTop ? handlePointerMove : undefined}
          onPointerUp={isTop ? handlePointerUp : undefined}
        >
          <div className={`bg-indigo-50 p-6 rounded-full mb-8 pointer-events-none ${!isTop && 'grayscale opacity-50'}`}>
            {renderIcon(item.icon)}
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 leading-snug pointer-events-none">{item.text}</h3>
        </div>
      )
  };

  if (isFinished && !feedback) return <div className="flex items-center justify-center h-full">Processing...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-100 p-4 overflow-hidden relative touch-none select-none">
      {/* Header */}
      <div className="text-center py-4">
        <h2 className="text-2xl font-display font-bold text-gray-800">{levelData.title}</h2>
        <div className="text-gray-500 font-bold">Card {currentIndex + 1} of {levelData.items.length}</div>
        <div className="text-xs text-gray-400 mt-1">Swipe Left or Right</div>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        
        {/* Background Hints */}
        <div className="absolute w-full flex justify-between px-8 opacity-20 pointer-events-none z-0">
            <div className={`p-4 rounded-full bg-red-500 transform transition-transform ${dragX < -50 ? 'scale-125 opacity-100' : ''}`}>
                <ArrowLeft size={40} className="text-white" />
            </div>
            <div className={`p-4 rounded-full bg-green-500 transform transition-transform ${dragX > 50 ? 'scale-125 opacity-100' : ''}`}>
                <ArrowRight size={40} className="text-white" />
            </div>
        </div>

        <div className="relative w-full h-full flex items-center justify-center">
             {/* Bottom Card (Next) */}
             {nextItem && renderCard(nextItem, false)}
             
             {/* Top Card (Current) */}
             {currentItem && renderCard(currentItem, true)}
        </div>

        {/* Feedback Overlay */}
        {feedback === 'CORRECT' && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
             <div className="bg-green-500 text-white p-6 rounded-full shadow-lg transform scale-150 animate-pop">
               <Check size={48} />
             </div>
           </div>
        )}
        {feedback === 'WRONG' && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
             <div className="bg-red-500 text-white p-6 rounded-full shadow-lg transform scale-150 animate-pop">
               <X size={48} />
             </div>
           </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full mb-4 z-30">
        <Button 
          variant="secondary" 
          size="lg" 
          className="h-20 text-lg border-b-4 border-pink-700" 
          onClick={() => handleDecision(false)}
          disabled={!!feedback}
        >
          <ArrowLeft className="mr-2" /> {levelData.leftLabel}
        </Button>
        <Button 
          variant="primary" 
          size="lg" 
          className="h-20 text-lg border-b-4 border-indigo-800"
          onClick={() => handleDecision(true)}
          disabled={!!feedback}
        >
           {levelData.rightLabel} <ArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
};
