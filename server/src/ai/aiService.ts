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

function extractInteractionsText(data: any): string {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }
  if (Array.isArray(data?.steps)) {
    for (const step of data.steps) {
      if (step.type === 'model_output' && Array.isArray(step.content)) {
        for (const item of step.content) {
          if (item.type === 'text' && typeof item.text === 'string' && item.text.trim()) {
            return item.text.trim();
          }
        }
      }
    }
  }
  if (Array.isArray(data?.outputs) && data.outputs[0]?.text) {
    return data.outputs[0].text.trim();
  }
  if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text.trim();
  }
  return '';
}

export class AIService {
  public async generateAnswer(
    sanitizedPrompt: string,
    modelId: NovaModelId = 'nova-smart',
    history: ChatHistoryMessage[] = [],
    attachment?: AttachmentContext
  ): Promise<AICompletionResult> {
    const startTime = Date.now();
    const isImage = !!(attachment && attachment.base64Data && attachment.mimeType.startsWith('image/'));

    // =========================================================================
    // 1. Image / Screenshot Routing: Dedicated Vision Provider
    // =========================================================================
    if (isImage) {
      console.log(`[AI Service] Visual asset detected ("${attachment!.originalName}", ${attachment!.mimeType}). Routing to vision provider...`);

      // Option A: Gemini Interactions API Vision (gemini-3.6-flash)
      if (process.env.GEMINI_API_KEY) {
        const apiKey = process.env.GEMINI_API_KEY;
        const targetModel = process.env.GEMINI_VISION_MODEL || process.env.GEMINI_MODEL || 'gemini-3.6-flash';
        console.log(`[AI Service] Dispatching image request to Gemini Interactions API (model: ${targetModel})...`);

        const systemInstruction =
          'You are NOVA AI, a privacy-first, highly capable, intelligent, natural, and empathetic general-purpose AI assistant. ' +
          'Analyze the provided image and respond directly, accurately, and insightfully based on the visual content.';

        let contextualPrompt = '';
        if (history.length > 0) {
          contextualPrompt += 'Previous conversation context:\n';
          for (const h of history) {
            contextualPrompt += `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}\n`;
          }
          contextualPrompt += '\n';
        }
        contextualPrompt += `User Request: ${sanitizedPrompt}`;

        const inputParts: any[] = [
          {
            type: 'image',
            mime_type: attachment!.mimeType,
            data: attachment!.base64Data,
          },
          {
            type: 'text',
            text: contextualPrompt,
          },
        ];

        try {
          let responseText = '';

          try {
            const ai = new GoogleGenAI({ apiKey });
            const interaction = await (ai as any).interactions.create({
              model: targetModel,
              system_instruction: systemInstruction,
              input: inputParts,
            });
            responseText = extractInteractionsText(interaction);
          } catch (sdkErr: any) {
            console.warn('[AI Service] SDK Interactions notice, attempting direct REST endpoint:', sdkErr.message || sdkErr);
          }

          if (!responseText || !responseText.trim()) {
            const restRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/interactions?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  model: targetModel,
                  system_instruction: systemInstruction,
                  input: inputParts,
                }),
              }
            );

            if (!restRes.ok) {
              const errData: any = await restRes.json().catch(() => ({}));
              const errMsg = errData?.error?.message || `HTTP ${restRes.status} ${restRes.statusText}`;
              console.error(`[AI Service] Gemini Vision error: ${errMsg}`);
              throw new Error(`Gemini Vision provider error (${restRes.status}): ${errMsg}`);
            }

            const restData: any = await restRes.json();
            responseText = extractInteractionsText(restData);
          }

          if (!responseText || !responseText.trim()) {
            throw new Error('Gemini Vision provider returned an empty response.');
          }

