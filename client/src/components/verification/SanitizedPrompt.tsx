import React from 'react';
import { ShieldCheck, Sparkles, EyeOff } from 'lucide-react';
import { DetectedEntity } from '../../types';

interface SanitizedPromptProps {
  rawPrompt: string;
  sanitizedPrompt: string;
  detections: DetectedEntity[];
}

export const SanitizedPrompt: React.FC<SanitizedPromptProps> = ({
  rawPrompt,
  sanitizedPrompt,
  detections,
}) => {
  const isDifferent = rawPrompt !== sanitizedPrompt;

  // Render privacy-safe redacted view of original prompt
  const renderPrivacySafeOriginalPrompt = () => {
    if (!detections.length) {
      return <span>{rawPrompt}</span>;
    }

    let lastIndex = 0;
    const elements: React.ReactNode[] = [];
    const sorted = [...detections].sort((a, b) => a.startIndex - b.startIndex);

    sorted.forEach((d, idx) => {
      if (d.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>{rawPrompt.substring(lastIndex, d.startIndex)}</span>
        );
      }
      elements.push(
        <mark
          key={`mark-${d.id}`}
          className="bg-amber-100/90 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold"
          title={`Detected ${d.category} (${d.confidence}%) — Protected`}
        >
          [REDACTED: {d.category.toUpperCase()}]
        </mark>
      );
      lastIndex = d.endIndex;
    });

    if (lastIndex < rawPrompt.length) {
      elements.push(<span key="tail">{rawPrompt.substring(lastIndex)}</span>);
    }

    return elements;
  };

  return (
    <div className="space-y-4">
      {/* Privacy-Safe Original Prompt View */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
            Original User Prompt (Privacy-Safe View)
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {rawPrompt.length} characters
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed break-words">
          {renderPrivacySafeOriginalPrompt()}
        </div>
      </div>

      {/* Sanitized Prompt Sent to AI */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Sanitized Prompt (Sent to AI)
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {sanitizedPrompt.length} characters
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs font-mono text-slate-800 leading-relaxed break-words">
          {sanitizedPrompt}
        </div>
      </div>

      {/* Delta indicator */}
      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          <span>Status:</span>
          <strong className="text-slate-800 font-semibold">
            {isDifferent ? 'Transformed & Minimized' : 'Pass-through (No sensitive data)'}
          </strong>
        </div>
        {isDifferent && (
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Protected Before AI
          </span>
        )}
      </div>
    </div>
  );
};
