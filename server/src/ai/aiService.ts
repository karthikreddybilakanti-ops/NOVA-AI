import { NovaModelId } from '../types.js';

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AttachmentContext {
  originalName: string;
  mimeType: string;
  extractedText: string;
  base64Data?: string;
}

export interface AICompletionResult {
  response: string;
  model: string;
  latency_ms: number;
}

export class AIService {
  public async generateAnswer(
    sanitizedPrompt: string,
    modelId: NovaModelId = 'nova-smart',
    history: ChatHistoryMessage[] = [],
    attachment?: AttachmentContext
  ): Promise<AICompletionResult> {
    const startTime = Date.now();

    // =========================================================================
    // 1. Primary AI Provider: Groq API (High-performance inference)
    // =========================================================================
    if (process.env.GROQ_API_KEY) {
      const apiKey = process.env.GROQ_API_KEY;
      const isImage = !!(attachment && attachment.base64Data && attachment.mimeType.startsWith('image/'));

      // If an image is attached, route to Groq's multimodal vision model (llama-3.2-11b-vision-preview).
      // Otherwise, route to Groq's flagship general-purpose model (llama-3.3-70b-versatile).
      const targetModel = isImage
        ? process.env.GROQ_VISION_MODEL || 'llama-3.2-11b-vision-preview'
        : process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

      console.log(`[AI Service] Dispatching request to Groq API (model: ${targetModel}, isImage: ${isImage})...`);

      const messages: any[] = [
        {
          role: 'system',
          content:
            'You are NOVA AI, a privacy-first, highly capable, intelligent, natural, and empathetic general-purpose AI assistant. ' +
            'Adapt your tone to the user\'s context, situation, and technical depth. Answer directly, clearly, and insightfully. ' +
            'When analyzing documents or images, ground your answers directly on the content provided.',
        },
        ...history.map((h) => ({ role: h.role, content: h.content })),
      ];

      let promptText = sanitizedPrompt;
      if (attachment && attachment.extractedText) {
        promptText = `[Uploaded File: "${attachment.originalName}" (${attachment.mimeType})]\n--- File Content Start ---\n${attachment.extractedText.slice(0, 35000)}\n--- File Content End ---\n\nUser Request: ${sanitizedPrompt}`;
      }

      if (isImage) {
        messages.push({
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${attachment!.mimeType};base64,${attachment!.base64Data}`,
              },
            },
            { type: 'text', text: promptText },
          ],
        });
      } else {
        messages.push({ role: 'user', content: promptText });
      }

      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: targetModel,
            messages,
          }),
        });

        if (!res.ok) {
          const errData: any = await res.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `HTTP ${res.status} ${res.statusText}`;
          console.error(`[AI Service] Groq API returned error: ${errMsg}`);
          throw new Error(`Groq AI provider error (${res.status}): ${errMsg}`);
        }

        const data: any = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (!text || !text.trim()) {
          throw new Error('Groq AI provider returned an empty response.');
        }

        const latency_ms = Date.now() - startTime;
        console.log(`[AI Service] Groq API (${targetModel}) successfully returned response in ${latency_ms}ms.`);
        return {
          response: text.trim(),
          model: 'NOVA AI',
          latency_ms,
        };
      } catch (err: any) {
        console.error('[AI Service] Groq request failure:', err.message || err);
        throw err;
      }
    }

    // =========================================================================
    // 2. Secondary Provider: OpenAI API (if configured)
    // =========================================================================
    if (process.env.OPENAI_API_KEY) {
      const apiKey = process.env.OPENAI_API_KEY;
      const targetModel = modelId === 'nova-reasoning' ? 'gpt-4o' : 'gpt-4o-mini';
      console.log(`[AI Service] Dispatching request to OpenAI API (model: ${targetModel})...`);

      const messages: any[] = [
        {
          role: 'system',
          content:
            'You are NOVA AI, a privacy-first, highly capable, intelligent, natural, and empathetic general-purpose AI assistant. ' +
            'Adapt your tone to the user\'s situation. Answer directly without robotic templates. ' +
            'When documents or images are attached, ground your answers specifically on the provided file content.',
        },
        ...history.map((h) => ({ role: h.role, content: h.content })),
      ];

      let promptText = sanitizedPrompt;
      if (attachment && attachment.extractedText) {
        promptText = `[Uploaded File: "${attachment.originalName}" (${attachment.mimeType})]\n--- File Content Start ---\n${attachment.extractedText.slice(0, 35000)}\n--- File Content End ---\n\nUser Request: ${sanitizedPrompt}`;
      }

      if (attachment && attachment.base64Data && attachment.mimeType.startsWith('image/')) {
        messages.push({
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${attachment.mimeType};base64,${attachment.base64Data}`,
              },
            },
            { type: 'text', text: promptText },
          ],
        });
      } else {
        messages.push({ role: 'user', content: promptText });
      }

      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: targetModel,
            messages,
          }),
        });

        if (!res.ok) {
          const errData: any = await res.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `HTTP ${res.status} ${res.statusText}`;
          console.error(`[AI Service] OpenAI API returned error: ${errMsg}`);
          throw new Error(`OpenAI provider error (${res.status}): ${errMsg}`);
        }

        const data: any = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (!text || !text.trim()) {
          throw new Error('OpenAI provider returned an empty response.');
        }

        const latency_ms = Date.now() - startTime;
        console.log(`[AI Service] OpenAI API successfully returned response in ${latency_ms}ms.`);
        return {
          response: text.trim(),
          model: 'NOVA AI',
          latency_ms,
        };
      } catch (err: any) {
        console.error('[AI Service] OpenAI request failure:', err.message || err);
        throw err;
      }
    }

    // =========================================================================
    // 3. NO LOCAL FALLBACK: When no AI API key is configured, return clear error
    // =========================================================================
    console.error('[AI Service] Error: No external AI provider (GROQ_API_KEY) is configured.');
    throw new Error(
      'AI service is currently unavailable. No AI provider API key (GROQ_API_KEY) is configured in the environment. Please configure your provider credentials.'
    );
  }
}
