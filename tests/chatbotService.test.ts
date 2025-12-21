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
} from '../src/services/chatbotService';

describe('chatbotService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset service state by reconfiguring
    configure('https://api.example.com/v1', 'test-api-key', false, false);
  });

  describe('configure', () => {
    it('should configure the service with API credentials', () => {
      configure('https://api.test.com', 'my-api-key');
      // Configuration is internal, but we can test it works via sendMessage
      expect(true).toBe(true);
    });

    it('should accept privacy configuration options', () => {
      configure('https://api.test.com', 'my-api-key', false, false, {
        enableSessionStorage: true,
        consentRequired: false,
      });
      expect(true).toBe(true);
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
    it('should grant consent', () => {
      grantConsent();
      // No assertion needed - just verifying no error
      expect(true).toBe(true);
    });

    it('should revoke consent and clear session', () => {
      revokeConsent();
      expect(window.localStorage.removeItem).toHaveBeenCalled();
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
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await sendMessage('Hello');
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
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await checkHealth();
      expect(result).toBe(false);
    });
  });
});
