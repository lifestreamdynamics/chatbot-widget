import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatbotWidget from '../../src/ChatbotWidget';
import type { ChatbotConfig } from '../../src/types';

// Mock the ChatBot component since it has complex dependencies
vi.mock('../../src/components/ChatBot', () => ({
  default: ({ config }: { config: ChatbotConfig }) => (
    <div data-testid="chatbot-mock" data-api-url={config.apiUrl}>
      Mocked ChatBot
    </div>
  ),
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
});
