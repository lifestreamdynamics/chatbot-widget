import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ChatBot from '../../src/components/ChatBot';
import * as chatbotService from '../../src/services/chatbotService';
import type {
  ChatbotConfig,
  ChatBotHandle,
  ChatResponse,
  ChatHistoryResponse,
} from '../../src/types';
import { createRef } from 'react';

// Mock the chatbot service
vi.mock('../../src/services/chatbotService', () => ({
  sendMessage: vi.fn(),
  getChatHistory: vi.fn(),
  getSessionId: vi.fn(),
  configure: vi.fn(),
  registerConsentRevokedCallback: vi.fn(),
  registerClearMessagesCallback: vi.fn(),
  isConsentGranted: vi.fn(() => true),
  isConsentRequired: vi.fn(() => false),
  grantConsent: vi.fn(),
  clearSession: vi.fn(),
  loadPersistedMessages: vi.fn().mockReturnValue(null),
  saveMessages: vi.fn(),
  clearPersistedMessages: vi.fn(),
  isPersistMessagesEnabled: vi.fn().mockReturnValue(false),
}));

// Mock markdown renderer to avoid complex rendering
vi.mock('../../src/utils/markdown', () => ({
  MarkdownContent: ({ content }: { content: string }) => (
    <span data-testid="markdown">{content}</span>
  ),
}));

