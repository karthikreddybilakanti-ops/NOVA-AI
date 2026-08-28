import React from 'react';
import { NecessityDecision } from '../../types';
import { Badge } from '../common/Badge';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

interface DecisionCardProps {
  decisions: NecessityDecision[];
}

export const DecisionCard: React.FC<DecisionCardProps> = ({ decisions }) => {
  if (!decisions.length) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>No necessity decisions were needed for this request.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {decisions.map((decision) => {
        const isUnnecessary = decision.decision === 'UNNECESSARY';

        return (
          <div
            key={decision.entityId}
            className={`p-3.5 rounded-xl border transition-all ${
              isUnnecessary
                ? 'bg-rose-50/40 border-rose-200/80'
                : 'bg-emerald-50/40 border-emerald-200/80'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {isUnnecessary ? (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span className="text-xs font-bold text-slate-900">
                  {decision.category}
                </span>
              </div>

              <Badge
                variant={isUnnecessary ? 'danger' : 'success'}
                size="sm"
              >
                {isUnnecessary ? 'UNNECESSARY (Removed)' : 'REQUIRED (Preserved)'}
              </Badge>
            </div>

            <div className="bg-white/80 rounded-lg p-2 font-mono text-[11px] text-slate-700 mb-2 border border-slate-200/60 truncate">
              {decision.value}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800 font-semibold">Rationale: </strong>
              {decision.reason}
            </p>
          </div>
        );
      })}
    </div>
  );
};
