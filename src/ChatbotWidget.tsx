import { StrictMode, forwardRef } from 'react';
import ChatBot from './components/ChatBot';
import { ChatbotConfig, ChatBotHandle, ChatbotEventName, ChatbotMessageEvent, ChatbotErrorEvent } from './types';

interface ChatbotWidgetProps {
  config: ChatbotConfig;
  onEmit?: (event: ChatbotEventName, data?: ChatbotMessageEvent | ChatbotErrorEvent) => void;
}

const ChatbotWidget = forwardRef<ChatBotHandle, ChatbotWidgetProps>(({ config, onEmit }, ref) => {
  return (
    <StrictMode>
      <ChatBot ref={ref} config={config} onEmit={onEmit} />
    </StrictMode>
  );
});

ChatbotWidget.displayName = 'ChatbotWidget';

export default ChatbotWidget;
