import React, { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw, Star } from 'lucide-react';
import { fetchAdminFeedback, updateAdminFeedbackStatus } from '../services/api';
import { AdminLayout } from '../components/admin/AdminLayout';

export const AdminFeedbackPage: React.FC = () => {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      const list = await fetchAdminFeedback();
      setFeedback(list);
    } catch (err) {
      console.error('Failed to load feedback', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateAdminFeedbackStatus(id, status);
      setFeedback((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status } : f))
      );
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              User Feedback & Issue Reports
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Feedback submitted by users from the in-app Help Center
            </p>
          </div>

          <button
            onClick={loadFeedback}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Feedback</span>
          </button>
        </div>

        <div className="space-y-3">
          {feedback.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-slate-700">No feedback entries recorded</p>
            </div>
          ) : (
            feedback.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-5 space-y-3 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 font-bold text-xs">
                      {item.category}
                    </span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= item.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                        item.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'reviewed'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <p className="text-sm text-slate-800 leading-relaxed font-normal">
                  "{item.message}"
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Submitted by: <strong className="text-slate-700">{item.userName || 'User'}</strong> ({item.userEmail})
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">{item.id}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
