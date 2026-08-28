import React from 'react';
import { Check, Loader2, Circle } from 'lucide-react';
import { PipelineStage as IPipelineStage } from '../../types';

interface PipelineStageProps {
  stage: IPipelineStage;
  isLast: boolean;
  stepNumber: number;
}

export const PipelineStageNode: React.FC<PipelineStageProps> = ({
  stage,
  isLast,
  stepNumber,
}) => {
  const isCompleted = stage.status === 'completed';
  const isActive = stage.status === 'active';

  return (
    <div className="relative flex items-start gap-3.5 group">
      {/* Node indicator & Vertical Connector */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
            isCompleted
              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
              : isActive
              ? 'bg-violet-600 text-white ring-4 ring-violet-100 shadow-glow-purple animate-pulse'
              : 'bg-slate-100 text-slate-400 border border-slate-200'
          }`}
        >
          {isCompleted ? (
            <Check className="w-4 h-4 stroke-[2.5]" />
          ) : isActive ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Circle className="w-3 h-3 text-slate-300 fill-slate-300" />
          )}
        </div>

        {/* Vertical Connector Line */}
        {!isLast && (
          <div
            className={`w-0.5 h-12 my-1 transition-colors ${
              isCompleted
                ? 'bg-gradient-to-b from-emerald-500 to-violet-500'
                : 'bg-slate-200'
            }`}
          />
        )}
      </div>

      {/* Stage Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              {stepNumber}. {stage.name}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
              {isCompleted ? 'Completed' : 'Pending'}
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            {stage.duration_ms}ms
          </span>
        </div>

        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          {stage.summary}
        </p>
      </div>
    </div>
  );
};
