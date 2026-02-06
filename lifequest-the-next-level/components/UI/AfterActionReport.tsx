import React from 'react';
import { GameResult } from '../../types';
import { Button } from './Button';
import { Check, X, Award } from 'lucide-react';

interface AfterActionReportProps {
  result: GameResult;
  onContinue: () => void;
}

export const AfterActionReport: React.FC<AfterActionReportProps> = ({ result, onContinue }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden animate-slide-up">
      <div className="bg-white p-6 shadow-sm border-b border-gray-200 z-10">
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-800">Mission Report</h2>
            <p className="text-gray-500">Here is how you did</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-gray-400 uppercase">Total Score</span>
            <span className="text-3xl font-display font-bold text-brand-primary">+{result.score}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-brand-primary to-indigo-600 rounded-3xl p-6 text-white shadow-lg mb-4 flex items-center justify-between">
             <div>
               <div className="text-indigo-200 font-bold uppercase tracking-wider text-sm">Accuracy</div>
               <div className="text-4xl font-display font-bold">
                 {Math.round((result.correctItems.length / (result.correctItems.length + result.wrongItems.length)) * 100)}%
               </div>
             </div>
             <Award size={48} className="text-yellow-300" />
          </div>

          <h3 className="font-bold text-gray-700 ml-2">Breakdown</h3>

          {result.correctItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border-l-4 border-green-500 shadow-sm flex gap-4">
              <div className="bg-green-100 p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0 text-green-600">
                <Check size={20} />
              </div>
              <div>
                <div className="font-bold text-gray-800">{item.text}</div>
                <div className="text-sm text-gray-600 mt-1">{item.explanation}</div>
              </div>
            </div>
          ))}

          {result.wrongItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border-l-4 border-red-500 shadow-sm flex gap-4">
              <div className="bg-red-100 p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0 text-red-600">
                <X size={20} />
              </div>
              <div>
                <div className="font-bold text-gray-800">{item.text}</div>
                <div className="text-sm text-gray-600 mt-1">{item.explanation}</div>
              </div>
            </div>
          ))}
          
          <div className="h-20"></div> {/* Spacer */}
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto">
          <Button onClick={onContinue} fullWidth size="lg">Continue Adventure</Button>
        </div>
      </div>
    </div>
  );
};
