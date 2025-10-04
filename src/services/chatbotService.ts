import { ChatResponse, ChatHistoryResponse } from '../types';

let API_URL = '';
let API_KEY = '';
let USE_SESSION_STORAGE = false;

export function configure(apiUrl: string, apiKey: string, sessionStorage = false) {
  API_URL = apiUrl;
  API_KEY = apiKey;
  USE_SESSION_STORAGE = sessionStorage;
}

export interface SendMessageOptions {
  metadata?: Record<string, any>;
  onChunk?: (chunk: string) => void;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  const storage = USE_SESSION_STORAGE ? window.sessionStorage : window.localStorage;
  let sessionId = storage.getItem('chatbot_session_id');

  if (!sessionId) {
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
}

export async function sendMessage(message: string, options?: SendMessageOptions): Promise<ChatResponse> {
  try {
    const sessionId = getSessionId();

    // If streaming is requested via onChunk callback
    if (options?.onChunk) {
      return await sendStreamingMessage(message, sessionId, options);
    }

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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 429) {
        return {
          success: false,
          error: 'Rate Limit Exceeded',
          message: 'You\'re chatting too quickly! Please wait a moment and try again.',
        };
      }

      return {
        success: false,
        error: errorData.error || 'Request Failed',
        message: errorData.message || 'Unable to send message. Please try again.',
      };
    }

    const data: ChatResponse = await response.json();
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || 'Request Failed',
        message: errorData.message || 'Unable to send message. Please try again.',
      };
    }

    // Process Server-Sent Events stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

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
              return {
                success: true,
                data: {
                  response: fullResponse,
                  session_id: sessionId,
                  tokens_used: 0, // Not provided in streaming mode
                },
              };
            }
            if (parsed.error) {
              return {
                success: false,
                error: 'Streaming Error',
                message: parsed.error,
              };
            }
          } catch (e) {
            // Skip invalid JSON
            continue;
          }
        }
      }
    }

    // Stream completed without done signal
    return {
      success: true,
      data: {
        response: fullResponse,
        session_id: sessionId,
        tokens_used: 0,
      },
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

export async function getChatHistory(): Promise<ChatHistoryResponse> {
  try {
    const sessionId = getSessionId();

    if (!sessionId) {
      return {
        success: true,
        data: {
          session_id: '',
          messages: [],
        },
      };
    }

    const response = await fetch(`${API_URL}/chat/history/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'Failed to load history',
      };
    }

    const data: ChatHistoryResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Chat History Error:', error);
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
