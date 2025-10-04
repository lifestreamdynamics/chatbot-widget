# Lifestream Chatbot Widget

A framework-agnostic, embeddable AI chatbot widget powered by Google Gemini. Integrate an intelligent chatbot into any website with just a few lines of code.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@lifestream/chatbot-widget.svg)](https://www.npmjs.com/package/@lifestream/chatbot-widget)

## ✨ Features

- **🚀 Framework Agnostic** - Works with vanilla JavaScript, React, Vue, Angular, Svelte, or any framework
- **🎨 Fully Customizable** - Control colors, positioning, messages, dimensions, and behavior
- **📱 Responsive Design** - Beautiful on desktop, tablet, and mobile devices
- **💬 Markdown Support** - Rich text formatting with code blocks, lists, links, and tables
- **⚡ Streaming Responses** - Real-time SSE streaming for instant AI responses (optional)
- **💾 Session Management** - Maintains conversation context with localStorage or sessionStorage
- **🎯 Quick Actions** - Customizable quick reply buttons for common questions
- **📊 Metadata Tracking** - Optional metadata for analytics and monitoring
- **📦 TypeScript Support** - Full type definitions included
- **⚙️ Small Bundle** - Optimized for fast loading (~205KB gzipped)

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

  // Dimensions
  maxWidth: '500px',
  maxHeight: '700px',

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

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "We offer AI development, web development, and technical consulting services.",
    "session_id": "sess_1234567890_abc123",
    "tokens_used": 45
  }
}
```

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

Retrieve conversation history for a session.

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
    ]
  }
}
```

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
| `lifestream-chatbot.css` | 8 KB | 2 KB |
| `lifestream-chatbot.iife.js` | 666 KB | 203 KB |
| `lifestream-chatbot.es.js` | 1.9 MB | 357 KB |
| **Total (IIFE + CSS)** | **674 KB** | **~205 KB** |

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

## 🔒 Security

- XSS protection via React's built-in escaping
- Safe markdown rendering with react-markdown
- No inline scripts in generated HTML
- HTTPS recommended for production
- Use public API keys only (implement rate limiting on backend)

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

See [CHANGELOG.md](./CHANGELOG.md) for version history and updates.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ by [Lifestream Dynamics](https://lifestreamdynamics.com)**
