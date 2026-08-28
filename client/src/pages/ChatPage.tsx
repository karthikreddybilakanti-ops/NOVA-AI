import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Menu, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage, Conversation, NovaModelConfig, NovaModelId } from '../types';
import {
  fetchModels,
  fetchConversations,
  fetchConversationDetails,
  deleteConversationApi,
  sendChatMessageApi,
  UploadedAttachment,
} from '../services/api';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ModelSelector } from '../components/chat/ModelSelector';
import { ChatMessageItem } from '../components/chat/ChatMessageItem';
import { ChatComposer } from '../components/chat/ChatComposer';
import { ChatEmptyState } from '../components/chat/ChatEmptyState';
import { useAuth } from '../context/AuthContext';

export const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [models, setModels] = useState<NovaModelConfig[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<NovaModelId>('nova-smart');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load models and user conversations on mount
  useEffect(() => {
    fetchModels()
      .then((mList) => {
        setModels(mList);
        if (mList.length > 0) {
          setSelectedModelId(mList[0].id);
        }
      })
      .catch(console.error);

    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const list = await fetchConversations();
      setConversations(list);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  // Load conversation details when conversationId param changes
  useEffect(() => {
    if (conversationId) {
      fetchConversationDetails(conversationId)
        .then(({ conversation, messages }) => {
          setCurrentConversation(conversation);
          setSelectedModelId(conversation.model_id || 'nova-smart');
          setMessages(messages);
        })
        .catch(() => {
          navigate('/chat', { replace: true });
        });
    } else {
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [conversationId]);

  const handleNewChat = () => {
    setCurrentConversation(null);
    setMessages([]);
    navigate('/chat');
  };

  const handleSelectConversation = (id: string) => {
    navigate(`/chat/${id}`);
  };

  const handleDeleteConversation = async (id: string) => {
    await deleteConversationApi(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversation?.id === id) {
      handleNewChat();
    }
  };

  const handleSendMessage = async (promptText: string, attachment?: UploadedAttachment | null) => {
    if ((!promptText.trim() && !attachment) || isLoading) return;

    const displayPrompt = promptText.trim() || `Analyze attachment: ${attachment?.originalName}`;

    // Temporary local message representation
    const tempUserMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      conversation_id: currentConversation?.id || '',
      role: 'user',
      content: displayPrompt,
      model_id: selectedModelId,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const response = await sendChatMessageApi(
        displayPrompt,
        selectedModelId,
        currentConversation?.id,
        attachment
      );

      const aiMsg: ChatMessage = {
        id: response.messageId,
        conversation_id: response.conversationId,
        role: 'assistant',
        content: response.answer,
        model_id: response.modelId,
        trace_id: response.trace_id,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // If this was a new conversation, update route & reload list
      if (!currentConversation || currentConversation.id !== response.conversationId) {
        navigate(`/chat/${response.conversationId}`, { replace: true });
        loadConversations();
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        conversation_id: currentConversation?.id || '',
        role: 'assistant',
        content: 'I encountered a temporary error while processing your message. Please try again.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden">
      {/* 1. Multi-Conversation Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={currentConversation?.id}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 2. Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#fafafa]">
        {/* Top Chat Bar */}
        <header className="h-14 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Model Selector Dropdown */}
            <ModelSelector
              models={models}
              selectedModelId={selectedModelId}
              onSelectModel={setSelectedModelId}
            />
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleNewChat}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <span>New Chat</span>
              </button>
            )}

            <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center border border-violet-200">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Message Feed or Clean Empty State */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          {messages.length === 0 ? (
            <ChatEmptyState />
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  onRegenerate={msg.role === 'assistant' ? handleRegenerate : undefined}
                />
              ))}

              {/* Natural Loading Indicator */}
              {isLoading && (
                <div className="flex items-start gap-3 my-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft text-xs text-slate-600 flex items-center gap-2.5">
                    <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
                    <span>Thinking and formulating answer...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Floating Bottom Composer with Attachment & Mic Support */}
        <div className="shrink-0 bg-gradient-to-t from-[#fafafa] via-[#fafafa]/90 to-transparent pt-2">
          <ChatComposer
            onSend={handleSendMessage}
            isLoading={isLoading}
            modelId={selectedModelId}
          />
        </div>
      </div>
    </div>
  );
};
