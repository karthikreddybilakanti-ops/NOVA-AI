import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  MessageSquare,
  Sparkles,
  Paperclip,
  Mic,
  ShieldCheck,
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { submitFeedbackApi } from '../services/api';

export const HelpFeedbackPage: React.FC = () => {
  const { user } = useAuth();

  // FAQ expanded state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Feedback form state
  const [category, setCategory] = useState<string>('AI response quality');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState<string>('');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const faqs = [
    {
      q: 'How does NOVA AI answer questions?',
      a: 'NOVA AI uses state-of-the-art general-purpose AI models to answer any coding, mathematics, writing, analysis, science, or casual inquiries directly and naturally without predefined templates.',
      icon: Sparkles,
    },
    {
      q: 'How does privacy-first processing work?',
      a: 'Before your prompt reaches the AI model, our backend deterministic scanner detects sensitive entities (emails, passwords, API keys, credentials). The Necessity Engine evaluates if that information is required for your task. Unnecessary sensitive data is minimized and removed, while necessary context (like your name for a personal bio) is preserved.',
      icon: ShieldCheck,
    },
    {
      q: 'How do file attachments work?',
      a: 'Click the paperclip button in the chat composer to upload PDFs, text documents, CSVs, DOCX files, or code files. NOVA AI extracts the text and reads the document to summarize, answer questions, or extract key points.',
      icon: Paperclip,
    },
    {
      q: 'How does voice input work?',
      a: 'Click the microphone button in the chat composer to start browser speech-to-text recording. As you speak, your words are transcribed live into the composer. You can edit the text before sending.',
      icon: Mic,
    },
    {
      q: 'What is the difference between Nova Smart, Reasoning, and Fast?',
      a: 'Nova Smart is the balanced default for everyday questions and coding. Nova Reasoning performs deep chain-of-thought analysis for complex math and architecture. Nova Fast delivers ultra-low latency concise responses.',
      icon: MessageSquare,
    },
  ];

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitFeedbackApi({
        category,
        rating,
        message: message.trim(),
        userEmail: email.trim() || user?.email || 'user@nova.ai',
        userName: user?.name || 'User',
        userId: user?.id,
      });
      setSubmitSuccess(true);
      setMessage('');
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 bg-[#fafafa] min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-xs font-semibold text-violet-700 mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Support & Knowledge Base</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Help & Feedback Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Find answers to common questions or share suggestions directly with the NOVA AI team.
            </p>
          </div>

          <Link to="/chat" className="shrink-0">
            <Button size="sm" variant="secondary" icon={<ArrowLeft className="w-3.5 h-3.5 mr-1" />}>
              Back to Chat
            </Button>
          </Link>
        </div>

        {/* 1. Frequently Asked Questions */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              const Icon = faq.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-slate-200/90 shadow-soft overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-violet-50 text-violet-600 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{faq.q}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. Interactive Feedback Form */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-soft p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-violet-600" />
              <span>Share Feedback or Report an Issue</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your feedback is recorded directly into our admin system to help improve answer quality and system capabilities.
            </p>
          </div>

          {submitSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Thank you! Your feedback has been received and logged in our system.</span>
            </div>
          )}

          {submitError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Feedback Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-violet-500"
                >
                  <option value="AI response quality">AI Response Quality</option>
                  <option value="Bug">Bug Report</option>
                  <option value="Attachment problem">Attachment / Document Processing</option>
                  <option value="Voice problem">Voice / Microphone Input</option>
                  <option value="Account problem">Account & Settings</option>
                  <option value="Other">General Suggestion / Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Satisfaction Rating
                </label>
                <div className="flex items-center gap-2 pt-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 rounded hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2 font-mono">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Your Email (Optional for updates)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Detailed Message
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your suggestion, the question you asked, or any unexpected behavior..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-violet-500 resize-none"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="md"
                variant="primary"
                disabled={isSubmitting || !message.trim()}
                icon={<Send className="w-3.5 h-3.5 ml-1" />}
              >
                {isSubmitting ? 'Submitting Feedback...' : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
