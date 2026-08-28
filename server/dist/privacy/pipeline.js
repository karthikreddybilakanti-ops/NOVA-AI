import { PrivacyDetector } from './detector.js';
import { NecessityEngine } from './necessityEngine.js';
import { PromptSanitizer } from './sanitizer.js';
import { IntentAnalyzer } from './intentAnalyzer.js';
import { AIService } from '../ai/aiService.js';
import { globalTraceStore } from '../trace/traceStore.js';
export class PrivacyPipeline {
    detector;
    necessityEngine;
    sanitizer;
    aiService;
    constructor() {
        this.detector = new PrivacyDetector();
        this.necessityEngine = new NecessityEngine();
        this.sanitizer = new PromptSanitizer();
        this.aiService = new AIService();
    }
    async process(rawPrompt, modelId = 'nova-smart', conversationId, userId = 'anon-user', history = [], attachment) {
        const startTime = Date.now();
        const traceId = `TRC-${Date.now().toString(16).slice(-4).toUpperCase()}${Math.floor(10 + Math.random() * 90)}`;
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        // STAGE 0: Intent & Problem Analysis
        const tIntentStart = Date.now();
        const taskIntent = IntentAnalyzer.analyze(rawPrompt);
        const intentDuration = Date.now() - tIntentStart;
        // STAGE 1: Sensitive Data Detection
        const tDetectStart = Date.now();
        const detections = this.detector.detect(rawPrompt);
        const detectDuration = Date.now() - tDetectStart;
        // STAGE 2: Necessity Decision (Intent-Aware)
        const tDecideStart = Date.now();
        const decisions = this.necessityEngine.evaluate(rawPrompt, detections, taskIntent);
        const decideDuration = Date.now() - tDecideStart;
        // STAGE 3: Prompt Minimization / Sanitization
        const tSanitizeStart = Date.now();
        const sanitizedPrompt = this.sanitizer.sanitize(rawPrompt, detections, decisions, taskIntent);
        const sanitizeDuration = Date.now() - tSanitizeStart;
        const isModified = sanitizedPrompt !== rawPrompt;
        // STAGE 4: Downstream AI Model Execution
        // The AI receives ONLY the sanitized/minimized prompt (+ parsed attachment if present)
        const tAiStart = Date.now();
        const aiResult = await this.aiService.generateAnswer(sanitizedPrompt, modelId, history, attachment);
        const aiDuration = Date.now() - tAiStart;
        const totalLatency = Date.now() - startTime;
        const removedCount = decisions.filter((d) => d.decision === 'UNNECESSARY').length;
        const preservedCount = decisions.filter((d) => d.decision === 'REQUIRED').length;
        const status = isModified ? 'sanitized' : 'pass_through';
        // Construct detailed pipeline verification stages for Admin inspection
        const stages = [
            {
                name: 'INPUT',
                status: 'completed',
                duration_ms: Math.max(1, intentDuration),
                summary: `Intent: "${taskIntent.summary}" (${taskIntent.problemType})`,
                details: { domain: taskIntent.domain, problemType: taskIntent.problemType },
            },
            {
                name: 'DETECT',
                status: 'completed',
                duration_ms: Math.max(1, detectDuration),
                summary: detections.length > 0 ? `Identified ${detections.length} sensitive entity matches` : 'Clean prompt, zero sensitive entities',
            },
            {
                name: 'DECIDE',
                status: 'completed',
                duration_ms: Math.max(1, decideDuration),
                summary: `Evaluated ${decisions.length} items (${removedCount} unnecessary, ${preservedCount} required)`,
            },
            {
                name: 'MINIMIZE',
                status: 'completed',
                duration_ms: Math.max(1, sanitizeDuration),
                summary: isModified ? `Minimization complete (Removed unnecessary tokens)` : 'Passed through without modification',
            },
            {
                name: 'AI',
                status: 'completed',
                duration_ms: aiDuration,
                summary: `Generated answer via ${aiResult.model} (${modelId})`,
            },
            {
                name: 'OUTPUT',
                status: 'completed',
                duration_ms: 2,
                summary: `Dispatched response to user in ${totalLatency}ms`,
            },
        ];
        // STAGE 5: Record Real-Time Telemetry to Global Trace Store (For Admin Verification)
        const traceRecord = {
            trace_id: traceId,
            timestamp: new Date().toISOString(),
            user_id: userId,
            conversation_id: conversationId,
            model_id: modelId,
            raw_prompt: rawPrompt,
            intent: taskIntent.summary,
            intent_summary: taskIntent.problemType,
            detections,
            necessity_decisions: decisions,
            sanitized_prompt: sanitizedPrompt,
            response: aiResult.response,
            model: aiResult.model,
            status,
            latency_ms: totalLatency,
            stages,
            metrics: {
                detectedCount: detections.length,
                removedCount,
                preservedCount,
                sanitizationPercentage: rawPrompt.length > 0
                    ? Math.round((Math.max(0, rawPrompt.length - sanitizedPrompt.length) / rawPrompt.length) * 100)
                    : 0,
            },
        };
        // Store in admin verification log and broadcast to admin SSE
        globalTraceStore.addTrace(traceRecord);
        return {
            messageId,
            conversationId,
            answer: aiResult.response,
            modelId,
            model: aiResult.model,
            latency_ms: totalLatency,
            trace_id: traceId,
            status,
        };
    }
}
export const globalPipeline = new PrivacyPipeline();
