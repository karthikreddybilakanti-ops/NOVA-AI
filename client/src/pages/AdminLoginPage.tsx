import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const [email, setEmail] = useState('admin@nova.ai');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setError(null);
    setIsLoading(true);

    try {
      await adminLogin(email.trim(), password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Admin authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-slate-100">
      <div className="w-full max-w-md bg-slate-850 rounded-3xl border border-slate-700 shadow-2xl p-8 sm:p-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-glow-purple mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">NOVA AI Admin Console</h2>
          <p className="text-xs text-slate-400 mt-1">Authorized developer and administrator access only</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nova.ai"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none p-0.5 rounded"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm shadow-md shadow-violet-600/30 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? 'Verifying admin authorization...' : 'Sign in to Console'}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <Link to="/" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to User Site</span>
          </Link>
          <span className="font-mono text-[11px] text-slate-500">v3.0 Security Portal</span>
        </div>
      </div>
    </div>
  );
};
