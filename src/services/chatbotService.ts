import { ChatResponse, ChatHistoryResponse, ChatHistoryParams, RateLimitInfo } from '../types';

let API_URL = '';
let API_KEY = '';
let USE_SESSION_STORAGE = false;
let ENABLE_DEV_MODE = false;
let STORAGE_ENABLED = true;
let CONSENT_GRANTED = true;

export function configure(apiUrl: string, apiKey: string, sessionStorage = false, devMode = false, privacyConfig?: { enableSessionStorage?: boolean; consentRequired?: boolean }) {
  API_URL = apiUrl;
  API_KEY = apiKey;
  USE_SESSION_STORAGE = sessionStorage;
  ENABLE_DEV_MODE = devMode;

  // Privacy configuration
  if (privacyConfig) {
    STORAGE_ENABLED = privacyConfig.enableSessionStorage !== false;
    CONSENT_GRANTED = !privacyConfig.consentRequired;
  }
}

export interface SendMessageOptions {
  metadata?: Record<string, any>;
  onChunk?: (chunk: string) => void;
}

// In-memory storage for when consent not granted or storage disabled
let memorySessionId: string | null = null;

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  // Use in-memory storage if consent not granted or storage disabled
  if (!CONSENT_GRANTED || !STORAGE_ENABLED) {
    if (!memorySessionId) {
      memorySessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    return memorySessionId;
  }

  const storage = USE_SESSION_STORAGE ? window.sessionStorage : window.localStorage;
  let sessionId = storage.getItem('chatbot_session_id');

  if (!sessionId) {
    // Ensure session ID matches required pattern: sess_[alphanumeric]
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    storage.setItem('chatbot_session_id', sessionId);
  }

  return sessionId;
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    const storage = USE_SESSION_STORAGE ? window.sessionStorage : window.localStorage;
    storage.removeItem('chatbot_session_id');
  }
  memorySessionId = null;
}

export function grantConsent(): void {
  CONSENT_GRANTED = true;
  // Move session from memory to storage if exists
  if (memorySessionId && STORAGE_ENABLED && typeof window !== 'undefined') {
    const storage = USE_SESSION_STORAGE ? window.sessionStorage : window.localStorage;
    storage.setItem('chatbot_session_id', memorySessionId);
  }
}

export function revokeConsent(): void {
  CONSENT_GRANTED = false;
  clearSession();
}

// Helper function to extract rate limit info from headers
function extractRateLimitInfo(headers: Headers): RateLimitInfo | undefined {
  const limit = headers.get('X-RateLimit-Limit');
  const remaining = headers.get('X-RateLimit-Remaining');
  const reset = headers.get('X-RateLimit-Reset');
  const tokenLimit = headers.get('X-Token-Limit');
  const tokenUsed = headers.get('X-Token-Used');
  const tokenRemaining = headers.get('X-Token-Remaining');

  if (limit && remaining && reset && tokenLimit && tokenUsed && tokenRemaining) {
    return {
      limit: parseInt(limit),
      remaining: parseInt(remaining),
      reset: parseInt(reset),
      tokenLimit: parseInt(tokenLimit),
      tokenUsed: parseInt(tokenUsed),
      tokenRemaining: parseInt(tokenRemaining),
    };
  }

  return undefined;
}

// Helper function to log in dev mode
function devLog(message: string, data?: any) {
  if (ENABLE_DEV_MODE) {
    console.log(`[Chatbot] ${message}`, data || '');
  }
}

export async function sendMessage(message: string, options?: SendMessageOptions): Promise<ChatResponse> {
  try {
    // Validate message length (max 10,000 characters per API spec)
    if (message.trim().length === 0) {
      return {
        success: false,
        error: 'Validation Error',
        message: 'Message cannot be empty.',
      };
    }

    if (message.length > 10000) {
      return {
        success: false,
        error: 'Validation Error',
        message: 'Message is too long. Maximum 10,000 characters allowed.',
      };
    }

    const sessionId = getSessionId();

    // If streaming is requested via onChunk callback
    if (options?.onChunk) {
      return await sendStreamingMessage(message, sessionId, options);
    }

    const requestStart = Date.now();

    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message.trim(),
        session_id: sessionId,
        metadata: options?.metadata,
      }),
    });

    const responseTime = Date.now() - requestStart;

    // Extract rate limit info from headers
    const rateLimitInfo = extractRateLimitInfo(response.headers);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');

        devLog('Rate limit exceeded', { retryAfter, rateLimitInfo });

        return {
          success: false,
          error: 'Rate Limit Exceeded',
          message: errorData.message || 'You\'re chatting too quickly! Please wait a moment and try again.',
          retryAfter,
          rateLimitInfo,
        };
      }

      devLog(`API Error: ${response.status}`, errorData);

      return {
        success: false,
        error: errorData.error || 'Request Failed',
        message: errorData.message || 'Unable to send message. Please try again.',
        rateLimitInfo,
      };
    }

    const data: ChatResponse = await response.json();

    // Map 'message' field to 'response' for backwards compatibility
    if (data.data?.message && !data.data.response) {
      data.data.response = data.data.message;
    }

    // Attach rate limit info
    if (rateLimitInfo) {
      data.rateLimitInfo = rateLimitInfo;
    }

    // Dev mode logging
    if (ENABLE_DEV_MODE && data.data) {
      devLog(`Rate Limit: ${rateLimitInfo?.remaining}/${rateLimitInfo?.limit} requests remaining`);
      devLog(`Tokens: ${rateLimitInfo?.tokenUsed}/${rateLimitInfo?.tokenLimit} used today (${((rateLimitInfo?.tokenUsed || 0) / (rateLimitInfo?.tokenLimit || 1) * 100).toFixed(1)}%)`);
      devLog(`Response time: ${responseTime}ms | Model: ${data.data.model || 'unknown'}${data.data.tokens_used ? ` | Tokens: ${data.data.tokens_used}` : ''}`);

      if (data.data.content_safety?.warnings?.length) {
        devLog('Content Safety:', data.data.content_safety.warnings.join(', '));
      }
    }

    return data;

  } catch (error) {
    console.error('[Chatbot] API Error:', error);
    return {
      success: false,
      error: 'Network Error',
      message: 'Unable to connect to the chatbot. Please check your connection and try again.',
    };
  }
}

