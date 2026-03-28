# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Framework-agnostic AI chatbot widget built with React 19 and Vite. Embeddable on any website via script tag. Supports IIFE, UMD, and ES module formats. Compatible with chatbot-api v1.0.0+.

## Development Commands

```bash
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Build for production (outputs to dist/)
npm run typecheck        # Type checking only
npm test                 # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
npm run format:check     # Check formatting (used in CI)
npm run preview          # Preview production build
```

Run a single test file:
```bash
npx vitest run tests/chatbotService.test.ts
npx vitest tests/components/ChatBot.test.tsx --watch  # Watch mode for single file
```

## Architecture

### Entry Point Flow
1. `src/index.tsx` - Main entry: exports `initLifestreamChatbot()`, attaches to `window.LifestreamChatbot`, manages React root mounting
2. `src/ChatbotWidget.tsx` - Wraps ChatBot in StrictMode, forwards ref for programmatic API
3. `src/components/ChatBot.tsx` - Main UI component with chat logic, message state, streaming
4. `src/utils/markdown.tsx` - Lightweight markdown renderer using `marked` + custom HTML sanitizer

### Service Layer
`src/services/chatbotService.ts` manages:
- API communication (POST `/api/v1/chat`, GET `/api/v1/chat/history/:sessionId`)
- SSE streaming (POST `/api/v1/chat/stream`)
- Session management (localStorage/sessionStorage/in-memory based on privacy settings)
- Rate limit tracking from response headers
- Dev mode logging

### Programmatic API
`src/index.tsx` exposes these functions globally via `window.LifestreamChatbot`:
- `init()`, `open()`, `close()`, `toggle()`, `sendMessage()`, `getSessionId()`, `isOpen()`
- `grantConsent()`, `revokeConsent()`, `clearHistory()`
- `on()`, `off()` - Event system for 'open', 'close', 'message', 'error' events
- `exportChat()`, `setThemeMode()`, `getThemeMode()`

### Type Definitions
`src/types.ts` contains:
- `ChatbotConfig` - Full configuration interface
- `ChatBotHandle` - Ref interface for programmatic control
- `ChatResponse`, `ChatHistoryResponse` - API response types
- Event types: `ChatbotEventName`, `ChatbotMessageEvent`, `ChatbotErrorEvent`, `ChatbotExportEvent`, `ChatbotThemeChangeEvent`

### Build Output
Vite builds three formats to `dist/`:
- `lifestream-chatbot.iife.js` - For script tags
- `lifestream-chatbot.umd.js` - For CommonJS/AMD
- `lifestream-chatbot.es.js` - For ES modules
- `lifestream-chatbot.css` - Styles

All dependencies (including React) are bundled. Production builds strip console logs and debuggers. Sourcemaps are generated for debugging.

### Path Aliases
```typescript
// vite.config.ts and vitest.config.ts
'@/*' → './src/*'
```

### API Contract (chatbot-api v1.0.0+)
- `POST /api/v1/chat` - Send message, returns `{message, session_id, tokens_used, model?, finish_reason?, content_safety?}`
- `POST /api/v1/chat/stream` - SSE streaming: `data: {"chunk": "text"}`, `data: {"done": true}`
- `GET /api/v1/chat/history/:sessionId?limit=N&offset=N` - Paginated history with `has_more`
- `GET /health` - Health check

Auth: Bearer token (`pk_...`). Session ID pattern: `sess_[timestamp]_[random]`.

## Testing

- **Framework**: Vitest with @testing-library/react
- **Location**: `tests/` directory
- **Setup**: `tests/setup.ts` (jsdom environment, globals enabled)
- **Coverage threshold**: 70% (statements, branches, functions, lines)

### Test Files

- `tests/setup.ts` — jsdom environment, globals
- `tests/chatbotService.test.ts` — service layer tests
- `tests/components/ChatBot.test.tsx` — main component tests
- `tests/components/ChatbotWidget.test.tsx` — wrapper component tests
- `tests/components/ConsentDialog.test.tsx` — consent dialog component tests
- `tests/components/ChatMenu.test.tsx` — chat menu component tests
- `tests/index.test.tsx` — public API layer tests (init, events, consent, globals)
- `tests/utils/cn.test.ts` — class name utility tests
- `tests/utils/markdown.test.ts` — markdown renderer and sanitizer tests

## CI/CD

GitHub Actions in `.github/workflows/ci.yml`:
1. **Lint** - ESLint + Prettier check (runs in parallel)
2. **Type check** - `tsc --noEmit` (runs in parallel)
3. **Test** - Run tests with coverage, upload artifacts (runs in parallel)
4. **Build** - Runs sequentially after lint/typecheck/test pass; verifies dist artifacts exist (iife.js, umd.js, es.js, css)

Triggers on push/PR to `main`, `master`, and `develop` branches. All jobs use Node version from `.nvmrc`.

## Important Notes

- Widget mounts to `#lifestream-chatbot-root` div (auto-created if not present)
- Theme applied via CSS custom properties on `:root` (e.g., `--chatbot-primary`)
- Privacy mode uses in-memory storage when consent not granted
- Node.js v20 required (see `.nvmrc`)
- NPM package scope is `@lifestreamdynamics/chatbot-widget` (README examples must use this scope, not `@lifestream`)
- Privacy config canonical keys: `enableSessionStorage`, `consentRequired`, `disableAnalytics` (planned, warns if used), `dataRetentionDays` (planned, warns if used). README privacy examples must match these.
- Default widget position is `bottom-right` (ChatBot.tsx), not `bottom-left`.
- Console log prefix is `[LifestreamChatbot]` everywhere.

### Privacy Storage Behavior (runtime)

- `privacy.enableSessionStorage: true` → uses browser `sessionStorage` (NOT in-memory). Takes precedence over top-level `sessionStorage`.
- `privacy.enableSessionStorage: false` → disables all persistent storage, forces in-memory
- `privacy.consentRequired: true` → forces in-memory until `grantConsent()` called
- In-memory mode: session ID stored in module-level `memorySessionId` variable
- `revokeConsent()`: switches to in-memory session AND closes chat UI, clears messages, emits `close` event
- Top-level `config.sessionStorage` is deprecated in favor of `privacy.enableSessionStorage` (will be removed in v3.0.0)
