import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Minus, Send, Sparkles, Bot } from '../utils/icons';
import { cn } from '../utils/cn';
import * as chatbotService from '../services/chatbotService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, ChatbotConfig, ContentSafetyWarning } from '../types';

interface ChatBotProps {
  config: ChatbotConfig;
}

interface MessageWithSafety extends Message {
  contentSafety?: ContentSafetyWarning;
}

export default function ChatBot({ config }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(config.autoOpen || false);
  const [messages, setMessages] = useState<MessageWithSafety[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyOffset, setHistoryOffset] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: MessageWithSafety = {
        id: 'welcome',
        role: 'assistant',
        content: config.welcomeMessage || "Hi! I'm here to help you learn about Lifestream Dynamics IT consultancy services. I can answer questions about what we do, our areas of expertise, and how to get started. What would you like to know?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);

      // Load initial chat history if available (after a small delay to ensure welcome message is set)
      setTimeout(() => {
        loadChatHistory(welcomeMessage);
      }, 0);
    }
  }, [isOpen, messages.length, config.welcomeMessage]);

  const loadChatHistory = async (welcomeMsg?: MessageWithSafety, offset = 0) => {
    setIsLoadingHistory(true);
    try {
      const historyResponse = await chatbotService.getChatHistory({
        limit: 20,
        offset,
      });

      if (historyResponse.success && historyResponse.data) {
        const historyMessages: MessageWithSafety[] = (historyResponse.data.messages || [])
          .filter((msg) => msg && msg.content) // Filter out any null/undefined messages
          .map((msg) => ({
            id: msg.id || `history-${Date.now()}-${Math.random()}`,
            role: (msg.role as 'user' | 'assistant' | 'system'),
            content: msg.content,
            timestamp: new Date(msg.created_at),
          }));

        if (offset === 0) {
          // Initial load - replace welcome message with history or keep welcome message
          if (historyMessages.length > 0) {
            setMessages(historyMessages);
          } else if (welcomeMsg) {
            // Keep the welcome message if no history
            setMessages([welcomeMsg]);
          }
        } else {
          // Pagination - prepend older messages
          setMessages((prev) => [...historyMessages, ...prev]);
        }

        setHasMoreHistory(historyResponse.data.has_more || false);
        setHistoryOffset(offset + (historyResponse.data.messages?.length || 0));
      }
    } catch (error) {
      console.error('[Chatbot] Failed to load history:', error);
      // On error, ensure we at least have the welcome message
      if (offset === 0 && welcomeMsg) {
        setMessages([welcomeMsg]);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingHistory && hasMoreHistory) {
      loadChatHistory(undefined, historyOffset);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    const userMessage: MessageWithSafety = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Streaming mode
      if (config.enableStreaming) {
        const assistantId = `assistant-${Date.now()}`;
        let streamedContent = '';

        // Add placeholder message for streaming
        const placeholderMessage: MessageWithSafety = {
          id: assistantId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, placeholderMessage]);

        const response = await chatbotService.sendMessage(messageText, {
          metadata: config.metadata,
          onChunk: (chunk: string) => {
            streamedContent += chunk;
            setMessages(prev =>
              prev.map(msg =>
                msg.id === assistantId
                  ? { ...msg, content: streamedContent }
                  : msg
              )
            );
          },
        });

        if (!response.success) {
          const errorContent = response.message || 'Sorry, I encountered an error. Please try again in a moment.';
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantId
                ? { ...msg, role: 'system', content: errorContent }
                : msg
            )
          );
        } else if (response.data?.content_safety) {
          // Update message with content safety info
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantId
                ? { ...msg, contentSafety: response.data?.content_safety }
                : msg
            )
          );
        }
      } else {
        // Normal mode (non-streaming)
        const response = await chatbotService.sendMessage(messageText, {
          metadata: config.metadata,
        });

        if (response.success && response.data) {
          const assistantMessage: MessageWithSafety = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response.data.response || response.data.message || '',
            timestamp: new Date(),
            contentSafety: response.data.content_safety,
          };

          setMessages(prev => [...prev, assistantMessage]);
        } else {
          const errorContent = response.message || 'Sorry, I encountered an error. Please try again in a moment.';

          const errorMessage: MessageWithSafety = {
            id: `error-${Date.now()}`,
            role: 'system',
            content: errorContent,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, errorMessage]);
        }
      }
    } catch (error) {
      console.error('[Chatbot] Chat error:', error);

      const errorMessage: MessageWithSafety = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: 'Unable to connect to the chat service. Please check your internet connection and try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = config.quickActions || [
    { label: 'Our Services', message: 'What services do you offer?' },
    { label: 'Technologies', message: 'What technologies do you work with?' },
    { label: 'Get Started', message: 'How do I get started?' }
  ];

  const getPositionStyles = (): React.CSSProperties => {
    const position = config.theme?.position || 'bottom-right';
    const offsetX = config.theme?.positionOffset?.x || '1.5rem';
    const offsetY = config.theme?.positionOffset?.y || '1.5rem';

    const positions: Record<string, React.CSSProperties> = {
      'bottom-left': { bottom: offsetY, left: offsetX },
      'bottom-right': { bottom: offsetY, right: offsetX },
      'top-left': { top: offsetY, left: offsetX },
      'top-right': { top: offsetY, right: offsetX },
    };

    return positions[position] || positions['bottom-right'];
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="chatbot-button"
        style={getPositionStyles()}
        aria-label="Open chat"
      >
        <div className="chatbot-button-ping" />
        <MessageCircle className="chatbot-button-icon" />
        <div className="chatbot-button-sparkle">
          <Sparkles className="chatbot-sparkle-icon" />
        </div>
      </button>
    );
  }

  return (
    <div
      className="chatbot-container"
      style={{
        ...getPositionStyles(),
        maxWidth: config.maxWidth || '450px',
        maxHeight: config.maxHeight || '650px',
      }}
    >
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-header-content">
          <div className="chatbot-avatar-wrapper">
            <div className="chatbot-avatar">
              <Bot className="chatbot-avatar-icon" />
            </div>
            <div className="chatbot-status-indicator" />
          </div>
          <div>
            <h3 className="chatbot-title">{config.title || 'AI Assistant'}</h3>
            <p className="chatbot-subtitle">
              {isTyping ? 'Typing...' : (config.subtitle || 'Online')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="chatbot-minimize-btn"
          aria-label="Minimize chat"
        >
          <Minus className="chatbot-minimize-icon" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="chatbot-messages" ref={messagesContainerRef}>
        {/* Load More Button */}
        {hasMoreHistory && (
          <div className="chatbot-load-more-wrapper">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingHistory}
              className="chatbot-load-more-btn"
            >
              {isLoadingHistory ? 'Loading...' : 'Load More Messages'}
            </button>
          </div>
        )}

        {messages.filter(msg => msg && msg.content).map((msg, index) => (
          <div
            key={msg.id}
            className={cn(
              "chatbot-message-wrapper",
              msg.role === 'user' ? "chatbot-message-user" : "chatbot-message-assistant"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={cn(
                "chatbot-message-bubble",
                msg.role === 'user' && "chatbot-bubble-user",
                msg.role === 'assistant' && "chatbot-bubble-assistant",
                msg.role === 'system' && "chatbot-bubble-system"
              )}
            >
              <div className={cn(
                "chatbot-message-content",
                msg.role === 'user' && "chatbot-content-user",
                msg.role === 'assistant' && "chatbot-content-assistant",
                msg.role === 'system' && "chatbot-content-system"
              )}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content || ''}
                </ReactMarkdown>
              </div>

              {/* Content Safety Warnings */}
              {msg.contentSafety && msg.contentSafety.warnings && msg.contentSafety.warnings.length > 0 && (
                <div className="chatbot-safety-warning">
                  <span className="chatbot-safety-icon">⚠️</span>
                  <span className="chatbot-safety-text">
                    {msg.contentSafety.redactions_applied
                      ? 'Personal information detected and protected'
                      : msg.contentSafety.warnings.join(', ')}
                  </span>
                </div>
              )}

              <p className={cn(
                "chatbot-message-time",
                msg.role === 'user' ? "chatbot-time-user" : "chatbot-time-assistant"
              )}>
                {msg.timestamp?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit' }) || ''}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="chatbot-message-wrapper chatbot-message-assistant">
            <div className="chatbot-typing-indicator">
              <div className="chatbot-typing-dots">
                <span className="chatbot-typing-dot" style={{ animationDelay: '0ms' }} />
                <span className="chatbot-typing-dot" style={{ animationDelay: '150ms' }} />
                <span className="chatbot-typing-dot" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chatbot-input-area">
        <div className="chatbot-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="chatbot-input"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="chatbot-send-btn"
            aria-label="Send message"
          >
            <Send className="chatbot-send-icon" />
          </button>
        </div>

        {/* Quick actions */}
        <div className="chatbot-quick-actions">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => setInput(action.message)}
              className="chatbot-quick-action-btn"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