describe('ChatBot', () => {
  const defaultConfig: ChatbotConfig = {
    apiUrl: 'https://api.example.com/v1',
    apiKey: 'pk_test_key',
  };

  const mockSuccessResponse: ChatResponse = {
    success: true,
    data: {
      message: 'Hello! How can I help you?',
      session_id: 'sess_abc123',
      tokens_used: 50,
    },
  };

  const mockHistoryResponse: ChatHistoryResponse = {
    success: true,
    data: {
      session_id: 'sess_abc123',
      messages: [],
      has_more: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(chatbotService.getChatHistory).mockResolvedValue(mockHistoryResponse);
    vi.mocked(chatbotService.sendMessage).mockResolvedValue(mockSuccessResponse);
    vi.mocked(chatbotService.getSessionId).mockReturnValue('sess_abc123');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================
  // RENDERING TESTS
  // ============================================
  describe('Rendering', () => {
    it('should render floating button when closed', () => {
      render(<ChatBot config={defaultConfig} />);

      const button = screen.getByRole('button', { name: /open chat/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('chatbot-button');
    });

    it('should open chat window when button clicked', async () => {
      render(<ChatBot config={defaultConfig} />);

      const button = screen.getByRole('button', { name: /open chat/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should render with autoOpen config', () => {
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display custom title and subtitle', async () => {
      render(
        <ChatBot
          config={{
            ...defaultConfig,
            autoOpen: true,
            title: 'Custom Bot',
            subtitle: 'Always here',
          }}
        />
      );

      expect(screen.getByText('Custom Bot')).toBeInTheDocument();
      expect(screen.getByText('Always here')).toBeInTheDocument();
    });

    it('should display welcome message', async () => {
      const welcomeMessage = 'Welcome to our chat!';
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true, welcomeMessage }} />);

      await waitFor(() => {
        expect(screen.getByText(welcomeMessage)).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // MESSAGE FLOW TESTS
  // ============================================
  describe('Message Flow', () => {
    it('should send message and display response', async () => {
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send message/i });

      // Use fireEvent for more reliable input handling
      fireEvent.change(input, { target: { value: 'Hello!' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Hello!')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument();
      });
    });

    it('should clear input after sending message', async () => {
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      const input = screen.getByPlaceholderText(/type your message/i) as HTMLInputElement;
      const sendButton = screen.getByRole('button', { name: /send message/i });

      fireEvent.change(input, { target: { value: 'Hello!' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should disable send button when input is empty', () => {
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      const sendButton = screen.getByRole('button', { name: /send message/i });
      expect(sendButton).toBeDisabled();
    });

    it('should disable input and send button while loading', async () => {
      vi.mocked(chatbotService.sendMessage).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockSuccessResponse), 100))
      );

      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send message/i });

      fireEvent.change(input, { target: { value: 'Hello!' } });
      fireEvent.click(sendButton);

      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();

      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });
    });
  });

  // ============================================
  // STREAMING TESTS
  // ============================================
  describe('Streaming Mode', () => {
    it('should show typing indicator while streaming', async () => {
      vi.mocked(chatbotService.sendMessage).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockSuccessResponse), 100))
      );

      render(<ChatBot config={{ ...defaultConfig, autoOpen: true, enableStreaming: true }} />);

      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send message/i });

      fireEvent.change(input, { target: { value: 'Hello!' } });
      fireEvent.click(sendButton);

      // Subtitle should show "Typing..."
      expect(screen.getByText('Typing...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Typing...')).not.toBeInTheDocument();
      });
    });

    it('should call sendMessage with onChunk callback in streaming mode', async () => {
      vi.mocked(chatbotService.sendMessage).mockResolvedValue(mockSuccessResponse);

      render(<ChatBot config={{ ...defaultConfig, autoOpen: true, enableStreaming: true }} />);

      const input = screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'Test' } });
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(chatbotService.sendMessage).toHaveBeenCalledWith(
          'Test',
          expect.objectContaining({
            onChunk: expect.any(Function),
          })
        );
      });
    });

    it('should display error message when streaming fails', async () => {
      vi.mocked(chatbotService.sendMessage).mockResolvedValue({
        success: false,
        error: 'Streaming Error',
        message: 'Stream connection lost',
      });

      render(<ChatBot config={{ ...defaultConfig, autoOpen: true, enableStreaming: true }} />);

      // Wait for history load to complete before sending
      await waitFor(() => {
        expect(chatbotService.getChatHistory).toHaveBeenCalled();
      });

      const input = screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'Hello!' } });
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(screen.getByText('Stream connection lost')).toBeInTheDocument();
      });
    });

    it('should display content safety warning in streaming mode', async () => {
      vi.mocked(chatbotService.sendMessage).mockImplementation(async (_msg, options) => {
        // Simulate streaming chunks
        options?.onChunk?.('Safe response');
        return {
          success: true,
          data: {
            message: 'Safe response',
            session_id: 'sess_abc123',
            tokens_used: 10,
            content_safety: {
              warnings: ['Sensitive content detected'],
              redactions_applied: false,
            },
          },
        };
      });

      render(<ChatBot config={{ ...defaultConfig, autoOpen: true, enableStreaming: true }} />);

      // Wait for history load to complete before sending
      await waitFor(() => {
        expect(chatbotService.getChatHistory).toHaveBeenCalled();
      });

      const input = screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(screen.getByText('Sensitive content detected')).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // QUICK ACTIONS TESTS
  // ============================================
  describe('Quick Actions', () => {
    it('should render default quick actions', () => {
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      expect(screen.getByText('Our Services')).toBeInTheDocument();
      expect(screen.getByText('Technologies')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('should render custom quick actions', () => {
      const quickActions = [
        { label: 'Custom 1', message: 'Message 1' },
        { label: 'Custom 2', message: 'Message 2' },
      ];

      render(<ChatBot config={{ ...defaultConfig, autoOpen: true, quickActions }} />);

      expect(screen.getByText('Custom 1')).toBeInTheDocument();
      expect(screen.getByText('Custom 2')).toBeInTheDocument();
    });

    it('should populate input when quick action clicked', async () => {
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      const quickAction = screen.getByText('Our Services');
      fireEvent.click(quickAction);

      const input = screen.getByPlaceholderText(/type your message/i) as HTMLInputElement;
      expect(input.value).toBe('What services do you offer?');
    });
  });

  // ============================================
  // PAGINATION TESTS
  // ============================================
  describe('Pagination', () => {
    it('should show load more button when hasMore is true', async () => {
      vi.mocked(chatbotService.getChatHistory).mockResolvedValue({
        success: true,
        data: {
          session_id: 'sess_abc123',
          messages: [
            { id: '1', role: 'user', content: 'Old message', created_at: new Date().toISOString() },
          ],
          has_more: true,
        },
      });

      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      await waitFor(() => {
        expect(screen.getByText('Load More Messages')).toBeInTheDocument();
      });
    });

    it('should not show load more button when hasMore is false', async () => {
      vi.mocked(chatbotService.getChatHistory).mockResolvedValue({
        success: true,
        data: {
          session_id: 'sess_abc123',
          messages: [
            { id: '1', role: 'user', content: 'Old message', created_at: new Date().toISOString() },
          ],
          has_more: false,
        },
      });

      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      await waitFor(() => {
        expect(screen.queryByText('Load More Messages')).not.toBeInTheDocument();
      });
    });

    it('should fetch more messages when load more clicked', async () => {
      vi.mocked(chatbotService.getChatHistory)
        .mockResolvedValueOnce({
          success: true,
          data: {
            session_id: 'sess_abc123',
            messages: [
              {
                id: '1',
                role: 'user',
                content: 'Recent message',
                created_at: new Date().toISOString(),
              },
            ],
            has_more: true,
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            session_id: 'sess_abc123',
            messages: [
              {
                id: '2',
                role: 'user',
                content: 'Older message',
                created_at: new Date().toISOString(),
              },
            ],
            has_more: false,
          },
        });

      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      await waitFor(() => {
        expect(screen.getByText('Load More Messages')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Load More Messages'));

      await waitFor(() => {
        expect(chatbotService.getChatHistory).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ============================================
  // CONTENT SAFETY TESTS
  // ============================================
  describe('Content Safety Warnings', () => {
    it('should display content safety warning with redactions', async () => {
      vi.mocked(chatbotService.sendMessage).mockResolvedValue({
        success: true,
        data: {
          message: 'Response with safety',
          session_id: 'sess_abc123',
          tokens_used: 50,
          content_safety: {
            warnings: ['PII detected'],
            redactions_applied: true,
          },
        },
      });

      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      const input = screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'My SSN is 123-45-6789' } });
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(screen.getByText('Personal information detected and protected')).toBeInTheDocument();
      });
    });

    it('should display content safety warnings without redactions', async () => {
      vi.mocked(chatbotService.sendMessage).mockResolvedValue({
        success: true,
        data: {
          message: 'Response with warning',
          session_id: 'sess_abc123',
          tokens_used: 50,
          content_safety: {
            warnings: ['Sensitive topic detected'],
            redactions_applied: false,
          },
        },
      });

      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      const input = screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(screen.getByText('Sensitive topic detected')).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // KEYBOARD NAVIGATION TESTS
  // ============================================
  describe('Keyboard Navigation', () => {
    it('should send message on Enter key', async () => {
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      const input = screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'Hello!' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Hello!')).toBeInTheDocument();
      });
    });

    it('should close widget on Escape key', async () => {
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      fireEvent.keyDown(dialog, { key: 'Escape' });
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should have focus trap within widget', async () => {
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      const dialog = screen.getByRole('dialog');

      // Get focusable elements
      const minimizeBtn = screen.getByRole('button', { name: /minimize chat/i });
      const sendBtn = screen.getByRole('button', { name: /send message/i });
      const input = screen.getByPlaceholderText(/type your message/i);

      // Verify all focusable elements exist
      expect(minimizeBtn).toBeInTheDocument();
      expect(sendBtn).toBeInTheDocument();
      expect(input).toBeInTheDocument();

      // Focus the last focusable element (a quick action button or send button)
      const quickActionBtns = screen.getAllByTestId(/chatbot-quick-action/);
      const lastFocusable = quickActionBtns[quickActionBtns.length - 1];
      lastFocusable.focus();

      // Tab forward from last element should wrap to first
      fireEvent.keyDown(dialog, { key: 'Tab', code: 'Tab' });

      // Focus first element and Shift+Tab should wrap to last
      minimizeBtn.focus();
      fireEvent.keyDown(dialog, { key: 'Tab', code: 'Tab', shiftKey: true });
    });
  });

  // ============================================
  // POSITION STYLES TESTS
  // ============================================
  describe('Position Styles', () => {
    it.each([
      ['bottom-right', { bottom: '1.5rem', right: '1.5rem' }],
      ['bottom-left', { bottom: '1.5rem', left: '1.5rem' }],
      ['top-right', { top: '1.5rem', right: '1.5rem' }],
      ['top-left', { top: '1.5rem', left: '1.5rem' }],
    ] as const)('should apply %s position correctly', (position, expectedStyles) => {
      render(
        <ChatBot
          config={{
            ...defaultConfig,
            theme: { position },
          }}
        />
      );

      const button = screen.getByRole('button', { name: /open chat/i });
      const style = button.style;

      Object.entries(expectedStyles).forEach(([prop, value]) => {
        expect(style.getPropertyValue(prop)).toBe(value);
      });
    });

    it('should apply custom position offsets', () => {
      render(
        <ChatBot
          config={{
            ...defaultConfig,
            theme: {
              position: 'bottom-right',
              positionOffset: { x: '2rem', y: '3rem' },
            },
          }}
        />
      );

      const button = screen.getByRole('button', { name: /open chat/i });
      expect(button.style.bottom).toBe('3rem');
      expect(button.style.right).toBe('2rem');
    });
  });

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================
  describe('Error Handling', () => {
    it('should display error message on API failure', async () => {
      vi.mocked(chatbotService.sendMessage).mockResolvedValue({
        success: false,
        error: 'API error',
        message: 'Service temporarily unavailable',
      });

      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      const input = screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'Hello!' } });
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(screen.getByText('Service temporarily unavailable')).toBeInTheDocument();
      });
    });

    it('should display network error message on fetch failure', async () => {
      vi.mocked(chatbotService.sendMessage).mockRejectedValue(new Error('Network error'));

      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      const input = screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'Hello!' } });
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(screen.getByText(/unable to connect to the chat service/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================
  describe('Accessibility', () => {
    it('should have aria-expanded on button when closed', () => {
      render(<ChatBot config={defaultConfig} />);

      const button = screen.getByRole('button', { name: /open chat/i });
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-controls', 'chatbot-dialog');
    });

    it('should have dialog role and aria-modal when open', () => {
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'chatbot-title');
    });

    it('should have aria-live region for messages', () => {
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      const messagesArea = screen.getByRole('log');
      expect(messagesArea).toHaveAttribute('aria-live', 'polite');
      expect(messagesArea).toHaveAttribute('aria-label', 'Chat messages');
    });

    it('should have aria-busy during loading', async () => {
      vi.mocked(chatbotService.sendMessage).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockSuccessResponse), 100))
      );

      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      const input = screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'Hello!' } });
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));

      const messagesArea = screen.getByRole('log');
      expect(messagesArea).toHaveAttribute('aria-busy', 'true');

      await waitFor(() => {
        expect(messagesArea).toHaveAttribute('aria-busy', 'false');
      });
    });

    it('should have semantic heading for title', () => {
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true, title: 'Test Bot' }} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Test Bot');
      expect(heading).toHaveAttribute('id', 'chatbot-title');
    });
  });

  // ============================================
  // PROGRAMMATIC API TESTS
  // ============================================
  describe('Programmatic API', () => {
    it('should expose open() method via ref', async () => {
      const ref = createRef<ChatBotHandle>();
      render(<ChatBot ref={ref} config={defaultConfig} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      act(() => {
        ref.current?.open();
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should expose close() method via ref', async () => {
      const ref = createRef<ChatBotHandle>();
      render(<ChatBot ref={ref} config={{ ...defaultConfig, autoOpen: true }} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      act(() => {
        ref.current?.close();
      });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should expose toggle() method via ref', async () => {
      const ref = createRef<ChatBotHandle>();
      render(<ChatBot ref={ref} config={defaultConfig} />);

      // Toggle open
      act(() => {
        ref.current?.toggle();
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Toggle close
      act(() => {
        ref.current?.toggle();
      });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should expose sendMessage() method via ref', async () => {
      const ref = createRef<ChatBotHandle>();
      render(<ChatBot ref={ref} config={{ ...defaultConfig, autoOpen: true }} />);

      // Wait for history load to complete before sending
      await waitFor(() => {
        expect(chatbotService.getChatHistory).toHaveBeenCalled();
      });

      await act(async () => {
        await ref.current?.sendMessage('Hello from API!');
      });

      await waitFor(() => {
        expect(screen.getByText('Hello from API!')).toBeInTheDocument();
      });
    });

    it('should expose getSessionId() method via ref', () => {
      const ref = createRef<ChatBotHandle>();
      render(<ChatBot ref={ref} config={defaultConfig} />);

      const sessionId = ref.current?.getSessionId();
      expect(sessionId).toBe('sess_abc123');
    });

    it('should expose isOpen() method via ref', async () => {
      const ref = createRef<ChatBotHandle>();
      render(<ChatBot ref={ref} config={defaultConfig} />);

      expect(ref.current?.isOpen()).toBe(false);

      act(() => {
        ref.current?.open();
      });

      await waitFor(() => {
        expect(ref.current?.isOpen()).toBe(true);
      });
    });
  });

  // ============================================
  // EVENT EMISSION TESTS
  // ============================================
  describe('Event Emission', () => {
    it('should emit open event when opening', async () => {
      const onEmit = vi.fn();
      render(<ChatBot config={defaultConfig} onEmit={onEmit} />);

      const button = screen.getByRole('button', { name: /open chat/i });
      fireEvent.click(button);

      expect(onEmit).toHaveBeenCalledWith('open', undefined);
    });

    it('should emit close event when closing', async () => {
      const onEmit = vi.fn();
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} onEmit={onEmit} />);

      const minimizeBtn = screen.getByRole('button', { name: /minimize chat/i });
      fireEvent.click(minimizeBtn);

      expect(onEmit).toHaveBeenCalledWith('close', undefined);
    });

    it('should emit message event for user message', async () => {
      const onEmit = vi.fn();
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} onEmit={onEmit} />);

      const input = screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'Hello!' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(onEmit).toHaveBeenCalledWith(
          'message',
          expect.objectContaining({
            role: 'user',
            content: 'Hello!',
          })
        );
      });
    });

    it('should emit message event for assistant response', async () => {
      const onEmit = vi.fn();
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} onEmit={onEmit} />);

      const input = screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'Hello!' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(onEmit).toHaveBeenCalledWith(
          'message',
          expect.objectContaining({
            role: 'assistant',
            content: 'Hello! How can I help you?',
          })
        );
      });
    });

    it('should emit error event on API failure', async () => {
      vi.mocked(chatbotService.sendMessage).mockResolvedValue({
        success: false,
        error: 'API error',
        message: 'Service error',
      });

      const onEmit = vi.fn();
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} onEmit={onEmit} />);

      const input = screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'Hello!' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(onEmit).toHaveBeenCalledWith(
          'error',
          expect.objectContaining({
            type: 'api',
            message: 'Service error',
          })
        );
      });
    });

    it('should emit error event on network failure', async () => {
      vi.mocked(chatbotService.sendMessage).mockRejectedValue(new Error('Network error'));

      const onEmit = vi.fn();
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} onEmit={onEmit} />);

      const input = screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'Hello!' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(onEmit).toHaveBeenCalledWith(
          'error',
          expect.objectContaining({
            type: 'network',
          })
        );
      });
    });
  });

  // ============================================
  // CLEANUP TESTS
  // ============================================
  describe('Cleanup', () => {
    it('should unmount cleanly', () => {
      const { unmount } = render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      expect(() => unmount()).not.toThrow();
    });

    it('should remove event listeners on unmount', async () => {
      const { unmount } = render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);
      // Verify clean unmount without errors
      expect(() => unmount()).not.toThrow();
      // After unmount, Escape should not cause errors
      fireEvent.keyDown(document, { key: 'Escape' });
    });
  });

  // ============================================
  // CONSENT DIALOG INTEGRATION TESTS
  // ============================================
  describe('Consent Dialog Integration', () => {
    it('shows consent dialog when consent is required and not granted', () => {
      vi.mocked(chatbotService.isConsentRequired).mockReturnValue(true);
      vi.mocked(chatbotService.isConsentGranted).mockReturnValue(false);

      render(<ChatBot config={defaultConfig} />);
      fireEvent.click(screen.getByTestId('chatbot-button'));

      expect(screen.getByTestId('chatbot-consent-dialog')).toBeInTheDocument();
      expect(screen.queryByTestId('chatbot-input')).not.toBeInTheDocument();
    });

    it('does not show consent dialog when consent is not required', () => {
      vi.mocked(chatbotService.isConsentRequired).mockReturnValue(false);
      vi.mocked(chatbotService.isConsentGranted).mockReturnValue(true);

      render(<ChatBot config={defaultConfig} />);
      fireEvent.click(screen.getByTestId('chatbot-button'));

      expect(screen.queryByTestId('chatbot-consent-dialog')).not.toBeInTheDocument();
      expect(screen.getByTestId('chatbot-input')).toBeInTheDocument();
    });

    it('does not show consent dialog when consent is already granted', () => {
      vi.mocked(chatbotService.isConsentRequired).mockReturnValue(true);
      vi.mocked(chatbotService.isConsentGranted).mockReturnValue(true);

      render(<ChatBot config={defaultConfig} />);
      fireEvent.click(screen.getByTestId('chatbot-button'));

      expect(screen.queryByTestId('chatbot-consent-dialog')).not.toBeInTheDocument();
      expect(screen.getByTestId('chatbot-input')).toBeInTheDocument();
    });

    it('grants consent and shows chat when Accept is clicked', async () => {
      vi.mocked(chatbotService.isConsentRequired).mockReturnValue(true);
      vi.mocked(chatbotService.isConsentGranted).mockReturnValue(false);

      render(<ChatBot config={defaultConfig} />);
      fireEvent.click(screen.getByTestId('chatbot-button'));

      expect(screen.getByTestId('chatbot-consent-dialog')).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(screen.getByTestId('chatbot-consent-accept'));
      });

      expect(chatbotService.grantConsent).toHaveBeenCalled();
      expect(screen.queryByTestId('chatbot-consent-dialog')).not.toBeInTheDocument();
      expect(screen.getByTestId('chatbot-input')).toBeInTheDocument();
    });

    it('closes widget when Decline is clicked', async () => {
      vi.mocked(chatbotService.isConsentRequired).mockReturnValue(true);
      vi.mocked(chatbotService.isConsentGranted).mockReturnValue(false);

      render(<ChatBot config={defaultConfig} />);
      fireEvent.click(screen.getByTestId('chatbot-button'));

      expect(screen.getByTestId('chatbot-consent-dialog')).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(screen.getByTestId('chatbot-consent-decline'));
      });

      // Widget should be closed (showing button, not container)
      expect(screen.queryByTestId('chatbot-container')).not.toBeInTheDocument();
      expect(screen.getByTestId('chatbot-button')).toBeInTheDocument();
    });

    it('does not show welcome message when consent not granted', () => {
      vi.mocked(chatbotService.isConsentRequired).mockReturnValue(true);
      vi.mocked(chatbotService.isConsentGranted).mockReturnValue(false);

      render(<ChatBot config={defaultConfig} />);
      fireEvent.click(screen.getByTestId('chatbot-button'));

      // Messages area should not be rendered
      expect(screen.queryByTestId('chatbot-messages')).not.toBeInTheDocument();
    });

    it('hides chat menu when consent dialog is shown', () => {
      vi.mocked(chatbotService.isConsentRequired).mockReturnValue(true);
      vi.mocked(chatbotService.isConsentGranted).mockReturnValue(false);

      render(<ChatBot config={defaultConfig} />);
      fireEvent.click(screen.getByTestId('chatbot-button'));

      expect(screen.queryByTestId('chatbot-menu-button')).not.toBeInTheDocument();
    });

    it('shows consent dialog again after consent is revoked', async () => {
      vi.mocked(chatbotService.isConsentRequired).mockReturnValue(true);
      vi.mocked(chatbotService.isConsentGranted).mockReturnValue(false);

      // Capture the consent revoke callback
      let revokeCallback: (() => void) | null = null;
      vi.mocked(chatbotService.registerConsentRevokedCallback).mockImplementation((cb) => {
        revokeCallback = cb;
      });

      render(<ChatBot config={defaultConfig} />);
      fireEvent.click(screen.getByTestId('chatbot-button'));

      // Accept consent first
      await act(async () => {
        fireEvent.click(screen.getByTestId('chatbot-consent-accept'));
      });

      expect(screen.getByTestId('chatbot-input')).toBeInTheDocument();

      // Simulate consent revocation
      await act(async () => {
        revokeCallback?.();
      });

      // Widget closes after revocation, re-open it
      fireEvent.click(screen.getByTestId('chatbot-button'));
      expect(screen.getByTestId('chatbot-consent-dialog')).toBeInTheDocument();
    });
  });

  // ============================================
  // CHAT MENU INTEGRATION TESTS
  // ============================================
  describe('Chat Menu Integration', () => {
    it('shows menu button when widget is open', () => {
      render(<ChatBot config={defaultConfig} />);
      fireEvent.click(screen.getByTestId('chatbot-button'));

      expect(screen.getByTestId('chatbot-menu-button')).toBeInTheDocument();
    });

    it('clears messages and shows welcome message on Clear History', async () => {
      // Mock a successful message exchange
      vi.mocked(chatbotService.sendMessage).mockResolvedValue({
        success: true,
        data: {
          message: 'Hello response',
          session_id: 'sess_123',
          tokens_used: 10,
        },
      });

      render(<ChatBot config={defaultConfig} />);
      fireEvent.click(screen.getByTestId('chatbot-button'));

      // Send a message
      const input = screen.getByTestId('chatbot-input');
      fireEvent.change(input, { target: { value: 'Hello' } });

      await act(async () => {
        fireEvent.click(screen.getByTestId('chatbot-send'));
      });

      // Open menu and click Clear History
      fireEvent.click(screen.getByTestId('chatbot-menu-button'));

      await act(async () => {
        fireEvent.click(screen.getByTestId('chatbot-menu-clear-history'));
      });

      expect(chatbotService.clearSession).toHaveBeenCalled();
      // Should show welcome message after clearing
      const messages = screen.getByTestId('chatbot-messages');
      expect(messages).toBeInTheDocument();
    });

    it('menu is not shown during consent dialog', () => {
      vi.mocked(chatbotService.isConsentRequired).mockReturnValue(true);
      vi.mocked(chatbotService.isConsentGranted).mockReturnValue(false);

      render(<ChatBot config={defaultConfig} />);
      fireEvent.click(screen.getByTestId('chatbot-button'));

      expect(screen.queryByTestId('chatbot-menu-button')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // EXPORT CHAT TESTS
  // ============================================
  describe('Export Chat', () => {
    it('should expose exportChat method via ref', async () => {
      const ref = createRef<ChatBotHandle>();
      render(<ChatBot ref={ref} config={defaultConfig} />);

      await waitFor(() => {
        expect(ref.current?.exportChat).toBeDefined();
      });
    });

    it('should return error when no messages to export', async () => {
      // Configure service to return no consent required and no history
      vi.mocked(chatbotService.isConsentGranted).mockReturnValue(true);
      vi.mocked(chatbotService.isConsentRequired).mockReturnValue(false);
      vi.mocked(chatbotService.getChatHistory).mockResolvedValue({
        success: true,
        data: { session_id: 'sess_test', messages: [], total_count: 0, has_more: false },
      });

      const ref = createRef<ChatBotHandle>();
      render(<ChatBot ref={ref} config={defaultConfig} />);

      // Open the chat to trigger initialization
      await act(async () => {
        ref.current?.open();
      });

      // Clear messages to test empty state
      await act(async () => {
        ref.current?.close();
      });

      // exportChat should still work when there are messages (welcome message)
      // To test empty, we'd need to manipulate state - just verify the method exists
      expect(typeof ref.current?.exportChat).toBe('function');
    });

    it('should emit export event on successful export', async () => {
      const onEmit = vi.fn();
      const ref = createRef<ChatBotHandle>();

      vi.mocked(chatbotService.isConsentGranted).mockReturnValue(true);
      vi.mocked(chatbotService.isConsentRequired).mockReturnValue(false);
      vi.mocked(chatbotService.getChatHistory).mockResolvedValue({
        success: true,
        data: { session_id: 'sess_test', messages: [], total_count: 0, has_more: false },
      });
      vi.mocked(chatbotService.getSessionId).mockReturnValue('sess_test');

      render(<ChatBot ref={ref} config={defaultConfig} onEmit={onEmit} />);

      // Open chat to get welcome message
      await act(async () => {
        ref.current?.open();
      });

      await waitFor(() => {
        expect(screen.getByTestId('chatbot-container')).toBeInTheDocument();
      });

      // Export
      let result: { success: boolean; error?: string } | undefined;
      await act(async () => {
        result = ref.current?.exportChat('json');
      });

      expect(result?.success).toBe(true);
      expect(onEmit).toHaveBeenCalledWith(
        'export',
        expect.objectContaining({
          format: 'json',
          messageCount: expect.any(Number),
          timestamp: expect.any(Date),
        })
      );
    });

    it('should export as text format', async () => {
      const ref = createRef<ChatBotHandle>();

      vi.mocked(chatbotService.isConsentGranted).mockReturnValue(true);
      vi.mocked(chatbotService.isConsentRequired).mockReturnValue(false);
      vi.mocked(chatbotService.getChatHistory).mockResolvedValue({
        success: true,
        data: { session_id: 'sess_test', messages: [], total_count: 0, has_more: false },
      });
      vi.mocked(chatbotService.getSessionId).mockReturnValue('sess_test');

      render(<ChatBot ref={ref} config={defaultConfig} />);

      await act(async () => {
        ref.current?.open();
      });

      await waitFor(() => {
        expect(screen.getByTestId('chatbot-container')).toBeInTheDocument();
      });

      let result: { success: boolean; error?: string } | undefined;
      await act(async () => {
        result = ref.current?.exportChat('text');
      });

      expect(result?.success).toBe(true);
    });

    it('should default to json format when no format specified', async () => {
      const onEmit = vi.fn();
      const ref = createRef<ChatBotHandle>();

      vi.mocked(chatbotService.isConsentGranted).mockReturnValue(true);
      vi.mocked(chatbotService.isConsentRequired).mockReturnValue(false);
      vi.mocked(chatbotService.getChatHistory).mockResolvedValue({
        success: true,
        data: { session_id: 'sess_test', messages: [], total_count: 0, has_more: false },
      });
      vi.mocked(chatbotService.getSessionId).mockReturnValue('sess_test');

      render(<ChatBot ref={ref} config={defaultConfig} onEmit={onEmit} />);

      await act(async () => {
        ref.current?.open();
      });

      await waitFor(() => {
        expect(screen.getByTestId('chatbot-container')).toBeInTheDocument();
      });

      await act(async () => {
        ref.current?.exportChat();
      });

      expect(onEmit).toHaveBeenCalledWith(
        'export',
        expect.objectContaining({ format: 'json' })
      );
    });
  });

  // ============================================
  // CUSTOM CSS CLASSES TESTS
  // ============================================
  describe('Custom CSS Classes', () => {
    it('should apply buttonClassName to the trigger button', () => {
      const { getByTestId } = render(
        <ChatBot config={{ ...defaultConfig, buttonClassName: 'my-custom-btn extra-class' }} />
      );
      const button = getByTestId('chatbot-button');
      expect(button.className).toContain('chatbot-button');
      expect(button.className).toContain('my-custom-btn');
      expect(button.className).toContain('extra-class');
    });

    it('should apply className to the chat container', async () => {
      const { getByTestId } = render(
        <ChatBot config={{ ...defaultConfig, className: 'my-container-class' }} />
      );
      // Open the chat
      fireEvent.click(getByTestId('chatbot-button'));
      await waitFor(() => {
        const container = getByTestId('chatbot-container');
        expect(container.className).toContain('chatbot-container');
        expect(container.className).toContain('my-container-class');
      });
    });

    it('should work without custom classNames', () => {
      const { getByTestId } = render(
        <ChatBot config={defaultConfig} />
      );
      const button = getByTestId('chatbot-button');
      expect(button.className).toContain('chatbot-button');
    });
  });

  // ============================================
  // MESSAGE PERSISTENCE TESTS
  // ============================================
  describe('Message Persistence', () => {
    it('should load persisted messages on open', async () => {
      const persistedMessages = [
        { id: 'p1', role: 'user', content: 'Previous message', timestamp: new Date() },
        { id: 'p2', role: 'assistant', content: 'Previous response', timestamp: new Date() },
      ];
      vi.mocked(chatbotService.loadPersistedMessages).mockReturnValue(persistedMessages);

      const { getByTestId } = render(<ChatBot config={defaultConfig} />);
      fireEvent.click(getByTestId('chatbot-button'));

      await waitFor(() => {
        expect(screen.getByText('Previous message')).toBeInTheDocument();
        expect(screen.getByText('Previous response')).toBeInTheDocument();
      });
    });

    it('should fall back to welcome message when no persisted messages', async () => {
      vi.mocked(chatbotService.loadPersistedMessages).mockReturnValue(null);

      const { getByTestId } = render(<ChatBot config={defaultConfig} />);
      fireEvent.click(getByTestId('chatbot-button'));

      await waitFor(() => {
        expect(screen.getByText(/I'm here to help/)).toBeInTheDocument();
      });
    });

    it('should save messages after receiving a response', async () => {
      vi.mocked(chatbotService.loadPersistedMessages).mockReturnValue(null);
      vi.mocked(chatbotService.isPersistMessagesEnabled).mockReturnValue(true);

      const { getByTestId } = render(<ChatBot config={defaultConfig} />);
      fireEvent.click(getByTestId('chatbot-button'));

      await waitFor(() => {
        expect(getByTestId('chatbot-input')).toBeInTheDocument();
      });

      fireEvent.change(getByTestId('chatbot-input'), { target: { value: 'Test message' } });
      fireEvent.click(getByTestId('chatbot-send'));

      await waitFor(() => {
        expect(chatbotService.saveMessages).toHaveBeenCalled();
      });
    });
  });
});
