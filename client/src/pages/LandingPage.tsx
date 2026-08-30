import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Code2,
  BookOpen,
  Compass,
  Lightbulb,
  Cpu,
  Lock,
  Layers,
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
            <span>Privacy-First General-Purpose AI</span>
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
            Your privacy-first general-purpose AI assistant. Ask any question, analyze documents and images, and write code while unnecessary sensitive information is kept safe before reaching the AI model.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            <Link to={isAuthenticated ? '/chat' : '/signup'}>
              <Button
                size="lg"
                variant="primary"
                className="px-8 py-3.5 text-base font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35"
                icon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Start chatting
              </Button>
            </Link>

            <Link to="/help">
              <Button size="lg" variant="secondary" className="px-7 py-3.5 text-base font-medium">
                How NOVA works
              </Button>
            </Link>
          </motion.div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">General-Purpose Intelligence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Coding, mathematics, scientific reasoning, creative writing, research, and everyday conversation powered by state-of-the-art AI.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Pre-AI Privacy Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatically detects and minimizes unnecessary sensitive data—such as financial numbers, credentials, and PII—before requests reach the AI model.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Multi-Modal Processing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Attach documents (PDF, DOCX, CSV) or images (receipts, statements) with integrated privacy scanning and OCR extraction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Capabilities Section */}
      <section className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">
              Versatile Assistant
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2 mb-3">
              One Assistant. Infinite Possibilities.
            </h2>
            <p className="text-slate-600 text-base">
              Whatever you are working on, NOVA AI adapts naturally to your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Code & Develop</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Write clean programs in C++, Python, TypeScript, debug stack traces, and architect systems.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Learn & Master</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Break down complex concepts simply, explore mathematics, and solve academic questions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Write & Create</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Draft professional emails, technical documentation, research proposals, and structured summaries.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Analyze & Plan</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Synthesize data, evaluate architecture designs, and plan multi-step project strategies.
              </p>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="mt-14 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h5 className="text-xs font-bold text-slate-900">
                  Built-in Privacy-Aware Processing
                </h5>
                <p className="text-[11px] text-slate-500">
                  NOVA AI runs automatic privacy detection in the backend to ensure your confidential data stays safe.
                </p>
              </div>
            </div>

            <Link to={isAuthenticated ? '/chat' : '/signup'} className="shrink-0">
              <Button size="sm" variant="primary">
                Start Chatting
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Bottom CTA */}
      <section className="py-20 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start having smarter conversations today.
          </h2>
          <p className="text-violet-100 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Experience a general-purpose AI assistant with privacy built in from the ground up.
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
