# Changelog

All notable changes to the Lifestream Chatbot Widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.0] - 2026-03-27

### Added
- **Conversation Export:** Export chat history as JSON or plain text
  - "Export as JSON" and "Export as Text" options in the chat menu
  - Programmatic API: `exportChat('json')` / `exportChat('text')`
  - Emits `export` event with format, message count, and timestamp
  - Download triggered via Blob + URL.createObjectURL
- **Dark/Light Mode Toggle:** Theme switching with OS-following support
  - `theme.mode` config option: `'dark'` (default), `'light'`, `'auto'`
  - `auto` mode follows `prefers-color-scheme` media query with live updates
  - Toggle button in chat menu (Sun/Moon icons with separator)
  - Programmatic API: `setThemeMode(mode)`, `getThemeMode()`
  - Emits `themeChange` event with mode and resolvedMode
  - User color overrides (e.g., `primaryColor`) always take priority over mode defaults
  - Light mode colors: accessible WCAG AA compliant palette
  - CSS scoped via `data-chatbot-theme` attribute on container (no global leaks)

### Changed
- **Bundle Size Reduction:** Replaced `react-markdown` + `remark-gfm` with `marked` + custom sanitizer
  - IIFE + CSS gzipped: **~111 KB → ~84 KB** (25% reduction)
  - Custom DOM-based HTML sanitizer with allowlisted safe tags
  - All markdown features preserved: GFM tables, strikethrough, code blocks, links
  - Links still open in new tabs with `rel="noopener noreferrer"`
- Theme color overrides now applied on container element instead of `:root` (prevents global CSS leaks)

### Technical Details
- New file: `src/utils/markdown.tsx` — lightweight MarkdownContent component + sanitizeHtml
- New icons: Download, Sun, Moon (Lucide-style SVGs)
- New types: `ChatbotExportEvent`, `ChatbotThemeChangeEvent`
- New events: `export`, `themeChange`
- New config: `theme.mode`
- New API methods: `exportChat()`, `setThemeMode()`, `getThemeMode()`
- Test count: 167 → 230 (63 new tests)
- Dependencies: Removed `react-markdown`, `remark-gfm` (81 transitive deps); Added `marked` (0 transitive deps)

## [2.1.1] - 2026-02-17

### Fixed
- Documentation accuracy: corrected package scope, default widget position, privacy config keys, pagination API, and content safety fields across README.md
- Test stability fixes

### Changed
- Added staleness notice to inline v2.0.0 changelog section in README.md
- Added `@planned` JSDoc annotations to unimplemented type fields (`disableAnalytics`, `dataRetentionDays`)

## [2.1.0] - 2025-12-21

### Added
- **Programmatic API:** Full widget control from application code
  - `open()` - Open the chat window
  - `close()` - Close/minimize the chat window
  - `toggle()` - Toggle open/closed state
  - `sendMessage(text)` - Send a message programmatically
  - `getSessionId()` - Get current session ID
  - `isOpen()` - Check if widget is open
- **Event System:** Subscribe to widget lifecycle events
  - `on(event, callback)` - Subscribe to events
  - `off(event, callback)` - Unsubscribe from events
  - Events: `open`, `close`, `message`, `error`
- **Full Accessibility (WCAG 2.1 AA):**
  - ARIA live regions for screen reader announcements
  - Keyboard navigation (Escape to close, Tab focus trap)
  - Focus management (save/restore focus on open/close)
  - Semantic heading structure (`<h2>` for title)
  - `aria-expanded`, `aria-controls`, `role="dialog"`, `aria-modal`
  - Focus-visible styles for keyboard users
- **E2E Testing Support:** Stable `data-testid` attributes on all interactive elements
  - `chatbot-button`, `chatbot-container`, `chatbot-minimize`
  - `chatbot-messages`, `chatbot-input`, `chatbot-send`
  - `chatbot-quick-action-{index}` for quick action buttons
- **Test Coverage:** Comprehensive test suite (70 test cases across 3 test files)
- **Print Styles:** Widget hidden when printing (`@media print`)

### Improved
- **Documentation:** Added Programmatic API, Event System, and Testing sections to README
- **Developer Experience:** Better test automation support with stable selectors

## [2.0.1] - 2025-10-19

### Fixed
- **Critical Bug:** Widget crash when accessing undefined message properties (ChatBot.tsx:316)
  - Added defensive null checks throughout message handling
  - Filter out null/undefined messages before rendering
  - Handle empty chat history gracefully
