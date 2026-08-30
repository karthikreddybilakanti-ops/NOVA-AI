import {
  NovaModelConfig,
  NovaModelId,
  Conversation,
  ChatMessage,
  TraceRecord,
  AppMetrics,
  User,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('nova_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 0. Auth API Methods
export async function loginApi(email: string, pass: string): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}

export async function signupApi(name: string, email: string, pass: string): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password: pass }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Signup failed' }));
    throw new Error(err.error || 'Signup failed');
  }
  return res.json();
}

export async function adminLoginApi(email: string, pass: string): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_BASE}/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Admin authentication failed' }));
    throw new Error(err.error || 'Admin authentication failed');
  }
  return res.json();
}

export async function getProfileApi(): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to get profile');
  return res.json();
}

export async function logoutApi(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
  }).catch(() => {});
}

// 1. Fetch AI Models
export async function fetchModels(): Promise<NovaModelConfig[]> {
  const res = await fetch(`${API_BASE}/chat/models`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to fetch models');
  const data = await res.json();
  return data.models;
}

// 2. Fetch User Conversations
export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/chat/conversations`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to fetch conversations');
  const data = await res.json();
  return data.conversations;
}

// 3. Create Conversation
export async function createConversationApi(
  title?: string,
  modelId?: NovaModelId
): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/chat/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ title, modelId }),
  });
  if (!res.ok) throw new Error('Failed to create conversation');
  const data = await res.json();
  return data.conversation;
}

// 4. Fetch Conversation Details & Messages
export async function fetchConversationDetails(
  id: string
): Promise<{ conversation: Conversation; messages: ChatMessage[] }> {
  const res = await fetch(`${API_BASE}/chat/conversations/${id}`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to load conversation');
  return res.json();
}

// 5. Delete Conversation
export async function deleteConversationApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/chat/conversations/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to delete conversation');
  const data = await res.json();
  return data.success;
}

// 6. Upload File Attachment (PDF, TXT, CSV, DOCX, Images)
export interface UploadedAttachment {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  summary: string;
  extractedText: string;
}

export async function uploadFileApi(file: File): Promise<UploadedAttachment> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/chat/upload`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Failed to upload attachment');
  }

  const data = await res.json();
  return data.file;
}

// 7. Send Chat Message
export async function sendChatMessageApi(
  prompt: string,
  modelId: NovaModelId = 'nova-smart',
  conversationId?: string,
  attachment?: UploadedAttachment | null
): Promise<{
  messageId: string;
  conversationId: string;
  answer: string;
  sanitizedPrompt?: string;
  modelId: NovaModelId;
  model: string;
  latency_ms: number;
  trace_id: string;
}> {
  const res = await fetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ prompt, modelId, conversationId, attachment }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || 'Failed to send chat message');
  }

  return res.json();
}

// 8. Help & Feedback Submission
export interface FeedbackPayload {
  category: string;
  message: string;
  rating: number;
  userEmail?: string;
  userName?: string;
  userId?: string;
}

export async function submitFeedbackApi(payload: FeedbackPayload): Promise<any> {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Submission failed' }));
    throw new Error(err.error || 'Failed to submit feedback');
  }
  return res.json();
}

// 9. Admin API: Metrics
export async function fetchAdminMetrics(): Promise<AppMetrics> {
  const res = await fetch(`${API_BASE}/admin/metrics`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to load admin metrics');
  return res.json();
}

// 10. Admin API: Request Traces
export async function fetchAdminTraces(limit = 100): Promise<TraceRecord[]> {
  const res = await fetch(`${API_BASE}/admin/traces?limit=${limit}`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to load request traces');
  const data = await res.json();
  return data.traces;
}

// 11. Admin API: Single Trace
export async function fetchAdminTraceById(traceId: string): Promise<TraceRecord> {
  const res = await fetch(`${API_BASE}/admin/traces/${traceId}`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Trace record not found');
  const data = await res.json();
  return data.trace;
}

// 12. Admin API: Clear Telemetry
export async function clearAdminTelemetry(): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/traces`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to clear admin telemetry');
}

// 13. Admin API: Toggle Model
export async function toggleModelApi(modelId: string): Promise<NovaModelConfig> {
  const res = await fetch(`${API_BASE}/admin/models/${modelId}/toggle`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to toggle model');
  const data = await res.json();
  return data.model;
}

// 14. Admin API: Users List
export async function fetchAdminUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to load admin users');
  const data = await res.json();
  return data.users;
}

// 15. Admin API: Feedback List
export async function fetchAdminFeedback(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/admin/feedback`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to load admin feedback');
  const data = await res.json();
  return data.feedback;
}

// 16. Admin API: Update Feedback Status
export async function updateAdminFeedbackStatus(id: string, status: string): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/feedback/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update feedback status');
  return res.json();
}

// 17. Admin Telemetry SSE Stream
export function subscribeToAdminStream(
  onTraceReceived: (trace: TraceRecord) => void,
  onReset?: () => void
): () => void {
  const eventSource = new EventSource(`${API_BASE}/admin/stream`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_TRACE' && data.trace) {
        onTraceReceived(data.trace);
      } else if (data.type === 'CLEARED' && onReset) {
        onReset();
      }
    } catch (err) {
      console.error('SSE JSON parse error:', err);
    }
  };

  eventSource.onerror = (err) => {
    console.warn('Admin SSE connection error:', err);
  };

  return () => {
    eventSource.close();
  };
}
