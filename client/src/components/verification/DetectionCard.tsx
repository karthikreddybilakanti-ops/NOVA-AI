import React from 'react';
import { DetectedEntity } from '../../types';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';

interface DetectionCardProps {
  detections: DetectedEntity[];
}

export const DetectionCard: React.FC<DetectionCardProps> = ({ detections }) => {
  if (!detections.length) {
    return (
      <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-emerald-800 text-xs flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>No sensitive personal data detected in this prompt.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {detections.map((item) => (
        <div
          key={item.id}
          className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col gap-1.5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-slate-800">
                {item.category}
              </span>
            </div>

            <Badge variant="warning" size="sm">
              Confidence: {item.confidence}%
            </Badge>
          </div>

          <div className="bg-slate-50 rounded-lg p-2 font-mono text-xs text-slate-700 break-all border border-slate-200/60">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};
