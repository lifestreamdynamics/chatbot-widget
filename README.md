# Lifestream Chatbot Widget

A standalone, embeddable AI-powered chatbot widget built with React and powered by Google Gemini. This widget can be integrated into any website with just a few lines of code.

## Features

- **Framework Agnostic** - Works with vanilla JavaScript, React, Vue, Angular, or any web framework
- **Fully Customizable** - Control colors, positioning, messages, and behavior
- **Responsive Design** - Beautiful on desktop, tablet, and mobile devices
- **Markdown Support** - Rich text formatting with code blocks, lists, and links
- **Session Management** - Maintains conversation context across page reloads
- **Quick Actions** - Customizable quick reply buttons for common questions
- **TypeScript Support** - Full type definitions included
- **Small Bundle Size** - Optimized for fast loading (~150KB gzipped with dependencies)

## Installation

### Using NPM/PNPM/Yarn

```bash
npm install @lifestream/chatbot-widget
# or
pnpm add @lifestream/chatbot-widget
# or
yarn add @lifestream/chatbot-widget
```

### Using CDN

```html
<!-- Include CSS -->
<link rel="stylesheet" href="https://unpkg.com/@lifestream/chatbot-widget/dist/lifestream-chatbot.css">

<!-- Include Script -->
<script src="https://unpkg.com/@lifestream/chatbot-widget/dist/lifestream-chatbot.iife.js"></script>
```

### Manual Installation

1. Download the latest release from the releases page
2. Extract the files to your project
3. Include the CSS and JS files in your HTML

## Quick Start

### Basic Usage (Vanilla JavaScript)

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
      apiUrl: 'https://your-chatbot-api.com/api/v1',
      apiKey: 'your-api-key-here'
    });
  </script>
</body>
</html>
```

### React Integration

```jsx
import { useEffect } from 'react';
import initLifestreamChatbot from '@lifestream/chatbot-widget';
import '@lifestream/chatbot-widget/style.css';

function App() {
  useEffect(() => {
    const cleanup = initLifestreamChatbot({
      apiUrl: 'https://your-chatbot-api.com/api/v1',
      apiKey: 'your-api-key-here'
    });

    return cleanup; // Cleanup on unmount
  }, []);

  return <div>My App</div>;
}
```

### Vue Integration

```vue
<template>
  <div>My App</div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue';
import initLifestreamChatbot from '@lifestream/chatbot-widget';
import '@lifestream/chatbot-widget/style.css';

