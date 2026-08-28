import { ShieldCheck, Sparkles } from 'lucide-react';
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

  // Highlight detected substrings in raw prompt
  const renderHighlightedPrompt = () => {
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
          className="bg-amber-100 text-amber-900 border-b-2 border-amber-400 px-1 py-0.5 rounded font-semibold"
          title={`${d.category} (${d.confidence}%)`}
        >
          {rawPrompt.substring(d.startIndex, d.endIndex)}
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
      {/* Original Prompt */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Original User Prompt (Raw)
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {rawPrompt.length} characters
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed break-words">
          {renderHighlightedPrompt()}
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
          <span className="text-emerald-700 font-medium">
            Protected Before AI
          </span>
        )}
      </div>
    </div>
  );
};
