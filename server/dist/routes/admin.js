import { Router } from 'express';
import { globalTraceStore } from '../trace/traceStore.js';
import { globalAuthStore } from '../auth/authStore.js';
import { globalConversationStore } from '../chat/conversationStore.js';
import { globalFeedbackStore } from '../feedback/feedbackStore.js';
export const adminRouter = Router();
// Middleware to verify admin authorization
const requireAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized. Administrator credentials required.' });
        return;
    }
    const token = authHeader.split(' ')[1];
    const user = globalAuthStore.getUserByToken(token);
    if (!user || user.role !== 'admin') {
        res.status(403).json({ error: 'Access forbidden. Administrator privileges required.' });
        return;
    }
    next();
};
adminRouter.use(requireAdmin);
// 1. Get Live Metrics for Admin Dashboard
adminRouter.get('/metrics', (_req, res) => {
    const metrics = globalTraceStore.getMetrics();
    res.json(metrics);
});
// 2. Get Request Traces
adminRouter.get('/traces', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
    const traces = globalTraceStore.getTraces().slice(0, limit);
    res.json({ traces });
});
// 3. Get Specific Request Trace by ID
adminRouter.get('/traces/:id', (req, res) => {
    const { id } = req.params;
    const trace = globalTraceStore.getTraceById(id);
    if (!trace) {
        res.status(404).json({ error: 'Trace record not found.' });
        return;
    }
    res.json({ trace });
});
// 4. Clear/Reset Traces Telemetry
adminRouter.delete('/traces', (_req, res) => {
    globalTraceStore.clear();
    res.json({ success: true, message: 'Admin telemetry store reset successfully.' });
});
// 5. Real-Time Server-Sent Events (SSE) Stream for Verification Console
adminRouter.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    // Send initial connected ping
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);
    globalTraceStore.addSSEClient(res);
});
// 6. Toggle Model Status
adminRouter.post('/models/:id/toggle', (req, res) => {
    const { id } = req.params;
    const updated = globalConversationStore.toggleModel(id);
    if (!updated) {
        res.status(404).json({ error: 'Model not found.' });
        return;
    }
    res.json({ success: true, model: updated });
});
// 7. Get All Users (Admin User Management)
adminRouter.get('/users', (_req, res) => {
    const users = globalAuthStore.getUsers();
    res.json({ users });
});
// 8. Get Feedback (Admin)
adminRouter.get('/feedback', (_req, res) => {
    const feedback = globalFeedbackStore.getAllFeedback();
    res.json({ feedback });
});
// 9. Update Feedback Status
adminRouter.patch('/feedback/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updated = globalFeedbackStore.updateStatus(id, status);
    if (!updated) {
        res.status(404).json({ error: 'Feedback not found.' });
        return;
    }
    res.json({ success: true, feedback: updated });
});
// 10. System Health & Infrastructure Diagnostics
adminRouter.get('/health', (_req, res) => {
    const mem = process.memoryUsage();
    res.json({
        status: 'ONLINE',
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMB: {
            rss: Math.round(mem.rss / 1024 / 1024),
            heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
        },
        nodeVersion: process.version,
        activeModels: globalConversationStore.getModels().filter((m) => m.enabled).length,
        totalTracesLogged: globalTraceStore.getTraces().length,
    });
});
