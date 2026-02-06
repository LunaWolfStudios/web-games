import React, { useEffect, useState } from 'react';
import { Star, Sparkles } from 'lucide-react';

interface StarUnlockProps {
  starCount: number;
  onDismiss: () => void;
}

export const StarUnlock: React.FC<StarUnlockProps> = ({ starCount, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setVisible(true), 100);
    // Auto dismiss after 3 seconds
    const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 500); // Wait for exit animation
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const ranks = ["Beginner", "Explorer", "Life Hero", "Legend"];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
      <div 
        className={`
          relative bg-white/90 backdrop-blur-xl border-4 border-yellow-300 w-full max-w-sm p-8 rounded-3xl shadow-[0_0_50px_rgba(250,204,21,0.5)] flex flex-col items-center text-center
          transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) pointer-events-auto
          ${visible ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 -rotate-12'}
        `}
      >
        {/* Burst Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>

        <div className="relative mb-6">
            <Star size={100} className="text-yellow-400 fill-yellow-400 animate-spin-slow drop-shadow-lg" />
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-black text-white drop-shadow-md">{starCount}</span>
            </div>
            {/* Sparkles */}
            <div className="absolute -top-4 -right-4 text-yellow-300 animate-bounce"><Sparkles size={32} /></div>
            <div className="absolute bottom-0 -left-6 text-orange-300 animate-pulse"><Sparkles size={24} /></div>
        </div>

        <h3 className="text-brand-primary font-display font-bold text-2xl uppercase tracking-widest mb-1 animate-slide-up">Level Up!</h3>
        <p className="text-gray-600 font-bold text-lg mb-4">You are now a {ranks[starCount] || "Hero"}!</p>

        <button 
          onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
          className="bg-yellow-400 text-yellow-900 font-bold py-2 px-6 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
};
