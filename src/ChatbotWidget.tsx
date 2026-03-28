import { StrictMode, forwardRef } from 'react';
import ChatBot from './components/ChatBot';
import {
  ChatbotConfig,
  ChatBotHandle,
  ChatbotEventName,
  ChatbotMessageEvent,
  ChatbotErrorEvent,
  ChatbotExportEvent,
  ChatbotThemeChangeEvent,
} from './types';

interface ChatbotWidgetProps {
  config: ChatbotConfig;
  onEmit?: (event: ChatbotEventName, data?: ChatbotMessageEvent | ChatbotErrorEvent | ChatbotExportEvent | ChatbotThemeChangeEvent) => void;
  themeMode?: 'dark' | 'light';
  onThemeChange?: () => void;
  onSetThemeMode?: (mode: 'dark' | 'light' | 'auto') => void;
}

const ChatbotWidget = forwardRef<ChatBotHandle, ChatbotWidgetProps>(({ config, onEmit, themeMode, onThemeChange, onSetThemeMode }, ref) => {
  return (
    <StrictMode>
      <ChatBot ref={ref} config={config} onEmit={onEmit} themeMode={themeMode} onThemeChange={onThemeChange} onSetThemeMode={onSetThemeMode} />
    </StrictMode>
  );
});

ChatbotWidget.displayName = 'ChatbotWidget';

export default ChatbotWidget;
