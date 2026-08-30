import React from 'react';
import { Sparkles } from 'lucide-react';
import { NovaModelConfig, NovaModelId } from '../../types';

interface ModelSelectorProps {
  models?: NovaModelConfig[];
  selectedModelId?: NovaModelId;
  onSelectModel?: (id: NovaModelId) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = () => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold shadow-xs">
      <Sparkles className="w-4 h-4 text-violet-600" />
      <span>NOVA AI</span>
    </div>
  );
};
