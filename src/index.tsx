import { createRoot } from 'react-dom/client';
import { createRef } from 'react';
import ChatbotWidget from './ChatbotWidget';
import { ChatbotConfig, ChatBotHandle, ChatbotEventName, ChatbotMessageEvent, ChatbotErrorEvent } from './types';
import { configure, grantConsent as grantConsentService, revokeConsent as revokeConsentService, clearSession as clearSessionService, getSessionId as getSessionIdService } from './services/chatbotService';
import './styles.css';

let rootInstance: ReturnType<typeof createRoot> | null = null;
let containerElement: HTMLDivElement | null = null;
let chatBotRef = createRef<ChatBotHandle>();

// Event Emitter for widget events
type EventCallback = (data?: ChatbotMessageEvent | ChatbotErrorEvent) => void;
const eventListeners = new Map<ChatbotEventName, Set<EventCallback>>();

function emitEvent(event: ChatbotEventName, data?: ChatbotMessageEvent | ChatbotErrorEvent): void {
  const listeners = eventListeners.get(event);
  if (listeners) {
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[Lifestream Chatbot] Error in ${event} event handler:`, error);
      }
    });
  }
}

function addEventListener(event: ChatbotEventName, callback: EventCallback): void {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, new Set());
  }
  eventListeners.get(event)!.add(callback);
}

function removeEventListener(event: ChatbotEventName, callback: EventCallback): void {
  const listeners = eventListeners.get(event);
  if (listeners) {
    listeners.delete(callback);
  }
}

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

  // Create a new ref for this instance
  chatBotRef = createRef<ChatBotHandle>();

  // Render the widget with ref and event handler
  rootInstance = createRoot(containerElement);
  rootInstance.render(
    <ChatbotWidget
      ref={chatBotRef}
      config={config}
      onEmit={emitEvent}
    />
  );

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
    // Clear event listeners on cleanup
    eventListeners.clear();
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

// Programmatic API - exposed functions
export function open(): void {
  chatBotRef.current?.open();
}

export function close(): void {
  chatBotRef.current?.close();
}

export function toggle(): void {
  chatBotRef.current?.toggle();
}

export function sendMessage(text: string): Promise<void> {
  return chatBotRef.current?.sendMessage(text) ?? Promise.resolve();
}

export function getSessionId(): string | null {
  return chatBotRef.current?.getSessionId() ?? getSessionIdService();
}

export function isOpen(): boolean {
  return chatBotRef.current?.isOpen() ?? false;
}

// Event System - exposed functions
export function on(event: ChatbotEventName, callback: EventCallback): void {
  addEventListener(event, callback);
}

export function off(event: ChatbotEventName, callback: EventCallback): void {
  removeEventListener(event, callback);
}

// UMD/IIFE global export
if (typeof window !== 'undefined') {
  (window as any).initLifestreamChatbot = initLifestreamChatbot;
  (window as any).LifestreamChatbot = {
    // Initialization
    init: initLifestreamChatbot,
    // Privacy & Consent
    grantConsent,
    revokeConsent,
    clearHistory,
    // Programmatic Control
    open,
    close,
    toggle,
    sendMessage,
    getSessionId,
    isOpen,
    // Event System
    on,
    off,
  };
}

export type { ChatbotConfig, ChatBotHandle, ChatbotEventName, ChatbotMessageEvent, ChatbotErrorEvent } from './types';
export default initLifestreamChatbot;
