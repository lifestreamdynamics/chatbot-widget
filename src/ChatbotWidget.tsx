import { StrictMode } from 'react';
import ChatBot from './components/ChatBot';
import { ChatbotConfig } from './types';

interface ChatbotWidgetProps {
  config: ChatbotConfig;
}

export default function ChatbotWidget({ config }: ChatbotWidgetProps) {
  return (
    <StrictMode>
      <ChatBot config={config} />
    </StrictMode>
  );
}
