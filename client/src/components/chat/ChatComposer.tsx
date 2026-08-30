import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Paperclip,
  Mic,
  MicOff,
  FileText,
  FileCode,
  Image as ImageIcon,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { NovaModelId } from '../../types';
import { uploadFileApi, UploadedAttachment } from '../../services/api';

interface ChatComposerProps {
  onSend: (prompt: string, attachment?: UploadedAttachment | null) => void;
  isLoading: boolean;
  modelId: NovaModelId;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSend,
  isLoading,
  modelId: _modelId,
}) => {
  const [prompt, setPrompt] = useState('');
  const [attachment, setAttachment] = useState<UploadedAttachment | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [prompt]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const isSubmittingRef = useRef(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isLoading || isUploading || isSubmittingRef.current) return;

    if (!prompt.trim()) {
      if (attachment) {
        setUploadError('Please enter a message about the attachment.');
      }
      return;
    }
    
    isSubmittingRef.current = true;
    const textToSend = prompt.trim();
    const attachToSend = attachment;

    setPrompt('');
    setAttachment(null);
    setUploadError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    onSend(textToSend, attachToSend);

    // Release lock after short debounce
    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 400);
  };

  // 1. File Attachment Handling
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadError(null);
    setIsUploading(true);

    try {
      const uploaded = await uploadFileApi(file);
      setAttachment(uploaded);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload attachment.');
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be chosen again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setUploadError(null);
  };

  // 2. Microphone / Voice Input via Web Speech API
  const handleToggleVoice = () => {
    setVoiceNotice(null);

    // Check browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // Store initial text before voice starts
      const initialBasePrompt = prompt.trim();
      let accumulatedFinal = '';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalChunk += res[0].transcript + ' ';
          } else {
            interimChunk += res[0].transcript;
          }
        }

        accumulatedFinal = finalChunk.trim();
        const currentInterim = interimChunk.trim();

        let updated = initialBasePrompt;
        if (accumulatedFinal) {
          updated = updated ? `${updated} ${accumulatedFinal}` : accumulatedFinal;
        }
        if (currentInterim) {
          updated = updated ? `${updated} ${currentInterim}` : currentInterim;
        }

        setPrompt(updated);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceNotice('Microphone access denied. Please enable microphone permissions in your browser.');
        } else {
          setVoiceNotice(`Speech recognition issue: ${event.error}`);
        }
        setIsListening(false);
        setTimeout(() => setVoiceNotice(null), 4500);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setVoiceNotice('Could not start microphone. Please check browser permissions.');
      setIsListening(false);
      setTimeout(() => setVoiceNotice(null), 4000);
    }
  };

  const getFileIcon = (mimeType: string, name: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-emerald-600" />;
    if (name.endsWith('.cpp') || name.endsWith('.py') || name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.json')) {
      return <FileCode className="w-4 h-4 text-purple-600" />;
    }
    return <FileText className="w-4 h-4 text-violet-600" />;
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 pb-4">
      {/* Hidden file picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.txt,.csv,.doc,.docx,.json,.md,.png,.jpg,.jpeg,.webp,.cpp,.py,.js,.ts,.html,.css"
      />

      {/* Voice Warning Notice if unsupported or denied */}
      {voiceNotice && (
        <div className="mb-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{voiceNotice}</span>
        </div>
      )}

      {/* Upload Error Alert */}
      {uploadError && (
        <div className="mb-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      <div className="relative rounded-3xl bg-white border border-slate-200/90 shadow-soft-lg transition-all focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-50">
        {/* Attached File Preview Chip */}
        {(attachment || isUploading) && (
          <div className="px-4 pt-3.5 pb-1 flex flex-wrap items-center gap-2">
            {isUploading ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-700">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-600" />
                <span>Uploading and extracting file content...</span>
              </div>
            ) : attachment ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 shadow-2xs">
                {getFileIcon(attachment.mimeType, attachment.originalName)}
                <span className="font-semibold max-w-[200px] truncate">{attachment.originalName}</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  ({(attachment.sizeBytes / 1024).toFixed(1)} KB)
                </span>
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="p-0.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors ml-1"
                  aria-label="Remove attachment"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            attachment
              ? `Ask anything about "${attachment.originalName}"...`
              : 'Ask anything...'
          }
          rows={1}
          className="w-full bg-transparent px-5 pt-3.5 pb-12 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none resize-none min-h-[54px] max-h-[180px]"
        />

        {/* Bottom Actions Row */}
        <div className="absolute left-3 bottom-2.5 right-3 flex items-center justify-between pointer-events-none">
          {/* Left Actions: Attachment & Voice Input */}
          <div className="flex items-center gap-1 pointer-events-auto">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={handleAttachmentClick}
              disabled={isLoading || isUploading}
              className="p-2 rounded-xl text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors disabled:opacity-40"
              title="Attach document or image (PDF, TXT, CSV, DOCX, Code)"
              aria-label="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Microphone Button with Live Recording Pulse */}
            <button
              type="button"
              onClick={handleToggleVoice}
              disabled={isLoading}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse'
                  : 'text-slate-500 hover:text-violet-600 hover:bg-violet-50'
              }`}
              title={isListening ? 'Stop recording voice' : 'Start speech-to-text voice input'}
              aria-label={isListening ? 'Stop voice recording' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Active Model Indicator Tag */}
            <span className="hidden sm:inline-block text-[11px] font-medium text-slate-400 ml-1">
              Using <span className="text-violet-600 font-semibold">NOVA AI</span>
            </span>
          </div>

          {/* Right Action: Send Button */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading || isUploading}
              className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                prompt.trim() && !isLoading && !isUploading
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 hover:bg-violet-700 active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              ) : (
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
