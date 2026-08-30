import { PrivacyDetector } from './detector.js';
import { NecessityEngine } from './necessityEngine.js';
import { PromptSanitizer } from './sanitizer.js';
import { IntentAnalyzer } from './intentAnalyzer.js';
import { AIService, AttachmentContext } from '../ai/aiService.js';
import { globalTraceStore } from '../trace/traceStore.js';
import { TraceRecord, NovaModelId, PipelineStage, DetectedEntity } from '../types.js';

export interface PrivacyPipelineResult {
  messageId: string;
  conversationId: string;
  answer: string;
  modelId: NovaModelId;
  model: string;
  latency_ms: number;
  trace_id: string;
  status: 'sanitized' | 'pass_through';
}

export class PrivacyPipeline {
  private detector: PrivacyDetector;
  private necessityEngine: NecessityEngine;
  private sanitizer: PromptSanitizer;
  private aiService: AIService;

  constructor() {
    this.detector = new PrivacyDetector();
    this.necessityEngine = new NecessityEngine();
    this.sanitizer = new PromptSanitizer();
    this.aiService = new AIService();
  }

  public async process(
    rawPrompt: string,
    modelId: NovaModelId = 'nova-smart',
    conversationId: string,
    userId: string = 'anon-user',
    history: { role: 'user' | 'assistant'; content: string }[] = [],
    attachment?: AttachmentContext
  ): Promise<PrivacyPipelineResult> {
    const startTime = Date.now();
    const traceId = `TRC-${Date.now().toString(16).slice(-4).toUpperCase()}${Math.floor(10 + Math.random() * 90)}`;
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // STAGE 0: Intent & Problem Analysis (Analyzing Prompt + Attachment context)
    const tIntentStart = Date.now();
    const analysisContext = attachment && attachment.extractedText
      ? `${rawPrompt}\n[Document Content]: ${attachment.extractedText.slice(0, 1000)}`
      : rawPrompt;
    const taskIntent = IntentAnalyzer.analyze(analysisContext);
    const intentDuration = Date.now() - tIntentStart;

    // STAGE 1: Sensitive Data Detection in Prompt
    const tDetectStart = Date.now();
    const promptDetections = this.detector.detect(rawPrompt);

    // Also detect sensitive data in attachment if present
    let docDetections: DetectedEntity[] = [];
    if (attachment && attachment.extractedText) {
      docDetections = this.detector.detect(attachment.extractedText);
    }
    const allDetections = [...promptDetections, ...docDetections];
    const detectDuration = Date.now() - tDetectStart;

    // STAGE 2: Necessity Decision (Intent-Aware)
    const tDecideStart = Date.now();
    const promptDecisions = this.necessityEngine.evaluate(rawPrompt, promptDetections, taskIntent);
    const docDecisions = attachment && attachment.extractedText
      ? this.necessityEngine.evaluate(attachment.extractedText, docDetections, taskIntent)
      : [];
    const allDecisions = [...promptDecisions, ...docDecisions];
    const decideDuration = Date.now() - tDecideStart;

    // STAGE 3: Prompt & Document Minimization / Sanitization
    const tSanitizeStart = Date.now();
    const sanitizedPrompt = this.sanitizer.sanitize(rawPrompt, promptDetections, promptDecisions, taskIntent);
    
    let sanitizedAttachment = attachment;
    if (attachment && attachment.extractedText) {
      const sanitizedDocText = this.sanitizer.sanitizeDocumentText(
        attachment.extractedText,
        docDetections,
        docDecisions
      );
      sanitizedAttachment = {
        ...attachment,
        extractedText: sanitizedDocText,
      };
    }
    const sanitizeDuration = Date.now() - tSanitizeStart;
    const isModified = sanitizedPrompt !== rawPrompt || (attachment && sanitizedAttachment?.extractedText !== attachment.extractedText);

    // STAGE 4: Downstream AI Model Execution
    // The AI receives ONLY the sanitized/minimized prompt and privacy-safe attachment content
    const tAiStart = Date.now();
    const aiResult = await this.aiService.generateAnswer(
      sanitizedPrompt,
      modelId,
      history,
      sanitizedAttachment
    );
    const aiDuration = Date.now() - tAiStart;

    const totalLatency = Date.now() - startTime;
    const removedCount = allDecisions.filter((d) => d.decision === 'UNNECESSARY').length;
    const preservedCount = allDecisions.filter((d) => d.decision === 'REQUIRED').length;
    const status = isModified ? 'sanitized' : 'pass_through';

    // Mask raw values in telemetry for security (Section 24: Do not store raw secrets in admin)
    const maskedDetections = allDetections.map((d) => ({
      ...d,
      value: this.maskSensitiveValue(d.category, d.value),
    }));

    const maskedDecisions = allDecisions.map((d) => ({
      ...d,
      value: this.maskSensitiveValue(d.category, d.value),
    }));

    // Construct detailed pipeline verification stages for Admin inspection
    const stages: PipelineStage[] = [
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
        summary: allDetections.length > 0 ? `Identified ${allDetections.length} sensitive entity matches` : 'Clean prompt, zero sensitive entities',
      },
      {
        name: 'DECIDE',
        status: 'completed',
        duration_ms: Math.max(1, decideDuration),
        summary: `Evaluated ${allDecisions.length} items (${removedCount} unnecessary, ${preservedCount} required)`,
      },
      {
        name: 'MINIMIZE',
        status: 'completed',
        duration_ms: Math.max(1, sanitizeDuration),
        summary: isModified ? `Minimization complete (Removed unnecessary sensitive context)` : 'Passed through without modification',
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
    const traceRecord: TraceRecord = {
      trace_id: traceId,
      timestamp: new Date().toISOString(),
      user_id: userId,
      conversation_id: conversationId,
      model_id: modelId,
      raw_prompt: rawPrompt,
      intent: taskIntent.summary,
      intent_summary: taskIntent.problemType,
      detections: maskedDetections,
      necessity_decisions: maskedDecisions,
      sanitized_prompt: sanitizedPrompt,
      response: aiResult.response,
      model: aiResult.model,
      status,
      latency_ms: totalLatency,
      stages,
      metrics: {
        detectedCount: allDetections.length,
        removedCount,
        preservedCount,
        sanitizationPercentage:
          rawPrompt.length > 0
            ? Math.round(
                (Math.max(0, rawPrompt.length - sanitizedPrompt.length) / rawPrompt.length) * 100
              )
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

  /**
   * Helper to mask sensitive values for admin telemetry security
   */
  private maskSensitiveValue(category: string, value: string): string {
    if (!value) return '[REDACTED]';

    if (category === 'Email') {
      const parts = value.split('@');
      if (parts.length === 2) {
        const name = parts[0];
        const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
        return `${maskedName}@${parts[1]}`;
      }
      return '[REDACTED EMAIL]';
    }

    if (category === 'Financial information' || category === 'Phone' || category === 'Government identifiers') {
      const digits = value.replace(/\D/g, '');
      if (digits.length >= 8) {
        return `${digits.slice(0, 4)}****${digits.slice(-4)}`;
      }
      return '[REDACTED NUMBER]';
    }

    if (category === 'Credentials/secrets') {
      return '[PROTECTED CREDENTIAL]';
    }

    return '[REDACTED]';
  }
}

export const globalPipeline = new PrivacyPipeline();
