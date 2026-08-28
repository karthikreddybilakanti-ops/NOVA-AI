export class TraceStore {
    traces = [];
    sseClients = new Set();
    addTrace(trace) {
        // Prepend new traces so newest is first
        this.traces.unshift(trace);
        // Limit memory footprint to last 1000 traces
        if (this.traces.length > 1000) {
            this.traces.pop();
        }
        // Broadcast to SSE clients (Admin telemetry stream)
        this.broadcastSSE('new_trace', trace);
    }
    getTraces() {
        return this.traces;
    }
    getTraceById(traceId) {
        return this.traces.find((t) => t.trace_id.toLowerCase() === traceId.toLowerCase());
    }
    getMetrics() {
        const totalRequests = this.traces.length;
        if (totalRequests === 0) {
            return {
                totalRequests: 0,
                sensitiveDataDetected: 0,
                dataMinimized: 0,
                averageProcessingTimeMs: 0,
                categoryBreakdown: {},
                modelUsage: {},
            };
        }
        let sensitiveDataDetected = 0;
        let dataMinimized = 0;
        let totalLatency = 0;
        const categoryBreakdown = {};
        const modelUsage = {};
        for (const t of this.traces) {
            sensitiveDataDetected += t.metrics.detectedCount;
            dataMinimized += t.metrics.removedCount;
            totalLatency += t.latency_ms;
            const m = t.model_id || 'nova-smart';
            modelUsage[m] = (modelUsage[m] || 0) + 1;
            for (const d of t.detections) {
                categoryBreakdown[d.category] = (categoryBreakdown[d.category] || 0) + 1;
            }
        }
        return {
            totalRequests,
            sensitiveDataDetected,
            dataMinimized,
            averageProcessingTimeMs: Math.round(totalLatency / totalRequests),
            categoryBreakdown,
            modelUsage,
        };
    }
    clear() {
        this.traces = [];
        this.broadcastSSE('cleared', {});
    }
    // SSE Subscription for Admin Verification
    addSSEClient(res) {
        this.sseClients.add(res);
        res.on('close', () => {
            this.sseClients.delete(res);
        });
    }
    broadcastSSE(event, data) {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        for (const client of this.sseClients) {
            try {
                client.write(payload);
            }
            catch {
                this.sseClients.delete(client);
            }
        }
    }
}
export const globalTraceStore = new TraceStore();
