import React from 'react';
import { GitCommit, Activity } from 'lucide-react';
import { PipelineStageNode } from './PipelineStage';
import { TraceRecord } from '../../types';

interface PipelineVisualizerProps {
  trace: TraceRecord | null;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({ trace }) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-600" />
            <span>Processing Pipeline</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Stage-by-stage privacy execution
          </p>
        </div>

        {trace && (
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-violet-100 text-violet-800 border border-violet-200">
            {trace.trace_id}
          </span>
        )}
      </div>

      {/* Stages Display or Empty State */}
      <div className="flex-1 overflow-y-auto p-5">
        {!trace ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
              <GitCommit className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No active trace selected.</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Select a request from the feed or submit a new question on the User Site to visualize the pipeline.
            </p>
          </div>
        ) : (
          <div className="py-2">
            {trace.stages.map((stage, idx) => (
              <PipelineStageNode
                key={stage.name}
                stage={stage}
                stepNumber={idx + 1}
                isLast={idx === trace.stages.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
