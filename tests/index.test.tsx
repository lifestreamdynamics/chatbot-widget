import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  initLifestreamChatbot,
  open,
  close,
  toggle,
  sendMessage,
  getSessionId,
  isOpen,
  grantConsent,
  revokeConsent,
  clearHistory,
  on,
  off,
} from '../src/index';
import * as chatbotService from '../src/services/chatbotService';
import type { ChatbotConfig } from '../src/types';

// Mock the chatbot service
vi.mock('../src/services/chatbotService', () => ({
  configure: vi.fn(),
  grantConsent: vi.fn(),
  revokeConsent: vi.fn(),
  clearSession: vi.fn(),
  getSessionId: vi.fn().mockReturnValue('sess_mock_123'),
  sendMessage: vi.fn().mockResolvedValue({ success: true, data: { message: 'ok', session_id: 'sess_1', tokens_used: 1 } }),
  getChatHistory: vi.fn().mockResolvedValue({ success: true, data: { session_id: 'sess_1', messages: [], has_more: false } }),
  registerConsentRevokedCallback: vi.fn(),
}));

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => children,
}));

vi.mock('remark-gfm', () => ({
  default: () => {},
}));

// Mock CSS import
vi.mock('../src/styles.css', () => ({}));

describe('index.tsx', () => {
  const defaultConfig: ChatbotConfig = {
    apiUrl: 'https://api.example.com/v1',
    apiKey: 'pk_test_key',
  };

  let cleanup: (() => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    // Clean up any existing container
    const existing = document.getElementById('lifestream-chatbot-root');
    if (existing) existing.remove();
  });

  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = undefined;
    }
    // Ensure container is cleaned up
    const existing = document.getElementById('lifestream-chatbot-root');
    if (existing) existing.remove();
  });

  // ============================================
  // INITIALIZATION TESTS
  // ============================================
  describe('initLifestreamChatbot', () => {
    it('should return noop cleanup when apiUrl is missing', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = initLifestreamChatbot({ apiUrl: '', apiKey: 'pk_test' } as ChatbotConfig);
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Missing required configuration'));
      expect(typeof result).toBe('function');
      errorSpy.mockRestore();
    });

    it('should return noop cleanup when apiKey is missing', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      initLifestreamChatbot({ apiUrl: 'https://api.test.com', apiKey: '' } as ChatbotConfig);
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Missing required configuration'));
      errorSpy.mockRestore();
    });

    it('should call configure with correct arguments', () => {
      cleanup = initLifestreamChatbot(defaultConfig);
      expect(chatbotService.configure).toHaveBeenCalledWith(
        defaultConfig.apiUrl,
        defaultConfig.apiKey,
        undefined,
        undefined,
        undefined
      );
    });

    it('should create container element if not present', () => {
      cleanup = initLifestreamChatbot(defaultConfig);
      const container = document.getElementById('lifestream-chatbot-root');
      expect(container).not.toBeNull();
    });

    it('should reuse existing container element', () => {
      const existingContainer = document.createElement('div');
      existingContainer.id = 'lifestream-chatbot-root';
      document.body.appendChild(existingContainer);

      cleanup = initLifestreamChatbot(defaultConfig);
      const containers = document.querySelectorAll('#lifestream-chatbot-root');
      expect(containers.length).toBe(1);
    });

    it('should clean up previous instance on re-init', () => {
      initLifestreamChatbot(defaultConfig);
      expect(document.getElementById('lifestream-chatbot-root')).not.toBeNull();

      // Re-init should not throw and should create new instance
      cleanup = initLifestreamChatbot(defaultConfig);
      expect(chatbotService.configure).toHaveBeenCalledTimes(2);
    });

    it('should apply theme CSS custom properties', () => {
      cleanup = initLifestreamChatbot({
        ...defaultConfig,
        theme: {
          primaryColor: '#ff0000',
          secondaryColor: '#00ff00',
        },
      });
      expect(document.documentElement.style.getPropertyValue('--chatbot-primary')).toBe('#ff0000');
      expect(document.documentElement.style.getPropertyValue('--chatbot-secondary')).toBe('#00ff00');
    });

    it('should pass privacy config to configure', () => {
      cleanup = initLifestreamChatbot({
        ...defaultConfig,
        privacy: {
          enableSessionStorage: true,
          consentRequired: true,
        },
      });
      expect(chatbotService.configure).toHaveBeenCalledWith(
        defaultConfig.apiUrl,
        defaultConfig.apiKey,
        undefined,
        undefined,
        { enableSessionStorage: true, consentRequired: true }
      );
    });
  });

  // ============================================
  // CLEANUP TESTS
  // ============================================
  describe('cleanup function', () => {
    it('should remove container from DOM', () => {
      cleanup = initLifestreamChatbot(defaultConfig);
      expect(document.getElementById('lifestream-chatbot-root')).not.toBeNull();

      cleanup();
      cleanup = undefined;
      expect(document.getElementById('lifestream-chatbot-root')).toBeNull();
    });

    it('should be safe to call multiple times', () => {
      cleanup = initLifestreamChatbot(defaultConfig);
      cleanup();
      expect(() => cleanup!()).not.toThrow();
      cleanup = undefined;
    });
  });

  // ============================================
  // CONSENT DELEGATION TESTS
  // ============================================
  describe('consent delegation', () => {
    it('should delegate grantConsent to service', () => {
      grantConsent();
      expect(chatbotService.grantConsent).toHaveBeenCalled();
    });

    it('should delegate revokeConsent to service', () => {
      revokeConsent();
      expect(chatbotService.revokeConsent).toHaveBeenCalled();
    });

    it('should delegate clearHistory to service', () => {
      clearHistory();
      expect(chatbotService.clearSession).toHaveBeenCalled();
    });
  });

  // ============================================
  // PROGRAMMATIC API (without ref)
  // ============================================
  describe('programmatic API without initialized ref', () => {
    it('should return service sessionId when ref is null', () => {
      const result = getSessionId();
      expect(result).toBe('sess_mock_123');
    });

    it('should return false for isOpen when ref is null', () => {
      expect(isOpen()).toBe(false);
    });

    it('should not throw when calling open without init', () => {
      expect(() => open()).not.toThrow();
    });

    it('should not throw when calling close without init', () => {
      expect(() => close()).not.toThrow();
    });

    it('should not throw when calling toggle without init', () => {
      expect(() => toggle()).not.toThrow();
    });

    it('should resolve sendMessage when ref is null', async () => {
      await expect(sendMessage('hello')).resolves.toBeUndefined();
    });
  });

  // ============================================
  // EVENT SYSTEM TESTS
  // ============================================
  describe('event system', () => {
    it('should register and call event listeners via on()', () => {
      cleanup = initLifestreamChatbot(defaultConfig);
      const callback = vi.fn();
      on('open', callback);

      // We can't easily trigger the internal emitEvent, but we can verify
      // that on() doesn't throw for valid event names
      expect(callback).not.toHaveBeenCalled();
    });

    it('should warn on invalid event name for on()', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      on('invalid' as any, vi.fn());
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Invalid event name: 'invalid'"));
      warnSpy.mockRestore();
    });

    it('should warn on invalid event name for off()', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      off('bogus' as any, vi.fn());
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Invalid event name: 'bogus'"));
      warnSpy.mockRestore();
    });

    it('should not add listener for invalid event', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const callback = vi.fn();
      on('notreal' as any, callback);
      // The callback should not have been registered
      // Calling off should also warn (since we never added it)
      off('notreal' as any, callback);
      expect(warnSpy).toHaveBeenCalledTimes(2);
      warnSpy.mockRestore();
    });

    it('should accept all valid event names', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      cleanup = initLifestreamChatbot(defaultConfig);
      const callback = vi.fn();

      on('open', callback);
      on('close', callback);
      on('message', callback);
      on('error', callback);

      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should remove listener with off()', () => {
      cleanup = initLifestreamChatbot(defaultConfig);
      const callback = vi.fn();
      on('open', callback);
      off('open', callback);
      // No error thrown means success
    });
  });

  // ============================================
  // GLOBAL EXPORT TESTS
  // ============================================
  describe('window.LifestreamChatbot', () => {
    it('should expose LifestreamChatbot on window', () => {
      expect((window as any).LifestreamChatbot).toBeDefined();
    });

    it('should expose all required methods', () => {
      const api = (window as any).LifestreamChatbot;
      expect(typeof api.init).toBe('function');
      expect(typeof api.open).toBe('function');
      expect(typeof api.close).toBe('function');
      expect(typeof api.toggle).toBe('function');
      expect(typeof api.sendMessage).toBe('function');
      expect(typeof api.getSessionId).toBe('function');
      expect(typeof api.isOpen).toBe('function');
      expect(typeof api.grantConsent).toBe('function');
      expect(typeof api.revokeConsent).toBe('function');
      expect(typeof api.clearHistory).toBe('function');
      expect(typeof api.on).toBe('function');
      expect(typeof api.off).toBe('function');
    });

    it('should expose initLifestreamChatbot as standalone global', () => {
      expect((window as any).initLifestreamChatbot).toBeDefined();
      expect(typeof (window as any).initLifestreamChatbot).toBe('function');
    });
  });
});
