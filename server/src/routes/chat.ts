import { Router, Request, Response } from 'express';
import multer from 'multer';
import { globalPipeline } from '../privacy/pipeline.js';
import { globalConversationStore } from '../chat/conversationStore.js';
import { globalAuthService } from '../auth/authService.js';
import { FileProcessor } from '../chat/fileProcessor.js';
import { uploadToSupabaseStorage } from '../supabase.js';
import { NovaModelId } from '../types.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

export const chatRouter = Router();

// Helper to extract user from Authorization header using persistent Supabase auth token
async function getAuthUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return await globalAuthService.getUserByToken(token);
}

// 1. File Upload Endpoint (for Attachments: PDF, TXT, CSV, DOCX, images)
chatRouter.post(
  '/upload',
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided in upload request.' });
        return;
      }

      const originalName = req.file.originalname || 'attachment.txt';
      const mimeType = req.file.mimetype || 'application/octet-stream';
      const buffer = req.file.buffer;

      // Extract text content and metadata
      const processed = await FileProcessor.processFile(buffer, originalName, mimeType);

      // If Supabase Storage is configured, upload to storage bucket
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'nova-attachments';
      const storageUpload = await uploadToSupabaseStorage(bucketName, originalName, buffer, mimeType);

      res.json({
        success: true,
        file: {
          originalName: processed.originalName,
          mimeType: processed.mimeType,
          sizeBytes: processed.sizeBytes,
          summary: processed.summary,
          extractedText: processed.extractedText,
          storageUrl: storageUpload.url || undefined,
        },
      });
    } catch (err: any) {
      console.error('[File Upload Error]:', err.message || err);
      res.status(500).json({ error: err.message || 'Failed to process and extract file content.' });
    }
  }
);

// 2. Fetch Available AI Models
chatRouter.get('/models', (_req: Request, res: Response) => {
  const models = globalConversationStore.getModels();
  res.json({ models });
});

// 3. User Conversations List
chatRouter.get('/conversations', async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  const userId = user ? user.id : 'anon-user';
  const conversations = globalConversationStore.getUserConversations(userId);
  res.json({ conversations });
});

// 4. Create New Conversation
chatRouter.post('/conversations', async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  const userId = user ? user.id : 'anon-user';
  const { title, modelId } = req.body;
  const conversation = globalConversationStore.createConversation(
    userId,
    title || 'New Chat',
    modelId || 'nova-smart'
  );
  res.status(201).json({ conversation });
});

// 5. Get Specific Conversation Details & Messages
chatRouter.get('/conversations/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const conversation = globalConversationStore.getConversation(id);
  if (!conversation) {
    res.status(404).json({ error: 'Conversation not found.' });
    return;
  }
  const messages = globalConversationStore.getMessages(id);
  res.json({ conversation, messages });
});

// 6. Delete Conversation
chatRouter.delete('/conversations/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const success = globalConversationStore.deleteConversation(id);
  res.json({ success });
});

// 7. Core Chat Message Dispatch
chatRouter.post('/message', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, modelId, conversationId, attachment } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'Prompt is required and cannot be empty.' });
      return;
    }

    const user = await getAuthUser(req);
    const userId = user ? user.id : 'anon-user';
    const selectedModel: NovaModelId = modelId || 'nova-smart';

    // 1. Get or create conversation
    let convId = conversationId;
    if (!convId || !globalConversationStore.getConversation(convId)) {
      const newConv = globalConversationStore.createConversation(
        userId,
        prompt.trim().slice(0, 40),
        selectedModel
      );
      convId = newConv.id;
    }

    // 2. Fetch recent conversation history for multi-turn context
    const existingMessages = globalConversationStore.getMessages(convId);
    const history = existingMessages.slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Find active attachment from current request OR recent conversation turn
    let activeAttachment = attachment;
    if (!activeAttachment || !activeAttachment.extractedText) {
      for (let i = existingMessages.length - 1; i >= 0; i--) {
        const prevAtt = existingMessages[i].attachment;
        if (prevAtt && prevAtt.extractedText && prevAtt.extractedText.trim().length > 0) {
          activeAttachment = prevAtt;
          break;
        }
      }
    }

    // 3. Run through Privacy Pipeline BEFORE model receives it!
    const result = await globalPipeline.process(
      prompt.trim(),
      selectedModel,
      convId,
      userId,
      history,
      activeAttachment
    );

    // 4. Store user message using privacy-safe minimized text with attachment (Sections 12 & 19)
    globalConversationStore.addMessage(
      convId,
      'user',
      result.sanitizedPrompt,
      selectedModel,
      undefined,
      attachment
    );

    // 5. Store AI message
    globalConversationStore.addMessage(
      convId,
      'assistant',
      result.answer,
      result.modelId,
      result.trace_id
    );

    // 6. Return response to user with privacy-safe sanitizedPrompt
    res.json({
      messageId: result.messageId,
      conversationId: result.conversationId,
      answer: result.answer,
      sanitizedPrompt: result.sanitizedPrompt,
      modelId: result.modelId,
      model: result.model,
      latency_ms: result.latency_ms,
      trace_id: result.trace_id,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Chat Service Error]:', err.message || err);
    res.status(500).json({ error: err.message || 'Internal server error processing chat request.' });
  }
});