- **Critical Bug:** CSS positioning utilities missing from compiled output
  - Added `position: fixed` and `z-index: 9999` to button and container classes
  - Replaced Tailwind-style positioning with inline style objects
  - All four position options now work correctly (bottom-left, bottom-right, top-left, top-right)
- **Critical Bug:** `process.env.NODE_ENV` undefined in browser environments
  - Added Vite `define` configuration to replace env vars at build time
  - No runtime errors from environment variable access

### Improved
- **Bundle Size Optimization:** Significantly reduced bundle sizes
  - IIFE: 687 kB → 361 kB (47% smaller, 205 kB → 109 kB gzipped)
  - UMD: 688 kB → 361 kB (47% smaller, 205 kB → 109 kB gzipped)
  - ES Module: 1,999 kB → 961 kB (52% smaller, 360 kB → 179 kB gzipped)
- **Code Quality:** Enhanced defensive programming with null checks
- **Positioning System:** More reliable CSS-based positioning with inline styles

## [2.0.0] - 2025-10-18

### Breaking Changes
- **API Response Field:** Backend API now returns `message` field instead of `response` (widget handles backwards compatibility internally)
- **Minimum API Version:** Requires chatbot-api v1.0.0 or higher

### Added
- **Content Safety Warnings:** Inline PII detection warnings with visual indicators
- **Pagination Support:** "Load More Messages" button for conversation history with 20 messages per page
- **Privacy Controls:** GDPR/PIPEDA compliance with consent management
  - `grantConsent()` - Enable persistent storage after user consent
  - `revokeConsent()` - Revoke consent and delete all data
  - `clearHistory()` - Clear conversation history
- **In-Memory Storage:** Privacy mode using in-memory storage when consent not granted
- **Developer Mode:** Console logging for debugging (rate limits, tokens, performance, content safety)
- **Rate Limit Tracking:** Extract and log rate limit information from API headers (dev mode only)
- **Enhanced Error Handling:** Better error messages with retry information for rate limits
- **Message Validation:** Client-side validation (max 10,000 characters)
- **Session ID Validation:** Enforce `sess_[alphanumeric]` pattern
- **TypeScript Declarations:** Full TypeScript type definitions included
- **Implementation Guide:** Comprehensive 850+ line implementation guide with examples

### Improved
- **Privacy Configuration:** New `privacy` config object with multiple options
  - `enableSessionStorage`: Control localStorage/sessionStorage usage
  - `disableAnalytics`: Disable analytics tracking
  - `dataRetentionDays`: Document data retention policy
  - `consentRequired`: Require explicit consent before storage
- **Developer Experience:** New `enableDevMode` flag for debug logging
- **Response Compatibility:** Automatic mapping between API's `message` and widget's `response` fields
- **Streaming Support:** Enhanced with content safety and model information
- **Error Messages:** More user-friendly error messages with actionable information
- **Documentation:** Expanded README from 573 to 1200+ lines with migration guide
- **API Integration:** Support for new v1.0.0 response fields (`model`, `finish_reason`, `content_safety`)

### Fixed
- TypeScript compilation now generates declaration files correctly
- Build process optimized with separate tsconfig for declarations
- Session ID now validated against required pattern before API calls

## [1.1.0] - 2025-10-04

### Added
- **Streaming Support**: Real-time SSE streaming responses via `/api/v1/chat/stream` endpoint
- **Metadata Tracking**: Optional metadata field for analytics and monitoring
- `enableStreaming` configuration option to enable real-time streaming mode
- `metadata` configuration option to send custom data with each request
- SSE (Server-Sent Events) parser for streaming responses
- Real-time UI updates during streaming with placeholder messages

### Changed
- **API Compatibility**: Now compatible with chatbot-api v1.0.0+
- Updated API request format to include optional `metadata` field
- Enhanced `chatbotService.sendMessage()` to support streaming via `onChunk` callback
- Improved ChatBot component to handle both streaming and non-streaming modes
- Updated all documentation with correct API key format (`pk_` prefix for public keys)
- Consolidated documentation into comprehensive README.md

### Fixed
- Corrected API key format in all examples (from `sk_` to `pk_` prefix)
- Fixed health endpoint response format in documentation
- Corrected bundle size information across all documentation
- Removed duplicate content between README and USAGE docs

### Documentation
- Complete rewrite of README.md with step-by-step installation guide
- Added streaming configuration examples
- Updated API requirements with metadata support
- Improved troubleshooting section with checkboxes
- Added emojis for better visual scanning
- Consolidated USAGE.md and DISTRIBUTION_GUIDE.md content into README

## [1.0.0] - 2025-01-15