          const latency_ms = Date.now() - startTime;
          console.log(`[AI Service] Gemini Vision (${targetModel}) responded in ${latency_ms}ms.`);
          return {
            response: responseText.trim(),
            model: 'NOVA AI',
            latency_ms,
          };
        } catch (err: any) {
          console.error('[AI Service] Vision request failure:', err.message || err);
          throw err;
        }
      }

      // Option B: OpenAI GPT-4o Vision
      if (process.env.OPENAI_API_KEY) {
        const apiKey = process.env.OPENAI_API_KEY;
        const targetModel = process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini';
        console.log(`[AI Service] Dispatching image request to OpenAI Vision (model: ${targetModel})...`);

        const messages: any[] = [
          {
            role: 'system',
            content:
              'You are NOVA AI, a privacy-first, highly capable general-purpose AI assistant. Analyze the image and respond accurately.',
          },
          ...history.map((h) => ({ role: h.role, content: h.content })),
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${attachment!.mimeType};base64,${attachment!.base64Data}`,
                },
              },
              { type: 'text', text: sanitizedPrompt },
            ],
          },
        ];

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
            throw new Error(`OpenAI Vision error (${res.status}): ${errMsg}`);
          }

          const data: any = await res.json();
          const text = data?.choices?.[0]?.message?.content;
          if (!text || !text.trim()) {
            throw new Error('OpenAI Vision provider returned an empty response.');
          }

          const latency_ms = Date.now() - startTime;
          return {
            response: text.trim(),
            model: 'NOVA AI',
            latency_ms,
          };
        } catch (err: any) {
          console.error('[AI Service] OpenAI Vision failure:', err.message || err);
          throw err;
        }
      }

      // If no vision key is configured:
      throw new Error(
        'Image/screenshot analysis requires a configured vision provider API key (GEMINI_API_KEY or OPENAI_API_KEY). Groq currently operates as a text and document intelligence provider on this account.'
      );
    }

    // =========================================================================
    // 2. Primary Text & Document Intelligence Provider: Groq (openai/gpt-oss-120b)
    // =========================================================================
    if (process.env.GROQ_API_KEY) {
      const apiKey = process.env.GROQ_API_KEY;
      const targetModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

      console.log(`[AI Service] Dispatching request to Groq API (model: ${targetModel})...`);

      const messages: any[] = [
        {
          role: 'system',
          content:
            'You are NOVA AI, a privacy-first, highly capable, intelligent, natural, and empathetic general-purpose AI assistant. ' +
            'Adapt your tone to the user\'s context, situation, and technical depth. Answer directly, clearly, and insightfully. ' +
            'When analyzing documents or reading file context, ground your answers directly on the content provided.',
        },
        ...history.map((h) => ({ role: h.role, content: h.content })),
      ];

      let promptText = sanitizedPrompt;
      if (attachment && attachment.extractedText) {
        promptText = `[Uploaded File: "${attachment.originalName}" (${attachment.mimeType})]\n--- File Content Start ---\n${attachment.extractedText.slice(0, 35000)}\n--- File Content End ---\n\nUser Request: ${sanitizedPrompt}`;
      }

      messages.push({ role: 'user', content: promptText });

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
          console.error(`[AI Service] Groq API error: ${errMsg}`);
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
    // 3. Fallback Providers: OpenAI / Gemini (if GROQ_API_KEY is not configured)
    // =========================================================================
    if (process.env.OPENAI_API_KEY) {
      const apiKey = process.env.OPENAI_API_KEY;
      const targetModel = modelId === 'nova-reasoning' ? 'gpt-4o' : 'gpt-4o-mini';

      const messages: any[] = [
        {
          role: 'system',
          content:
            'You are NOVA AI, a privacy-first, highly capable general-purpose AI assistant. Answer directly without robotic templates.',
        },
        ...history.map((h) => ({ role: h.role, content: h.content })),
      ];

      let promptText = sanitizedPrompt;
      if (attachment && attachment.extractedText) {
        promptText = `[Uploaded File: "${attachment.originalName}" (${attachment.mimeType})]\n--- File Content Start ---\n${attachment.extractedText.slice(0, 35000)}\n--- File Content End ---\n\nUser Request: ${sanitizedPrompt}`;
      }

      messages.push({ role: 'user', content: promptText });

      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ model: targetModel, messages }),
        });

        if (!res.ok) {
          const errData: any = await res.json().catch(() => ({}));
          throw new Error(`OpenAI provider error (${res.status}): ${errData?.error?.message || res.statusText}`);
        }

        const data: any = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        const latency_ms = Date.now() - startTime;
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
    // 4. NO LOCAL FALLBACK: When no AI API key is configured, return clear error
    // =========================================================================
    console.error('[AI Service] Error: No AI provider API key (GROQ_API_KEY) is configured.');
    throw new Error(
      'AI service is currently unavailable. No AI provider API key (GROQ_API_KEY) is configured in the environment. Please configure your provider credentials.'
    );
  }
}
