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
    mode?: 'dark' | 'light' | 'auto';
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
  /** Custom CSS class(es) applied to the chat window container */
  className?: string;
  /** Custom CSS class(es) applied to the floating trigger button */
  buttonClassName?: string;
  enableStreaming?: boolean;
  /** Enable client-side message persistence across page reloads. Requires storage to be enabled. */
  persistMessages?: boolean;
  metadata?: Record<string, unknown>;
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
    message: string; // Changed from 'response' to match API v1.0.0
    /** @deprecated Use `message` instead. Will be removed in v3.0.0. */
    response?: string;
    session_id: string;
    tokens_used: number;
    model?: string;
    finish_reason?: 'stop' | 'max_tokens' | 'safety' | 'error';
    content_safety?: ContentSafetyWarning;
  };
  error?: string;
  message?: string; // Error message
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
      role: 'user' | 'assistant' | 'system';
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
  sendMessage: (text: string) => Promise<{ success: boolean; error?: string }>;
  getSessionId: () => string;
  isOpen: () => boolean;
  exportChat: (format?: 'json' | 'text') => { success: boolean; error?: string };
  setThemeMode: (mode: 'dark' | 'light' | 'auto') => void;
  getThemeMode: () => 'dark' | 'light' | 'auto';
}

// Event System Types
export type ChatbotEventName = 'open' | 'close' | 'message' | 'error' | 'export' | 'themeChange';

export interface ChatbotMessageEvent {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatbotErrorEvent {
  type: 'api' | 'network' | 'validation' | 'streaming';
  message: string;
  details?: unknown;
}

export interface ChatbotExportEvent {
  format: 'json' | 'text';
  messageCount: number;
  timestamp: Date;
}

export interface ChatbotThemeChangeEvent {
  mode: 'dark' | 'light' | 'auto';
  resolvedMode: 'dark' | 'light';
}