export default {
  setup() {
    let cleanup;

    onMounted(() => {
      cleanup = initLifestreamChatbot({
        apiUrl: 'https://your-chatbot-api.com/api/v1',
        apiKey: 'your-api-key-here'
      });
    });

    onUnmounted(() => {
      if (cleanup) cleanup();
    });
  }
};
</script>
```

## Configuration

### Required Options

| Option | Type | Description |
|--------|------|-------------|
| `apiUrl` | string | The URL of your chatbot API endpoint |
| `apiKey` | string | Your API authentication key |

### Optional Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `theme` | object | - | Theme customization options (see below) |
| `welcomeMessage` | string | Default welcome text | Initial message shown to users |
| `title` | string | "AI Assistant" | Chat header title |
| `subtitle` | string | "Online" | Chat header subtitle |
| `quickActions` | array | Default actions | Quick reply buttons |
| `autoOpen` | boolean | false | Open chat automatically on load |
| `sessionStorage` | boolean | false | Use sessionStorage instead of localStorage |
| `maxWidth` | string | "450px" | Maximum chat window width |
| `maxHeight` | string | "650px" | Maximum chat window height |

### Theme Options

```typescript
theme: {
  primaryColor: '#00d9ff',      // Primary brand color
  secondaryColor: '#00ff88',    // Secondary brand color
  backgroundColor: '#000000',   // Chat background
  surfaceColor: '#151515',      // Message bubble background
  textColor: '#ffffff',         // Text color
  borderColor: '#2a2a2a',       // Border color
  position: 'bottom-left',      // Position on screen
  positionOffset: {
    x: '1.5rem',                // Horizontal offset
    y: '1.5rem'                 // Vertical offset
  }
}
```

#### Position Options

- `bottom-left` (default)
- `bottom-right`
- `top-left`
- `top-right`

### Quick Actions

```javascript
quickActions: [
  { label: 'Our Services', message: 'What services do you offer?' },
  { label: 'Pricing', message: 'How much does it cost?' },
  { label: 'Contact', message: 'How can I contact you?' }
]
```

## Full Configuration Example

```javascript
initLifestreamChatbot({
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

  // Messaging
  title: 'Support Bot',
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

## API Backend Requirements

The widget expects a REST API with the following endpoints:

### POST `/api/v1/chat`

Send a chat message and receive a response.

**Request:**
```json
{
  "message": "Hello, what services do you offer?",
  "session_id": "sess_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "We offer AI development, web development, and technical consulting services.",
    "session_id": "sess_1234567890",
    "tokens_used": 45
  }
}
```

### GET `/api/v1/chat/history/:sessionId`

Retrieve chat history for a session.

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
      },
      {
        "role": "assistant",
        "content": "Hi! How can I help you?",
        "created_at": "2025-01-15T10:30:02Z"
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
  "status": "healthy"
}
```

## Development

### Prerequisites

- Node.js 18+
- pnpm 10+ (or npm/yarn)

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Project Structure

```
chatbot-widget/
├── src/
│   ├── components/
│   │   └── ChatBot.tsx          # Main chatbot component
│   ├── services/
│   │   └── chatbotService.ts    # API service layer
│   ├── utils/
│   │   ├── cn.ts                # Class name utility
│   │   └── icons.tsx            # Inline SVG icons
│   ├── ChatbotWidget.tsx        # Widget wrapper
│   ├── index.tsx                # Entry point
│   ├── styles.css               # Widget styles
│   └── types.ts                 # TypeScript definitions
├── examples/
│   ├── basic.html               # Basic integration example
│   ├── themed.html              # Custom theme example
│   └── advanced.html            # Advanced configuration example
├── index.html                   # Development preview
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Bundle Size

- **IIFE Build**: ~180KB (uncompressed), ~55KB (gzipped)
- **ES Module**: ~175KB (uncompressed), ~53KB (gzipped)
- **CSS**: ~15KB (uncompressed), ~4KB (gzipped)

Total: ~195KB uncompressed, ~59KB gzipped

## Performance

- First Paint: <100ms
- Interactive: <200ms
- Lazy loading of markdown renderer
- Optimized re-renders with React memoization
- Efficient DOM updates

## Accessibility

- Keyboard navigation support
- ARIA labels and roles
- Screen reader friendly
- Focus management
- High contrast mode support

## Security

- XSS protection via React's built-in escaping
- No inline scripts in generated HTML
- HTTPS recommended for production
- API key should be public-facing (use rate limiting on backend)

## Troubleshooting

### Widget doesn't appear

1. Check that CSS file is loaded
2. Verify JavaScript file is loaded without errors
3. Check browser console for error messages
4. Ensure `apiUrl` and `apiKey` are correct

### Messages not sending

1. Verify API endpoint is accessible
2. Check network tab for failed requests
3. Verify API key is valid
4. Check CORS settings on your API

### Styling conflicts

1. Widget uses scoped CSS classes (`.chatbot-*`)
2. Ensure no global styles are overriding widget styles
3. Check z-index conflicts (widget uses z-index: 9999)

## Examples

See the `examples/` directory for complete working examples:

- `basic.html` - Minimal integration
- `themed.html` - Custom theme
- `advanced.html` - All configuration options

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/lifestream-dynamics/chatbot-widget/issues
- Email: support@lifestreamdynamics.com

## Changelog

### v1.0.0 (2025-01-15)

- Initial release
- React 19 support
- Markdown rendering
- Customizable themes
- Session management
- Quick actions
- Multiple positioning options
