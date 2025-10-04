# Changelog

All notable changes to the Lifestream Chatbot Widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Widget does not expose programmatic API for open/close/send actions (enhancement planned)
- No built-in analytics or event tracking (planned for future)
- No message persistence across page reloads (only session ID persists)

### Security
- XSS protection via React's built-in escaping
- No inline scripts in generated HTML
- Safe markdown rendering with react-markdown
- API key validation on initialization

## [Unreleased]

### Planned Features
- Programmatic API for controlling widget state
- Event callbacks (onOpen, onClose, onMessage, etc.)
- Message persistence across page reloads
- File upload support
- Voice input option
- Analytics integration (opt-in)
- Accessibility improvements (ARIA enhancements)
- Internationalization (i18n) support
- Custom CSS class injection
- Widget state persistence
- Message read receipts
- Rich media support (images, videos, buttons)
- Conversation export functionality
- Dark/light mode toggle

### Future Enhancements
- Reduce bundle size (<150KB gzipped target)
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
- GitHub Issues: https://github.com/lifestream-dynamics/chatbot-widget/issues
- Email: support@lifestreamdynamics.com
