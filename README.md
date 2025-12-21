# Lifestream Chatbot Widget

A framework-agnostic, embeddable AI chatbot widget powered by Google Gemini. Integrate an intelligent chatbot into any website with just a few lines of code.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@lifestream/chatbot-widget.svg)](https://www.npmjs.com/package/@lifestream/chatbot-widget)

## 📖 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Migration Guide](#-migration-guide) ⚠️ **New in v2.0.0**
- [Configuration](#️-configuration)
- [API Requirements](#-api-requirements)
- [Content Safety & Warnings](#️-content-safety--warnings)
- [Privacy & Compliance](#-privacy--compliance)
- [Pagination](#-pagination)
- [Developer Mode](#-developer-mode)
- [Utility Functions](#-utility-functions)
- [Programmatic API](#-programmatic-api) 🆕 **New in v2.1.0**
- [Event System](#-event-system) 🆕 **New in v2.1.0**
- [Testing](#-testing) 🆕 **New in v2.1.0**
- [Development](#️-development)
- [Browser Support](#-browser-support)
- [Accessibility](#-accessibility)
- [Security & Privacy](#-security--privacy)
- [Troubleshooting](#-troubleshooting)
- [Examples](#-examples)
- [Changelog](#-changelog)

## ✨ Features

- **🚀 Framework Agnostic** - Works with vanilla JavaScript, React, Vue, Angular, Svelte, or any framework
- **🎨 Fully Customizable** - Control colors, positioning, messages, dimensions, and behavior
- **📱 Responsive Design** - Beautiful on desktop, tablet, and mobile devices
- **💬 Markdown Support** - Rich text formatting with code blocks, lists, links, and tables
- **⚡ Streaming Responses** - Real-time SSE streaming for instant AI responses (optional)
- **💾 Session Management** - Maintains conversation context with localStorage or sessionStorage
- **🎯 Quick Actions** - Customizable quick reply buttons for common questions
- **📊 Metadata Tracking** - Optional metadata for analytics and monitoring
- **🔒 Privacy Controls** - GDPR/PIPEDA compliant with consent management and privacy mode
- **🛡️ Content Safety** - Built-in PII detection warnings and content safety features
- **📄 Pagination** - Load historical messages with "Load More Messages" feature
- **🔍 Developer Mode** - Enhanced logging for debugging rate limits and token usage
- **🎮 Programmatic API** - Control widget state with open(), close(), sendMessage(), and more
- **📡 Event System** - Subscribe to widget events (open, close, message, error)
- **♿ Full Accessibility** - WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **🧪 E2E Testing Ready** - Stable data-testid attributes for reliable test automation
- **📦 TypeScript Support** - Full type definitions included
- **⚙️ Small Bundle** - Optimized for fast loading (~111KB gzipped)

## 📦 Installation

### Option 1: NPM (Recommended)

```bash
npm install @lifestream/chatbot-widget
```

### Option 2: CDN

```html
<!-- CSS -->
<link rel="stylesheet" href="https://unpkg.com/@lifestream/chatbot-widget/dist/lifestream-chatbot.css">

<!-- JavaScript -->
<script src="https://unpkg.com/@lifestream/chatbot-widget/dist/lifestream-chatbot.iife.js"></script>
```

### Option 3: Manual Download

1. Download the latest release from [GitHub Releases](https://github.com/lifestream-dynamics/chatbot-widget/releases)
2. Extract `lifestream-chatbot.css` and `lifestream-chatbot.iife.js`
3. Include them in your project

## 🚀 Quick Start

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Website</title>
  <link rel="stylesheet" href="https://unpkg.com/@lifestream/chatbot-widget/dist/lifestream-chatbot.css">
</head>
<body>
  <h1>Welcome to My Website</h1>

  <script src="https://unpkg.com/@lifestream/chatbot-widget/dist/lifestream-chatbot.iife.js"></script>
  <script>
    initLifestreamChatbot({
      apiUrl: 'https://your-api.com/api/v1',
      apiKey: 'pk_your_public_key_here'
    });
  </script>
</body>
</html>
```

### React

```jsx
import { useEffect } from 'react';
import initLifestreamChatbot from '@lifestream/chatbot-widget';
import '@lifestream/chatbot-widget/style.css';

function App() {
  useEffect(() => {
    const cleanup = initLifestreamChatbot({
      apiUrl: 'https://your-api.com/api/v1',
      apiKey: 'pk_your_public_key_here'
    });

    return cleanup; // Cleanup on component unmount
  }, []);

  return <div>My App</div>;
}

export default App;
```

### Vue 3

```vue
<template>
  <div>My App</div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import initLifestreamChatbot from '@lifestream/chatbot-widget';
import '@lifestream/chatbot-widget/style.css';

let cleanup;

onMounted(() => {
  cleanup = initLifestreamChatbot({
    apiUrl: 'https://your-api.com/api/v1',
    apiKey: 'pk_your_public_key_here'
  });
});

onUnmounted(() => {
  if (cleanup) cleanup();
});
</script>
```

### Angular

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import initLifestreamChatbot from '@lifestream/chatbot-widget';
import '@lifestream/chatbot-widget/style.css';

@Component({
  selector: 'app-root',
  template: '<div>My App</div>'
})
export class AppComponent implements OnInit, OnDestroy {
  private cleanup: () => void;

  ngOnInit() {
    this.cleanup = initLifestreamChatbot({
      apiUrl: 'https://your-api.com/api/v1',
      apiKey: 'pk_your_public_key_here'
    });
  }

  ngOnDestroy() {
    if (this.cleanup) {
      this.cleanup();
    }
  }
}
```

### Svelte

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import initLifestreamChatbot from '@lifestream/chatbot-widget';
  import '@lifestream/chatbot-widget/style.css';

  let cleanup;

  onMount(() => {
    cleanup = initLifestreamChatbot({
      apiUrl: 'https://your-api.com/api/v1',
      apiKey: 'pk_your_public_key_here'
    });
  });

  onDestroy(() => {
    if (cleanup) cleanup();
  });
</script>

<div>My App</div>
```

## 🔄 Migration Guide

### Upgrading to chatbot-api v1.0.0+

If you're upgrading from an older version of the chatbot API, please note the following changes:

#### Breaking Change: Response Field Name

The API response field has been changed from `response` to `message` for consistency:

**Before (chatbot-api < v1.0.0):**
```json
{
  "success": true,
  "data": {
    "response": "Here's my answer...",
    "session_id": "sess_123"
  }
}
```

**After (chatbot-api v1.0.0+):**
```json
{
  "success": true,
  "data": {
    "message": "Here's my answer...",
    "session_id": "sess_123",
    "model": "gemini-2.0-flash-exp",
    "finish_reason": "STOP",
    "tokens_used": 45
  }
}
```

**Backwards Compatibility:** The widget automatically handles both field names, so no changes are required in your widget configuration. However, we recommend updating your backend to chatbot-api v1.0.0+ to access new features.

#### New Features in v1.0.0+

- **Content Safety**: PII detection warnings and content safety metadata
- **Privacy Controls**: GDPR/PIPEDA compliance with consent management
- **Pagination**: Load historical messages with configurable page size
- **Enhanced Metadata**: `model`, `finish_reason`, and improved token tracking
- **Rate Limit Headers**: Detailed rate limit information in API responses
- **Developer Mode**: Enhanced console logging for debugging

#### Requirements

- **Minimum Backend Version**: chatbot-api v1.0.0 or higher
- **API Endpoint**: Ensure your backend supports the updated `/api/v1/chat` endpoint structure
- **Privacy Mode**: If using privacy features, ensure your backend supports the privacy headers

## ⚙️ Configuration

### Required Options

| Option | Type | Description |
|--------|------|-------------|
| `apiUrl` | `string` | Your chatbot API endpoint (e.g., `https://api.example.com/api/v1`) |
| `apiKey` | `string` | Public API key for authentication (format: `pk_...`) |

### Optional Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `theme` | `object` | `{}` | Theme customization options (see Theme Options below) |
| `welcomeMessage` | `string` | Default message | Initial greeting message shown to users |
| `title` | `string` | `"AI Assistant"` | Chat window header title |
| `subtitle` | `string` | `"Online"` | Chat window header subtitle |
| `quickActions` | `array` | Default actions | Quick reply button configurations |
| `autoOpen` | `boolean` | `false` | Automatically open chat on page load |
| `sessionStorage` | `boolean` | `false` | Use sessionStorage instead of localStorage |
| `maxWidth` | `string` | `"450px"` | Maximum chat window width |
| `maxHeight` | `string` | `"650px"` | Maximum chat window height |
| `enableStreaming` | `boolean` | `false` | Enable real-time SSE streaming responses |
| `metadata` | `object` | `undefined` | Optional metadata sent with each request |
| `privacy` | `object` | `{}` | Privacy and compliance configuration (see Privacy Options below) |
| `enableDevMode` | `boolean` | `false` | Enable developer mode with enhanced console logging |

### Theme Options

```typescript
theme: {
  primaryColor: '#00d9ff',       // Primary accent color
  secondaryColor: '#00ff88',     // Secondary accent color
  backgroundColor: '#000000',    // Chat background color
  surfaceColor: '#151515',       // Message bubble background
  textColor: '#ffffff',          // Text color
  borderColor: '#2a2a2a',        // Border color
  position: 'bottom-left',       // Widget position on screen
  positionOffset: {
    x: '1.5rem',                 // Horizontal offset from edge
    y: '1.5rem'                  // Vertical offset from edge
  }
}
```

**Position Options:**
- `bottom-left` (default)
- `bottom-right`
- `top-left`
- `top-right`

### Privacy Options

```typescript
privacy: {
  enablePrivacyMode: false,       // Use in-memory storage instead of localStorage
  requireConsent: false,           // Require explicit user consent before chatting
  consentMessage: 'Custom message', // Custom consent message (optional)
  showDataRetentionInfo: true,    // Show data retention information
  allowDataDeletion: true,         // Show "Clear History" option
  complianceMode: 'gdpr'           // 'gdpr', 'pipeda', or undefined
}
```

**Privacy Configuration Details:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enablePrivacyMode` | `boolean` | `false` | Use in-memory storage only (no localStorage/sessionStorage) |
| `requireConsent` | `boolean` | `false` | Require explicit user consent before enabling chat |
| `consentMessage` | `string` | Auto-generated | Custom consent message based on compliance mode |
| `showDataRetentionInfo` | `boolean` | `true` | Display data retention information in consent dialog |
| `allowDataDeletion` | `boolean` | `true` | Show "Clear History" option in chat menu |
| `complianceMode` | `string` | `undefined` | Compliance framework: `'gdpr'`, `'pipeda'`, or `undefined` |

**Compliance Modes:**
- **GDPR** (EU): Emphasizes data minimization and user rights
- **PIPEDA** (Canada): Focuses on consent and transparency
- **None**: Standard privacy controls without specific compliance language

### Quick Actions

```javascript
quickActions: [
  { label: '🛍️ Products', message: 'Show me your products' },
  { label: '💰 Pricing', message: 'What are your prices?' },
  { label: '📞 Contact', message: 'How do I contact support?' }
]
```

## 📝 Full Configuration Example

```javascript
initLifestreamChatbot({
  // Required
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'pk_your_public_key_here',

  // Behavior
  autoOpen: false,
  sessionStorage: false,
  enableStreaming: true,          // Enable real-time streaming
  enableDevMode: true,             // Enable developer logging

  // Dimensions
  maxWidth: '500px',
  maxHeight: '700px',

  // Privacy & Compliance
  privacy: {
    enablePrivacyMode: false,
    requireConsent: true,
    complianceMode: 'gdpr',
    showDataRetentionInfo: true,
    allowDataDeletion: true
  },

  // Metadata for analytics
  metadata: {
    source: 'website',
    page: 'home',
    version: '1.0.0'
  },

  // Theme
  theme: {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    backgroundColor: '#1a1a2e',
    surfaceColor: '#16213e',
    textColor: '#eaeaea',
    borderColor: '#0f3460',
    position: 'bottom-right',
    positionOffset: {
      x: '2rem',
      y: '2rem'
    }
  },

  // Content
  title: 'Support Assistant',
  subtitle: 'How can we help?',
  welcomeMessage: 'Welcome! Ask me anything about our products and services.',

  // Quick Actions
  quickActions: [
    { label: '🛍️ Products', message: 'Show me your products' },
    { label: '💰 Pricing', message: 'What are your prices?' },
    { label: '📞 Contact', message: 'How do I contact support?' }
  ]
});
```

## 🔌 API Requirements

The widget requires a compatible backend API with the following endpoints:

### POST `/api/v1/chat`

Send a message and receive a response.

**Request:**
```json
{
  "message": "Hello, what services do you offer?",
  "session_id": "sess_1234567890_abc123",
  "metadata": {
    "source": "website",
    "page": "home"
  }
}
```

**Headers:**
```
Authorization: Bearer pk_your_public_key_here
Content-Type: application/json
```

**Response (chatbot-api v1.0.0+):**
```json
{
  "success": true,
  "data": {
    "message": "We offer AI development, web development, and technical consulting services.",
    "session_id": "sess_1234567890_abc123",
    "model": "gemini-2.0-flash-exp",
    "finish_reason": "STOP",
    "tokens_used": 45,
    "content_safety": {
      "has_pii": false,
      "pii_types": []
    }
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `message` | `string` | The AI-generated response message |
| `session_id` | `string` | Unique session identifier for conversation context |
| `model` | `string` | AI model used for generation (e.g., `gemini-2.0-flash-exp`) |
| `finish_reason` | `string` | Completion reason: `STOP`, `MAX_TOKENS`, `SAFETY`, etc. |
| `tokens_used` | `number` | Total tokens consumed in this request |
| `content_safety` | `object` | Content safety metadata (optional) |

**Rate Limit Headers:**

The API may return rate limit information in response headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642345678
```

These headers are automatically logged when `enableDevMode: true` is set.

### POST `/api/v1/chat/stream` (Optional - for streaming)

Send a message and receive a streaming response via Server-Sent Events.

**Request:** Same as `/api/v1/chat`

**Response:** SSE stream
```
data: {"chunk":"Hello"}
data: {"chunk":" there"}
data: {"chunk":"!"}
data: {"done":true}
```

### GET `/api/v1/chat/history/:sessionId`

Retrieve conversation history for a session with pagination support.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `number` | `1` | Page number (1-indexed) |
| `limit` | `number` | `50` | Messages per page (max 100) |

**Example Request:**
```
GET /api/v1/chat/history/sess_1234567890_abc123?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "sess_1234567890_abc123",
    "messages": [
      {
        "role": "user",
        "content": "Hello",
        "created_at": "2025-01-15T10:30:00.000Z"
      },
      {
        "role": "assistant",
        "content": "Hi! How can I help you?",
        "created_at": "2025-01-15T10:30:02.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_messages": 45,
      "total_pages": 3,
      "has_more": true
    }
  }
}
```

**Pagination in Widget:**

The widget automatically displays a "Load More Messages" button when there are older messages available. Users can click to load previous messages in batches.

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

> **Note:** The widget is compatible with the [chatbot-api](https://github.com/lifestream-dynamics/chatbot-api) v1.0.0+ backend.

## 🛡️ Content Safety & Warnings

The widget includes built-in content safety features that work with chatbot-api v1.0.0+ to detect and warn users about potentially sensitive content.

### PII Detection

When the API detects Personally Identifiable Information (PII) in user messages, a warning banner is displayed:

**Detected PII Types:**
- Email addresses
- Phone numbers
- Credit card numbers
- Social Security Numbers (SSN)
- IP addresses
- Physical addresses
- And more...

**Warning Display:**

When PII is detected, users see a warning message:

```
⚠️ Privacy Notice: Your message may contain sensitive information
(Email Address, Phone Number). Avoid sharing personal data when possible.
```

**How It Works:**

1. User sends a message containing PII
2. API analyzes the message and returns `content_safety` metadata
3. Widget displays a warning banner with detected PII types
4. Message is still sent (user has full control)

**Configuration:**

Content safety is enabled by default and requires no configuration. It works automatically when using chatbot-api v1.0.0+.

## 🔒 Privacy & Compliance

The widget provides comprehensive privacy controls to help you comply with GDPR, PIPEDA, and other privacy regulations.

### Privacy Modes

#### Standard Mode (Default)
- Session data stored in localStorage
- Persistent across browser sessions
- User can clear history manually

#### Privacy Mode
```javascript
privacy: {
  enablePrivacyMode: true
}
```
- Session data stored in memory only
- Cleared when widget is closed or page refreshes
- No persistent storage used
- Ideal for sensitive environments

### Consent Management

Require explicit user consent before enabling the chatbot:

```javascript
privacy: {
  requireConsent: true,
  complianceMode: 'gdpr',  // or 'pipeda'
  consentMessage: 'We use this chatbot to assist you. Your conversation data will be processed according to our privacy policy.',
  showDataRetentionInfo: true
}
```

**Consent Dialog Features:**
- Custom consent message based on compliance mode
- Data retention information display
- Accept/Decline buttons
- Persistent consent state (stored separately from chat data)

**GDPR Compliance (EU):**
```javascript
privacy: {
  requireConsent: true,
  complianceMode: 'gdpr',
  allowDataDeletion: true
}
```

Default consent message emphasizes:
- Right to access data
- Right to deletion
- Data minimization
- Lawful processing basis

**PIPEDA Compliance (Canada):**
```javascript
privacy: {
  requireConsent: true,
  complianceMode: 'pipeda',
  allowDataDeletion: true
}
```

Default consent message emphasizes:
- Meaningful consent
- Transparency in data use
- Accountability
- Right to withdraw consent

### Data Deletion

Users can delete their conversation history at any time:

**Via Chat Menu:**
1. Click the menu icon (⋮) in the chat header
2. Select "Clear History"
3. Confirm deletion
4. All messages and session data are removed

**Programmatically:**
```javascript
import { clearHistory } from '@lifestream/chatbot-widget';

// Clear history for current session
clearHistory();
```

### Privacy Best Practices

1. **Enable Privacy Mode for Sensitive Data:**
   ```javascript
   privacy: { enablePrivacyMode: true }
   ```

2. **Require Consent in Regulated Industries:**
   ```javascript
   privacy: { requireConsent: true, complianceMode: 'gdpr' }
   ```

3. **Allow Data Deletion:**
   ```javascript
   privacy: { allowDataDeletion: true }
   ```

4. **Combine with Backend Privacy Controls:**
   - Implement data retention policies on the API
   - Use privacy headers to signal privacy mode
   - Respect user deletion requests

## 📄 Pagination

The widget supports paginated message loading for conversations with extensive history.

### How It Works

1. **Initial Load:** Widget loads the most recent messages (default: 50)
2. **Load More:** Users click "Load More Messages" to fetch older messages
3. **Batch Loading:** Messages are loaded in configurable batches (default: 20)
4. **Seamless UX:** New messages appear smoothly at the top of the conversation

### Configuration

Pagination is automatic and requires no configuration. The widget uses these defaults:

- **Initial page size:** 50 messages
- **Load more batch size:** 20 messages
- **Maximum per page:** 100 messages (API limit)

### User Experience

**When there are more messages:**
```
[Load More Messages ↑]
─────────────────────
User: Hello
Bot: Hi there!
...
```

**When all messages are loaded:**
```
─────────────────────
User: Hello
Bot: Hi there!
...
```

### Backend Requirements

Your API must support pagination parameters on the history endpoint:

```
GET /api/v1/chat/history/:sessionId?page=1&limit=20
```

Response must include `pagination` metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_messages": 45,
    "total_pages": 3,
    "has_more": true
  }
}
```

## 🔍 Developer Mode

Enable enhanced console logging for debugging and monitoring.

### Enabling Developer Mode

```javascript
initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'pk_your_key',
  enableDevMode: true  // Enable developer logging
});
```

### What Gets Logged

**Rate Limit Information:**
```
[Chatbot Widget] Rate Limit Status:
  • Limit: 100 requests
  • Remaining: 95 requests
  • Reset: 2025-01-15T11:00:00.000Z
```

**Token Usage:**
```
[Chatbot Widget] Tokens used: 45
```

**API Requests:**
```
[Chatbot Widget] Sending message to API...
[Chatbot Widget] API Response received
```

**Content Safety Warnings:**
```
[Chatbot Widget] PII detected: Email Address, Phone Number
```

**Session Information:**
```
[Chatbot Widget] Session ID: sess_1234567890_abc123
[Chatbot Widget] Privacy mode: enabled
```

**Errors and Debugging:**
```
[Chatbot Widget] Error: Network timeout after 30s
```

### Use Cases

- **Development:** Debug API integration issues
- **Monitoring:** Track rate limit usage and token consumption
- **Troubleshooting:** Identify content safety triggers
- **Performance:** Monitor API response times

**Important:** Disable developer mode in production to avoid console clutter and potential information disclosure.

## 🔧 Utility Functions

The widget exports utility functions for programmatic control over privacy and consent.

### Consent Management

#### grantConsent()

Grant user consent programmatically:

```javascript
import { grantConsent } from '@lifestream/chatbot-widget';

// Grant consent (e.g., after user accepts in a custom dialog)
grantConsent();
```

**When to use:**
- Custom consent dialogs outside the widget
- Pre-authorized users (e.g., authenticated sessions)
- Consent granted through other mechanisms

#### revokeConsent()

Revoke user consent and disable the chatbot:

```javascript
import { revokeConsent } from '@lifestream/chatbot-widget';

// Revoke consent (e.g., user opts out)
revokeConsent();
```

**Effects:**
- Chat becomes disabled
- Consent dialog reappears if user tries to chat
- Existing messages remain unless cleared separately

### Data Management

#### clearHistory()

Clear all conversation history and session data:

```javascript
import { clearHistory } from '@lifestream/chatbot-widget';

// Clear all messages and session data
clearHistory();

// Example: Clear history on user logout
function handleLogout() {
  clearHistory();
  // ... other logout logic
}
```

**Effects:**
- Removes all messages from UI
- Clears session ID from storage
- Resets conversation state
- Does not revoke consent

### Complete Example

```javascript
import initLifestreamChatbot, {
  grantConsent,
  revokeConsent,
  clearHistory
} from '@lifestream/chatbot-widget';
import '@lifestream/chatbot-widget/style.css';

// Initialize widget
const cleanup = initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'pk_your_key',
  privacy: {
    requireConsent: true,
    complianceMode: 'gdpr'
  }
});

// Custom consent handling
function handleUserAcceptsTerms() {
  grantConsent();
  console.log('User accepted chatbot terms');
}

function handleUserDeclinesTerms() {
  revokeConsent();
  console.log('User declined chatbot terms');
}

// Custom data deletion
function handleClearUserData() {
  clearHistory();
  console.log('User data cleared');
}

// Cleanup on app unmount
function handleAppUnmount() {
  clearHistory();
  cleanup();
}
```

### TypeScript Support

All utility functions are fully typed:

```typescript
export function grantConsent(): void;
export function revokeConsent(): void;
export function clearHistory(): void;
```

## 🎮 Programmatic API

The widget exposes a programmatic API for controlling the chatbot from your application code.

### Widget Control

```javascript
import { open, close, toggle, sendMessage, getSessionId, isOpen } from '@lifestream/chatbot-widget';

// Open the chat window
open();

// Close the chat window
close();

// Toggle open/closed state
toggle();

// Send a message programmatically
await sendMessage('Hello from my app!');

// Get the current session ID
const sessionId = getSessionId(); // 'sess_abc123' or null

// Check if widget is open
if (isOpen()) {
  console.log('Chat is open');
}
```

### Global Access (IIFE/UMD)

When using the script tag version, methods are available on `window.LifestreamChatbot`:

```html
<script src="https://unpkg.com/@lifestream/chatbot-widget/dist/lifestream-chatbot.iife.js"></script>
<script>
  // Initialize
  LifestreamChatbot.init({
    apiUrl: 'https://api.example.com/api/v1',
    apiKey: 'pk_your_key'
  });

  // Control the widget
  document.getElementById('open-chat').addEventListener('click', () => {
    LifestreamChatbot.open();
  });

  document.getElementById('send-greeting').addEventListener('click', () => {
    LifestreamChatbot.sendMessage('Hi, I need help!');
  });
</script>
```

## 📡 Event System

Subscribe to widget events for deeper integration with your application.

### Available Events

| Event | Data | Description |
|-------|------|-------------|
| `open` | - | Widget opened |
| `close` | - | Widget closed/minimized |
| `message` | `{ role, content, timestamp }` | Message sent or received |
| `error` | `{ type, message, details }` | Error occurred |

### Usage

```javascript
import { on, off } from '@lifestream/chatbot-widget';

// Subscribe to events
on('open', () => {
  console.log('Chat opened');
});

on('close', () => {
  console.log('Chat closed');
});

on('message', (event) => {
  console.log(`${event.role}: ${event.content}`);
  // event.role: 'user' | 'assistant'
  // event.content: string
  // event.timestamp: Date
});

on('error', (event) => {
  console.error(`Error (${event.type}): ${event.message}`);
  // event.type: 'api' | 'network' | 'validation'
  // event.message: string
  // event.details: unknown
});

// Unsubscribe
const handler = (event) => console.log(event);
on('message', handler);
off('message', handler);
```

### Global Access (IIFE/UMD)

```html
<script>
  LifestreamChatbot.on('message', (event) => {
    if (event.role === 'user') {
      analytics.track('chat_message_sent', { content: event.content });
    }
  });

  LifestreamChatbot.on('error', (event) => {
    errorTracker.capture(event);
  });
</script>
```

## 🧪 Testing

The widget includes `data-testid` attributes for reliable E2E testing:

| Selector | Element |
|----------|---------|
| `data-testid="chatbot-button"` | Floating trigger button |
| `data-testid="chatbot-container"` | Chat window container |
| `data-testid="chatbot-minimize"` | Minimize/close button |
| `data-testid="chatbot-messages"` | Messages container |
| `data-testid="chatbot-input"` | Message input field |
| `data-testid="chatbot-send"` | Send button |
| `data-testid="chatbot-quick-action-0"` | First quick action (0-indexed) |

### Playwright Example

```javascript
await page.getByTestId('chatbot-button').click();
await page.getByTestId('chatbot-input').fill('Hello');
await page.getByTestId('chatbot-send').click();
await expect(page.getByTestId('chatbot-messages')).toContainText('Hello');
```

## 🛠️ Development

### Prerequisites

- Node.js 18+ or 20+
- npm, pnpm, or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Type checking
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
chatbot-widget/
├── src/
│   ├── components/
│   │   └── ChatBot.tsx          # Main chatbot UI component
│   ├── services/
│   │   └── chatbotService.ts    # API service layer
│   ├── utils/
│   │   ├── cn.ts                # Class name utility
│   │   └── icons.tsx            # Inline SVG icons
│   ├── ChatbotWidget.tsx        # Widget wrapper
│   ├── index.tsx                # Entry point & initialization
│   ├── styles.css               # Widget styles
│   └── types.ts                 # TypeScript type definitions
├── examples/
│   ├── basic.html               # Basic integration example
│   ├── themed.html              # Custom theme example
│   └── advanced.html            # Full configuration example
├── dist/                        # Build output (generated)
├── index.html                   # Development preview page
├── vite.config.ts               # Vite build configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Package metadata
```

## 📊 Bundle Size

| File | Uncompressed | Gzipped |
|------|-------------|---------|
| `lifestream-chatbot.css` | 9 KB | 2 KB |
| `lifestream-chatbot.iife.js` | 361 KB | 109 KB |
| `lifestream-chatbot.es.js` | 961 KB | 179 KB |
| **Total (IIFE + CSS)** | **370 KB** | **~111 KB** |

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 6+)

## ♿ Accessibility

- Keyboard navigation support
- ARIA labels and roles
- Screen reader friendly
- Focus management
- High contrast mode support

## 🔒 Security & Privacy

### Security Features

- XSS protection via React's built-in escaping
- Safe markdown rendering with react-markdown
- No inline scripts in generated HTML
- HTTPS recommended for production
- Use public API keys only (implement rate limiting on backend)

### Privacy Features

- **PII Detection:** Automatic warnings for sensitive information
- **Privacy Mode:** In-memory storage option (no localStorage)
- **Consent Management:** GDPR/PIPEDA compliant consent dialogs
- **Data Deletion:** User-initiated history clearing
- **Compliance Modes:** Built-in support for GDPR and PIPEDA regulations
- **Secure Storage:** Session data encrypted in transit (HTTPS required)

### Best Practices

1. **Always use HTTPS in production** to protect data in transit
2. **Enable privacy mode** for sensitive environments (healthcare, finance)
3. **Require consent** in regulated jurisdictions (EU, Canada)
4. **Implement rate limiting** on your backend API
5. **Monitor PII detection** using developer mode during testing
6. **Regular security audits** of your backend API
7. **Data retention policies** aligned with your compliance requirements

## 🐛 Troubleshooting

### Widget Doesn't Appear

1. ✅ Check browser console for errors
2. ✅ Verify CSS file is loaded (check Network tab)
3. ✅ Confirm JavaScript file loaded without errors
4. ✅ Ensure `apiUrl` and `apiKey` are correct
5. ✅ Check if widget container exists in DOM

### Messages Not Sending

1. ✅ Verify API endpoint is accessible (test with curl/Postman)
2. ✅ Check Network tab for failed requests
3. ✅ Verify API key is valid and has correct format (`pk_...`)
4. ✅ Check CORS settings on your API server
5. ✅ Ensure backend is running and healthy

### CORS Errors

Your API must allow requests from your website domain:

```http
Access-Control-Allow-Origin: https://your-website.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Styling Conflicts

1. Widget uses scoped CSS classes (`.chatbot-*`)
2. Check for global styles overriding widget styles
3. Verify z-index isn't being overridden (widget uses 9999)
4. Ensure CSS file is loaded after other stylesheets

### Session Not Persisting

- Check if localStorage/sessionStorage is enabled in browser
- Verify browser privacy settings allow storage
- Try using `sessionStorage: true` option if localStorage is blocked
- Check for browser extensions blocking storage
- If using `privacy.enablePrivacyMode: true`, sessions are intentionally in-memory only

### PII Warnings Not Showing

- Verify backend is running chatbot-api v1.0.0+
- Check API response includes `content_safety` metadata
- Enable developer mode to see PII detection logs
- Ensure backend has PII detection enabled

### Consent Dialog Not Appearing

- Verify `privacy.requireConsent: true` is set
- Check browser console for errors
- Clear browser storage and reload page
- Ensure previous consent state isn't cached

### Pagination Not Working

- Verify backend supports pagination parameters (`page`, `limit`)
- Check API response includes `pagination` metadata
- Enable developer mode to see pagination logs
- Ensure backend returns `has_more` flag correctly

### Developer Mode Not Logging

- Verify `enableDevMode: true` is set in configuration
- Check browser console is open
- Ensure console logging isn't filtered or disabled
- Look for `[Chatbot Widget]` prefix in logs

## 📚 Examples

See the [`examples/`](./examples) directory for complete working examples:

- **[basic.html](./examples/basic.html)** - Minimal integration with required config only
- **[themed.html](./examples/themed.html)** - Custom dark theme example
- **[advanced.html](./examples/advanced.html)** - All configuration options with streaming

## 🚀 Publishing & Distribution

### NPM Publishing

```bash
# Build the package
npm run build

# Login to npm (first time only)
npm login

# Publish to npm registry
npm publish --access public

# Publish updates
npm version patch  # or minor, or major
npm publish
```

### CDN Distribution

After publishing to npm, the package is automatically available on:

- **unpkg**: `https://unpkg.com/@lifestream/chatbot-widget/dist/`
- **jsDelivr**: `https://cdn.jsdelivr.net/npm/@lifestream/chatbot-widget/`

### Manual Distribution

```bash
# Create a distributable zip file
npm run build
cd dist
zip -r ../chatbot-widget-v1.0.0.zip .
```

Share the zip file with users along with integration instructions.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 💬 Support

- **Documentation**: This README and [`examples/`](./examples) directory
- **GitHub Issues**: [Report bugs or request features](https://github.com/lifestream-dynamics/chatbot-widget/issues)
- **Email**: eric@mittonvillage.com

## 🔄 Changelog

### Version 2.0.0 (Latest)

**Breaking Changes:**
- API response field changed from `response` to `message` (backwards compatible in widget)
- Requires chatbot-api v1.0.0 or higher

**New Features:**
- Content safety with PII detection warnings
- Privacy controls for GDPR/PIPEDA compliance
- Consent management with customizable dialogs
- Privacy mode (in-memory storage only)
- Pagination for message history with "Load More" feature
- Developer mode with enhanced logging
- Utility functions: `grantConsent()`, `revokeConsent()`, `clearHistory()`
- Rate limit information logging
- Enhanced token usage tracking
- Data deletion support

**Improvements:**
- Better error handling and user feedback
- Improved accessibility for consent dialogs
- Enhanced TypeScript types for new features
- Updated API response handling

See [CHANGELOG.md](./CHANGELOG.md) for complete version history and updates.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ by [Lifestream Dynamics](https://lifestreamdynamics.com)**