### Added
- Initial release of the Lifestream Chatbot Widget
- React 19 based chatbot component
- Markdown support with `react-markdown` and `remark-gfm`
- Multiple build formats (IIFE, UMD, ES Module)
- Standalone CSS with theming support via CSS custom properties
- Inline SVG icons (no external icon library dependency)
- Session management with localStorage/sessionStorage options
- Customizable quick action buttons
- Multiple positioning options (bottom-left, bottom-right, top-left, top-right)
- Full TypeScript support with type definitions
- Responsive design for desktop, tablet, and mobile
- Auto-open option for automatically showing chat on load
- Custom welcome messages and titles
- Configurable chat dimensions (maxWidth, maxHeight)
- Complete theme customization (colors, positioning, offsets)
- Message history with timestamps
- Typing indicators
- Error handling and user-friendly error messages
- API service layer with health checks
- Development preview page
- Three example HTML files (basic, themed, advanced)
- Comprehensive documentation (README, USAGE, DISTRIBUTION_GUIDE)

### Technical Details
- Built with Vite 6
- React 19 with StrictMode
- TypeScript 5.7
- Production builds include source maps
- Minified with Terser
- Console logs removed in production
- Optimized bundle size (~203KB gzipped for IIFE)

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

### Dependencies
- `react` ^19.0.0
- `react-dom` ^19.0.0
- `react-markdown` ^9.0.1
- `remark-gfm` ^4.0.0

### Files Included
- `dist/lifestream-chatbot.css` (7.96 KB)
- `dist/lifestream-chatbot.iife.js` (666 KB uncompressed, 203 KB gzipped)
- `dist/lifestream-chatbot.umd.js` (666 KB uncompressed, 203 KB gzipped)
- `dist/lifestream-chatbot.es.js` (1.9 MB uncompressed, 357 KB gzipped)
- Source maps for all JavaScript files

### Known Limitations
- ~~Widget does not expose programmatic API for open/close/send actions (enhancement planned)~~ (resolved in v2.1.0)
- No built-in analytics or event tracking (planned for future)
- No message persistence across page reloads (only session ID persists)

### Security
- XSS protection via React's built-in escaping
- No inline scripts in generated HTML
- Safe markdown rendering with react-markdown
- API key validation on initialization

## [2.2.0] - 2026-03-27

### Added
- **Consent Dialog UI:** Visual consent gate when `privacy.consentRequired: true`
  - Shield icon with privacy explanation and Accept/Decline buttons
  - Shown inside the chat window (header remains visible for minimize)
  - Accept grants consent and enables full chat functionality
  - Decline closes the widget
  - Re-shown after `revokeConsent()` is called
  - Fully accessible: `role="alertdialog"`, auto-focus, keyboard navigation
  - Test IDs: `chatbot-consent-dialog`, `chatbot-consent-accept`, `chatbot-consent-decline`
- **In-Widget Chat Menu:** Three-dot menu in the chat header
  - "Clear History" option clears messages, session data, and resets to welcome message
  - Click-outside and Escape key to close
  - Fully accessible: `aria-haspopup`, `role="menu"`, `role="menuitem"`
  - Test IDs: `chatbot-menu-button`, `chatbot-menu-dropdown`, `chatbot-menu-clear-history`
  - Hidden when consent dialog is displayed
- **Consent state getters:** `isConsentGranted()` and `isConsentRequired()` exported from service layer

### Fixed
- `clearHistory()` now clears displayed messages in the UI (previously only cleared storage)
- Programmatic `clearHistory()` via public API now syncs with visible chat state via `registerClearMessagesCallback`

### Fixed (23 items resolved — 2026-02-26)

#### CRITICAL
- CI now triggers on `master` branch (alongside `main`/`develop`) — CI was not running on production branch
- `STORAGE_ENABLED` renamed to `PERSISTENT_STORAGE_ENABLED` with corrected semantics — no longer conflates "which storage" vs "whether storage"

#### MAJOR
- Top-level `sessionStorage` config deprecated with JSDoc notice; `privacy.enableSessionStorage` takes precedence at runtime
- Singleton state leak on re-initialization: `initLifestreamChatbot()` now cleans up previous instance before creating new one
- `revokeConsent()` now closes widget UI, clears messages, and emits `close` event via consent revoke callback system
- `src/index.tsx` now has 28 dedicated tests covering init, cleanup, consent delegation, programmatic API, events, and global exports
- `disableAnalytics`/`dataRetentionDays` now emit `console.warn()` when passed to `configure()` instead of being silently dropped
- `configure()` now resets `PERSISTENT_STORAGE_ENABLED` and `CONSENT_GRANTED` to defaults on re-call

