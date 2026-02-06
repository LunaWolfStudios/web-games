import React, { useState } from 'react';
import { ViewState, GameType, PlayerStats, DialogueOption, GameResult, Mentor } from './types';
import { DIALOGUE_TREE, LEVELS, INSIGHTS, MENTORS } from './constants';
import { ChatHub } from './components/ChatHub';
import { CharacterSelect } from './components/CharacterSelect';
import { DropSortGame } from './components/MiniGames/DropSortGame';
import { BinarySortGame } from './components/MiniGames/BinarySortGame';
import { MatchingGame } from './components/MiniGames/MatchingGame';
import { Journal } from './components/Journal';
import { InsightUnlock } from './components/UI/InsightUnlock';
import { StarUnlock } from './components/UI/StarUnlock';
import { AfterActionReport } from './components/UI/AfterActionReport';
import { FinalSummary } from './components/UI/FinalSummary';
import { Star, Book, Trophy } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<ViewState>('INTRO');
  const [currentDialogueId, setCurrentDialogueId] = useState<string>('start');
  const [stats, setStats] = useState<PlayerStats>({ score: 0, stars: 0, insights: [] });
  const [showJournal, setShowJournal] = useState(false);
  const [activeGameConfig, setActiveGameConfig] = useState<GameType | null>(null);
  const [justUnlockedInsight, setJustUnlockedInsight] = useState<string | null>(null);
  const [justUnlockedStar, setJustUnlockedStar] = useState<number | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<Mentor>(MENTORS[0]); // Default
  
  // Store result to show AAR
  const [lastGameResult, setLastGameResult] = useState<GameResult | null>(null);

  // --- Helpers ---
  
  const calculateStars = (insightCount: number) => Math.min(3, Math.floor(insightCount / 3));

  // --- Handlers ---

  const handleStartIntro = () => {
    setView('CHARACTER_SELECT');
  };

  const handleMentorSelect = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setView('CHAT');
  };

  const handleDialogueOption = (option: DialogueOption) => {
    if (option.triggerGame) {
      setActiveGameConfig(option.triggerGame);
      setView('MINIGAME');
      return;
    }

    // SPECIAL: Check for Summary Trigger
    if (option.nextId === 'SUMMARY_SCREEN') {
        setView('SUMMARY');
        return;
    }

    const nextNode = DIALOGUE_TREE[option.nextId];
    if (nextNode) {
      if (nextNode.unlockInsightId && !stats.insights.includes(nextNode.unlockInsightId)) {
        triggerUnlock(nextNode.unlockInsightId);
      }
      setCurrentDialogueId(option.nextId);
    }
  };

  const handleGameComplete = (result: GameResult) => {
    setLastGameResult(result);
    
    setStats(prev => ({ 
      ...prev, 
      score: prev.score + result.score 
    }));

    if (result.insightRewardId && !stats.insights.includes(result.insightRewardId)) {
        triggerUnlock(result.insightRewardId);
    }

    // Go to AAR instead of Chat immediately
    setView('AAR');
  };

  const handleAARContinue = () => {
    if (lastGameResult) {
      setCurrentDialogueId(lastGameResult.nextDialogueId);
    }
    setLastGameResult(null);
    setActiveGameConfig(null);
    setView('CHAT');
  };

  const triggerUnlock = (insightId: string) => {
    setStats(prev => {
      const newInsights = [...prev.insights, insightId];
      const newStarCount = calculateStars(newInsights.length);
      
      // Trigger Star Popup if we gained a star
      if (newStarCount > prev.stars) {
          setJustUnlockedStar(newStarCount);
      }

      return {
        ...prev,
        insights: newInsights,
        stars: newStarCount
      };
    });
    setJustUnlockedInsight(insightId);
  };

  const handlePlayAgain = () => {
    setStats({ score: 0, stars: 0, insights: [] });
    setCurrentDialogueId('start');
    setView('INTRO');
  };

  // --- Render ---

  return (
    <div className="h-screen w-full bg-slate-100 text-gray-800 flex flex-col font-body">
      
      {/* --- Overlay: Insight Unlock --- */}
      {justUnlockedInsight && (
        <InsightUnlock 
          insight={INSIGHTS[justUnlockedInsight]} 
          onDismiss={() => setJustUnlockedInsight(null)} 
        />
      )}

      {/* --- Overlay: Star Level Up --- */}
      {justUnlockedStar && (
        <StarUnlock 
          starCount={justUnlockedStar} 
          onDismiss={() => setJustUnlockedStar(null)} 
        />
      )}

      {/* --- Top Bar --- */}
      {/* Visible during Chat, Minigame (optional), AAR, and Summary (per user request) */}
      {(view !== 'INTRO' && view !== 'CHARACTER_SELECT') && (
        <header className="bg-white/80 backdrop-blur-md p-3 md:p-4 shadow-sm flex items-center justify-between z-40 sticky top-0 border-b border-gray-100">
          <div className="flex items-center gap-2">
             <div className="bg-brand-primary text-white px-3 py-1 rounded-xl font-display font-bold text-lg shadow-sm">
                LifeQuest
             </div>
             {/* Score Display */}
             <div className="flex items-center gap-1 ml-2 text-brand-primary font-bold bg-indigo-50 px-3 py-1 rounded-lg">
                <Trophy size={16} />
                <span>{stats.score}</span>
             </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6 flex-1 justify-end max-w-md">
            {/* Stars */}
            <div className="flex gap-1 bg-gray-100 rounded-full px-3 py-1">
              {[1, 2, 3].map((star) => (
                <Star 
                  key={star} 
                  size={20} 
                  className={`${star <= stats.stars ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            
            {/* Journal Button */}
            <button 
              onClick={() => setShowJournal(true)}
              className="relative p-2 text-brand-primary hover:bg-indigo-50 rounded-full transition-colors"
              aria-label="Open Journal"
            >
              <Book size={26} />
              {stats.insights.length > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>
          </div>
        </header>
      )}

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-hidden relative">
        
        {view === 'INTRO' && (
          <div className="h-full flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-purple-500 to-pink-500 text-white text-center">
            <div className="animate-float mb-8 text-9xl filter drop-shadow-2xl">
               🚀
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 drop-shadow-lg tracking-tight">LifeQuest</h1>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 max-w-lg mb-12">
                <p className="text-xl md:text-2xl font-semibold leading-relaxed">
                Your adventure into adulthood starts here. <br/>Master real-life skills and level up!
                </p>
            </div>
            <button 
              onClick={handleStartIntro}
              className="bg-brand-accent hover:bg-yellow-400 text-white text-2xl font-bold py-4 px-16 rounded-full shadow-2xl transform transition hover:scale-105 active:scale-95 border-4 border-white/30"
            >
              Start Adventure
            </button>
          </div>
        )}

        {view === 'CHARACTER_SELECT' && (
            <CharacterSelect onSelect={handleMentorSelect} />
        )}

        {view === 'CHAT' && (
          <ChatHub 
            dialogue={DIALOGUE_TREE[currentDialogueId]} 
            onOptionSelect={handleDialogueOption} 
            playerStats={stats}
            mentor={selectedMentor}
          />
        )}

        {view === 'AAR' && lastGameResult && (
          <AfterActionReport result={lastGameResult} onContinue={handleAARContinue} />
        )}

        {view === 'SUMMARY' && (
          <FinalSummary 
            stats={stats} 
            onPlayAgain={handlePlayAgain} 
            onOpenJournal={() => setShowJournal(true)}
          />
        )}

        {view === 'MINIGAME' && activeGameConfig && LEVELS[activeGameConfig] && (
           <>
              {LEVELS[activeGameConfig].type === 'DROP_SORT' && (
                <DropSortGame 
                  levelData={LEVELS[activeGameConfig] as any} 
                  onComplete={handleGameComplete} 
                />
              )}
              {LEVELS[activeGameConfig].type === 'BINARY_SORT' && (
                <BinarySortGame 
                  levelData={LEVELS[activeGameConfig] as any} 
                  onComplete={handleGameComplete} 
                />
              )}
              {LEVELS[activeGameConfig].type === 'MATCHING' && (
                <MatchingGame 
                  levelData={LEVELS[activeGameConfig] as any} 
                  onComplete={handleGameComplete} 
                />
              )}
           </>
        )}
      </main>

      {/* --- Journal Modal --- */}
      {showJournal && (
        <Journal 
          unlockedIds={stats.insights} 
          onClose={() => setShowJournal(false)} 
        />
      )}

    </div>
  );
};

export default App;
