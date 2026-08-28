import React, { useState } from 'react';
import { Copy, Check, Clock, Cpu } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ResponsePanelProps {
  response: string;
  model: string;
  latencyMs: number;
}

export const ResponsePanel: React.FC<ResponsePanelProps> = ({
  response,
  model,
  latencyMs,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Downstream AI Response
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="blue" size="sm">
            {model}
          </Badge>
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {latencyMs}ms
          </span>
        </div>
      </div>

      <div className="relative group">
        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap shadow-inner border border-slate-800">
          {response}
        </div>

        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1 shadow"
          title="Copy response"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-sans">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[10px] font-sans">Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
