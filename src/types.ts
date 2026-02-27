export interface ChatbotConfig {
  apiUrl: string;
  apiKey: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    surfaceColor?: string;
    textColor?: string;
    borderColor?: string;
    position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
    positionOffset?: {
      x?: string;
      y?: string;
    };
  };
  welcomeMessage?: string;
  title?: string;
  subtitle?: string;
  quickActions?: Array<{ label: string; message: string }>;
  autoOpen?: boolean;
  /** @deprecated Use `privacy.enableSessionStorage` instead. Will be removed in v3.0.0. */
  sessionStorage?: boolean;
  maxWidth?: string;
  maxHeight?: string;
  enableStreaming?: boolean;
  metadata?: Record<string, any>;
  privacy?: {
    enableSessionStorage?: boolean;
    /** @planned Not yet implemented. Will disable analytics metadata in future releases. */
    disableAnalytics?: boolean;
    /** @planned Not yet implemented. Will configure session retention in future releases. */
    dataRetentionDays?: number;
    consentRequired?: boolean;
  };
  enableDevMode?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ContentSafetyWarning {
  warnings: string[];
  redactions_applied?: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  tokenLimit: number;
  tokenUsed: number;
  tokenRemaining: number;
}

export interface ChatResponse {
  success: boolean;
  data?: {
    message: string;  // Changed from 'response' to match API v1.0.0
    response?: string;  // Kept for backwards compatibility
    session_id: string;
    tokens_used: number;
    model?: string;
    finish_reason?: 'stop' | 'max_tokens' | 'safety' | 'error';
    content_safety?: ContentSafetyWarning;
  };
  error?: string;
  message?: string;  // Error message
  retryAfter?: number;
  rateLimitInfo?: RateLimitInfo;
}

export interface ChatHistoryParams {
  limit?: number;
  offset?: number;
}

export interface ChatHistoryResponse {
  success: boolean;
  data?: {
    session_id: string;
    messages: Array<{
      id?: string;
      role: string;
      content: string;
      tokens_used?: number;
      created_at: string;
    }>;
    total_count?: number;
    has_more?: boolean;
  };
  error?: string;
}

// Programmatic API Handle
export interface ChatBotHandle {
  open: () => void;
  close: () => void;
  toggle: () => void;
  sendMessage: (text: string) => Promise<void>;
  getSessionId: () => string;
  isOpen: () => boolean;
}

// Event System Types
export type ChatbotEventName = 'open' | 'close' | 'message' | 'error';

export interface ChatbotMessageEvent {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatbotErrorEvent {
  type: 'api' | 'network' | 'validation';
  message: string;
  details?: unknown;
}
