import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-16 bg-[#fafafa]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-xs font-semibold text-violet-700">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>Product Mission</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            About NOVA AI
          </h1>
          <p className="text-lg text-slate-600">
            Your privacy-first general-purpose AI assistant.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft p-8 sm:p-10 space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Our Vision</h2>
            <p>
              NOVA AI is designed to deliver a modern, powerful, and intuitive conversational AI experience — for coding, writing, research, and everyday questions — without sacrificing your personal privacy.
            </p>
          </div>

          <hr className="border-slate-100" />

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">The Two Core Pillars</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">1. General-Purpose Intelligence</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Interact naturally with state-of-the-art models for technical problem solving, creative composition, and multi-turn conversations.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">2. Invisible Privacy Layer</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Deterministic scanners and necessity engines intercept unnecessary personal data, ensuring sensitive tokens stay out of downstream models.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Core Principles</h2>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Zero Model Leakage:</strong> Unnecessary secrets, credentials, and PII are minimized before model execution.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Context-Aware Necessity:</strong> Preserves information essential to the task (e.g. names for personal bios) while stripping irrelevant data.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Uncompromised User Experience:</strong> A seamless, modern chat interface free of intrusive security warnings.</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Link to="/chat">
              <Button size="md" variant="primary" icon={<ArrowRight className="w-4 h-4 ml-1" />}>
                Open NOVA AI Chat
              </Button>
            </Link>
            <Link to="/how-it-works" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
              See How It Works →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
