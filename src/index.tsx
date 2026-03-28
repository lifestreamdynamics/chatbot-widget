import { createRoot } from 'react-dom/client';
import { createRef } from 'react';
import ChatbotWidget from './ChatbotWidget';
import {
  ChatbotConfig,
  ChatBotHandle,
  ChatbotEventName,
  ChatbotMessageEvent,
  ChatbotErrorEvent,
  ChatbotExportEvent,
  ChatbotThemeChangeEvent,
} from './types';
import {
  configure,
  grantConsent as grantConsentService,
  revokeConsent as revokeConsentService,
  clearSession as clearSessionService,
  getSessionId as getSessionIdService,
  checkHealth as checkHealthService,
} from './services/chatbotService';
import './styles.css';

let rootInstance: ReturnType<typeof createRoot> | null = null;
let containerElement: HTMLDivElement | null = null;
let chatBotRef = createRef<ChatBotHandle>();

// Theme state
let currentThemeMode: 'dark' | 'light' | 'auto' = 'dark';
let resolvedThemeMode: 'dark' | 'light' = 'dark';
let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;
let mediaQueryList: MediaQueryList | null = null;
let currentConfig: ChatbotConfig | null = null;

function resolveThemeMode(mode: 'dark' | 'light' | 'auto'): 'dark' | 'light' {
  if (mode === 'auto' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode === 'auto' ? 'dark' : mode;
}

function applyTheme(): void {
  if (!containerElement) return;
  resolvedThemeMode = resolveThemeMode(currentThemeMode);
  containerElement.setAttribute('data-chatbot-theme', resolvedThemeMode);

  // Re-apply user color overrides (inline styles always win over CSS)
  if (currentConfig?.theme) {
    const el = containerElement;
    if (currentConfig.theme.primaryColor)
      el.style.setProperty('--chatbot-primary', currentConfig.theme.primaryColor);
    if (currentConfig.theme.secondaryColor)
      el.style.setProperty('--chatbot-secondary', currentConfig.theme.secondaryColor);
    if (currentConfig.theme.backgroundColor)
      el.style.setProperty('--chatbot-bg', currentConfig.theme.backgroundColor);
    if (currentConfig.theme.surfaceColor)
      el.style.setProperty('--chatbot-surface', currentConfig.theme.surfaceColor);
    if (currentConfig.theme.textColor)
      el.style.setProperty('--chatbot-text', currentConfig.theme.textColor);
    if (currentConfig.theme.borderColor)
      el.style.setProperty('--chatbot-border', currentConfig.theme.borderColor);
  }
}

function setupAutoModeListener(): void {
  cleanupAutoModeListener();
  if (currentThemeMode !== 'auto' || typeof window === 'undefined') return;

  mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQueryListener = () => {
    applyTheme();
    renderWidget();
    emitEvent('themeChange', { mode: currentThemeMode, resolvedMode: resolvedThemeMode });
  };
  mediaQueryList.addEventListener('change', mediaQueryListener);
}

function cleanupAutoModeListener(): void {
  if (mediaQueryList && mediaQueryListener) {
    mediaQueryList.removeEventListener('change', mediaQueryListener);
  }
  mediaQueryList = null;
  mediaQueryListener = null;
}

function renderWidget(): void {
  if (!rootInstance || !currentConfig) return;
  rootInstance.render(
    <ChatbotWidget
      ref={chatBotRef}
      config={currentConfig}
      onEmit={emitEvent}
      themeMode={resolvedThemeMode}
      onThemeChange={handleThemeToggle}
      onSetThemeMode={setThemeMode}
    />
  );
}

function handleThemeToggle(): void {
  const newMode = resolvedThemeMode === 'dark' ? 'light' : 'dark';
  currentThemeMode = newMode;
  applyTheme();
  renderWidget();
  emitEvent('themeChange', { mode: currentThemeMode, resolvedMode: resolvedThemeMode });
}

// Runtime guard for JS consumers (TypeScript enforces this at compile time via ChatbotEventName)
const VALID_EVENTS: Set<string> = new Set(['open', 'close', 'message', 'error', 'export', 'themeChange']);

// Event Emitter for widget events
type EventCallback = (data?: ChatbotMessageEvent | ChatbotErrorEvent | ChatbotExportEvent | ChatbotThemeChangeEvent) => void;
const eventListeners = new Map<ChatbotEventName, Set<EventCallback>>();

function emitEvent(event: ChatbotEventName, data?: ChatbotMessageEvent | ChatbotErrorEvent | ChatbotExportEvent | ChatbotThemeChangeEvent): void {
  const listeners = eventListeners.get(event);
  if (listeners) {
    listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[LifestreamChatbot] Error in ${event} event handler:`, error);
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
    console.error(
      '[LifestreamChatbot] Missing required configuration: apiUrl and apiKey are required'
    );
    return () => {};
  }

  // Clean up previous instance if re-initializing (singleton guard)
  if (rootInstance) {
    rootInstance.unmount();
    rootInstance = null;
  }
  if (containerElement && containerElement.parentNode) {
    containerElement.parentNode.removeChild(containerElement);
    containerElement = null;
  }
  chatBotRef = createRef<ChatBotHandle>();
  eventListeners.clear();
  cleanupAutoModeListener();

  // Store config for theme re-renders
  currentConfig = config;

  // Configure the chatbot service with privacy settings
  configure(
    config.apiUrl,
    config.apiKey,
    config.sessionStorage,
    config.enableDevMode,
    config.privacy,
    config.persistMessages
  );

  // Create or get mount point
  containerElement = document.getElementById('lifestream-chatbot-root') as HTMLDivElement;

  if (!containerElement) {
    containerElement = document.createElement('div');
    containerElement.id = 'lifestream-chatbot-root';
    document.body.appendChild(containerElement);
  }

  // Apply position offset CSS custom properties on :root
  if (config.theme) {
    const root = document.documentElement;
    if (config.theme.positionOffset?.x)
      root.style.setProperty('--chatbot-position-x', config.theme.positionOffset.x);
    if (config.theme.positionOffset?.y)
      root.style.setProperty('--chatbot-position-y', config.theme.positionOffset.y);
  }

  // Initialize theme mode
  currentThemeMode = config.theme?.mode || 'dark';
  applyTheme();
  setupAutoModeListener();

  // Render the widget with ref, event handler, and theme
  rootInstance = createRoot(containerElement);
  renderWidget();

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
    // Clean up CSS custom properties
    const root = document.documentElement;
    ['--chatbot-position-x', '--chatbot-position-y'
    ].forEach(prop => root.style.removeProperty(prop));
    // Clean up theme
    cleanupAutoModeListener();
    currentThemeMode = 'dark';
    resolvedThemeMode = 'dark';
    currentConfig = null;
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

export function sendMessage(text: string): Promise<{ success: boolean; error?: string }> {
  if (typeof text !== 'string') {
    console.warn('[LifestreamChatbot] sendMessage: text must be a string');
    return Promise.resolve({ success: false, error: 'text must be a string' });
  }

  const trimmed = text.trim();
  if (!trimmed) {
    console.warn('[LifestreamChatbot] sendMessage: message text is empty');
    return Promise.resolve({ success: false, error: 'Message text is empty' });
  }

  if (trimmed.length > 10000) {
    console.warn('[LifestreamChatbot] sendMessage: message exceeds 10,000 character limit');
    return Promise.resolve({ success: false, error: 'Message exceeds 10,000 character limit' });
  }

  return chatBotRef.current?.sendMessage(trimmed)
    ?? Promise.resolve({ success: false, error: 'Widget not initialized' });
}

export function getSessionId(): string {
  return chatBotRef.current?.getSessionId() ?? getSessionIdService();
}

export function isOpen(): boolean {
  return chatBotRef.current?.isOpen() ?? false;
}

export function setThemeMode(mode: 'dark' | 'light' | 'auto'): void {
  if (mode !== 'dark' && mode !== 'light' && mode !== 'auto') {
    console.warn('[LifestreamChatbot] setThemeMode: mode must be "dark", "light", or "auto"');
    return;
  }
  currentThemeMode = mode;
  applyTheme();
  setupAutoModeListener();
  renderWidget();
  emitEvent('themeChange', { mode: currentThemeMode, resolvedMode: resolvedThemeMode });
}

export function getThemeMode(): 'dark' | 'light' | 'auto' {
  return currentThemeMode;
}

export function exportChat(format?: 'json' | 'text'): { success: boolean; error?: string } {
  const resolvedFormat = format ?? 'json';

  if (resolvedFormat !== 'json' && resolvedFormat !== 'text') {
    console.warn('[LifestreamChatbot] exportChat: format must be "json" or "text"');
    return { success: false, error: 'format must be "json" or "text"' };
  }

  return chatBotRef.current?.exportChat(resolvedFormat)
    ?? { success: false, error: 'Widget not initialized' };
}

// Health Check
export async function checkHealth(healthUrl?: string): Promise<boolean> {
  return checkHealthService(healthUrl);
}

// Event System - exposed functions
export function on(event: ChatbotEventName, callback: EventCallback): void {
  if (!VALID_EVENTS.has(event)) {
    console.warn(
      `[LifestreamChatbot] Invalid event name: '${event}'. Valid events are: ${[...VALID_EVENTS].join(', ')}`
    );
    return;
  }
  if (!rootInstance) {
    console.warn('[LifestreamChatbot] on() called before init(). Listeners will be cleared when init() is called.');
  }
  addEventListener(event, callback);
}

export function off(event: ChatbotEventName, callback: EventCallback): void {
  if (!VALID_EVENTS.has(event)) {
    console.warn(
      `[LifestreamChatbot] Invalid event name: '${event}'. Valid events are: ${[...VALID_EVENTS].join(', ')}`
    );
    return;
  }
  removeEventListener(event, callback);
}

declare global {
  interface Window {
    initLifestreamChatbot: typeof initLifestreamChatbot;
    LifestreamChatbot: {
      init: typeof initLifestreamChatbot;
      grantConsent: typeof grantConsent;
      revokeConsent: typeof revokeConsent;
      clearHistory: typeof clearHistory;
      open: typeof open;
      close: typeof close;
      toggle: typeof toggle;
      sendMessage: typeof sendMessage;
      exportChat: typeof exportChat;
      setThemeMode: typeof setThemeMode;
      getThemeMode: typeof getThemeMode;
      getSessionId: typeof getSessionId;
      checkHealth: typeof checkHealth;
      isOpen: typeof isOpen;
      on: typeof on;
      off: typeof off;
    };
  }
}

// UMD/IIFE global export
if (typeof window !== 'undefined') {
  window.initLifestreamChatbot = initLifestreamChatbot;
  window.LifestreamChatbot = {
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
    exportChat,
    setThemeMode,
    getThemeMode,
    checkHealth,
    getSessionId,
    isOpen,
    // Event System
    on,
    off,
  };
}

export type {
  ChatbotConfig,
  ChatBotHandle,
  ChatbotEventName,
  ChatbotMessageEvent,
  ChatbotErrorEvent,
  ChatbotExportEvent,
  ChatbotThemeChangeEvent,
} from './types';
