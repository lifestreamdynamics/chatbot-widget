# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Framework-agnostic AI chatbot widget built with React 19 and Vite. Embeddable on any website via script tag. Supports IIFE, UMD, and ES module formats. **100% compatible with chatbot-api v1.0.0** (released 2025-10-18) with enhanced features: content safety warnings, pagination, privacy controls, and developer mode logging.

**Backend Compatibility:** As of 2025-10-18, the chatbot-api backend implements ALL v1.0.0 features documented in this widget. All features are now fully functional.

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
- **POST /api/v1/chat**: Send message with `{message, session_id, metadata?}`, returns `{message, session_id, tokens_used, model?, finish_reason?, content_safety?}`
- **POST /api/v1/chat/stream**: Send message and receive SSE streaming response (real-time token-by-token)
- **GET /api/v1/chat/history/:sessionId?limit=N&offset=N**: Retrieve paginated conversation history with `total_count` and `has_more`
- **GET /health**: Health check endpoint
- **GET /health/detailed**: Detailed health check with dependencies
- **GET /health/ready**: Readiness probe
- **GET /health/live**: Liveness probe

**Key Changes in v1.0.0:**
- Response field changed from `response` to `message` (widget handles backwards compatibility)
- New response fields: `model`, `finish_reason`, `content_safety`
- Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `X-Token-Limit`, `X-Token-Used`, `X-Token-Remaining`
- Pagination support with `limit`, `offset`, `total_count`, `has_more`
- Content safety warnings for PII detection and content filtering

Authentication: Bearer token (public key format: `pk_...`)
Session ID pattern: `sess_[alphanumeric]` (validated before API calls)
Storage: localStorage (default), sessionStorage (optional), or in-memory (privacy mode).

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
  metadata: { source: 'website', page: 'home' }, // optional metadata

  // NEW in v1.0.0+
  enableDevMode: false, // developer console logging
  privacy: {
    enableSessionStorage: true, // allow localStorage/sessionStorage
    disableAnalytics: false,    // disable usage tracking
    dataRetentionDays: 30,      // data retention period (documentation only)
    consentRequired: false       // require consent before storage
  }
});

// Privacy management (NEW)
import { grantConsent, revokeConsent, clearHistory } from '@lifestream/chatbot-widget';

// Grant consent after user accepts privacy policy
grantConsent();

// Revoke consent and clear data
revokeConsent();

// Clear conversation history
clearHistory();

// Later: cleanup() to unmount and remove DOM element
```

## New Features (v1.0.0+)

### Content Safety Warnings
- PII detection warnings display inline with messages
- Shows "⚠️ Personal information detected and protected" when redaction occurs
- Configurable via API backend settings
- Styled with amber warning colors for visibility

### Pagination
- "Load More Messages" button at top of chat when `has_more: true`
- Loads 20 messages at a time with offset-based pagination
- Prepends older messages while maintaining scroll position
- Loading state with disabled button during fetch

### Privacy Controls
- **Standard Mode**: Uses localStorage/sessionStorage for persistence
- **Privacy Mode**: In-memory storage when consent not granted
- **Consent Management**: `grantConsent()` moves data from memory to storage
- **Data Deletion**: `revokeConsent()` and `clearHistory()` for GDPR/PIPEDA compliance
- Session IDs validated against pattern `^sess_[a-zA-Z0-9]+$`

### Developer Mode
- Console logging for debugging and monitoring
- Logs rate limits: "95/100 requests remaining"
- Logs token usage: "125,000/1,000,000 used today (12.5%)"
- Logs response times and model info
- Logs content safety detections
- Enable via `enableDevMode: true` in config

### Enhanced Error Handling
- Message length validation (max 10,000 chars)
- Better error messages for rate limits (with retry countdown)
- Quota exceeded warnings with reset times
- Network error detection and user-friendly messages

## Important Notes

- All React dependencies are bundled into the output files
- Widget creates/mounts to `#lifestream-chatbot-root` div
- Theme applied via CSS custom properties on `:root`
- Service configuration (API URL/key) set globally via `configure()`
- TypeScript strict mode enabled
- Production builds drop console logs and debuggers (except error logs)
- Response field mapping: API returns `message`, widget internally uses `response` for backwards compatibility
- Rate limit info tracked in headers but only logged in dev mode (not shown to users)