async function sendStreamingMessage(
  message: string,
  sessionId: string,
  options: SendMessageOptions
): Promise<ChatResponse> {
  try {
    const requestStart = Date.now();

    const response = await fetch(`${API_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message.trim(),
        session_id: sessionId,
        metadata: options.metadata,
      }),
    });

    // Extract rate limit info
    const rateLimitInfo = extractRateLimitInfo(response.headers);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        return {
          success: false,
          error: 'Rate Limit Exceeded',
          message: errorData.message || 'Rate limit exceeded. Please try again later.',
          retryAfter,
          rateLimitInfo,
        };
      }

      return {
        success: false,
        error: errorData.error || 'Request Failed',
        message: errorData.message || 'Unable to send message. Please try again.',
        rateLimitInfo,
      };
    }

    // Process Server-Sent Events stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    if (!reader) {
      throw new Error('No response body');
    }

    let streamComplete = false;
    while (!streamComplete) {
      const { done, value } = await reader.read();
      if (done) {
        streamComplete = true;
        continue;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.chunk) {
              fullResponse += parsed.chunk;
              options.onChunk?.(parsed.chunk);
            }
            if (parsed.done) {
              const responseTime = Date.now() - requestStart;

              // Dev mode logging for streaming
              if (ENABLE_DEV_MODE) {
                devLog(`Streaming complete: ${responseTime}ms`);
                if (rateLimitInfo) {
                  devLog(`Rate Limit: ${rateLimitInfo.remaining}/${rateLimitInfo.limit} requests remaining`);
                }
              }

              return {
                success: true,
                data: {
                  message: fullResponse,
                  response: fullResponse,  // Backwards compatibility
                  session_id: sessionId,
                  tokens_used: parsed.tokens_used || 0,
                  model: parsed.model,
                  finish_reason: parsed.finish_reason || 'stop',
                  content_safety: parsed.content_safety,
                },
                rateLimitInfo,
              };
            }
            if (parsed.error) {
              return {
                success: false,
                error: 'Streaming Error',
                message: parsed.error,
                rateLimitInfo,
              };
            }
          } catch {
            // Skip invalid JSON
            continue;
          }
        }
      }
    }

    // Stream completed without done signal
    const responseTime = Date.now() - requestStart;
    devLog(`Streaming completed (no done signal): ${responseTime}ms`);

    return {
      success: true,
      data: {
        message: fullResponse,
        response: fullResponse,
        session_id: sessionId,
        tokens_used: 0,
      },
      rateLimitInfo,
    };

  } catch (error) {
    console.error('[Chatbot] Streaming Error:', error);
    return {
      success: false,
      error: 'Network Error',
      message: 'Unable to connect to the chatbot. Please check your connection and try again.',
    };
  }
}

export async function getChatHistory(params?: ChatHistoryParams): Promise<ChatHistoryResponse> {
  try {
    const sessionId = getSessionId();

    if (!sessionId) {
      return {
        success: true,
        data: {
          session_id: '',
          messages: [],
          total_count: 0,
          has_more: false,
        },
      };
    }

    // Build query string for pagination
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const queryString = queryParams.toString();
    const url = `${API_URL}/chat/history/${sessionId}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      devLog(`History fetch failed: ${response.status}`);
      return {
        success: false,
        error: 'Failed to load history',
      };
    }

    const data: ChatHistoryResponse = await response.json();

    devLog(`Chat history loaded: ${data.data?.messages?.length || 0} messages${data.data?.has_more ? ' (more available)' : ''}`);

    return data;

  } catch (error) {
    console.error('[Chatbot] Chat History Error:', error);
    return {
      success: false,
      error: 'Network error loading history',
    };
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL.replace('/api/v1', '')}/health`, {
      method: 'GET',
    });

    return response.ok;
  } catch (error) {
    console.error('Health Check Failed:', error);
    return false;
  }
}
