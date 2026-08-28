import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw, FileText, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import { TraceRecord } from '../types';
import { fetchAdminTraces } from '../services/api';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Badge } from '../components/common/Badge';

export const AdminRequestsPage: React.FC = () => {
  const [traces, setTraces] = useState<TraceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadTraces = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminTraces();
      setTraces(data);
    } catch (err) {
      console.error('Failed to load request traces', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTraces();
  }, []);

  const filtered = traces.filter(
    (t) =>
      t.trace_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.raw_prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Request Logs & Auditing
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Historical ledger of user prompts, downstream models, and privacy transformations
            </p>
          </div>

          <button
            onClick={loadTraces}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Trace ID (e.g. TRC-XXXXXX), prompt keywords, or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-violet-400"
            />
          </div>
          <span className="text-xs text-slate-400 font-medium px-2">
            {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {/* Request Logs Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-slate-700">No request logs found</p>
              <p className="text-xs text-slate-500 mt-0.5">Incoming chats from the User AI assistant will populate here in real-time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Trace ID</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Task Intent</th>
                    <th className="py-3 px-4">Prompt Preview</th>
                    <th className="py-3 px-4">Model</th>
                    <th className="py-3 px-4">Privacy Status</th>
                    <th className="py-3 px-4">Latency</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filtered.map((t) => {
                    const date = new Date(t.timestamp);
                    const isSanitized = t.status === 'sanitized';
                    return (
                      <tr key={t.trace_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {t.trace_id}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">
                          {date.toLocaleTimeString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 text-[11px] font-semibold">
                            {t.intent || 'General Inquiry'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-800">
                          "{t.raw_prompt}"
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="capitalize font-semibold text-slate-800">
                            {t.model_id?.replace('-', ' ') || t.model}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {isSanitized ? (
                            <Badge variant="warning" size="sm" icon={<ShieldAlert className="w-3 h-3" />}>
                              {t.metrics.removedCount} stripped
                            </Badge>
                          ) : (
                            <Badge variant="success" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                              Pass-through
                            </Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          {t.latency_ms}ms
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/admin/verification?traceId=${t.trace_id}`}
                            className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-800 font-semibold"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
