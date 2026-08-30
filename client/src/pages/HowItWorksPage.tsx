import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  EyeOff,
  Filter,
  Minimize2,
  Bot,
  ShieldCheck,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const HowItWorksPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: 1,
      title: 'You Ask',
      icon: Search,
      badge: 'Input Phase',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      description: 'You enter any question, instruction, code snippet, image, or document freely into NOVA AI.',
      example: 'User Input: Any question, instruction, image, or document provided by the user.',
    },
    {
      step: 2,
      title: 'NOVA Understands',
      icon: EyeOff,
      badge: 'Intent & Detection Phase',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      description: 'The privacy gateway analyzes the intent of your request and detects potential sensitive information (such as credentials, financial identifiers, or personal details).',
      example: 'Analysis: Identifies user task goal & scans for sensitive data entities.',
    },
    {
      step: 3,
      title: 'Necessity Check',
      icon: Filter,
      badge: 'Necessity Engine',
      color: 'text-violet-600 bg-violet-50 border-violet-200',
      description: 'The Necessity Engine evaluates whether each detected entity is truly necessary to fulfill your request, preserving only what is required.',
      example: 'Evaluation: Determines which details are essential vs. unnecessary for the task.',
    },
    {
      step: 4,
      title: 'Minimization',
      icon: Minimize2,
      badge: 'Minimization Phase',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      description: 'Unnecessary sensitive tokens are removed or redacted, producing a clean, privacy-safe representation of your original task.',
      example: 'Minimization: Unnecessary private data is removed; semantic intent is preserved.',
    },
    {
      step: 5,
      title: 'AI Model Processing',
      icon: Bot,
      badge: 'Inference Phase',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      description: 'The AI model receives only the privacy-safe context necessary to answer your request. Unnecessary private data never reaches the downstream model.',
      example: 'Inference: AI model receives sanitized context with zero unnecessary exposure.',
    },
    {
      step: 6,
      title: 'Natural AI Answer',
      icon: ShieldCheck,
      badge: 'Delivery Phase',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      description: 'You receive a natural, accurate response tailored to your question. The entire privacy pipeline completes in milliseconds.',
      example: 'Result: High-quality AI response delivered directly to you.',
    },
  ];

  return (
    <div className="py-16 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-xs font-semibold text-violet-700 mb-4">
            <Cpu className="w-3.5 h-3.5 text-violet-600" />
            <span>Architecture & Privacy Pipeline</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            How NOVA AI Protects Your Data
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Ask anything. NOVA AI automatically prevents unnecessary sensitive information from reaching downstream AI models while delivering natural, intelligent answers.
          </p>
        </div>

        {/* 6-Step Visual Pipeline */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-12">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={s.step}
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20 border-violet-600 scale-[1.02]'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold truncate">{s.title}</span>
                <span className={`text-[10px] mt-0.5 ${isActive ? 'text-violet-100' : 'text-slate-400'}`}>
                  Stage {s.step}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Step Deep Dive Card */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-soft p-6 sm:p-10 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl border ${steps[activeStep].color}`}>
                  {React.createElement(steps[activeStep].icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">
                    {steps[activeStep].badge}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {steps[activeStep].step}. {steps[activeStep].title}
                  </h3>
                </div>
              </div>

              <p className="text-base text-slate-600 leading-relaxed">
                {steps[activeStep].description}
              </p>

              <div className="pt-2 flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">Progress:</span>
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all ${
                        i === activeStep
                          ? 'w-6 bg-violet-600'
                          : i < activeStep
                          ? 'w-2 bg-emerald-500'
                          : 'w-2 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-5 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs sm:text-sm leading-relaxed border border-slate-800 shadow-inner">
                <div className="text-slate-400 text-[11px] mb-2 uppercase tracking-wider font-bold">
                  Stage {activeStep + 1} Pipeline Logic
                </div>
                {steps[activeStep].example}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/chat">
            <Button size="lg" variant="primary" icon={<ArrowRight className="w-4 h-4 ml-1" />}>
              Open NOVA AI Chat →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
