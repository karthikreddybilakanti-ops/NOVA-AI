import React, { useState } from 'react';
import { Search, Inbox, RefreshCw, Trash2 } from 'lucide-react';
import { TraceRecord } from '../../types';
import { RequestRow } from './RequestRow';

interface RequestListProps {
  traces: TraceRecord[];
  selectedTrace: TraceRecord | null;
  onSelectTrace: (trace: TraceRecord) => void;
  onRefresh: () => void;
  onClear: () => void;
  isLoading: boolean;
}

export const RequestList: React.FC<RequestListProps> = ({
  traces,
  selectedTrace,
  onSelectTrace,
  onRefresh,
  onClear,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTraces = traces.filter(
    (t) =>
      t.trace_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.raw_prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sanitized_prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Live Requests Feed</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
              {traces.length}
            </span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Real incoming requests from User AI
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Refresh feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {traces.length > 0 && (
            <button
              onClick={onClear}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              title="Clear all traces"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Trace ID or prompt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-violet-400"
          />
        </div>
      </div>

      {/* Request List Feed or Empty State */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {traces.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No requests yet.</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Ask any question on the User AI Site to generate real live processing traces.
            </p>
          </div>
        ) : filteredTraces.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No matching requests found for "{searchTerm}"
          </div>
        ) : (
          filteredTraces.map((trace) => (
            <RequestRow
              key={trace.trace_id}
              trace={trace}
              isSelected={selectedTrace?.trace_id === trace.trace_id}
              onSelect={onSelectTrace}
            />
          ))
        )}
      </div>
    </div>
  );
};
