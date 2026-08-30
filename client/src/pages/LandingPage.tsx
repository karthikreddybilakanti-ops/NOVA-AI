import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
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
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
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
            Your privacy-first general-purpose AI assistant. Ask any question, analyze documents and images, and explore topics while unnecessary sensitive information is minimized before reaching the AI model.
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

            <Link to="/how-it-works">
              <Button size="lg" variant="secondary" className="px-7 py-3.5 text-base font-medium">
                How NOVA works
              </Button>
            </Link>
          </motion.div>

          {/* Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">General-Purpose AI</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Coding, mathematics, scientific analysis, writing, and multi-turn conversations powered by modern generative AI.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Privacy Before AI</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatically detects and minimizes unnecessary sensitive data—such as financial numbers, credentials, and PII—before AI dispatch.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Multi-Modal Inputs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Attach documents (PDF, DOCX, CSV) or image receipts with integrated OCR extraction and voice speech-to-text.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Detailed "How NOVA Works" Section */}
      <section className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">
              Architecture & Transparency
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2 mb-3">
              How Privacy Works Before the AI
            </h2>
            <p className="text-slate-600 text-sm">
              Your request stays yours. NOVA sends only what the AI model actually needs to solve your problem.
            </p>
          </div>

          {/* Visual Step Pipeline Flow */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center mb-16">
            {[
              { step: '1', title: 'You Ask', desc: 'Text, voice, or files' },
              { step: '2', title: 'Understand', desc: 'Intent analysis' },
              { step: '3', title: 'Detect', desc: 'Sensitive data scan' },
              { step: '4', title: 'Necessity', desc: 'Task relevance check' },
              { step: '5', title: 'Minimize', desc: 'Redact unneeded info' },
              { step: '6', title: 'Real AI', desc: 'Secure model dispatch' },
              { step: '7', title: 'Answer', desc: 'Intelligent response' },
            ].map((p, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col items-center justify-center">
                <span className="w-6 h-6 rounded-full bg-violet-600 text-white font-bold text-[11px] flex items-center justify-center mb-1.5">
                  {p.step}
                </span>
                <span className="text-xs font-bold text-slate-900">{p.title}</span>
                <span className="text-[10px] text-slate-500">{p.desc}</span>
              </div>
            ))}
          </div>

          {/* Three Illustrative Scenario Cards with Placeholders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-100 text-violet-800 text-[11px] font-bold">
                Scenario 1: Text & PII
              </div>
              <h4 className="text-sm font-bold text-slate-900">Personal Banking & Account Tasks</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                When you ask a banking question containing <code className="text-violet-700 bg-white px-1 rounded">[ACCOUNT NUMBER]</code> and <code className="text-violet-700 bg-white px-1 rounded">[EMAIL]</code>, NOVA strips the private credentials and sends only the problem context to the AI.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold">
                Scenario 2: Image OCR
              </div>
              <h4 className="text-sm font-bold text-slate-900">Document & Receipt Screenshots</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Uploaded images undergo OCR scanning. Unnecessary personal tokens like <code className="text-indigo-700 bg-white px-1 rounded">[CARD NUMBER]</code> are redacted before the AI analyzes failure codes or amounts.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
                Scenario 3: Corporate Info
              </div>
              <h4 className="text-sm font-bold text-slate-900">Internal Code & Secrets</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                When debugging code containing <code className="text-purple-700 bg-white px-1 rounded">[API KEY]</code> or server passwords, secrets default to exclusion while the core programming logic is submitted to the AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Capabilities Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">
              Versatile Assistant
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2 mb-3">
              One Assistant for Any Task
            </h2>
            <p className="text-slate-600 text-sm">
              Ask questions, write code, analyze data, and summarize documents with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Code & Develop</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Write clean programs in C++, Python, TypeScript, debug stack traces, and architect systems.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Learn & Master</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Break down complex concepts simply, explore mathematics, and solve academic questions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Write & Create</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Draft professional emails, technical documentation, research proposals, and structured summaries.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Analyze & Plan</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Synthesize data, evaluate architecture designs, and plan multi-step project strategies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA */}
      <section className="py-20 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start having smarter, safer conversations today.
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
