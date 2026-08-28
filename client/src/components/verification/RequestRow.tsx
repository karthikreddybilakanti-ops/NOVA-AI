import { ShieldAlert, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { TraceRecord } from '../../types';
import { Badge } from '../common/Badge';

interface RequestRowProps {
  trace: TraceRecord;
  isSelected: boolean;
  onSelect: (trace: TraceRecord) => void;
}

export const RequestRow: React.FC<RequestRowProps> = ({ trace, isSelected, onSelect }) => {
  const date = new Date(trace.timestamp);
  const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const detectedCount = trace.metrics.detectedCount;
  const removedCount = trace.metrics.removedCount;

  return (
    <button
      onClick={() => onSelect(trace)}
      className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-2 ${
        isSelected
          ? 'bg-violet-50/80 border-violet-400 shadow-sm ring-1 ring-violet-400'
          : 'bg-white hover:bg-slate-50/90 border-slate-200/80'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {detectedCount > 0 ? (
            <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="font-mono text-xs font-bold text-slate-900">
            {trace.trace_id}
          </span>
        </div>

        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
          <Clock className="w-3 h-3" />
          {timeFormatted}
        </span>
      </div>

      <p className="text-xs text-slate-600 line-clamp-1 font-normal">
        "{trace.raw_prompt}"
      </p>

      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {detectedCount > 0 ? (
            <Badge variant="warning" size="sm">
              {removedCount} removed / {detectedCount} detected
            </Badge>
          ) : (
            <Badge variant="success" size="sm">
              Clean Prompt
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
          <span>{trace.latency_ms}ms</span>
          <ArrowRight className={`w-3 h-3 ${isSelected ? 'text-violet-600' : 'text-slate-300'}`} />
        </div>
      </div>
    </button>
  );
};
