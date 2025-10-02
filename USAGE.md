# Chatbot Widget Usage Guide

## Quick Start

The simplest way to add the chatbot to your website:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="lifestream-chatbot.css">
</head>
<body>
  <h1>My Website</h1>

  <script src="lifestream-chatbot.iife.js"></script>
  <script>
    initLifestreamChatbot({
      apiUrl: 'https://your-api.com/api/v1',
      apiKey: 'your-api-key'
    });
  </script>
</body>
</html>
```

## Installation Methods

### 1. Direct Download

1. Download the latest release
2. Extract files to your project
3. Include in your HTML:

```html
<link rel="stylesheet" href="path/to/lifestream-chatbot.css">
<script src="path/to/lifestream-chatbot.iife.js"></script>
```

### 2. CDN (Coming Soon)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@lifestream/chatbot-widget/dist/lifestream-chatbot.css">
<script src="https://cdn.jsdelivr.net/npm/@lifestream/chatbot-widget/dist/lifestream-chatbot.iife.js"></script>
```

### 3. NPM Package

```bash
npm install @lifestream/chatbot-widget
```

Then import in your project:

```javascript
import initLifestreamChatbot from '@lifestream/chatbot-widget';
import '@lifestream/chatbot-widget/style.css';

initLifestreamChatbot({
  apiUrl: 'https://your-api.com/api/v1',
  apiKey: 'your-api-key'
});
```

## Configuration Examples

### Minimal Configuration

```javascript
initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'sk_live_abc123'
});
```

### Custom Theme

```javascript
initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'sk_live_abc123',
  theme: {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    position: 'bottom-right'
  }
});
```

### Full Configuration

```javascript
const cleanup = initLifestreamChatbot({
  // Required
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'sk_live_abc123',

  // Behavior
  autoOpen: false,
  sessionStorage: false,

  // Dimensions
  maxWidth: '500px',
  maxHeight: '700px',

  // Theme
  theme: {
    primaryColor: '#00d9ff',
    secondaryColor: '#00ff88',
    backgroundColor: '#000000',
    surfaceColor: '#151515',
    textColor: '#ffffff',
    borderColor: '#2a2a2a',
    position: 'bottom-left',
    positionOffset: {
      x: '2rem',
      y: '2rem'
    }
  },

  // Messaging
  title: 'AI Assistant',
  subtitle: 'How can we help?',
  welcomeMessage: 'Welcome! How can I assist you today?',

  // Quick Actions
  quickActions: [
    { label: 'Services', message: 'What services do you offer?' },
    { label: 'Pricing', message: 'How much does it cost?' },
    { label: 'Contact', message: 'How can I contact you?' }
  ]
});

// Call cleanup() when you want to remove the widget
// cleanup();
```

## Framework Integration

### React

```jsx
import { useEffect } from 'react';
import initLifestreamChatbot from '@lifestream/chatbot-widget';
import '@lifestream/chatbot-widget/style.css';

function App() {
  useEffect(() => {
    const cleanup = initLifestreamChatbot({
      apiUrl: 'https://api.example.com/api/v1',
      apiKey: 'your-api-key'
    });

    return cleanup;
  }, []);

  return <div>My App</div>;
}
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
    apiUrl: 'https://api.example.com/api/v1',
    apiKey: 'your-api-key'
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
      apiUrl: 'https://api.example.com/api/v1',
      apiKey: 'your-api-key'
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
      apiUrl: 'https://api.example.com/api/v1',
      apiKey: 'your-api-key'
    });
  });

  onDestroy(() => {
    if (cleanup) cleanup();
  });
</script>

<div>My App</div>
```

## Theming

### Position Options

- `bottom-left` (default)
- `bottom-right`
- `top-left`
- `top-right`

### Custom Positioning

```javascript
theme: {
  position: 'bottom-right',
  positionOffset: {
    x: '3rem',  // Distance from horizontal edge
    y: '3rem'   // Distance from vertical edge
  }
}
```

### Color Customization

