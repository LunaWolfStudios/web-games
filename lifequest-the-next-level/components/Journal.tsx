import React from 'react';
import { Insight } from '../types';
import { INSIGHTS } from '../constants';
import * as Icons from 'lucide-react';

interface JournalProps {
  unlockedIds: string[];
  onClose: () => void;
}

export const Journal: React.FC<JournalProps> = ({ unlockedIds, onClose }) => {
  const unlockedInsights = unlockedIds.map(id => INSIGHTS[id]).filter(Boolean);

  // Helper to dynamically render Lucide icons
  const renderIcon = (iconName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent size={24} /> : <Icons.Lightbulb size={24} />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-pop">
        
        {/* Header */}
        <div className="bg-brand-primary p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <Icons.BookOpen size={28} />
            <h2 className="text-2xl font-display font-bold">My Life Journal</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <Icons.X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-brand-bg">
          {unlockedInsights.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icons.Lock size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No insights unlocked yet.</p>
              <p className="text-sm">Play more to learn new skills!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {unlockedInsights.map((insight) => (
                <div key={insight.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
                   <div className="flex items-center gap-3 text-brand-primary font-bold">
                     <div className="p-2 bg-indigo-50 rounded-lg">
                       {renderIcon(insight.icon)}
                     </div>
                     <span>{insight.title}</span>
                   </div>
                   <p className="text-gray-600 text-sm leading-relaxed">
                     {insight.description}
                   </p>
                   <div className="mt-auto pt-2">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{insight.category}</span>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
