import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, EyeOff, Server, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="py-12 bg-[#fafafa] min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="border-b border-slate-200/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-xs font-semibold text-violet-700 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Transparency & Data Protection</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy & Terms</h1>
          <p className="text-sm text-slate-500 mt-1">
            How NOVA AI protects your sensitive data before downstream AI model processing.
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft space-y-2">
            <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Pre-AI Minimization</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sensitive identifiers (bank accounts, credentials, private emails) are scanned and removed before dispatching requests to the AI model.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Necessity Evaluation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Information is preserved only when strictly required for your requested task (e.g., your name in a draft bio vs. an unneeded credit card number).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Redacted Audit Telemetry</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Admin telemetry stores only privacy-safe redacted prompts. Plaintext sensitive numbers and secrets are never persisted in logs.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 sm:p-8 space-y-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-violet-600" />
              1. Information We Collect and Process
            </h2>
            <p>
              When you use NOVA AI, you may submit questions, code, spoken voice input, or uploaded files (PDF, DOCX, TXT, CSV, images). 
              Our architecture intercepts this input on our secure gateway, analyzes the task intent, and detects sensitive entities across 10 categories including financial numbers, credentials, and PII.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-violet-600" />
              2. How Minimization Works Before AI Dispatch
            </h2>
            <p>
              Rather than sending your raw input directly to downstream AI providers (such as Gemini or OpenAI), our Necessity Engine minimizes unnecessary sensitive data. 
              The AI model receives only the sanitized context required to formulate an accurate answer.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-violet-600" />
              3. Data Retention & Account Management
            </h2>
            <p>
              User accounts and authentication sessions are securely managed via Supabase Auth. Your chat conversations are saved to your account so you can reference previous chats across sessions. 
              You can delete individual conversations or sign out at any time to clear your active session.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-violet-600" />
              4. Uploaded Files and Images
            </h2>
            <p>
              Files uploaded for analysis (such as documents or receipts) are processed to extract readable textual data. Optical Character Recognition (OCR) is performed on images. 
              Extracted text is filtered through the same privacy minimization pipeline before being supplied to the AI assistant.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-violet-600" />
              5. Honest Scope & Limitations
            </h2>
            <p>
              NOVA AI acts as a smart privacy buffer between you and cloud generative AI services. While we systematically detect and redact known categories of private data, 
              users should avoid submitting unlawful or hazardous materials.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-500">
          <Link to="/" className="inline-flex items-center gap-1.5 hover:text-slate-900 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/help" className="hover:text-violet-600">Help & Support</Link>
            <Link to="/chat" className="hover:text-violet-600">Start Chatting</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
