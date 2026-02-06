import React from 'react';
import { Mentor } from '../types';
import { MENTORS } from '../constants';
import { Button } from './UI/Button';
import { Check } from 'lucide-react';

interface CharacterSelectProps {
  onSelect: (mentor: Mentor) => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelect }) => {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const handleConfirm = () => {
    const mentor = MENTORS.find(m => m.id === selectedId);
    if (mentor) onSelect(mentor);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-slate-50 animate-slide-up overflow-hidden">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-display font-bold text-gray-800">Choose Your Coach</h2>
        <p className="text-gray-500">Who will guide you on this journey?</p>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20">
        {MENTORS.map((mentor) => {
          const isSelected = selectedId === mentor.id;
          return (
            <div 
              key={mentor.id}
              onClick={() => setSelectedId(mentor.id)}
              className={`
                relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4 group
                ${isSelected 
                  ? 'border-brand-primary bg-indigo-50 shadow-md scale-[1.02]' 
                  : 'border-white bg-white hover:border-indigo-200 shadow-sm'}
              `}
            >
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className={`font-display font-bold text-lg ${isSelected ? 'text-brand-primary' : 'text-gray-800'}`}>
                    {mentor.name}
                </h3>
                <p className="text-sm text-gray-500">{mentor.bio}</p>
              </div>
              
              {isSelected && (
                <div className="absolute top-4 right-4 bg-brand-primary text-white p-1 rounded-full animate-pop">
                  <Check size={16} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-gray-200">
        <div className="max-w-md mx-auto">
          <Button 
            fullWidth 
            size="lg" 
            onClick={handleConfirm}
            disabled={!selectedId}
          >
            Start Adventure
          </Button>
        </div>
      </div>
    </div>
  );
};
