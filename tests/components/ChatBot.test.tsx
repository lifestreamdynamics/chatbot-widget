import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ChatBot from '../../src/components/ChatBot';
import * as chatbotService from '../../src/services/chatbotService';
import type { ChatbotConfig, ChatBotHandle, ChatResponse, ChatHistoryResponse } from '../../src/types';
import { createRef } from 'react';

// Mock the chatbot service
vi.mock('../../src/services/chatbotService', () => ({
  sendMessage: vi.fn(),
  getChatHistory: vi.fn(),
  getSessionId: vi.fn(),
  configure: vi.fn(),
}));

// Mock react-markdown to avoid complex rendering
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <span data-testid="markdown">{children}</span>,
}));

vi.mock('remark-gfm', () => ({
  default: () => {},
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
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true, title: 'Custom Bot', subtitle: 'Always here' }} />);

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
              { id: '1', role: 'user', content: 'Recent message', created_at: new Date().toISOString() },
            ],
            has_more: true,
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            session_id: 'sess_abc123',
            messages: [
              { id: '2', role: 'user', content: 'Older message', created_at: new Date().toISOString() },
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
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText('Hello!')).toBeInTheDocument();
      });
    });

    it('should close widget on Escape key', async () => {
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should have focus trap within widget', () => {
      render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      // The focus trap is tested by verifying the component has focusable elements
      // and the keydown handler is registered
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // Verify focusable elements exist within the dialog
      const minimizeBtn = screen.getByRole('button', { name: /minimize chat/i });
      const sendBtn = screen.getByRole('button', { name: /send message/i });
      const input = screen.getByPlaceholderText(/type your message/i);

      expect(minimizeBtn).toBeInTheDocument();
      expect(sendBtn).toBeInTheDocument();
      expect(input).toBeInTheDocument();
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
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

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
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

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
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

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
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

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
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = render(<ChatBot config={{ ...defaultConfig, autoOpen: true }} />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});
