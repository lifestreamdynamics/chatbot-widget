import { ChatResponse, ChatHistoryResponse } from '../types';

let API_URL = '';
let API_KEY = '';
let USE_SESSION_STORAGE = false;

export function configure(apiUrl: string, apiKey: string, sessionStorage = false) {
  API_URL = apiUrl;
  API_KEY = apiKey;
  USE_SESSION_STORAGE = sessionStorage;
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

export async function sendMessage(message: string): Promise<ChatResponse> {
  try {
    const sessionId = getSessionId();

    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message.trim(),
        session_id: sessionId,
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
