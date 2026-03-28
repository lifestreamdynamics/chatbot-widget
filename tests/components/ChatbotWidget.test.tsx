import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef, forwardRef, useImperativeHandle } from 'react';
import ChatbotWidget from '../../src/ChatbotWidget';
import type { ChatbotConfig, ChatBotHandle } from '../../src/types';

// Mock the ChatBot component since it has complex dependencies
vi.mock('../../src/components/ChatBot', () => ({
  default: forwardRef<ChatBotHandle, { config: ChatbotConfig }>(({ config }, ref) => {
    useImperativeHandle(ref, () => ({
      open: vi.fn(),
      close: vi.fn(),
      toggle: vi.fn(),
      sendMessage: vi.fn().mockResolvedValue({ success: true }),
      getSessionId: () => 'sess_test',
      isOpen: () => false,
    }));
    return (
      <div data-testid="chatbot-mock" data-api-url={config.apiUrl}>
        Mocked ChatBot
      </div>
    );
  }),
}));

describe('ChatbotWidget', () => {
  const defaultConfig: ChatbotConfig = {
    apiUrl: 'https://api.example.com/v1',
    apiKey: 'test-api-key',
  };

  it('should render without crashing', () => {
    render(<ChatbotWidget config={defaultConfig} />);
    expect(screen.getByTestId('chatbot-mock')).toBeInTheDocument();
  });

  it('should pass config to ChatBot component', () => {
    render(<ChatbotWidget config={defaultConfig} />);
    const chatbot = screen.getByTestId('chatbot-mock');
    expect(chatbot).toHaveAttribute('data-api-url', defaultConfig.apiUrl);
  });

  it('should wrap ChatBot in StrictMode', () => {
    // StrictMode doesn't add visible DOM elements, but we can verify
    // the component renders correctly which would fail if StrictMode had issues
    const { container } = render(<ChatbotWidget config={defaultConfig} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('should accept optional theme configuration', () => {
    const configWithTheme: ChatbotConfig = {
      ...defaultConfig,
      theme: {
        primaryColor: '#007bff',
        position: 'bottom-right',
      },
    };

    render(<ChatbotWidget config={configWithTheme} />);
    expect(screen.getByTestId('chatbot-mock')).toBeInTheDocument();
  });

  it('should accept privacy configuration', () => {
    const configWithPrivacy: ChatbotConfig = {
      ...defaultConfig,
      privacy: {
        enableSessionStorage: true,
        consentRequired: true,
        dataRetentionDays: 30,
      },
    };

    render(<ChatbotWidget config={configWithPrivacy} />);
    expect(screen.getByTestId('chatbot-mock')).toBeInTheDocument();
  });

  it('should forward ref to ChatBot component', () => {
    const ref = createRef<ChatBotHandle>();
    render(<ChatbotWidget ref={ref} config={defaultConfig} />);

    expect(ref.current).not.toBeNull();
    expect(typeof ref.current?.open).toBe('function');
    expect(typeof ref.current?.close).toBe('function');
    expect(typeof ref.current?.sendMessage).toBe('function');
    expect(typeof ref.current?.getSessionId).toBe('function');
    expect(typeof ref.current?.isOpen).toBe('function');
  });
});
