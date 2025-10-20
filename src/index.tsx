import { createRoot } from 'react-dom/client';
import ChatbotWidget from './ChatbotWidget';
import { ChatbotConfig } from './types';
import { configure, grantConsent as grantConsentService, revokeConsent as revokeConsentService, clearSession as clearSessionService } from './services/chatbotService';
import './styles.css';

let rootInstance: ReturnType<typeof createRoot> | null = null;
let containerElement: HTMLDivElement | null = null;

export function initLifestreamChatbot(config: ChatbotConfig): () => void {
  // Validate required configuration
  if (!config.apiUrl || !config.apiKey) {
    console.error('[Lifestream Chatbot] Missing required configuration: apiUrl and apiKey are required');
    return () => {};
  }

  // Configure the chatbot service with privacy settings
  configure(
    config.apiUrl,
    config.apiKey,
    config.sessionStorage,
    config.enableDevMode,
    config.privacy
  );

  // Create or get mount point
  containerElement = document.getElementById('lifestream-chatbot-root') as HTMLDivElement;

  if (!containerElement) {
    containerElement = document.createElement('div');
    containerElement.id = 'lifestream-chatbot-root';
    document.body.appendChild(containerElement);
  }

  // Apply theme CSS custom properties
  if (config.theme) {
    const root = document.documentElement;
    if (config.theme.primaryColor) root.style.setProperty('--chatbot-primary', config.theme.primaryColor);
    if (config.theme.secondaryColor) root.style.setProperty('--chatbot-secondary', config.theme.secondaryColor);
    if (config.theme.backgroundColor) root.style.setProperty('--chatbot-bg', config.theme.backgroundColor);
    if (config.theme.surfaceColor) root.style.setProperty('--chatbot-surface', config.theme.surfaceColor);
    if (config.theme.textColor) root.style.setProperty('--chatbot-text', config.theme.textColor);
    if (config.theme.borderColor) root.style.setProperty('--chatbot-border', config.theme.borderColor);

    if (config.theme.positionOffset?.x) root.style.setProperty('--chatbot-position-x', config.theme.positionOffset.x);
    if (config.theme.positionOffset?.y) root.style.setProperty('--chatbot-position-y', config.theme.positionOffset.y);
  }

  // Render the widget
  rootInstance = createRoot(containerElement);
  rootInstance.render(<ChatbotWidget config={config} />);

  // Return cleanup function
  return () => {
    if (rootInstance) {
      rootInstance.unmount();
      rootInstance = null;
    }
    if (containerElement && containerElement.parentNode) {
      containerElement.parentNode.removeChild(containerElement);
      containerElement = null;
    }
  };
}

// Privacy & Consent Management
export function grantConsent(): void {
  grantConsentService();
}

export function revokeConsent(): void {
  revokeConsentService();
}

export function clearHistory(): void {
  clearSessionService();
}

// UMD/IIFE global export
if (typeof window !== 'undefined') {
  (window as any).initLifestreamChatbot = initLifestreamChatbot;
  (window as any).LifestreamChatbot = {
    init: initLifestreamChatbot,
    grantConsent,
    revokeConsent,
    clearHistory,
  };
}

export type { ChatbotConfig } from './types';
export default initLifestreamChatbot;
