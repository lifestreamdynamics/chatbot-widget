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
  sessionStorage?: boolean;
  maxWidth?: string;
  maxHeight?: string;
  enableStreaming?: boolean;
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  success: boolean;
  data?: {
    response: string;
    session_id: string;
    tokens_used: number;
  };
  error?: string;
  message?: string;
}

export interface ChatHistoryResponse {
  success: boolean;
  data?: {
    session_id: string;
    messages: Array<{
      role: string;
      content: string;
      created_at: string;
    }>;
  };
  error?: string;
}
