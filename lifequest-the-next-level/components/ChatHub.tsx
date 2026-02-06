import React, { useState, useEffect, useRef } from 'react';
import { DialogueNode, DialogueOption, BackgroundType, Mentor } from '../types';
import { Button } from './UI/Button';
import { ArrowRight, User } from 'lucide-react';

interface ChatHubProps {
  dialogue: DialogueNode;
  onOptionSelect: (option: DialogueOption) => void;
  playerStats: { stars: number, score: number };
  mentor: Mentor;
}

// Map background types to CSS styles (Gradients/Images)
const BACKGROUND_STYLES: Record<BackgroundType, string> = {
  HOME: "bg-gradient-to-b from-orange-100 to-amber-50",
  BANK: "bg-gradient-to-b from-emerald-100 to-green-50",
  KITCHEN: "bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-yellow-100 via-orange-100 to-red-100",
  BEDROOM: "bg-gradient-to-b from-indigo-100 to-purple-50",
  PARK: "bg-gradient-to-b from-sky-200 to-green-200",
  OFFICE: "bg-gradient-to-b from-gray-200 to-slate-200",
  CITY: "bg-gradient-to-b from-purple-200 to-pink-200"
};

const BACKGROUND_EMOJIS: Record<BackgroundType, string> = {
  HOME: "🏠",
  BANK: "🏦",
  KITCHEN: "🍳",
  BEDROOM: "🛏️",
  PARK: "🌳",
  OFFICE: "🏢",
  CITY: "🌆"
};

export const ChatHub: React.FC<ChatHubProps> = ({ dialogue, onOptionSelect, mentor }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const textEndRef = useRef<HTMLDivElement>(null);

  // Typewriter effect - Fixed for no cutoff
  useEffect(() => {
    setIsTyping(true);
    let i = 0;
    const speed = 25; 
    const fullText = dialogue.text;
    
    // Clear immediately to prevent ghosting
    setDisplayedText(''); 

    const timer = setInterval(() => {
      i++;
      // Use slice to get the substring from 0 to i. 
      // This prevents the "missing first letter" issue caused by charAt logic or weird rendering.
      setDisplayedText(fullText.slice(0, i));

      if (i >= fullText.length) {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [dialogue]);

  // Scroll to bottom of bubble
  useEffect(() => {
    textEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedText]);

  const bgClass = BACKGROUND_STYLES[dialogue.background] || BACKGROUND_STYLES.HOME;
  const bgEmoji = BACKGROUND_EMOJIS[dialogue.background] || "🏠";

  return (
    <div className={`flex flex-col h-full w-full relative transition-colors duration-1000 ${bgClass}`}>
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 text-9xl transform -rotate-12">{bgEmoji}</div>
        <div className="absolute bottom-20 right-10 text-9xl transform rotate-12">{bgEmoji}</div>
      </div>

      <div className="flex flex-col h-full max-w-3xl mx-auto p-4 md:p-6 relative z-10">
        
        {/* Mentor Area */}
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="relative animate-float">
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-8 border-white/80 shadow-2xl overflow-hidden bg-white">
              <img src={mentor.avatar} alt="Mentor" className="w-full h-full object-cover" />
            </div>
            {/* Status Badge */}
            <div className="absolute bottom-0 right-0 bg-white px-4 py-2 rounded-full shadow-lg text-brand-primary flex items-center gap-2 border-2 border-indigo-100">
               <User size={16} fill="currentColor" /> 
               <span className="font-bold font-display">{mentor.name}</span>
            </div>
          </div>
        </div>

        {/* Dialogue Area */}
        <div className="mt-4 backdrop-blur-md bg-white/90 rounded-3xl p-6 md:p-8 shadow-xl border border-white/50 relative animate-slide-up mx-2 mb-safe">
          {/* Triangle Tail */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[16px] border-b-white/90"></div>
          
          <div className="min-h-[5rem] flex items-start">
             <p className="text-xl md:text-2xl text-slate-800 font-body leading-relaxed font-medium">
              {displayedText}
              {isTyping && <span className="inline-block w-3 h-6 ml-1 bg-brand-primary animate-pulse align-middle rounded-sm"/>}
            </p>
          </div>
          <div ref={textEndRef} />

          {/* Action Area */}
          <div className={`mt-8 grid gap-3 transition-all duration-500 ${isTyping ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
            {dialogue.options.map((option, idx) => (
              <Button 
                key={idx} 
                variant={idx === 0 ? 'primary' : 'outline'} 
                fullWidth 
                size="lg"
                onClick={() => onOptionSelect(option)}
                className="justify-between group shadow-md"
              >
                <span>{option.text}</span>
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform opacity-70 group-hover:opacity-100" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
