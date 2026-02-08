import React, { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { Screen } from './types';
import StarryBackground from './components/ui/StarryBackground';
import GalaxyMap from './screens/GalaxyMap';
import MeteorMath from './games/MeteorMath';
import FractionFactory from './games/FractionFactory';
import CircuitHero from './games/CircuitHero';
import GravityLab from './games/GravityLab';
import EcosystemBuilder from './games/EcosystemBuilder';
import MultiplicationRacer from './games/MultiplicationRacer';
import LevelUpModal from './components/LevelUpModal';

const AppContent: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');

  return (
    <div className="relative h-screen w-full bg-slate-900 text-white font-sans selection:bg-cyan-500 selection:text-black flex flex-col overflow-hidden">
      {/* Background stays persistent unless inside a game that needs its own background */}
      {currentScreen === 'HOME' && <StarryBackground />}
      
      {/* Level Up Overlay - Global */}
      <LevelUpModal />

      {/* Screen Router */}
      <main className="flex-1 relative z-10 w-full h-full">
        {currentScreen === 'HOME' && (
          <GalaxyMap onNavigate={setCurrentScreen} />
        )}
        
        {currentScreen === 'GAME_METEOR_MATH' && (
          <MeteorMath onExit={() => setCurrentScreen('HOME')} />
        )}

        {currentScreen === 'GAME_FRACTION_FACTORY' && (
          <FractionFactory onExit={() => setCurrentScreen('HOME')} />
        )}

        {currentScreen === 'GAME_CIRCUIT_HERO' && (
           <CircuitHero onExit={() => setCurrentScreen('HOME')} />
        )}

        {currentScreen === 'GAME_GRAVITY_LAB' && (
           <GravityLab onExit={() => setCurrentScreen('HOME')} />
        )}

        {currentScreen === 'GAME_ECOSYSTEM_BUILDER' && (
           <EcosystemBuilder onExit={() => setCurrentScreen('HOME')} />
        )}

        {currentScreen === 'GAME_MULTIPLICATION_RACER' && (
           <MultiplicationRacer onExit={() => setCurrentScreen('HOME')} />
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;