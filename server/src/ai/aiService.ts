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

    // 1. External Gemini API integration if configured (with native multimodal vision)
    if (process.env.GEMINI_API_KEY) {
      const apiKey = process.env.GEMINI_API_KEY;
      const targetModel = 'gemini-1.5-flash';
      console.log(`[AI Service] Dispathing request to Google Gemini API (model: ${targetModel})...`);

      const geminiContents: { role: string; parts: any[] }[] = [];

      // Conversational system prompt
      const systemPrompt =
        'You are NOVA AI, a privacy-first, highly capable, intelligent, natural, and empathetic general-purpose AI assistant. ' +
        'Adapt your tone to the user\'s context, situation, and technical depth. Answer directly, clearly, and insightfully. ' +
        'When analyzing documents or images, ground your answers directly on the content provided.';

      geminiContents.push({
        role: 'user',
        parts: [{ text: systemPrompt }],
      });
      geminiContents.push({
        role: 'model',
        parts: [{ text: 'Understood. I am NOVA AI, ready to assist naturally, empathetically, and accurately.' }],
      });

      // Multi-turn history
      for (const h of history) {
        geminiContents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }],
        });
      }

      // Add user prompt with attachment context & native vision if available
      const currentParts: any[] = [];
      if (attachment && attachment.base64Data && attachment.mimeType.startsWith('image/')) {
        currentParts.push({
          inlineData: {
            mimeType: attachment.mimeType,
            data: attachment.base64Data,
          },
        });
      }

      let userPromptWithAttachment = sanitizedPrompt;
      if (attachment && attachment.extractedText) {
        userPromptWithAttachment = `[Uploaded File: "${attachment.originalName}" (${attachment.mimeType})]\n--- File Content Start ---\n${attachment.extractedText.slice(0, 30000)}\n--- File Content End ---\n\nUser Request: ${sanitizedPrompt}`;
      }

      currentParts.push({ text: userPromptWithAttachment });
      geminiContents.push({
        role: 'user',
        parts: currentParts,
      });

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: geminiContents }),
          }
        );

        if (!res.ok) {
          const errData: any = await res.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `HTTP ${res.status} ${res.statusText}`;
          console.error(`[AI Service] Gemini API returned error: ${errMsg}`);
          throw new Error(`Gemini AI provider error (${res.status}): ${errMsg}`);
        }

        const data: any = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text || !text.trim()) {
          throw new Error('Gemini AI provider returned an empty response.');
        }

        const latency_ms = Date.now() - startTime;
        console.log(`[AI Service] Gemini API successfully returned response in ${latency_ms}ms.`);
        return {
          response: text.trim(),
          model: 'Gemini 1.5 Flash',
          latency_ms,
        };
      } catch (err: any) {
        console.error('[AI Service] Gemini request failure:', err.message || err);
        throw err;
      }
    }

    // 2. External OpenAI API integration if configured (with native multimodal vision)
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
        promptText = `[Uploaded File: "${attachment.originalName}" (${attachment.mimeType})]\n--- File Content Start ---\n${attachment.extractedText.slice(0, 30000)}\n--- File Content End ---\n\nUser Request: ${sanitizedPrompt}`;
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
          model: `OpenAI (${targetModel})`,
          latency_ms,
        };
      } catch (err: any) {
        console.error('[AI Service] OpenAI request failure:', err.message || err);
        throw err;
      }
    }

    // 3. NO LOCAL FALLBACK: When no AI API key is configured, return an explicit service error
    console.error('[AI Service] Error: No external AI provider (GEMINI_API_KEY or OPENAI_API_KEY) is configured.');
    throw new Error(
      'AI service is currently unavailable. No AI provider API key (GEMINI_API_KEY or OPENAI_API_KEY) is configured in the environment. Please configure your provider credentials.'
    );
  }
}
