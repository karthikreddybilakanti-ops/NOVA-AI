import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Zap,
  Code2,
  BookOpen,
  Compass,
  Lightbulb,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        {/* Subtle background gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-violet-200/40 via-indigo-100/20 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-violet-200 shadow-xs text-xs font-semibold text-violet-800 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>Next-Generation Intelligence Assistant</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] max-w-4xl mx-auto mb-6"
          >
            Ask anything. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600">
              Get intelligent answers.
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto mb-10"
          >
            A general-purpose AI assistant for learning, coding, writing, research, analysis, and everyday questions.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link to={isAuthenticated ? '/chat' : '/signup'}>
              <Button
                size="lg"
                variant="primary"
                className="px-8 py-3.5 text-base font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35"
                icon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Start chatting →
              </Button>
            </Link>

            <a href="#models">
              <Button size="lg" variant="secondary" className="px-7 py-3.5 text-base font-medium">
                Explore models
              </Button>
            </a>
          </motion.div>

          {/* Interactive Chat UI Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-14 max-w-4xl mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden text-left"
          >
            {/* Window Header */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                </div>
                <span className="text-xs font-bold text-slate-700 ml-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  <span>NOVA AI Assistant</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                <span>Model: Nova Smart</span>
              </div>
            </div>

            {/* Conversation Preview */}
            <div className="p-6 space-y-5 bg-gradient-to-b from-white to-slate-50/50">
              {/* User Turn */}
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-3 text-sm shadow-xs max-w-lg">
                  What is polymorphism in C++ and how does dynamic binding work?
                </div>
              </div>

              {/* AI Turn */}
              <div className="flex items-start gap-3 max-w-2xl">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft text-sm text-slate-800 space-y-2.5 flex-1">
                  <p>
                    Polymorphism in C++ allows objects of different derived classes to be treated through a common base interface.
                  </p>
                  <div className="rounded-xl bg-slate-950 text-slate-200 p-3 font-mono text-xs overflow-x-auto">
                    <span className="text-purple-400">class</span> <span className="text-yellow-300">Shape</span> {'{'}{'\n'}
                    {'  '}<span className="text-purple-400">public</span>:{'\n'}
                    {'    '}<span className="text-blue-400">virtual void</span> <span className="text-green-400">draw</span>() <span className="text-blue-400">const</span> = 0; <span className="text-slate-500">// Pure virtual</span>{'\n'}
                    {'}'};
                  </div>
                  <p className="text-xs text-slate-600">
                    At runtime, the compiler utilizes a <strong>vtable</strong> (virtual method table) to resolve dynamic dispatches safely.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Model Selection Showcase (#models) */}
      <section id="models" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">
              Tailored Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-4">
              Choose the Right Model for Your Task
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Switch models dynamically within any conversation based on your depth, speed, and reasoning requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Nova Smart */}
            <div className="p-6 rounded-3xl bg-slate-50 border-2 border-violet-200/90 shadow-soft flex flex-col justify-between hover:shadow-soft-lg transition-all relative">
              <div className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-100 text-violet-800 uppercase tracking-wider">
                Recommended
              </div>

              <div>
                <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Nova Smart</h3>
                <p className="text-xs font-semibold text-violet-700 mt-0.5 mb-3">
                  Best for everyday questions
                </p>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Balanced, highly articulate intelligence designed for natural discussions, quick coding, writing assistance, and general problem solving.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/70 space-y-2 text-xs text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Speed:</span>
                  <strong className="text-slate-900">Fast</strong>
                </div>
                <div className="flex justify-between">
                  <span>Intelligence:</span>
                  <strong className="text-slate-900">High</strong>
                </div>
                <div className="flex justify-between">
                  <span>Context:</span>
                  <strong className="text-slate-900">128k Tokens</strong>
                </div>
              </div>
            </div>

            {/* Nova Reasoning */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-soft flex flex-col justify-between hover:shadow-soft-lg transition-all relative">
              <div className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 uppercase tracking-wider">
                Deep Logic
              </div>

              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Nova Reasoning</h3>
                <p className="text-xs font-semibold text-purple-700 mt-0.5 mb-3">
                  For complex problems & analysis
                </p>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Thorough step-by-step chain-of-thought analysis, mathematical derivations, algorithmic system design, and rigorous evaluations.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/70 space-y-2 text-xs text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Speed:</span>
                  <strong className="text-slate-900">Thorough</strong>
                </div>
                <div className="flex justify-between">
                  <span>Intelligence:</span>
                  <strong className="text-slate-900">Maximum</strong>
                </div>
                <div className="flex justify-between">
                  <span>Context:</span>
                  <strong className="text-slate-900">256k Tokens</strong>
                </div>
              </div>
            </div>

            {/* Nova Fast */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-soft flex flex-col justify-between hover:shadow-soft-lg transition-all relative">
              <div className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider">
                Instant
              </div>

              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Nova Fast</h3>
                <p className="text-xs font-semibold text-amber-700 mt-0.5 mb-3">
                  Fast everyday responses
                </p>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Engineered for ultra-low latency, instant summaries, high-speed queries, and quick translations.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/70 space-y-2 text-xs text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Speed:</span>
                  <strong className="text-slate-900">Ultra Fast</strong>
                </div>
                <div className="flex justify-between">
                  <span>Intelligence:</span>
                  <strong className="text-slate-900">Standard</strong>
                </div>
                <div className="flex justify-between">
                  <span>Context:</span>
                  <strong className="text-slate-900">64k Tokens</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Capabilities (#capabilities) */}
      <section id="capabilities" className="py-20 bg-[#fafafa] border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">
              Versatile Assistant
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2 mb-3">
              One Assistant. Infinite Possibilities.
            </h2>
            <p className="text-slate-600 text-base">
              Whatever you are working on, NOVA AI adapts to your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Code & Develop</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Write clean programs in C++, Python, TypeScript, debug stack traces, and architect systems.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Learn & Master</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Break down complex scientific concepts simply, build study schedules, and practice exam queries.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Write & Create</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Draft professional emails, technical documentation, research proposals, and compelling essays.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Analyze & Plan</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Plan detailed trip itineraries, perform financial calculations, and synthesize information.
              </p>
            </div>
          </div>

          {/* Privacy Note (Subtle, professional) */}
          <div className="mt-14 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h5 className="text-xs font-bold text-slate-900">
                  Built-in Privacy-Aware Processing
                </h5>
                <p className="text-[11px] text-slate-500">
                  NOVA AI runs automatic privacy filtering in the backend to ensure your confidential data stays safe.
                </p>
              </div>
            </div>

            <Link to={isAuthenticated ? '/chat' : '/login'} className="shrink-0">
              <Button size="sm" variant="secondary">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA */}
      <section className="py-20 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start having smarter conversations today.
          </h2>
          <p className="text-violet-100 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Join NOVA AI and experience a general-purpose AI assistant that understands your goals.
          </p>
          <div className="pt-2">
            <Link to={isAuthenticated ? '/chat' : '/signup'}>
              <Button size="lg" variant="secondary" className="px-8 py-3.5 font-bold text-violet-900 shadow-xl">
                Open NOVA AI Chat →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
