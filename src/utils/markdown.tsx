import { marked, Renderer } from 'marked';

// Allowlisted safe HTML tags
const SAFE_TAGS = new Set([
  'p', 'a', 'strong', 'em', 'b', 'i', 'code', 'pre', 'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'br', 'hr', 'del',
  'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'span', 'div',
  'input', 'sup', 'sub',
]);

// Attributes allowed per tag
const SAFE_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'title', 'width', 'height']),
  td: new Set(['align']),
  th: new Set(['align']),
  input: new Set(['type', 'checked', 'disabled']),
};

// Configure marked with custom renderer
const renderer = new Renderer();
renderer.link = ({ href, title, text }) => {
  const safeHref = isSafeUrl(href || '') ? href : '#';
  const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
  return `<a href="${escapeAttr(safeHref || '')}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
};

marked.use({ renderer, gfm: true, breaks: false });

function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function isSafeUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
    return false;
  }
  return true;
}

/**
 * DOM-based HTML sanitizer using an allowlist of safe tags and attributes.
 * Strips dangerous elements, event handlers, and unsafe URLs.
 */
export function sanitizeHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const container = doc.body.firstChild as HTMLElement;

  if (!container) return '';

  sanitizeNode(container);

  return container.innerHTML;
}

function sanitizeNode(node: Node): void {
  const children = Array.from(node.childNodes);

  for (const child of children) {
    if (child.nodeType === Node.TEXT_NODE) {
      continue;
    }

    if (child.nodeType === Node.COMMENT_NODE) {
      node.removeChild(child);
      continue;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) {
      node.removeChild(child);
      continue;
    }

    const el = child as HTMLElement;
    const tagName = el.tagName.toLowerCase();

    if (!SAFE_TAGS.has(tagName)) {
      node.removeChild(el);
      continue;
    }

    // Remove dangerous attributes
    const allowedAttrs = SAFE_ATTRS[tagName] || new Set<string>();
    const attrsToRemove: string[] = [];

    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      // Remove all on* event handlers
      if (name.startsWith('on')) {
        attrsToRemove.push(attr.name);
      } else if (!allowedAttrs.has(name) && name !== 'class' && name !== 'id') {
        attrsToRemove.push(attr.name);
      }
    }

    for (const attrName of attrsToRemove) {
      el.removeAttribute(attrName);
    }

    // Sanitize URLs in href and src
    if (el.hasAttribute('href') && !isSafeUrl(el.getAttribute('href') || '')) {
      el.setAttribute('href', '#');
    }
    if (el.hasAttribute('src') && !isSafeUrl(el.getAttribute('src') || '')) {
      el.removeAttribute('src');
    }

    // Recursively sanitize children
    sanitizeNode(el);
  }
}

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  if (!content) return null;

  const html = sanitizeHtml(marked.parse(content) as string);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
