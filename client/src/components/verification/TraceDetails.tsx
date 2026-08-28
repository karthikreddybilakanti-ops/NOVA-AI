import React, { useState } from 'react';
import { Shield, Clock, FileText, Code2, Copy, Check } from 'lucide-react';
import { TraceRecord } from '../../types';
import { Badge } from '../common/Badge';
import { DetectionCard } from './DetectionCard';
import { DecisionCard } from './DecisionCard';
import { SanitizedPrompt } from './SanitizedPrompt';
import { ResponsePanel } from './ResponsePanel';

interface TraceDetailsProps {
  trace: TraceRecord | null;
}

export const TraceDetails: React.FC<TraceDetailsProps> = ({ trace }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'json'>('overview');
  const [copiedTrace, setCopiedTrace] = useState(false);

  if (!trace) {
    return (
      <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 items-center justify-center text-center text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
          <FileText className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700">No request selected.</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
          Select any request from the live feed to inspect its full privacy trace, detections, decisions, and AI output.
        </p>
      </div>
    );
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(trace, null, 2));
    setCopiedTrace(true);
    setTimeout(() => setCopiedTrace(false), 2000);
  };

  const date = new Date(trace.timestamp);
  const timeFormatted = date.toLocaleString();

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-sm font-mono font-bold text-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                {trace.trace_id}
              </h3>
              <Badge
                variant={trace.status === 'sanitized' ? 'warning' : 'success'}
                size="sm"
              >
                {trace.status === 'sanitized' ? 'Sanitized' : 'Pass-through'}
              </Badge>
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono mt-0.5">
              <Clock className="w-3 h-3" />
              {timeFormatted} • Total Latency: {trace.latency_ms}ms
            </span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inspector
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'json'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw JSON</span>
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {activeTab === 'json' ? (
          <div className="relative">
            <button
              onClick={handleCopyJson}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1 shadow z-10"
            >
              {copiedTrace ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed max-h-[600px]">
              {JSON.stringify(trace, null, 2)}
            </pre>
          </div>
        ) : (
          <>
            {/* 0. Intent & Task Analysis Banner */}
            {trace.intent && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/80 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-violet-700 uppercase tracking-wider">
                    Task Intent & Problem Analysis
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-violet-200/70 text-violet-900">
                    {trace.intent}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  {trace.intent_summary || 'Task intent analyzed by privacy engine before sensitive minimization.'}
                </p>
              </div>
            )}

            {/* 1. Original & Sanitized Prompts */}
            <div className="space-y-2">
              <SanitizedPrompt
                rawPrompt={trace.raw_prompt}
                sanitizedPrompt={trace.sanitized_prompt}
                detections={trace.detections}
              />
            </div>

            {/* 2. Detected Information */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Detected Entities ({trace.detections.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  Deterministic & Pattern Scanners
                </span>
              </div>
              <DetectionCard detections={trace.detections} />
            </div>

            {/* 3. Necessity Evaluation & Decisions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Necessity Decisions ({trace.necessity_decisions.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  Task Relevance Engine
                </span>
              </div>
              <DecisionCard decisions={trace.necessity_decisions} />
            </div>

            {/* 4. AI Response Panel */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <ResponsePanel
                response={trace.response}
                model={trace.model}
                latencyMs={trace.latency_ms}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
