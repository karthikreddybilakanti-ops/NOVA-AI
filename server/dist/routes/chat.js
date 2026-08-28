import { Router } from 'express';
import multer from 'multer';
import { globalPipeline } from '../privacy/pipeline.js';
import { globalConversationStore } from '../chat/conversationStore.js';
import { globalAuthStore } from '../auth/authStore.js';
import { FileProcessor } from '../chat/fileProcessor.js';
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});
export const chatRouter = Router();
// Helper to extract user from Authorization header
function getAuthUser(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return null;
    const token = authHeader.split(' ')[1];
    return globalAuthStore.getUserByToken(token);
}
// 1. File Upload Endpoint (for Attachments: PDF, TXT, CSV, DOCX, images)
chatRouter.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const originalName = req.file.originalname;
        const mimeType = req.file.mimetype;
        const buffer = req.file.buffer;
        const processed = await FileProcessor.processFile(buffer, originalName, mimeType);
        res.json({
            success: true,
            file: {
                originalName: processed.originalName,
                mimeType: processed.mimeType,
                sizeBytes: processed.sizeBytes,
                summary: processed.summary,
                extractedText: processed.extractedText,
            },
        });
    }
    catch (err) {
        console.error('File upload error:', err);
        res.status(500).json({ error: err.message || 'Failed to process file' });
    }
});
// 2. Fetch Available AI Models
chatRouter.get('/models', (_req, res) => {
    const models = globalConversationStore.getModels();
    res.json({ models });
});
// 3. User Conversations List
chatRouter.get('/conversations', (req, res) => {
    const user = getAuthUser(req);
    const userId = user ? user.id : 'anon-user';
    const conversations = globalConversationStore.getUserConversations(userId);
    res.json({ conversations });
});
// 4. Create New Conversation
chatRouter.post('/conversations', (req, res) => {
    const user = getAuthUser(req);
    const userId = user ? user.id : 'anon-user';
    const { title, modelId } = req.body;
    const conversation = globalConversationStore.createConversation(userId, title || 'New Chat', modelId || 'nova-smart');
    res.status(201).json({ conversation });
});
// 5. Get Specific Conversation Details & Messages
chatRouter.get('/conversations/:id', (req, res) => {
    const { id } = req.params;
    const conversation = globalConversationStore.getConversation(id);
    if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
    }
    const messages = globalConversationStore.getMessages(id);
    res.json({ conversation, messages });
});
// 6. Delete Conversation
chatRouter.delete('/conversations/:id', (req, res) => {
    const { id } = req.params;
    const success = globalConversationStore.deleteConversation(id);
    res.json({ success });
});
// 7. Core Chat Message Dispatch
chatRouter.post('/message', async (req, res) => {
    try {
        const { prompt, modelId, conversationId, attachment } = req.body;
        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            res.status(400).json({ error: 'Prompt is required' });
            return;
        }
        const user = getAuthUser(req);
        const userId = user ? user.id : 'anon-user';
        const selectedModel = modelId || 'nova-smart';
        // 1. Get or create conversation
        let convId = conversationId;
        if (!convId || !globalConversationStore.getConversation(convId)) {
            const newConv = globalConversationStore.createConversation(userId, prompt.trim().slice(0, 40), selectedModel);
            convId = newConv.id;
        }
        // 2. Fetch recent conversation history for multi-turn context
        const existingMessages = globalConversationStore.getMessages(convId);
        const history = existingMessages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
        }));
        // 3. Log user message
        globalConversationStore.addMessage(convId, 'user', prompt.trim(), selectedModel);
        // 4. Run through Privacy Pipeline BEFORE model receives it!
        const result = await globalPipeline.process(prompt.trim(), selectedModel, convId, userId, history, attachment);
        // 5. Store AI message
        globalConversationStore.addMessage(convId, 'assistant', result.answer, result.modelId, result.trace_id);
        // 6. Return response to user
        res.json({
            messageId: result.messageId,
            conversationId: result.conversationId,
            answer: result.answer,
            modelId: result.modelId,
            model: result.model,
            latency_ms: result.latency_ms,
            trace_id: result.trace_id,
            timestamp: new Date().toISOString(),
        });
    }
    catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ error: err.message || 'Internal server error processing chat request.' });
    }
});
