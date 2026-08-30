import React, { useState } from 'react';
import { Sparkles, User, Copy, Check, ThumbsUp, ThumbsDown, RotateCw, Code, Paperclip } from 'lucide-react';
import { ChatMessage } from '../../types';

interface ChatMessageItemProps {
  message: ChatMessage;
  onRegenerate?: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, onRegenerate }) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);
  const isAI = message.role === 'assistant';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Robust Markdown & Code Blocks Formatter
  const renderFormattedContent = (content: string) => {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderTextSegment(content.substring(lastIndex, match.index), `txt-${lastIndex}`));
      }

      const lang = match[1] || 'code';
      const code = match[2];
      parts.push(
        <CodeBlock key={`code-${match.index}`} language={lang} code={code} />
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(renderTextSegment(content.substring(lastIndex), `txt-tail`));
    }

    return parts;
  };

  const renderTextSegment = (text: string, keyPrefix: string) => {
    const lines = text.split('\n');
    return (
      <div key={keyPrefix} className="space-y-2.5 leading-relaxed text-slate-800 text-sm sm:text-base">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-slate-900 text-base sm:text-lg mt-3 mb-1">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-extrabold text-slate-900 text-lg sm:text-xl mt-4 mb-2">
                {line.replace('## ', '')}
              </h3>
            );
          }
          if (line.startsWith('# ')) {
            return (
              <h2 key={idx} className="font-extrabold text-slate-900 text-xl sm:text-2xl mt-4 mb-2">
                {line.replace('# ', '')}
              </h2>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-violet-600 font-bold">•</span>
                <span>{formatInline(line.substring(2))}</span>
              </div>
            );
          }
          if (/^\d+\.\s/.test(line)) {
            const num = line.match(/^\d+\./)?.[0];
            const rest = line.replace(/^\d+\.\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-violet-700 font-semibold text-xs mt-1">{num}</span>
                <span>{formatInline(rest)}</span>
              </div>
            );
          }
          if (line.trim() === '---') {
            return <hr key={idx} className="border-slate-200 my-4" />;
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx}>{formatInline(line)}</p>;
        })}
      </div>
    );
  };

  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\$\$.*?\$\$)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-slate-700">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-slate-100 text-violet-700 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return (
          <span key={i} className="font-mono text-xs bg-violet-50 text-violet-800 px-2 py-0.5 rounded">
            {part.slice(2, -2)}
          </span>
        );
      }
      return part;
    });
  };

  // User Message Layout
  if (!isAI) {
    return (
      <div className="flex justify-end my-4">
        <div className="flex items-start gap-2.5 max-w-2xl">
          <div className="space-y-2">
            {message.attachment && (
              <div className="flex flex-col gap-1.5 p-2 rounded-2xl bg-violet-600/30 backdrop-blur-md border border-white/20 text-white text-xs font-medium max-w-sm ml-auto">
                {message.attachment.mimeType?.startsWith('image/') && message.attachment.url ? (
                  <img
                    src={message.attachment.url}
                    alt={message.attachment.originalName}
                    className="max-h-44 w-auto rounded-xl object-cover border border-white/10"
                  />
                ) : null}
                <div className="flex items-center gap-1.5 px-1 py-0.5">
                  <Paperclip className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span className="truncate">{message.attachment.originalName}</span>
                  {message.attachment.size && (
                    <span className="text-[10px] opacity-75 shrink-0 ml-auto">
                      ({(message.attachment.size / 1024).toFixed(0)} KB)
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-sm text-sm sm:text-base leading-relaxed break-words">
              {message.content}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 shrink-0 mt-0.5">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message Layout
  return (
    <div className="flex justify-start my-6">
      <div className="flex items-start gap-3 max-w-3xl w-full">
        {/* Assistant Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>

        {/* Content Card */}
        <div className="flex-1 rounded-2xl bg-white border border-slate-200/80 shadow-soft p-4 sm:p-5">
          <div className="space-y-3">
            {renderFormattedContent(message.content)}
          </div>

          {/* Action Toolbar */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleCopy(message.content)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                title="Copy full response"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setFeedback(feedback === 'liked' ? null : 'liked')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  feedback === 'liked'
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                }`}
                title="Good response"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setFeedback(feedback === 'disliked' ? null : 'disliked')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  feedback === 'disliked'
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                }`}
                title="Poor response"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                  title="Regenerate response"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>

            <span className="text-[11px] text-slate-400 font-medium">
              NOVA AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Syntax Highlighted / Copyable Code Block
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 shadow-md">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <Code className="w-3.5 h-3.5 text-violet-400" />
          <span>{language || 'code'}</span>
        </span>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          {codeCopied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[11px]">Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed text-slate-200">
        {code.trim()}
      </pre>
    </div>
  );
};
