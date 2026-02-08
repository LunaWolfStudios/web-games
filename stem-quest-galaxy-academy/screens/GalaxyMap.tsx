import React, { useState } from 'react';
import { PlanetData, Screen } from '../types';
import { Rocket, Calculator, Zap, Lock, Star, Activity, Leaf, Trash2, Brain, Puzzle, Type, Construction } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useGame } from '../context/GameContext';

interface GalaxyMapProps {
  onNavigate: (screen: Screen) => void;
}

const PLANETS: PlanetData[] = [
  {
    id: 'meteor-math',
    name: 'Meteor Math',
    description: 'Blast meteors by solving equations!',
    icon: <Rocket className="w-8 h-8" />,
    unlockLevel: 1,
    screenTarget: 'GAME_METEOR_MATH',
    color: 'from-red-500 to-orange-600',
  },
  {
    id: 'fraction-factory',
    name: 'Space Pizza',
    description: 'Slice and serve pizzas for the crew.',
    icon: <Calculator className="w-8 h-8" />,
    unlockLevel: 1,
    screenTarget: 'GAME_FRACTION_FACTORY',
    color: 'from-green-500 to-teal-600',
  },
  {
    id: 'multi-racer',
    name: 'Multi Racer',
    description: 'Race by solving times tables.',
    icon: <Rocket className="w-8 h-8 rotate-90" />,
    unlockLevel: 1,
    screenTarget: 'GAME_MULTIPLICATION_RACER',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'gravity-lab',
    name: 'Gravity Jump',
    description: 'Adjust gravity to jump over obstacles!',
    icon: <Activity className="w-8 h-8" />,
    unlockLevel: 2,
    screenTarget: 'GAME_GRAVITY_LAB',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'ecosystem-builder',
    name: 'Ecosystem',
    description: 'Balance nature with your budget.',
    icon: <Leaf className="w-8 h-8" />,
    unlockLevel: 2,
    screenTarget: 'GAME_ECOSYSTEM_BUILDER',
    color: 'from-emerald-500 to-green-700',
  },
  {
    id: 'circuit-hero',
    name: 'Circuit Hero',
    description: 'Fix the robot wiring systems.',
    icon: <Zap className="w-8 h-8" />,
    unlockLevel: 3,
    screenTarget: 'GAME_CIRCUIT_HERO',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'logic-lock',
    name: 'Logic Lock',
    description: 'Decode the alien signals.',
    icon: <Brain className="w-8 h-8" />,
    unlockLevel: 4,
    screenTarget: 'HOME', // Placeholder
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: 'planet-patterns',
    name: 'Planet Patterns',
    description: 'Match the galactic sequences.',
    icon: <Puzzle className="w-8 h-8" />,
    unlockLevel: 5,
    screenTarget: 'HOME', // Placeholder
    color: 'from-violet-500 to-fuchsia-600',
  },
  {
    id: 'star-speller',
    name: 'Star Speller',
    description: 'Spell words to navigate the nebula.',
    icon: <Type className="w-8 h-8" />,
    unlockLevel: 6,
    screenTarget: 'HOME', // Placeholder
    color: 'from-sky-500 to-blue-700',
  },
];

const GalaxyMap: React.FC<GalaxyMapProps> = ({ onNavigate }) => {
  const { userStats, gameProgress, resetProgress } = useGame();
  const [comingSoonPlanet, setComingSoonPlanet] = useState<PlanetData | null>(null);

  const handlePlanetClick = (planet: PlanetData) => {
    if (planet.screenTarget === 'HOME') {
        setComingSoonPlanet(planet);
    } else {
        onNavigate(planet.screenTarget);
    }
  };

  return (
    <div className="absolute inset-0 overflow-y-auto z-10 scrollbar-hide">
      <div className="min-h-screen pt-28 px-4 pb-24 flex flex-col items-center">
        <TopBar />
        
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-10 duration-700 mt-4">
          <h1 className="text-4xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            GALAXY MAP
          </h1>
          <p className="text-cyan-200 text-lg md:text-xl max-w-2xl mx-auto">
            Complete missions to power up the Academy!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
          {PLANETS.map((planet, index) => {
            const isLocked = userStats.level < planet.unlockLevel;
            const progress = gameProgress[planet.id] || { stars: 0, highScore: 0, played: false };
            
            return (
              <button
                key={planet.id}
                onClick={() => !isLocked && handlePlanetClick(planet)}
                disabled={isLocked}
                className={`
                  relative group rounded-3xl p-1 transition-all duration-500 hover:scale-105 text-left
                  ${isLocked ? 'opacity-70 grayscale cursor-not-allowed' : 'hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]'}
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`
                  h-56 rounded-2xl bg-slate-800/90 backdrop-blur-md border border-slate-700 overflow-hidden flex flex-col relative
                  group-hover:border-cyan-400/50 transition-colors
                `}>
                  {/* Background Glow */}
                  <div className={`absolute -top-20 -right-20 w-56 h-56 rounded-full bg-gradient-to-br ${planet.color} opacity-20 blur-3xl group-hover:opacity-30 transition-opacity`}></div>
                  
                  <div className="p-5 flex-1 flex flex-col items-center text-center z-10">
                    <div className={`
                      w-16 h-16 rounded-full bg-gradient-to-br ${planet.color} mb-3 flex items-center justify-center shadow-lg
                      ${!isLocked && 'animate-float'}
                    `}>
                      {planet.icon}
                    </div>
                    
                    <h3 className="text-xl font-display font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                      {planet.name}
                    </h3>
                    <p className="text-sm text-slate-300 mb-3 leading-snug px-2">
                      {planet.description}
                    </p>

                    {isLocked ? (
                      <div className="mt-auto flex items-center gap-2 text-slate-400 font-bold bg-black/40 px-4 py-2 rounded-full border border-slate-700">
                        <Lock className="w-4 h-4" /> LVL {planet.unlockLevel}
                      </div>
                    ) : (
                      <div className="mt-auto w-full">
                        {progress.played ? (
                          <>
                            <div className="flex justify-center gap-1 mb-2">
                              {[1, 2, 3].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`w-5 h-5 ${star <= progress.stars ? 'fill-yellow-400 text-yellow-400 drop-shadow-md' : 'text-slate-700'}`} 
                                />
                              ))}
                            </div>
                            <div className="text-xs text-cyan-400 font-mono font-bold bg-slate-900/50 py-1 rounded-md mx-4 border border-cyan-500/20">
                              HIGH SCORE: {progress.highScore}
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-slate-500 font-mono py-2 italic">
                            NO DATA
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-12">
          <button 
              onClick={() => { if(confirm('Reset all progress?')) resetProgress() }}
              className="flex items-center gap-2 px-4 py-2 text-xs text-slate-500 hover:text-red-400 border border-transparent hover:border-red-500/30 rounded-lg transition-colors"
          >
              <Trash2 className="w-3 h-3" /> Reset Progress
          </button>
        </div>

        {/* Coming Soon Modal */}
        {comingSoonPlanet && (
            <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border-2 border-cyan-500 rounded-2xl p-8 max-w-sm w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                    <Construction className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-display font-bold text-white mb-2">Under Construction</h2>
                    <p className="text-slate-300 mb-6">
                        The Academy engineers are still building the <b>{comingSoonPlanet.name}</b> module. Check back later, Cadet!
                    </p>
                    <button 
                      onClick={() => setComingSoonPlanet(null)}
                      className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors"
                    >
                        Roger That
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default GalaxyMap;