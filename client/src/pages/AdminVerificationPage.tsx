import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldAlert, Cpu, Minimize2, Clock } from 'lucide-react';
import { AppMetrics, TraceRecord } from '../types';
import {
  fetchAdminTraces,
  fetchAdminMetrics,
  clearAdminTelemetry,
  subscribeToAdminStream,
} from '../services/api';
import { AdminLayout } from '../components/admin/AdminLayout';
import { RequestList } from '../components/verification/RequestList';
import { PipelineVisualizer } from '../components/verification/PipelineVisualizer';
import { TraceDetails } from '../components/verification/TraceDetails';
import { MetricCard } from '../components/verification/MetricCard';

export const AdminVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlTraceId = searchParams.get('traceId');

  const [traces, setTraces] = useState<TraceRecord[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<TraceRecord | null>(null);
  const [metrics, setMetrics] = useState<AppMetrics>({
    totalRequests: 0,
    sensitiveDataDetected: 0,
    dataMinimized: 0,
    averageProcessingTimeMs: 0,
    categoryBreakdown: {},
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tracesData, metricsData] = await Promise.all([
        fetchAdminTraces(),
        fetchAdminMetrics(),
      ]);
      setTraces(tracesData);
      setMetrics(metricsData);

      if (urlTraceId) {
        const found = tracesData.find(
          (t) => t.trace_id.toLowerCase() === urlTraceId.toLowerCase()
        );
        if (found) setSelectedTrace(found);
      } else if (tracesData.length > 0 && !selectedTrace) {
        setSelectedTrace(tracesData[0]);
      }
    } catch (err) {
      console.error('Failed to load admin verification data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to real-time admin telemetry stream
    const unsubscribe = subscribeToAdminStream(
      (newTrace) => {
        setTraces((prev) => [newTrace, ...prev.filter((t) => t.trace_id !== newTrace.trace_id)]);
        setSelectedTrace(newTrace);
        fetchAdminMetrics().then(setMetrics).catch(console.error);
      },
      () => {
        setTraces([]);
        setSelectedTrace(null);
        fetchAdminMetrics().then(setMetrics).catch(console.error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (urlTraceId && traces.length > 0) {
      const found = traces.find(
        (t) => t.trace_id.toLowerCase() === urlTraceId.toLowerCase()
      );
      if (found) setSelectedTrace(found);
    }
  }, [urlTraceId, traces]);

  const handleClear = async () => {
    if (window.confirm('Reset all verification traces from the telemetry database?')) {
      await clearAdminTelemetry();
      setTraces([]);
      setSelectedTrace(null);
      await fetchAdminMetrics().then(setMetrics);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Bar with Real-Time Indicator & Metric Cards */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Privacy Processing Telemetry & Verification
                </h1>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Real-time Stream Connected</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic scanner, task necessity decisions, prompt minimization, and downstream trace details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Requests"
              value={metrics.totalRequests > 0 ? metrics.totalRequests : 'No data yet'}
              subtitle={metrics.totalRequests > 0 ? 'Live recorded queries' : 'Awaiting first request'}
              icon={<Cpu className="w-5 h-5" />}
              color="text-violet-600 bg-violet-50 border-violet-200"
            />
            <MetricCard
              label="Sensitive Intercepted"
              value={metrics.totalRequests > 0 ? metrics.sensitiveDataDetected : 'No data yet'}
              subtitle={metrics.totalRequests > 0 ? 'PII & secret tokens' : 'Awaiting first request'}
              icon={<ShieldAlert className="w-5 h-5" />}
              color="text-amber-600 bg-amber-50 border-amber-200"
            />
            <MetricCard
              label="Data Minimized"
              value={metrics.totalRequests > 0 ? metrics.dataMinimized : 'No data yet'}
              subtitle={metrics.totalRequests > 0 ? 'Unnecessary tokens stripped' : 'Awaiting first request'}
              icon={<Minimize2 className="w-5 h-5" />}
              color="text-emerald-600 bg-emerald-50 border-emerald-200"
            />
            <MetricCard
              label="Avg Processing Time"
              value={metrics.totalRequests > 0 ? `${metrics.averageProcessingTimeMs}ms` : 'No data yet'}
              subtitle={metrics.totalRequests > 0 ? 'Pipeline execution latency' : 'Awaiting first request'}
              icon={<Clock className="w-5 h-5" />}
              color="text-blue-600 bg-blue-50 border-blue-200"
            />
          </div>
        </div>

        {/* 3-Column Inspection Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-22rem)] min-h-[600px]">
          {/* Column 1: Live Requests Feed */}
          <div className="lg:col-span-4 h-full">
            <RequestList
              traces={traces}
              selectedTrace={selectedTrace}
              onSelectTrace={setSelectedTrace}
              onRefresh={loadData}
              onClear={handleClear}
              isLoading={isLoading}
            />
          </div>

          {/* Column 2: Processing Pipeline Visualizer */}
          <div className="lg:col-span-3 h-full">
            <PipelineVisualizer trace={selectedTrace} />
          </div>

          {/* Column 3: Deep Request Details Inspector */}
          <div className="lg:col-span-5 h-full">
            <TraceDetails trace={selectedTrace} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
