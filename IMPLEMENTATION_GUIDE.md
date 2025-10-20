# Lifestream Chatbot Widget - Implementation Guide

**Version:** 2.0.0
**Compatible with:** chatbot-api v1.0.0+
**Last Updated:** October 2025

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Installation Methods](#installation-methods)
3. [Basic Configuration](#basic-configuration)
4. [Advanced Features](#advanced-features)
5. [Framework Integration](#framework-integration)
6. [Privacy & Compliance](#privacy--compliance)
7. [Customization](#customization)
8. [Testing & Debugging](#testing--debugging)
9. [Troubleshooting](#troubleshooting)
10. [Production Checklist](#production-checklist)

---

## Quick Start

### Option 1: CDN (Fastest)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>

  <!-- Load the widget styles -->
  <link rel="stylesheet" href="https://unpkg.com/@lifestreamdynamics/chatbot-widget@2/dist/lifestream-chatbot.css">
</head>
<body>
  <h1>Welcome to My Website</h1>

  <!-- Your website content -->

  <!-- Load the widget script -->
  <script src="https://unpkg.com/@lifestreamdynamics/chatbot-widget@2/dist/lifestream-chatbot.iife.js"></script>

  <!-- Initialize the widget -->
  <script>
    const cleanup = initLifestreamChatbot({
      apiUrl: 'https://your-api.example.com/api/v1',
      apiKey: 'pk_your_public_api_key_here'
    });
  </script>
</body>
</html>
```

**That's it!** The widget will appear in the bottom-right corner of your page.

---

## Installation Methods

### Method 1: NPM/Yarn (Recommended for Modern Apps)

```bash
# NPM
npm install @lifestreamdynamics/chatbot-widget

# Yarn
yarn add @lifestreamdynamics/chatbot-widget

# PNPM
pnpm add @lifestreamdynamics/chatbot-widget
```

**Usage:**

```javascript
import { initLifestreamChatbot } from '@lifestreamdynamics/chatbot-widget';
import '@lifestreamdynamics/chatbot-widget/style.css';

const cleanup = initLifestreamChatbot({
  apiUrl: 'https://your-api.example.com/api/v1',
  apiKey: 'pk_your_public_api_key_here'
});
```

### Method 2: CDN (No Build Step)

**jsDelivr (Recommended):**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@lifestreamdynamics/chatbot-widget@2/dist/lifestream-chatbot.css">
<script src="https://cdn.jsdelivr.net/npm/@lifestreamdynamics/chatbot-widget@2/dist/lifestream-chatbot.iife.js"></script>
```

**unpkg:**
```html
<link rel="stylesheet" href="https://unpkg.com/@lifestreamdynamics/chatbot-widget@2/dist/lifestream-chatbot.css">
<script src="https://unpkg.com/@lifestreamdynamics/chatbot-widget@2/dist/lifestream-chatbot.iife.js"></script>
```

### Method 3: Download and Self-Host

```bash
# Download the package
npm pack @lifestreamdynamics/chatbot-widget

# Extract and copy dist/ folder to your project
tar -xzf lifestreamdynamics-chatbot-widget-2.0.0.tgz
cp -r package/dist ./public/chatbot
```

```html
<link rel="stylesheet" href="/chatbot/lifestream-chatbot.css">
<script src="/chatbot/lifestream-chatbot.iife.js"></script>
```

---

## Basic Configuration

### Minimal Configuration

```javascript
const cleanup = initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',  // Required: Your API endpoint
  apiKey: 'pk_abc123...'                      // Required: Your public API key
});
```

### Common Configuration

```javascript
const cleanup = initLifestreamChatbot({
  // Required
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'pk_your_public_key',

  // Appearance
  theme: {
    primaryColor: '#00d9ff',
    position: 'bottom-right',  // 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
    positionOffset: {
      x: '1.5rem',
      y: '1.5rem'
    }
  },

  // Content
  title: 'Support Assistant',
  subtitle: 'We\'re here to help',
  welcomeMessage: 'Hi! How can I assist you today?',

  // Behavior
  autoOpen: false,           // Auto-open on page load
  sessionStorage: false,     // Use sessionStorage instead of localStorage
  enableStreaming: true,     // Enable real-time streaming responses

  // Optional metadata to attach to all messages
  metadata: {
    source: 'website',
    page: window.location.pathname,
    userId: 'user_123'
  }
});
```

---

## Advanced Features

### 1. Privacy & Compliance (GDPR/PIPEDA)

**Scenario: Require user consent before storing data**

```javascript
const cleanup = initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'pk_your_key',

  privacy: {
    enableSessionStorage: true,   // Allow storage (but wait for consent)
    consentRequired: true,         // Don't store until consent granted
    disableAnalytics: false,       // Keep analytics enabled
    dataRetentionDays: 30          // Documentation: data retention policy
  }
});

// Show your consent banner
showConsentBanner({
  onAccept: () => {
    // Import the consent function
    import('@lifestreamdynamics/chatbot-widget').then(({ grantConsent }) => {
      grantConsent();  // Now data can be stored
      hideConsentBanner();
    });
  },
  onDecline: () => {
    // Widget will use in-memory storage only
    hideConsentBanner();
  }
});
```

**Privacy Functions:**

```javascript
import {
  grantConsent,    // Grant consent and enable storage
  revokeConsent,   // Revoke consent and clear all data
  clearHistory     // Clear conversation history
} from '@lifestreamdynamics/chatbot-widget';

// Grant consent after user accepts
grantConsent();

// Revoke consent (GDPR "Right to be Forgotten")
revokeConsent();

// Clear conversation history
clearHistory();
```

### 2. Developer Mode (Debugging)

```javascript
const cleanup = initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'pk_your_key',

  enableDevMode: process.env.NODE_ENV === 'development'
});
```

**What Developer Mode Logs:**

```
[Chatbot] Rate Limit: 95/100 requests remaining
[Chatbot] Tokens: 125,000/1,000,000 used today (12.5%)
[Chatbot] Response time: 245ms | Model: gemini-2.5-flash-lite | Tokens: 42
[Chatbot] Content Safety: PII detected: email address
[Chatbot] Chat history loaded: 15 messages (more available)
```

**Important:** Disable in production to reduce console noise.

### 3. Streaming Responses

```javascript
const cleanup = initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'pk_your_key',
  enableStreaming: true  // Enable real-time token-by-token streaming
});
```

**Benefits:**
- Better user experience (no waiting for full response)
- Perceived faster response times
- Real-time feedback

**Requirements:**
- Backend must support `/api/v1/chat/stream` endpoint
- Server-Sent Events (SSE) must be enabled

### 4. Custom Quick Actions

```javascript
const cleanup = initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'pk_your_key',

  quickActions: [
    { label: 'Pricing', message: 'Tell me about your pricing plans' },
    { label: 'Features', message: 'What features do you offer?' },
    { label: 'Support', message: 'I need help with my account' }
  ]
});
```

### 5. Custom Themes

```javascript
const cleanup = initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'pk_your_key',

  theme: {
    primaryColor: '#3b82f6',       // Blue accent
    secondaryColor: '#10b981',     // Green for success
    backgroundColor: '#1f2937',    // Dark background
    surfaceColor: '#374151',       // Card backgrounds
    textColor: '#f9fafb',          // Light text
    borderColor: '#4b5563'         // Borders
  }
});
```

**Pro Tip:** Use your brand colors for a cohesive look!

---

## Framework Integration

### React

```tsx
import { useEffect, useRef } from 'react';
import { initLifestreamChatbot } from '@lifestreamdynamics/chatbot-widget';
import '@lifestreamdynamics/chatbot-widget/style.css';

function App() {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    cleanupRef.current = initLifestreamChatbot({
      apiUrl: process.env.REACT_APP_CHATBOT_API_URL!,
      apiKey: process.env.REACT_APP_CHATBOT_API_KEY!,
      enableDevMode: process.env.NODE_ENV === 'development'
    });

    return () => {
      cleanupRef.current?.();
    };
  }, []);

  return <div>Your App Content</div>;
}
```

### Vue 3

```vue
<template>
  <div>Your App Content</div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { initLifestreamChatbot } from '@lifestreamdynamics/chatbot-widget';
import '@lifestreamdynamics/chatbot-widget/style.css';

let cleanup = null;

onMounted(() => {
  cleanup = initLifestreamChatbot({
    apiUrl: import.meta.env.VITE_CHATBOT_API_URL,
    apiKey: import.meta.env.VITE_CHATBOT_API_KEY
  });
});

onUnmounted(() => {
  cleanup?.();
});
</script>
```

### Svelte

```svelte
<script>
import { onMount, onDestroy } from 'svelte';
import { initLifestreamChatbot } from '@lifestreamdynamics/chatbot-widget';
import '@lifestreamdynamics/chatbot-widget/style.css';

let cleanup;

onMount(() => {
  cleanup = initLifestreamChatbot({
    apiUrl: import.meta.env.VITE_CHATBOT_API_URL,
    apiKey: import.meta.env.VITE_CHATBOT_API_KEY
  });
});

onDestroy(() => {
  cleanup?.();
});
</script>

<div>Your App Content</div>
```

### Next.js (App Router)

```tsx
'use client';

import { useEffect, useRef } from 'react';
import '@lifestreamdynamics/chatbot-widget/style.css';

export default function ChatbotProvider({ children }) {
  const cleanupRef = useRef(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    import('@lifestreamdynamics/chatbot-widget').then(({ initLifestreamChatbot }) => {
      cleanupRef.current = initLifestreamChatbot({
        apiUrl: process.env.NEXT_PUBLIC_CHATBOT_API_URL,
        apiKey: process.env.NEXT_PUBLIC_CHATBOT_API_KEY
      });
    });

    return () => {
      cleanupRef.current?.();
    };
  }, []);

  return <>{children}</>;
}
```

### WordPress

```php
<?php
// Add to your theme's functions.php or create a custom plugin

function add_lifestream_chatbot() {
  ?>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@lifestreamdynamics/chatbot-widget@2/dist/lifestream-chatbot.css">
  <script src="https://cdn.jsdelivr.net/npm/@lifestreamdynamics/chatbot-widget@2/dist/lifestream-chatbot.iife.js"></script>
  <script>
    initLifestreamChatbot({
      apiUrl: '<?php echo esc_js(get_option('chatbot_api_url')); ?>',
      apiKey: '<?php echo esc_js(get_option('chatbot_api_key')); ?>'
    });
  </script>
  <?php
}
add_action('wp_footer', 'add_lifestream_chatbot');
```

---

## Privacy & Compliance

### GDPR Compliance Example

```html
<!-- Consent Banner -->
<div id="gdpr-banner" style="display: none;">
  <p>We use cookies and local storage to improve your experience.
     By clicking "Accept", you consent to data storage.</p>
  <button onclick="acceptPrivacy()">Accept</button>
  <button onclick="declinePrivacy()">Decline</button>
</div>

<script type="module">
import { initLifestreamChatbot, grantConsent, revokeConsent } from '@lifestreamdynamics/chatbot-widget';

// Initialize with consent required
const cleanup = initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'pk_your_key',
  privacy: {
    consentRequired: true  // Widget uses in-memory storage until consent
  }
});

// Check if user has previously consented
const hasConsented = localStorage.getItem('privacy_consent') === 'true';

if (!hasConsented) {
  document.getElementById('gdpr-banner').style.display = 'block';
}

window.acceptPrivacy = () => {
  localStorage.setItem('privacy_consent', 'true');
  grantConsent();  // Enable persistent storage
  document.getElementById('gdpr-banner').style.display = 'none';
};

window.declinePrivacy = () => {
  localStorage.setItem('privacy_consent', 'false');
  // Widget will continue using in-memory storage
  document.getElementById('gdpr-banner').style.display = 'none';
};

// Add "Forget Me" button somewhere in your privacy settings
window.forgetMe = () => {
  revokeConsent();  // Clear all data
  localStorage.removeItem('privacy_consent');
  alert('All your data has been deleted.');
};
</script>
```

### PIPEDA Compliance (Canada)

Similar to GDPR, but also requires:

```javascript
const cleanup = initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'pk_your_key',

  privacy: {
    consentRequired: true,
    dataRetentionDays: 30  // Document in your privacy policy
  },

  metadata: {
    // Include user consent timestamp
    consentTimestamp: new Date().toISOString(),
    consentVersion: '1.0'  // Track which privacy policy version
  }
});
```

---

## Customization

### Custom Positioning

```javascript
const cleanup = initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'pk_your_key',

  theme: {
    position: 'bottom-left',
    positionOffset: {
      x: '2rem',  // 32px from left
      y: '5rem'   // 80px from bottom (to avoid other UI elements)
    }
  }
});
```

### Custom Widget Size

```javascript
const cleanup = initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'pk_your_key',

  maxWidth: '500px',   // Wider on desktop
  maxHeight: '700px'   // Taller chat window
});
```

### Conditional Loading

```javascript
// Only show chatbot on certain pages
if (window.location.pathname.startsWith('/support')) {
  const cleanup = initLifestreamChatbot({
    apiUrl: 'https://api.example.com/api/v1',
    apiKey: 'pk_your_key',
    autoOpen: true  // Auto-open on support pages
  });
}

// Or show for specific user roles
if (userRole === 'customer') {
  const cleanup = initLifestreamChatbot({
    apiUrl: 'https://api.example.com/api/v1',
    apiKey: 'pk_your_key',
    metadata: {
      userRole: 'customer',
      userId: currentUser.id
    }
  });
}
```

---

## Testing & Debugging

### Local Development

```javascript
const cleanup = initLifestreamChatbot({
  apiUrl: 'http://localhost:3177/api/v1',  // Local API
  apiKey: 'pk_development_key',
  enableDevMode: true,  // Enable debug logging
  enableStreaming: false  // Disable streaming for easier debugging
});
```

### Content Safety Testing

To test PII detection warnings:

```javascript
// Send a message with PII in the chatbot
// Example: "My email is test@example.com and phone is 555-1234"

// You should see:
// 1. Warning message in the chat: "⚠️ Personal information detected and protected"
// 2. In dev mode console: "[Chatbot] Content Safety: PII detected: email address"
```

### Rate Limit Testing

```javascript
// In dev mode, you'll see rate limit info after each message
// [Chatbot] Rate Limit: 95/100 requests remaining
// [Chatbot] Tokens: 125,000/1,000,000 used today (12.5%)

// When you hit the limit, you'll get a user-friendly error:
// "You're chatting too quickly! Please wait a moment and try again."
```

### Network Error Testing

```javascript
// Simulate network error by using invalid API URL
const cleanup = initLifestreamChatbot({
  apiUrl: 'https://invalid-url.example.com/api/v1',
  apiKey: 'pk_test_key'
});

// Try sending a message - you should see:
// "Unable to connect to the chat service. Please check your internet connection and try again."
```

---

## Troubleshooting

### Widget Not Appearing

**Check 1: Verify CSS is loaded**
```html
<!-- Make sure this is in your <head> -->
<link rel="stylesheet" href="path/to/lifestream-chatbot.css">
```

**Check 2: Check browser console for errors**
```
F12 → Console tab
Look for errors mentioning "chatbot" or "lifestream"
```

**Check 3: Verify initialization**
```javascript
const cleanup = initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'pk_...'
});

console.log('Cleanup function:', cleanup);  // Should be a function
```

### API Connection Issues

**Check 1: Verify API URL is correct**
```javascript
// Should end with /api/v1 (no trailing slash)
apiUrl: 'https://api.example.com/api/v1'  // ✓ Correct
apiUrl: 'https://api.example.com/api/v1/' // ✗ Wrong
apiUrl: 'https://api.example.com'          // ✗ Wrong
```

**Check 2: Verify API key format**
```javascript
// Public keys should start with 'pk_'
apiKey: 'pk_abc123...'  // ✓ Correct
apiKey: 'sk_abc123...'  // ✗ Wrong (this is a private key)
apiKey: 'abc123...'     // ✗ Wrong (no prefix)
```

**Check 3: Check CORS**
```
If you see CORS errors in console:
- Ensure your API allows requests from your domain
- Check API's CORS configuration
- Verify preflight OPTIONS requests are handled
```

### Streaming Not Working

**Check 1: Verify streaming is enabled**
```javascript
enableStreaming: true  // Must be explicitly enabled
```

**Check 2: Backend must support streaming**
```
Your API must have /api/v1/chat/stream endpoint
Server must support Server-Sent Events (SSE)
```

**Check 3: Fallback to standard mode**
```javascript
// If streaming fails, widget automatically falls back to standard mode
// Check dev console for errors
```

### Content Safety Warnings Not Showing

**Check 1: Backend must have content safety enabled**
```
Content safety is configured on the backend (chatbot-api)
Widget only displays warnings sent by the API
```

**Check 2: Test with obvious PII**
```
Send a message like: "My email is test@example.com"
You should see a warning if backend has PII detection enabled
```

### Privacy Mode Issues

**Check 1: Verify consent configuration**
```javascript
privacy: {
  consentRequired: true  // Must be true to require consent
}
```

**Check 2: Grant consent after user accepts**
```javascript
import { grantConsent } from '@lifestreamdynamics/chatbot-widget';

// After user clicks "Accept" in your consent banner
grantConsent();
```

**Check 3: Check localStorage/sessionStorage**
```javascript
// In browser console
localStorage.getItem('chatbot_session_id')  // Should be null until consent granted
```

---

## Production Checklist

### Pre-Launch

- [ ] **API Configuration**
  - [ ] API URL is correct (production endpoint)
  - [ ] Public API key is correct (`pk_...`)
  - [ ] Test connection to API
  - [ ] Verify API is accessible from production domain

- [ ] **Security**
  - [ ] Never use private keys (`sk_...`) in frontend code
  - [ ] Public key is safe to expose
  - [ ] HTTPS is enabled on your website
  - [ ] CORS is configured correctly on API

- [ ] **Privacy & Compliance**
  - [ ] Consent banner implemented (if required)
  - [ ] Privacy policy updated
  - [ ] `grantConsent()` and `revokeConsent()` functions connected
  - [ ] Data retention policy documented

- [ ] **Performance**
  - [ ] Developer mode disabled in production
  - [ ] CSS and JS loaded from CDN or optimized bundle
  - [ ] Widget doesn't block page rendering
  - [ ] Mobile responsiveness tested

- [ ] **Testing**
  - [ ] Tested on desktop browsers (Chrome, Firefox, Safari, Edge)
  - [ ] Tested on mobile browsers (iOS Safari, Chrome Android)
  - [ ] Tested with content safety features
  - [ ] Tested pagination (load more messages)
  - [ ] Tested streaming (if enabled)
  - [ ] Tested error scenarios

- [ ] **User Experience**
  - [ ] Welcome message is appropriate
  - [ ] Quick actions are relevant
  - [ ] Theme matches brand colors
  - [ ] Position doesn't block important content
  - [ ] Auto-open behavior is correct

### Post-Launch Monitoring

```javascript
const cleanup = initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'pk_production_key',

  // Add metadata to help with monitoring
  metadata: {
    version: '2.0.0',
    environment: 'production',
    deployDate: '2025-10-18'
  }
});
```

**What to Monitor:**
- Widget initialization errors (browser console)
- API response times (dev mode temporarily)
- User engagement (via your analytics)
- Error rates (API logs)
- Rate limit hits (API dashboard)

---

## Support & Resources

- **Documentation:** [README.md](./README.md)
- **API Documentation:** [chatbot-api repository](https://github.com/lifestream-dynamics/chatbot-api)
- **Issues:** [GitHub Issues](https://github.com/lifestream-dynamics/chatbot-widget/issues)
- **Email:** eric@mittonvillage.com

---

## Quick Reference

### Minimal Setup (CDN)
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@lifestreamdynamics/chatbot-widget@2/dist/lifestream-chatbot.css">
<script src="https://cdn.jsdelivr.net/npm/@lifestreamdynamics/chatbot-widget@2/dist/lifestream-chatbot.iife.js"></script>
<script>
  initLifestreamChatbot({
    apiUrl: 'https://api.example.com/api/v1',
    apiKey: 'pk_your_key'
  });
</script>
```

### Minimal Setup (NPM)
```javascript
import { initLifestreamChatbot } from '@lifestreamdynamics/chatbot-widget';
import '@lifestreamdynamics/chatbot-widget/style.css';

initLifestreamChatbot({
  apiUrl: 'https://api.example.com/api/v1',
  apiKey: 'pk_your_key'
});
```

### Privacy Functions
```javascript
import { grantConsent, revokeConsent, clearHistory } from '@lifestreamdynamics/chatbot-widget';

grantConsent();    // Enable storage
revokeConsent();   // Delete all data
clearHistory();    // Clear chat history
```

---

**Ready to go live? Follow the [Production Checklist](#production-checklist) above!** 🚀
