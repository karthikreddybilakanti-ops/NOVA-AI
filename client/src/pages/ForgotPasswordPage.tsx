import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { forgotPasswordApi } from '../services/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setIsLoading(true);

    try {
      await forgotPasswordApi(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch password reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#fafafa]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-soft-lg p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-sm mx-auto mb-4">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-1">Enter your email to receive recovery instructions</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {sent ? (
          <div className="text-center space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex flex-col items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>Password reset instructions have been sent to <strong>{email}</strong>.</span>
            </div>
            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-violet-600 hover:text-violet-700">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={isLoading}
              className="w-full mt-2 font-semibold shadow-md shadow-violet-500/20"
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
            </Button>

            <div className="pt-3 text-center">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to sign in</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
