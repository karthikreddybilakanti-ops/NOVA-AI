import React from 'react';
import { Sparkles } from 'lucide-react';

export const ChatEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-xl mx-auto text-center px-4 py-8 select-none">
      {/* Brand Icon */}
      <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-glow-purple mb-5">
        <Sparkles className="w-7 h-7" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
        Ask anything.
      </h2>
      <p className="text-sm text-slate-600 max-w-md leading-relaxed font-normal">
        Ask anything. NOVA AI understands your request and helps you get the answer you need.
      </p>
    </div>
  );
};
