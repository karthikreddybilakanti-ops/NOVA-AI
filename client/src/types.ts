export type NovaModelId = 'nova-smart' | 'nova-reasoning' | 'nova-fast' | 'ai-assistant';

export interface NovaModelConfig {
  id: NovaModelId;
  name: string;
  tagline?: string;
  description?: string;
  badge?: string;
  enabled: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  model_id: NovaModelId;
  created_at: string;
  updated_at: string;
}

export interface UploadedAttachment {
  id?: string;
  originalName: string;
  mimeType: string;
  size?: number;
  url?: string;
  extractedText?: string;
  base64Data?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  attachment?: UploadedAttachment;
  model_id?: NovaModelId;
  trace_id?: string;
  created_at: string;
  liked?: boolean | null;
}

export type SensitiveCategory =
  | 'Email'
  | 'Phone'
  | 'Address'
  | 'Personal identifiers'
  | 'Credentials/secrets'
  | 'Financial information'
  | 'Government identifiers'
  | 'Health information'
  | 'Precise location'
  | 'Confidential information';

export interface DetectedEntity {
  id: string;
  category: SensitiveCategory;
  value: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export type NecessityStatus = 'UNNECESSARY' | 'REQUIRED';

export interface NecessityDecision {
  entityId: string;
  category: SensitiveCategory;
  value: string;
  decision: NecessityStatus;
  confidence: number;
  reason: string;
}

export type StageName = 'INPUT' | 'DETECT' | 'DECIDE' | 'MINIMIZE' | 'AI' | 'OUTPUT';

export interface PipelineStage {
  name: StageName;
  status: 'pending' | 'active' | 'completed' | 'failed';
  duration_ms: number;
  summary: string;
  details?: Record<string, any>;
}

export interface TraceRecord {
  trace_id: string;
  timestamp: string;
  raw_prompt: string;
  intent?: string;
  intent_summary?: string;
  detections: DetectedEntity[];
  necessity_decisions: NecessityDecision[];
  sanitized_prompt: string;
  model: string;
  model_id?: NovaModelId;
  user_id?: string;
  conversation_id?: string;
  response: string;
  latency_ms: number;
  status: 'completed' | 'sanitized' | 'pass_through' | 'error';
  stages: PipelineStage[];
  metrics: {
    detectedCount: number;
    removedCount: number;
    preservedCount: number;
    sanitizationPercentage: number;
  };
}

export interface AppMetrics {
  totalRequests: number;
  sensitiveDataDetected: number;
  dataMinimized: number;
  averageProcessingTimeMs: number;
  categoryBreakdown: Record<string, number>;
  modelUsage?: Record<string, number>;
}
