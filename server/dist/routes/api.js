import { Router } from 'express';
import { PrivacyPipeline } from '../privacy/pipeline.js';
import { globalTraceStore } from '../trace/traceStore.js';
export const apiRouter = Router();
const pipeline = new PrivacyPipeline();
// 1. Submit Chat Query
apiRouter.post('/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            res.status(400).json({ error: 'A valid text prompt is required.' });
            return;
        }
        const trace = await pipeline.process(prompt.trim());
        globalTraceStore.addTrace(trace);
        res.json({
            answer: trace.response,
            trace_id: trace.trace_id,
            latency_ms: trace.latency_ms,
            status: trace.status,
            model: trace.model,
            sanitized_prompt: trace.sanitized_prompt,
            stages: trace.stages,
            metrics: trace.metrics,
        });
    }
    catch (error) {
        console.error('Error processing prompt:', error);
        res.status(500).json({ error: 'Internal pipeline error occurred while processing request.' });
    }
});
// 2. Get All Traces
apiRouter.get('/traces', (_req, res) => {
    const traces = globalTraceStore.getTraces();
    res.json({ traces });
});
// 3. Get Specific Trace by ID
apiRouter.get('/traces/:traceId', (req, res) => {
    const { traceId } = req.params;
    const trace = globalTraceStore.getTraceById(traceId);
    if (!trace) {
        res.status(404).json({ error: `Trace ${traceId} not found.` });
        return;
    }
    res.json({ trace });
});
// 4. SSE Stream for Live Real-Time Verification Updates
apiRouter.get('/traces/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    // Send initial ping
    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', time: new Date().toISOString() })}\n\n`);
    globalTraceStore.addSSEClient(res);
});
// 5. Get Real Application Metrics
apiRouter.get('/metrics', (_req, res) => {
    const metrics = globalTraceStore.getMetrics();
    res.json(metrics);
});
// 6. Reset Data (for testing)
apiRouter.post('/clear', (_req, res) => {
    globalTraceStore.clear();
    res.json({ success: true, message: 'All traces reset successfully.' });
});
