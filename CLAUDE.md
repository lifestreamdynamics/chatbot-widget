# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Framework-agnostic AI chatbot widget built with React 19 and Vite. Embeddable on any website via script tag. Supports IIFE, UMD, and ES module formats.

## Development Commands

```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Type checking only (no build)
npm run typecheck

# Preview production build
npm run preview
```

## Architecture

### Entry Point Flow
1. `src/index.tsx` - Exports `initLifestreamChatbot()` function and handles global window attachment
2. `src/ChatbotWidget.tsx` - Wraps ChatBot component in StrictMode
3. `src/components/ChatBot.tsx` - Main UI component (not included in analysis but referenced)

### Key Components
- **index.tsx**: Main entry point, creates React root, applies theme CSS custom properties, returns cleanup function
- **ChatbotWidget.tsx**: Thin wrapper component around ChatBot
- **chatbotService.ts**: API integration layer (sendMessage, getChatHistory, checkHealth, session management)
- **types.ts**: TypeScript interfaces for ChatbotConfig, Message, API responses

### Build Configuration
- **Vite**: Builds IIFE, UMD, and ES module formats
- **Output**: `dist/lifestream-chatbot.{iife,umd,es}.js` and `dist/lifestream-chatbot.css`
- **Bundling**: All dependencies bundled (no externals), React included in bundle
- **Minification**: Terser with console/debugger removal
- **Path alias**: `@/*` maps to `./src/*`

### API Integration
Backend expects (compatible with chatbot-api v1.0.0+):
- **POST /api/v1/chat**: Send message with `{message, session_id, metadata?}`
- **POST /api/v1/chat/stream**: Send message and receive SSE streaming response
- **GET /api/v1/chat/history/:sessionId**: Retrieve conversation history
- **GET /health**: Health check endpoint
- **GET /health/detailed**: Detailed health check with dependencies
- **GET /health/ready**: Readiness probe
- **GET /health/live**: Liveness probe

Authentication: Bearer token (public key format: `pk_...`)
Session ID stored in localStorage (or sessionStorage if configured).

### Streaming Support
Widget supports two modes:
1. **Standard mode** (default): Single response after full generation
2. **Streaming mode** (`enableStreaming: true`): Real-time token-by-token streaming via Server-Sent Events

Streaming implementation:
- Uses `/api/v1/chat/stream` endpoint
- Processes SSE events with format: `data: {"chunk": "text"}` and `data: {"done": true}`
- Updates UI in real-time as chunks arrive
- Graceful fallback to error state on stream failure

### Initialization Pattern
```javascript
const cleanup = initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'pk_your_public_key',
  theme: { primaryColor: '#ff6b6b', position: 'bottom-right' },
  welcomeMessage: 'Hello!',
  autoOpen: false,
  sessionStorage: false, // use localStorage by default
  enableStreaming: false, // enable streaming mode (default: false)
  metadata: { source: 'website', page: 'home' } // optional metadata
});

// Later: cleanup() to unmount and remove DOM element
```

## Important Notes

- All React dependencies are bundled into the output files
- Widget creates/mounts to `#lifestream-chatbot-root` div
- Theme applied via CSS custom properties on `:root`
- Service configuration (API URL/key) set globally via `configure()`
- TypeScript strict mode enabled
- Production builds drop console logs and debuggers
