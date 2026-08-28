import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Cpu,
  ShieldAlert,
  Minimize2,
  Clock,
} from 'lucide-react';
import { AppMetrics } from '../types';
import { fetchAdminMetrics } from '../services/api';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Card } from '../components/common/Card';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AppMetrics>({
    totalRequests: 0,
    sensitiveDataDetected: 0,
    dataMinimized: 0,
    averageProcessingTimeMs: 0,
    categoryBreakdown: {},
    modelUsage: {},
  });

  useEffect(() => {
    fetchAdminMetrics()
      .then(setMetrics)
      .catch(console.error);
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Executive Analytics & Telemetry
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live operational metrics for NOVA AI Assistant & Privacy Gateway
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/admin/verification"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              <Activity className="w-4 h-4" />
              <span>Open Live Verification Stream</span>
            </Link>
          </div>
        </div>

        {/* 4 Core Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Requests
              </span>
              <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {metrics.totalRequests > 0 ? metrics.totalRequests : 'No data yet'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Live processed queries
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Sensitive Intercepted
              </span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {metrics.totalRequests > 0 ? metrics.sensitiveDataDetected : 'No data yet'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              PII & credential entities
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Data Minimized
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Minimize2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {metrics.totalRequests > 0 ? metrics.dataMinimized : 'No data yet'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Unnecessary tokens stripped
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Avg Latency
              </span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {metrics.totalRequests > 0 ? `${metrics.averageProcessingTimeMs}ms` : 'No data yet'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              End-to-end pipeline speed
            </p>
          </Card>
        </div>

        {/* Breakdown Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Model Usage Breakdown */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-violet-600" />
                <span>AI Model Distribution</span>
              </h3>
              <Link to="/admin/models" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
                Manage Models →
              </Link>
            </div>

            {Object.keys(metrics.modelUsage || {}).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No model requests logged yet</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(metrics.modelUsage || {}).map(([mId, count]) => (
                  <div key={mId} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span className="capitalize">{mId.replace('-', ' ')}</span>
                      <span className="font-mono font-bold text-slate-900">{count} queries</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-600 rounded-full"
                        style={{
                          width: `${Math.min(100, (count / (metrics.totalRequests || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Category Distribution */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Sensitive Data Categories</span>
              </h3>
              <Link to="/admin/verification" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
                Inspect Traces →
              </Link>
            </div>

            {Object.keys(metrics.categoryBreakdown).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No sensitive data detected yet</p>
            ) : (
              <div className="space-y-2.5">
                {Object.entries(metrics.categoryBreakdown).map(([cat, count]) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <span className="font-medium text-slate-700">{cat}</span>
                    <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      {count} detected
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
