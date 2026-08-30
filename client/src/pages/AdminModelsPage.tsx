import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, Zap, Shield } from 'lucide-react';
import { NovaModelConfig } from '../types';
import { fetchModels, toggleModelApi } from '../services/api';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Card } from '../components/common/Card';

export const AdminModelsPage: React.FC = () => {
  const [models, setModels] = useState<NovaModelConfig[]>([]);

  useEffect(() => {
    fetchModels()
      .then(setModels)
      .catch(console.error);
  }, []);

  const handleToggle = async (id: string) => {
    try {
      const updated = await toggleModelApi(id);
      setModels((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (err) {
      console.error('Failed to toggle model', err);
    }
  };

  const getModelIcon = (id: string) => {
    switch (id) {
      case 'nova-reasoning':
        return <BrainCircuit className="w-6 h-6 text-purple-600" />;
      case 'nova-fast':
        return <Zap className="w-6 h-6 text-amber-500" />;
      case 'nova-smart':
      default:
        return <Sparkles className="w-6 h-6 text-violet-600" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            AI Model Orchestration & Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage available models, token context allowances, and runtime availability for user chats
          </p>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {models.map((model) => (
            <Card key={model.id} className="p-6 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    {getModelIcon(model.id)}
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      model.enabled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {model.enabled ? 'Active / Online' : 'Disabled'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{model.name}</h3>
                <p className="text-xs font-semibold text-violet-700 mt-0.5 mb-2">{model.tagline}</p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{model.description}</p>

                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Engine Type:</span>
                    <strong className="text-slate-900">General AI + Privacy Gate</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">Model Availability</span>
                <button
                  onClick={() => handleToggle(model.id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    model.enabled ? 'bg-violet-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      model.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Upstream Gateways Notice */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <Shield className="w-5 h-5 text-violet-600 shrink-0" />
          <div className="text-xs text-slate-600">
            <strong className="text-slate-900">Backend AI Gateway: </strong>
            Upstream API keys (Google Gemini / OpenAI) are automatically detected via environment variables. When no API keys are present, the high-performance built-in contextual Nova generative engine is seamlessly utilized.
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
