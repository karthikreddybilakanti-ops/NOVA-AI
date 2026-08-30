import { GoogleGenAI } from '@google/genai';
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
    // 1. External Gemini Interactions API Integration (gemini-3.6-flash)
    // =========================================================================
    if (process.env.GEMINI_API_KEY) {
      const apiKey = process.env.GEMINI_API_KEY;
      const targetModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
      console.log(`[AI Service] Dispatching request to Google Gemini Interactions API (model: ${targetModel})...`);

      const systemInstruction =
        'You are NOVA AI, a privacy-first, highly capable, intelligent, natural, and empathetic general-purpose AI assistant. ' +
        'Adapt your tone to the user\'s context, situation, and technical depth. Answer directly, clearly, and insightfully. ' +
        'When analyzing documents or images, ground your answers directly on the content provided.';

      // Format multi-turn conversation context
      let contextualPrompt = '';
      if (history.length > 0) {
        contextualPrompt += 'Previous conversation context:\n';
        for (const h of history) {
          contextualPrompt += `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}\n`;
        }
        contextualPrompt += '\n';
      }

      if (attachment && attachment.extractedText) {
        contextualPrompt += `[Uploaded File: "${attachment.originalName}" (${attachment.mimeType})]\n--- File Content Start ---\n${attachment.extractedText.slice(0, 35000)}\n--- File Content End ---\n\n`;
      }

      contextualPrompt += `Current User Request: ${sanitizedPrompt}`;

      // Build multimodal inputs array
      const inputParts: any[] = [];
      if (attachment && attachment.base64Data && attachment.mimeType.startsWith('image/')) {
        inputParts.push({
          type: 'image',
          mime_type: attachment.mimeType,
          data: attachment.base64Data,
        });
      }
      inputParts.push({
        type: 'text',
        text: contextualPrompt,
      });

      try {
        let responseText = '';

        // Attempt via official @google/genai SDK Interactions client
        try {
          const ai = new GoogleGenAI({ apiKey });
          const interaction = await (ai as any).interactions.create({
            model: targetModel,
            system_instruction: systemInstruction,
            input: inputParts.length === 1 ? contextualPrompt : inputParts,
          });

          responseText =
            interaction?.output_text ||
            interaction?.output ||
            interaction?.outputs?.[0]?.text ||
            (typeof interaction?.steps?.[0]?.output === 'string' ? interaction.steps[0].output : '') ||
            '';
        } catch (sdkErr: any) {
          console.warn('[AI Service] SDK Interactions notice, attempting REST endpoint:', sdkErr.message || sdkErr);
        }

        // Direct REST Interactions API call if SDK didn't return text
        if (!responseText || !responseText.trim()) {
          const restRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/interactions?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: targetModel,
                system_instruction: systemInstruction,
                input: inputParts.length === 1 ? contextualPrompt : inputParts,
              }),
            }
          );

          if (!restRes.ok) {
            const errData: any = await restRes.json().catch(() => ({}));
            const errMsg = errData?.error?.message || `HTTP ${restRes.status} ${restRes.statusText}`;
            console.error(`[AI Service] Gemini Interactions API error: ${errMsg}`);
            throw new Error(`Gemini AI provider error (${restRes.status}): ${errMsg}`);
          }

          const restData: any = await restRes.json();
          responseText =
            restData?.output_text ||
            restData?.output ||
            restData?.outputs?.[0]?.text ||
            (typeof restData?.steps?.[0]?.output === 'string' ? restData.steps[0].output : '') ||
            '';
        }

        if (!responseText || !responseText.trim()) {
          throw new Error('Gemini Interactions API returned an empty response.');
        }

        const latency_ms = Date.now() - startTime;
        console.log(`[AI Service] Google Gemini Interactions API (${targetModel}) responded in ${latency_ms}ms.`);
        return {
          response: responseText.trim(),
          model: 'NOVA AI',
          latency_ms,
        };
      } catch (err: any) {
        console.error('[AI Service] Gemini Interactions API request failure:', err.message || err);
        throw err;
      }
    }

    // =========================================================================
    // 2. External OpenAI API Integration
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
          model: `OpenAI (${targetModel})`,
          latency_ms,
        };
      } catch (err: any) {
        console.error('[AI Service] OpenAI request failure:', err.message || err);
        throw err;
      }
    }

    // =========================================================================
    // 3. NO LOCAL FALLBACK: When no AI API key is configured, return error
    // =========================================================================
    console.error('[AI Service] Error: No external AI provider (GEMINI_API_KEY or OPENAI_API_KEY) is configured.');
    throw new Error(
      'AI service is currently unavailable. No AI provider API key (GEMINI_API_KEY or OPENAI_API_KEY) is configured in the environment. Please configure your provider credentials.'
    );
  }
}
