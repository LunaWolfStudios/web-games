import React, { useEffect, useState } from 'react';
import { Insight } from '../../types';
import * as Icons from 'lucide-react';

interface InsightUnlockProps {
  insight: Insight;
  onDismiss: () => void;
}

export const InsightUnlock: React.FC<InsightUnlockProps> = ({ insight, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure mount animation plays
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[insight.icon] || Icons.Lightbulb;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300" onClick={onDismiss}>
      <div 
        className={`
          relative bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center
          transform transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)
          ${visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-20'}
        `}
        onClick={(e) => e.stopPropagation()} // Prevent click through
      >
        {/* Burst Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>

        {/* Icon Badge */}
        <div className="relative -mt-16 mb-6 bg-gradient-to-br from-brand-primary to-purple-600 p-6 rounded-full shadow-lg border-4 border-white animate-bounce">
          <IconComponent size={48} className="text-white" />
        </div>

        <h3 className="text-brand-accent font-display font-bold text-lg uppercase tracking-widest mb-2">Insight Unlocked!</h3>
        <h2 className="text-3xl font-display font-bold text-gray-800 mb-4">{insight.title}</h2>
        <p className="text-gray-600 leading-relaxed mb-8 font-body text-lg">{insight.description}</p>

        <button 
          onClick={onDismiss}
          className="bg-brand-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-indigo-600 hover:scale-105 transition-all"
        >
          Collect Knowledge
        </button>

        {/* Decorative sparkles */}
        <div className="absolute top-10 right-10 text-yellow-400 animate-spin-slow"><Icons.Sparkles size={24} /></div>
        <div className="absolute bottom-10 left-10 text-pink-400 animate-pulse"><Icons.Star size={24} /></div>
      </div>
    </div>
  );
};
