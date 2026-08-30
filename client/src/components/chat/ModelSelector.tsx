import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, Check } from 'lucide-react';
import { NovaModelConfig, NovaModelId } from '../../types';

interface ModelSelectorProps {
  models: NovaModelConfig[];
  selectedModelId: NovaModelId;
  onSelectModel: (id: NovaModelId) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModelId,
  onSelectModel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModel = models.find((m) => m.id === selectedModelId) || models[0] || {
    id: 'nova-smart',
    name: 'NOVA AI',
    tagline: 'Privacy-first general-purpose assistant',
    badge: 'Active',
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getModelIcon = (_id?: NovaModelId) => {
    return <Sparkles className="w-4 h-4 text-violet-600" />;
  };

  if (models.length <= 1) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold">
        <Sparkles className="w-4 h-4 text-violet-600" />
        <span>{selectedModel.name}</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-violet-400"
      >
        <span className="flex items-center gap-1.5">
          {getModelIcon(selectedModel.id)}
          <span>{selectedModel.name}</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-slate-200 shadow-soft-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Select Intelligence Model
            </span>
          </div>

          <div className="space-y-1 mt-1">
            {models.map((model) => {
              const isSelected = model.id === selectedModelId;
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-violet-50/80 border border-violet-200/80'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-white border border-slate-200/60 shadow-xs mt-0.5 shrink-0">
                    {getModelIcon(model.id)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {model.name}
                      </span>
                      {model.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-violet-100 text-violet-700">
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                      {model.tagline}
                    </p>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-violet-600 shrink-0 self-center" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
