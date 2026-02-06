import React, { useState, useEffect } from 'react';
import { MatchingLevel, MatchingPair, GameResult } from '../../types';
import { Check } from 'lucide-react';
import * as Icons from 'lucide-react';

interface MatchingGameProps {
  levelData: MatchingLevel;
  onComplete: (result: GameResult) => void;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({ levelData, onComplete }) => {
  const [shuffledTerms, setShuffledTerms] = useState<MatchingPair[]>([]);
  const [matches, setMatches] = useState<Record<string, string>>({}); // termId -> definitionId
  const [score, setScore] = useState(0);
  
  // Interaction State
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null); // For tap-to-select
  
  // Feedback
  const [shakeId, setShakeId] = useState<string | null>(null);

  useEffect(() => {
    // Shuffle terms for bottom row
    const shuffled = [...levelData.pairs].sort(() => Math.random() - 0.5);
    setShuffledTerms(shuffled);
  }, [levelData]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggingId(id);
    setSelectedTermId(id); // Auto select on drag
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
  };

  const handleDrop = (e: React.DragEvent, definitionItem: MatchingPair) => {
    e.preventDefault();
    const termId = e.dataTransfer.getData('text/plain');
    attemptMatch(termId, definitionItem);
    setDraggingId(null);
  };

  const handleTermClick = (id: string) => {
    if (matches[id]) return; // Already matched
    if (selectedTermId === id) {
      setSelectedTermId(null);
    } else {
      setSelectedTermId(id);
    }
  };

  const handleDefClick = (defItem: MatchingPair) => {
    // If we have a selected term, try to match it
    if (selectedTermId) {
      attemptMatch(selectedTermId, defItem);
    }
  };

  const attemptMatch = (termId: string, defItem: MatchingPair) => {
    if (termId === defItem.id) {
      // Correct
      setMatches(prev => ({ ...prev, [termId]: defItem.id }));
      setScore(s => s + 100);
      setSelectedTermId(null);
      
      // Check Win
      if (Object.keys(matches).length + 1 === levelData.pairs.length) {
         setTimeout(() => {
             onComplete({
                 score: score + 100,
                 maxScore: levelData.pairs.length * 100,
                 correctItems: levelData.pairs,
                 wrongItems: [],
                 nextDialogueId: levelData.nextDialogueId,
                 insightRewardId: levelData.insightRewardId
             });
         }, 1000);
      }
    } else {
      // Wrong
      setShakeId(defItem.id);
      setSelectedTermId(null);
      setTimeout(() => setShakeId(null), 500);
    }
  };

  // Helper to render icon
  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent size={20} className="mb-1 opacity-80" /> : null;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 md:p-6 overflow-hidden">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-display font-bold text-gray-800">{levelData.title}</h2>
        <p className="text-gray-500 text-sm">Drag the Term to its Definition</p>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full gap-6">
        
        {/* TOP: DEFINITIONS (DROP ZONES) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-2 pb-4">
          {levelData.pairs.map((pair) => {
             // Check if this definition has been matched
             const matchedTermId = Object.keys(matches).find(key => matches[key] === pair.id);
             const matchedTerm = matchedTermId ? levelData.pairs.find(p => p.id === matchedTermId) : null;
             
             return (
               <div
                 key={`def-${pair.id}`}
                 onDragOver={handleDragOver}
                 onDrop={(e) => handleDrop(e, pair)}
                 onClick={() => handleDefClick(pair)}
                 className={`
                   relative p-4 rounded-xl border-2 transition-all flex items-center justify-center text-center min-h-[90px] shadow-sm
                   ${matchedTerm ? 'bg-green-50 border-green-500 border-solid' : 'bg-white border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'}
                   ${selectedTermId && !matchedTerm ? 'animate-pulse ring-2 ring-indigo-100 cursor-pointer bg-indigo-50/30' : ''}
                   ${shakeId === pair.id ? 'animate-shake border-red-500 bg-red-50' : ''}
                 `}
               >
                 {matchedTerm ? (
                    <div className="flex flex-col items-center text-green-700 animate-pop">
                        <Check size={24} className="mb-1" />
                        <span className="font-bold text-lg">{matchedTerm.text}</span>
                        <span className="text-xs opacity-70 mt-1">{pair.matchText}</span>
                    </div>
                 ) : (
                    <span className="text-gray-600 font-medium select-none pointer-events-none text-sm md:text-base leading-snug">{pair.matchText}</span>
                 )}
               </div>
             );
          })}
        </div>

        {/* BOTTOM: TERMS (DRAGGABLES) */}
        <div className="h-auto bg-gray-100 p-4 rounded-2xl flex flex-wrap gap-3 justify-center shadow-inner min-h-[120px] items-start content-start">
            {shuffledTerms.map(term => {
                const isMatched = !!matches[term.id];
                if (isMatched) return null; // Remove from pool if matched

                const isSelected = selectedTermId === term.id;

                return (
                    <div
                        key={`term-${term.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, term.id)}
                        onClick={() => handleTermClick(term.id)}
                        className={`
                            bg-gradient-to-br from-white to-gray-50 px-4 py-3 rounded-xl shadow-md border-b-4 font-bold text-brand-primary cursor-grab active:cursor-grabbing hover:-translate-y-2 hover:shadow-lg transition-all flex flex-col items-center
                            ${isSelected ? 'ring-2 ring-brand-accent border-brand-accent scale-105 from-indigo-50 to-white' : 'border-indigo-100'}
                        `}
                    >
                        {renderIcon(term.icon)}
                        <span>{term.text}</span>
                    </div>
                );
            })}
            
            {shuffledTerms.every(t => matches[t.id]) && (
                <div className="text-gray-400 font-bold italic animate-pulse">All matched!</div>
            )}
        </div>

      </div>
    </div>
  );
};
