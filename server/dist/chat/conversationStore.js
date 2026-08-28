export class ConversationStore {
    conversations = new Map();
    messages = new Map(); // conversation_id -> MessageRecord[]
    models = [
        {
            id: 'nova-smart',
            name: 'Nova Smart',
            tagline: 'Best for everyday questions',
            description: 'Balanced, articulate, and versatile intelligence for natural discussions, coding, and general tasks.',
            badge: 'Recommended',
            speed: 'Fast',
            intelligence: 'High',
            contextWindow: '128k',
            enabled: true,
        },
        {
            id: 'nova-reasoning',
            name: 'Nova Reasoning',
            tagline: 'For complex problems and analysis',
            description: 'Deep chain-of-thought analysis, mathematical proofs, architectural planning, and rigorous logic.',
            badge: 'Deep Logic',
            speed: 'Thorough',
            intelligence: 'Maximum',
            contextWindow: '256k',
            enabled: true,
        },
        {
            id: 'nova-fast',
            name: 'Nova Fast',
            tagline: 'Fast everyday responses',
            description: 'Optimized for rapid responses, quick summaries, concise explanations, and high-speed Q&A.',
            badge: 'Instant',
            speed: 'Ultra Fast',
            intelligence: 'Standard',
            contextWindow: '64k',
            enabled: true,
        },
    ];
    getModels() {
        return this.models;
    }
    getModelById(id) {
        return this.models.find((m) => m.id === id);
    }
    toggleModel(id) {
        const model = this.models.find((m) => m.id === id);
        if (!model)
            return null;
        model.enabled = !model.enabled;
        return model;
    }
    createConversation(userId, title, modelId = 'nova-smart') {
        const id = `conv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const now = new Date().toISOString();
        const conv = {
            id,
            user_id: userId,
            title: title || 'New Conversation',
            model_id: modelId,
            created_at: now,
            updated_at: now,
        };
        this.conversations.set(id, conv);
        this.messages.set(id, []);
        return conv;
    }
    getConversation(id) {
        return this.conversations.get(id);
    }
    getUserConversations(userId) {
        const list = [];
        for (const conv of this.conversations.values()) {
            if (conv.user_id === userId) {
                list.push(conv);
            }
        }
        return list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }
    getMessages(conversationId) {
        return this.messages.get(conversationId) || [];
    }
    addMessage(conversationId, role, content, modelId, traceId) {
        const conv = this.conversations.get(conversationId);
        const now = new Date().toISOString();
        const msg = {
            id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            conversation_id: conversationId,
            role,
            content,
            model_id: modelId || conv?.model_id || 'nova-smart',
            trace_id: traceId,
            created_at: now,
        };
        const list = this.messages.get(conversationId) || [];
        list.push(msg);
        this.messages.set(conversationId, list);
        // Auto-update conversation title if it's the first user message
        if (conv) {
            conv.updated_at = now;
            if (conv.title === 'New Conversation' && role === 'user') {
                conv.title = content.length > 38 ? content.slice(0, 38).trim() + '...' : content.trim();
            }
        }
        return msg;
    }
    updateTitle(conversationId, newTitle) {
        const conv = this.conversations.get(conversationId);
        if (!conv)
            return null;
        conv.title = newTitle.trim();
        conv.updated_at = new Date().toISOString();
        return conv;
    }
    deleteConversation(conversationId) {
        this.messages.delete(conversationId);
        return this.conversations.delete(conversationId);
    }
}
export const globalConversationStore = new ConversationStore();