#### HIGH
- Migrated deprecated `onKeyPress` → `onKeyDown` in ChatBot.tsx (React 19 compatibility)
- `sendMessage()` programmatic API now awaits completion instead of using `setTimeout` race condition
- `checkHealth()` now uses `new URL('/health', API_URL)` instead of fragile string replace; accepts optional `healthUrl` parameter
- `getSessionId()` return type unified to `string` across `ChatBotHandle` interface, index.tsx, and service layer
- SSE stream chunk fragmentation handled: added line accumulation buffer to process only complete lines

#### MEDIUM
- `on()`/`off()` now validate event names at runtime; invalid names log a warning and return early
- CI IIFE artifact check added to build verification step
- CI duplicate test run removed (kept only `npm run test:coverage`)
- `AlertCircle` dead code removed from `icons.tsx`
- Console log prefix standardized to `[LifestreamChatbot]` across all files (was `[Chatbot]`, `[Lifestream Chatbot]`)
- `devLog` no longer emits empty string for falsy data — uses rest parameters
- `getChatHistory` no longer silently omits `offset=0` or `limit=0`
- `ChatbotEventCallback`/`ChatbotEventEmitter` unused types removed from `types.ts`
- Placeholder `expect(true).toBe(true)` tests replaced with real behavioral assertions
- `checkHealth` error log now uses standardized `[LifestreamChatbot]` prefix

### Technical Debt

<!-- Review cadence: reassess items quarterly. Remove resolved items. Escalate items older than 6 months. -->

(No remaining tracked items — all 18 previously listed items resolved above)

### Planned Features (High Priority)
- ~~Consent dialog UI: Visual consent gate when `consentRequired: true`~~ (completed 2026-03-27 — shows consent dialog inside chat window with Accept/Decline)
- ~~In-widget chat menu: Menu icon with Clear History option~~ (completed 2026-03-27 — three-dot menu in header with Clear History)
- ~~Privacy config unification: Reconcile field names across README, types.ts, and service layer~~ (resolved 2026-02-26 — `privacy.enableSessionStorage` now takes precedence, top-level `sessionStorage` deprecated)
- ~~Screen reader announcement region: Dedicated `aria-live` region for new assistant messages (WCAG 2.1 AA)~~ (completed 2026-02-26 — messages container has role="log" + aria-live="polite")
- ~~Package name normalization: Ensure all documentation references `@lifestreamdynamics/chatbot-widget`~~ (completed 2026-02-26)

<!-- Note: Items below are speculative backlog. High Priority items above are active targets. -->
### Planned Features
- Message persistence across page reloads
- File upload support
- Voice input option
- Analytics integration (opt-in)
- Internationalization (i18n) support
- Custom CSS class injection
- Message read receipts
- Rich media support (images, videos, buttons)

### Future Enhancements
- Further reduce bundle size (<100KB gzipped target) - currently ~84KB
- Lazy load markdown renderer
- Virtual scrolling for long conversations
- Offline mode with queue
- PWA support with service worker
- WebSocket support for real-time updates
- Voice-to-text integration
- AI model selection (allow switching between models)
- Conversation branching/threading
- User authentication integration
- Multi-language support

---

## Version History

- **2.3.0** (2026-03-27) - Conversation Export, Dark/Light Mode, Bundle Size Reduction
- **2.2.0** (2026-03-27) - Consent Dialog UI, In-Widget Chat Menu, 23 bug fixes
- **2.1.0** (2025-12-21) - Programmatic API, event system, full accessibility (WCAG 2.1 AA)
- **2.0.1** (2025-10-19) - Critical bug fixes and bundle optimization
- **2.0.0** (2025-10-18) - Major release with privacy controls, content safety, and pagination
- **1.1.0** (2025-10-04) - Streaming support and metadata tracking
- **1.0.0** (2025-01-15) - Initial release

## How to Update

### From any version to latest:
1. Download the latest release
2. Replace old files with new files
3. Review CHANGELOG for breaking changes
4. Update your configuration if needed
5. Test thoroughly before deploying to production
6. Clear browser cache to ensure new version loads

### Breaking Changes Policy
- Major versions (x.0.0) may include breaking changes
- Minor versions (1.x.0) are backwards compatible
- Patch versions (1.0.x) are bug fixes only

## Support

For questions about changes or upgrading:
- GitHub Issues: https://github.com/lifestreamdynamics/chatbot-widget/issues
- Email: support@lifestreamdynamics.com
