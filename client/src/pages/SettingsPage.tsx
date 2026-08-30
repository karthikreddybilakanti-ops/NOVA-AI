import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Shield, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [defaultModel, setDefaultModel] = useState('nova-smart');
  const [streamSpeed, setStreamSpeed] = useState('balanced');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/chat"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
              <p className="text-xs text-slate-500">Manage your NOVA AI assistant preferences</p>
            </div>
          </div>

          <Link to="/chat">
            <Button size="sm" variant="primary">
              Return to Chat
            </Button>
          </Link>
        </div>

        {saved && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Preferences saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <User className="w-4 h-4 text-violet-600" />
              <span>Account Profile</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  disabled
                  value={user?.name || 'User'}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'user@nova.ai'}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Model Preferences */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span>Model & Generation Defaults</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Model for New Chats</label>
                <select
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-violet-500"
                >
                  <option value="nova-smart">NOVA AI Assistant (Standard)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Response Style</label>
                <select
                  value={streamSpeed}
                  onChange={(e) => setStreamSpeed(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-violet-500"
                >
                  <option value="balanced">Balanced & Direct (Default)</option>
                  <option value="concise">Ultra Concise</option>
                  <option value="detailed">In-depth & Thorough</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Built-in Privacy Filtering</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Privacy-aware AI processing is automatically integrated into NOVA AI. Unnecessary sensitive data (such as secret keys, credentials, and payment details) is filtered in the background before reaching downstream models.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="md" variant="primary">
              Save Preferences
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