```javascript
theme: {
  primaryColor: '#667eea',      // Accent color
  secondaryColor: '#764ba2',    // Secondary accent
  backgroundColor: '#1a1a2e',   // Main background
  surfaceColor: '#16213e',      // Message bubbles
  textColor: '#eaeaea',         // Text color
  borderColor: '#0f3460'        // Border color
}
```

## Quick Actions

Customize the quick action buttons:

```javascript
quickActions: [
  { label: '🛍️ Products', message: 'Show me your products' },
  { label: '💰 Pricing', message: 'What are your prices?' },
  { label: '📞 Contact', message: 'How do I contact support?' },
  { label: '📚 Docs', message: 'Where is the documentation?' }
]
```

## API Requirements

Your backend API must implement these endpoints:

### POST /api/v1/chat

Send a message and receive a response.

**Request:**
```json
{
  "message": "Hello!",
  "session_id": "sess_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Hi! How can I help you?",
    "session_id": "sess_1234567890",
    "tokens_used": 15
  }
}
```

### GET /api/v1/chat/history/:sessionId

Get conversation history.

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "sess_1234567890",
    "messages": [
      {
        "role": "user",
        "content": "Hello",
        "created_at": "2025-01-15T10:30:00Z"
      }
    ]
  }
}
```

## Troubleshooting

### Widget Not Appearing

1. Check browser console for errors
2. Verify CSS file is loaded
3. Confirm JavaScript file loaded successfully
4. Check `apiUrl` and `apiKey` are correct

### CORS Errors

Your API must allow requests from your website domain:

```
Access-Control-Allow-Origin: https://your-website.com
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Styling Conflicts

The widget uses scoped CSS classes (`.chatbot-*`). If you have conflicts:

1. Check for global styles overriding widget styles
2. Verify z-index isn't being overridden (widget uses 9999)
3. Ensure CSS file is loaded after other stylesheets

### Session Not Persisting

- Check if cookies/localStorage are enabled
- Verify browser privacy settings
- Try `sessionStorage: true` option

## Performance Tips

1. **Lazy Load**: Load the widget only when needed
2. **Preconnect**: Add DNS prefetch for your API
3. **Cache**: Set proper cache headers on CSS/JS files
4. **CDN**: Use a CDN for faster global delivery

```html
<!-- Preconnect to API -->
<link rel="preconnect" href="https://api.example.com">

<!-- Lazy load widget -->
<script defer src="lifestream-chatbot.iife.js"></script>
```

## Security

### API Key

- Use a public API key (don't expose private keys)
- Implement rate limiting on your backend
- Validate all requests server-side

### HTTPS

Always use HTTPS in production:
- `apiUrl: 'https://api.example.com/api/v1'`

### Content Security Policy

Add to your CSP:
```
script-src 'self' https://cdn.example.com;
connect-src 'self' https://api.example.com;
```

## Advanced Usage

### Multiple Widgets

You can have multiple widget instances on one page:

```javascript
// Widget 1 - Sales
initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'sales-key',
  theme: { position: 'bottom-left' },
  title: 'Sales Assistant'
});

// Widget 2 - Support
initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'support-key',
  theme: { position: 'bottom-right' },
  title: 'Support Assistant'
});
```

### Conditional Loading

Load widget based on conditions:

```javascript
// Only show on certain pages
if (window.location.pathname.includes('/products')) {
  initLifestreamChatbot({
    apiUrl: 'https://api.example.com/api/v1',
    apiKey: 'your-api-key'
  });
}

// Only show after user has been on page for 30 seconds
setTimeout(() => {
  initLifestreamChatbot({
    apiUrl: 'https://api.example.com/api/v1',
    apiKey: 'your-api-key',
    autoOpen: true
  });
}, 30000);
```

### A/B Testing

Test different configurations:

```javascript
const config = Math.random() > 0.5 ? {
  // Version A
  theme: { position: 'bottom-left' },
  welcomeMessage: 'Hi! Need help?'
} : {
  // Version B
  theme: { position: 'bottom-right' },
  welcomeMessage: 'Welcome! How can we assist you?'
};

initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'your-api-key',
  ...config
});
```

## Support

- Documentation: See README.md
- Examples: Check the `examples/` directory
- Issues: GitHub Issues
- Email: support@lifestreamdynamics.com
