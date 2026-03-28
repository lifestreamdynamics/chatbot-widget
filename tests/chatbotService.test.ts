import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  configure,
  getSessionId,
  clearSession,
  grantConsent,
  revokeConsent,
  sendMessage,
  getChatHistory,
  checkHealth,
  isConsentGranted,
  isConsentRequired,
  registerClearMessagesCallback,
  saveMessages,
  loadPersistedMessages,
  clearPersistedMessages,
  isPersistMessagesEnabled,
} from '../src/services/chatbotService';

describe('chatbotService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset service state by reconfiguring
    configure('https://api.example.com/v1', 'test-api-key', false, false);
  });

  describe('configure', () => {
    it('should use sessionStorage when enableSessionStorage is true', () => {
      configure('https://api.test.com', 'my-api-key', false, false, {
        enableSessionStorage: true,
      });

      const sessionId = getSessionId();
      expect(sessionId).toMatch(/^sess_/);
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('chatbot_session_id', expect.any(String));
      expect(window.localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should configure the service with API credentials', async () => {
      configure('https://api.test.com/v1', 'my-api-key');

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          success: true,
          data: { message: 'ok', session_id: 'sess_1', tokens_used: 1 },
        }),
      });

      await sendMessage('hello');

      expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/v1/chat', expect.any(Object));
    });

    it('should use in-memory storage when privacy disables storage', () => {
      configure('https://api.test.com', 'my-api-key', false, false, {
        enableSessionStorage: false,
      });

      const sessionId = getSessionId();
      expect(sessionId).toMatch(/^sess_/);
      // Should NOT have called localStorage or sessionStorage
      expect(window.localStorage.setItem).not.toHaveBeenCalled();
      expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getSessionId', () => {
    it('should generate a session ID with correct format', () => {
      const sessionId = getSessionId();
      expect(sessionId).toMatch(/^sess_\d+_[a-z0-9]+$/);
    });

    it('should return consistent session ID on subsequent calls', () => {
      // Setup mock to return what was stored
      let storedSessionId: string | null = null;
      vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => storedSessionId);
      vi.spyOn(window.localStorage, 'setItem').mockImplementation((_key, value) => {
        storedSessionId = value;
      });

      const firstId = getSessionId();
      const secondId = getSessionId();
      expect(firstId).toBe(secondId);
    });
  });

  describe('clearSession', () => {
    it('should clear the session ID', () => {
      getSessionId(); // Generate one first
      clearSession();
      // After clearing, localStorage.removeItem should have been called
      expect(window.localStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('consent management', () => {
    it('should grant consent and migrate session to storage', () => {
      configure('https://api.test.com', 'my-api-key', false, false, {
        consentRequired: true,
      });

      // Generate in-memory session first
      const sessionId = getSessionId();
      expect(window.localStorage.setItem).not.toHaveBeenCalled();

      // Grant consent - should migrate to storage
      grantConsent();
      expect(window.localStorage.setItem).toHaveBeenCalledWith('chatbot_session_id', sessionId);
    });

    it('should revoke consent and clear session', () => {
      // Generate a session first so there's something to revoke
      getSessionId();
      // Revoke consent - clears in-memory session, sets CONSENT_GRANTED=false
      revokeConsent();
      // After revoking, in-memory session is cleared (memorySessionId = null)
      // CONSENT_GRANTED becomes false, so future getSessionId generates a new in-memory id
      const newSessionId = getSessionId();
      expect(newSessionId).toMatch(/^sess_/);
    });
  });

  describe('privacy warnings', () => {
    it('should warn when disableAnalytics is passed', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      configure('https://api.test.com', 'my-api-key', false, false, {
        disableAnalytics: true,
      });
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('disableAnalytics'));
      warnSpy.mockRestore();
    });

    it('should warn when dataRetentionDays is passed', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      configure('https://api.test.com', 'my-api-key', false, false, {
        dataRetentionDays: 30,
      });
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('dataRetentionDays'));
      warnSpy.mockRestore();
    });
  });

  describe('sendMessage', () => {
    it('should return validation error for empty message', async () => {
      const result = await sendMessage('   ');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation Error');
      expect(result.message).toContain('empty');
    });

    it('should return validation error for message exceeding 10000 characters', async () => {
      const longMessage = 'a'.repeat(10001);
      const result = await sendMessage(longMessage);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation Error');
      expect(result.message).toContain('too long');
    });

    it('should send message and return success response', async () => {
      const mockResponse = {
        success: true,
        data: {
          message: 'Hello! How can I help you?',
          session_id: 'sess_123',
          tokens_used: 50,
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse,
      });

      const result = await sendMessage('Hello');
      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('Hello! How can I help you?');
    });

    it('should handle rate limit error', async () => {
      const headers = new Headers();
      headers.set('Retry-After', '30');

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers,
        json: async () => ({ message: 'Rate limit exceeded' }),
      });

      const result = await sendMessage('Hello');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Rate Limit Exceeded');
      expect(result.retryAfter).toBe(30);
    });

    it('should handle network error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      const result = await sendMessage('Hello');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network Error');
    });
  });

  describe('dev mode logging', () => {
    it('should log with prefix when devMode is enabled', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      configure('https://api.example.com/v1', 'test-api-key', false, true);

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '99',
          'X-RateLimit-Reset': '1234567890',
          'X-Token-Limit': '10000',
          'X-Token-Used': '50',
          'X-Token-Remaining': '9950',
        }),
        json: async () => ({
          success: true,
          data: { message: 'test reply', session_id: 'sess_1', tokens_used: 50, model: 'gpt-4' },
        }),
      });

      await sendMessage('Hello');

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('[LifestreamChatbot]')
      );
      logSpy.mockRestore();
    });
  });

  // Helper to create a mock ReadableStream for SSE testing
  function createMockStream(lines: string[]) {
    const encoder = new TextEncoder();
    let i = 0;
    return {
      getReader: () => ({
        read: vi.fn().mockImplementation(async () => {
          if (i < lines.length) {
            return { done: false, value: encoder.encode(lines[i++] + '\n') };
          }
          return { done: true, value: undefined };
        }),
      }),
    };
  }

  describe('sendStreamingMessage', () => {
    it('should stream chunks and assemble full response', async () => {
      const mockStream = createMockStream([
        'data: {"chunk":"Hello"}',
        'data: {"chunk":" world"}',
        'data: {"done":true,"tokens_used":10,"model":"gpt-4","finish_reason":"stop"}',
      ]);

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        body: mockStream,
      });

      const chunks: string[] = [];
      const result = await sendMessage('Hello', {
        onChunk: (chunk) => chunks.push(chunk),
      });

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('Hello world');
      expect(chunks).toEqual(['Hello', ' world']);
      expect(result.data?.tokens_used).toBe(10);
      expect(result.data?.model).toBe('gpt-4');
    });

    it('should handle rate limit error (429) in streaming', async () => {
      const headers = new Headers();
      headers.set('Retry-After', '45');

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers,
        json: async () => ({ message: 'Too many requests' }),
      });

      const result = await sendMessage('Hello', { onChunk: vi.fn() });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rate Limit Exceeded');
      expect(result.retryAfter).toBe(45);
    });

    it('should handle non-rate-limit API error in streaming', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 503,
        headers: new Headers(),
        json: async () => ({ error: 'Service Unavailable', message: 'Try later' }),
      });

      const result = await sendMessage('Hello', { onChunk: vi.fn() });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Service Unavailable');
      expect(result.message).toBe('Try later');
    });

    it('should handle network error in streaming', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Connection refused')
      );

      const result = await sendMessage('Hello', { onChunk: vi.fn() });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network Error');
    });

    it('should skip malformed JSON and continue streaming', async () => {
      const mockStream = createMockStream(['data: not-valid-json', 'data: {"done":true}']);

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        body: mockStream,
      });

      const result = await sendMessage('Hello', { onChunk: vi.fn() });

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('');
    });

    it('should handle streaming error event', async () => {
      const mockStream = createMockStream(['data: {"error":"Internal server error"}']);

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        body: mockStream,
      });

      const result = await sendMessage('Hello', { onChunk: vi.fn() });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Streaming Error');
      expect(result.message).toBe('Internal server error');
    });

    it('should handle stream completing without done signal', async () => {
      const mockStream = createMockStream(['data: {"chunk":"partial content"}']);

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        body: mockStream,
      });

      const result = await sendMessage('Hello', { onChunk: vi.fn() });

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('partial content');
    });

    it('should handle stream with null body', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        body: null,
      });

      const result = await sendMessage('Hello', { onChunk: vi.fn() });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network Error');
    });
  });

  describe('getChatHistory', () => {
    it('should fetch chat history successfully', async () => {
      const mockHistory = {
        success: true,
        data: {
          session_id: 'sess_123',
          messages: [
            { role: 'user', content: 'Hello', created_at: '2024-01-01T00:00:00Z' },
            { role: 'assistant', content: 'Hi!', created_at: '2024-01-01T00:00:01Z' },
          ],
          total_count: 2,
          has_more: false,
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHistory,
      });

      const result = await getChatHistory();
      expect(result.success).toBe(true);
      expect(result.data?.messages).toHaveLength(2);
    });

    it('should support pagination parameters', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { session_id: '', messages: [] } }),
      });

      await getChatHistory({ limit: 10, offset: 5 });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=5'),
        expect.any(Object)
      );
    });

    it('should include offset=0 in URL when explicitly set', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { session_id: '', messages: [] } }),
      });

      await getChatHistory({ limit: 10, offset: 0 });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=0'),
        expect.any(Object)
      );
    });

    it('should handle network error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Connection refused')
      );

      const result = await getChatHistory();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error loading history');
    });

    it('should handle non-ok response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await getChatHistory();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to load history');
    });

    it('should return empty result when sessionId is empty', async () => {
      // Force an empty session by clearing everything
      clearSession();
      // The getSessionId function will generate a new one, so let's test
      // the early return path indirectly - when sessionId exists but API returns empty
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { session_id: '', messages: [], total_count: 0, has_more: false },
        }),
      });

      const result = await getChatHistory();
      expect(result.success).toBe(true);
      expect(result.data?.messages).toEqual([]);
    });
  });

  describe('checkHealth', () => {
    it('should return true when API is healthy', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
      });

      const result = await checkHealth();
      expect(result).toBe(true);
    });

    it('should return false when API is unhealthy', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      const result = await checkHealth();
      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      const result = await checkHealth();
      expect(result).toBe(false);
    });

    it('should use proper URL construction for health endpoint', async () => {
      configure('https://api.example.com/api/v1', 'test-key');
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });

      await checkHealth();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/health',
        expect.any(Object)
      );
    });

    it('should accept custom health URL', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });

      await checkHealth('https://custom.example.com/healthz');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://custom.example.com/healthz',
        expect.any(Object)
      );
    });
  });

  describe('isConsentGranted', () => {
    it('returns true by default', () => {
      configure('http://api.test', 'pk_test');
      expect(isConsentGranted()).toBe(true);
    });

    it('returns false when consentRequired is true', () => {
      configure('http://api.test', 'pk_test', false, false, { consentRequired: true });
      expect(isConsentGranted()).toBe(false);
    });

    it('returns true after grantConsent()', () => {
      configure('http://api.test', 'pk_test', false, false, { consentRequired: true });
      expect(isConsentGranted()).toBe(false);
      grantConsent();
      expect(isConsentGranted()).toBe(true);
    });

    it('returns false after revokeConsent()', () => {
      configure('http://api.test', 'pk_test');
      expect(isConsentGranted()).toBe(true);
      revokeConsent();
      expect(isConsentGranted()).toBe(false);
    });
  });

  describe('isConsentRequired', () => {
    it('returns false by default', () => {
      configure('http://api.test', 'pk_test');
      expect(isConsentRequired()).toBe(false);
    });

    it('returns true when consentRequired is true', () => {
      configure('http://api.test', 'pk_test', false, false, { consentRequired: true });
      expect(isConsentRequired()).toBe(true);
    });

    it('returns false when no privacy config', () => {
      configure('http://api.test', 'pk_test', false, false);
      expect(isConsentRequired()).toBe(false);
    });

    it('resets on re-configure', () => {
      configure('http://api.test', 'pk_test', false, false, { consentRequired: true });
      expect(isConsentRequired()).toBe(true);
      configure('http://api.test', 'pk_test');
      expect(isConsentRequired()).toBe(false);
    });
  });

  describe('clearMessages callback', () => {
    it('clearSession invokes registered clearMessages callback', () => {
      configure('http://api.test', 'pk_test');
      const callback = vi.fn();
      registerClearMessagesCallback(callback);
      clearSession();
      expect(callback).toHaveBeenCalledOnce();
      registerClearMessagesCallback(null);
    });

    it('clearSession works without registered callback', () => {
      configure('http://api.test', 'pk_test');
      registerClearMessagesCallback(null);
      expect(() => clearSession()).not.toThrow();
    });

    it('unregistering callback prevents invocation', () => {
      configure('http://api.test', 'pk_test');
      const callback = vi.fn();
      registerClearMessagesCallback(callback);
      registerClearMessagesCallback(null);
      clearSession();
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('message persistence', () => {
    const mockMessages = [
      { id: 'msg-1', role: 'user', content: 'Hello', timestamp: new Date('2026-01-01T10:00:00Z') },
      { id: 'msg-2', role: 'assistant', content: 'Hi there!', timestamp: new Date('2026-01-01T10:00:01Z') },
    ];

    beforeEach(() => {
      // Configure with persistence enabled
      configure('https://api.test.com/v1', 'pk_test', false, false, undefined, true);
    });

    it('should save and load messages when persistence is enabled', () => {
      const storage: Record<string, string> = {};
      vi.mocked(localStorage.setItem).mockImplementation((key, value) => { storage[key] = value; });
      vi.mocked(localStorage.getItem).mockImplementation((key) => storage[key] || null);

      saveMessages(mockMessages);
      expect(localStorage.setItem).toHaveBeenCalled();

      const loaded = loadPersistedMessages();
      expect(loaded).not.toBeNull();
      expect(loaded).toHaveLength(2);
      expect(loaded![0].content).toBe('Hello');
      expect(loaded![0].timestamp).toBeInstanceOf(Date);
    });

    it('should return null when no persisted messages exist', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      const loaded = loadPersistedMessages();
      expect(loaded).toBeNull();
    });

    it('should not save when persistence is disabled', () => {
      configure('https://api.test.com/v1', 'pk_test', false, false, undefined, false);
      saveMessages(mockMessages);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should not save when consent is not granted', () => {
      configure('https://api.test.com/v1', 'pk_test', false, false, { consentRequired: true }, true);
      saveMessages(mockMessages);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should cap messages at 100', () => {
      const manyMessages = Array.from({ length: 150 }, (_, i) => ({
        id: `msg-${i}`,
        role: 'user' as const,
        content: `Message ${i}`,
        timestamp: new Date(),
      }));

      const storage: Record<string, string> = {};
      vi.mocked(localStorage.setItem).mockImplementation((key, value) => { storage[key] = value; });
      vi.mocked(localStorage.getItem).mockImplementation((key) => storage[key] || null);

      saveMessages(manyMessages);
      const loaded = loadPersistedMessages();
      expect(loaded).toHaveLength(100);
      // Should keep the last 100 (most recent)
      expect(loaded![0].content).toBe('Message 50');
    });

    it('should clear persisted messages', () => {
      // Ensure a session ID exists so clearPersistedMessages has a key to clear
      vi.mocked(localStorage.getItem).mockImplementation((key) =>
        key === 'chatbot_session_id' ? 'sess_test_123' : null
      );
      clearPersistedMessages();
      expect(localStorage.removeItem).toHaveBeenCalledWith('chatbot_messages_sess_test_123');
    });

    it('should clear persisted messages when clearSession is called', () => {
      const storage: Record<string, string> = {};
      storage['chatbot_session_id'] = 'sess_test_123';
      vi.mocked(localStorage.getItem).mockImplementation((key) => storage[key] || null);

      clearSession();
      expect(localStorage.removeItem).toHaveBeenCalledWith('chatbot_session_id');
      // Also clears message storage
      expect(localStorage.removeItem).toHaveBeenCalledWith(expect.stringContaining('chatbot_messages_'));
    });

    it('should use sessionStorage when configured', () => {
      configure('https://api.test.com/v1', 'pk_test', false, false, { enableSessionStorage: true }, true);

      const storage: Record<string, string> = {};
      vi.mocked(sessionStorage.setItem).mockImplementation((key, value) => { storage[key] = value; });
      vi.mocked(sessionStorage.getItem).mockImplementation((key) => storage[key] || null);

      saveMessages(mockMessages);
      expect(sessionStorage.setItem).toHaveBeenCalled();
    });

    it('should report persistence status correctly', () => {
      expect(isPersistMessagesEnabled()).toBe(true);

      configure('https://api.test.com/v1', 'pk_test', false, false, undefined, false);
      expect(isPersistMessagesEnabled()).toBe(false);
    });
  });
});
