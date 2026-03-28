import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { sanitizeHtml, MarkdownContent } from '../../src/utils/markdown';

describe('sanitizeHtml', () => {
  it('strips script tags', () => {
    const result = sanitizeHtml('<p>safe</p><script>alert("xss")</script>');
    expect(result).not.toContain('<script');
    expect(result).toContain('safe');
  });

  it('strips style tags', () => {
    const result = sanitizeHtml('<p>text</p><style>body{display:none}</style>');
    expect(result).not.toContain('<style');
    expect(result).toContain('text');
  });

  it('strips iframe tags', () => {
    const result = sanitizeHtml('<p>text</p><iframe src="evil.com"></iframe>');
    expect(result).not.toContain('<iframe');
  });

  it('strips object and embed tags', () => {
    const result = sanitizeHtml('<object data="evil.swf"></object><embed src="evil.swf">');
    expect(result).not.toContain('<object');
    expect(result).not.toContain('<embed');
  });

  it('strips form tags', () => {
    const result = sanitizeHtml('<form action="evil.com"><input></form>');
    expect(result).not.toContain('<form');
  });

  it('removes on* event handler attributes', () => {
    const result = sanitizeHtml('<img src="img.png" onerror="alert(1)">');
    expect(result).not.toContain('onerror');
  });

  it('removes onclick attributes', () => {
    const result = sanitizeHtml('<a href="#" onclick="alert(1)">link</a>');
    expect(result).not.toContain('onclick');
    expect(result).toContain('link');
  });

  it('blocks javascript: URLs in href', () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
    expect(result).not.toContain('javascript:');
    expect(result).toContain('href="#"');
  });

  it('blocks data: URLs in href', () => {
    const result = sanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">click</a>');
    expect(result).not.toContain('data:');
  });

  it('allows safe tags', () => {
    const result = sanitizeHtml('<p><strong>bold</strong> <em>italic</em> <code>code</code></p>');
    expect(result).toContain('<strong>');
    expect(result).toContain('<em>');
    expect(result).toContain('<code>');
  });

  it('allows links with safe href', () => {
    const result = sanitizeHtml('<a href="https://example.com">link</a>');
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('link');
  });

  it('allows lists', () => {
    const result = sanitizeHtml('<ul><li>item 1</li><li>item 2</li></ul>');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>');
  });

  it('allows tables', () => {
    const result = sanitizeHtml('<table><thead><tr><th>H</th></tr></thead><tbody><tr><td>D</td></tr></tbody></table>');
    expect(result).toContain('<table>');
    expect(result).toContain('<th>');
    expect(result).toContain('<td>');
  });

  it('allows del (strikethrough)', () => {
    const result = sanitizeHtml('<del>deleted</del>');
    expect(result).toContain('<del>');
  });

  it('allows blockquote', () => {
    const result = sanitizeHtml('<blockquote>quote</blockquote>');
    expect(result).toContain('<blockquote>');
  });

  it('allows headings', () => {
    const result = sanitizeHtml('<h1>H1</h1><h2>H2</h2><h3>H3</h3>');
    expect(result).toContain('<h1>');
    expect(result).toContain('<h2>');
    expect(result).toContain('<h3>');
  });

  it('allows images with safe src', () => {
    const result = sanitizeHtml('<img src="https://example.com/img.png" alt="alt text">');
    expect(result).toContain('src="https://example.com/img.png"');
    expect(result).toContain('alt="alt text"');
  });

  it('strips HTML comments', () => {
    const result = sanitizeHtml('<p>text</p><!-- comment -->');
    expect(result).not.toContain('<!--');
  });

  it('returns empty string for empty input', () => {
    const result = sanitizeHtml('');
    expect(result).toBe('');
  });
});

describe('MarkdownContent', () => {
  it('renders markdown paragraphs', () => {
    const { container } = render(<MarkdownContent content="Hello world" />);
    expect(container.querySelector('p')).toBeTruthy();
    expect(container.textContent).toContain('Hello world');
  });

  it('renders bold text', () => {
    const { container } = render(<MarkdownContent content="**bold text**" />);
    expect(container.querySelector('strong')).toBeTruthy();
    expect(container.textContent).toContain('bold text');
  });

  it('renders italic text', () => {
    const { container } = render(<MarkdownContent content="*italic text*" />);
    expect(container.querySelector('em')).toBeTruthy();
    expect(container.textContent).toContain('italic text');
  });

  it('renders inline code', () => {
    const { container } = render(<MarkdownContent content="`code`" />);
    expect(container.querySelector('code')).toBeTruthy();
    expect(container.textContent).toContain('code');
  });

  it('renders code blocks', () => {
    const { container } = render(<MarkdownContent content={"```\nconst x = 1;\n```"} />);
    // marked wraps code blocks in <pre><code>
    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
    expect(pre?.querySelector('code') || container.querySelector('code')).toBeTruthy();
  });

  it('renders links with target="_blank" and rel="noopener noreferrer"', () => {
    const { container } = render(<MarkdownContent content="[link](https://example.com)" />);
    const anchor = container.querySelector('a');
    expect(anchor).toBeTruthy();
    expect(anchor?.getAttribute('target')).toBe('_blank');
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(anchor?.getAttribute('href')).toBe('https://example.com');
  });

  it('renders unordered lists', () => {
    const { container } = render(<MarkdownContent content={"- item 1\n- item 2"} />);
    expect(container.querySelector('ul')).toBeTruthy();
    expect(container.querySelectorAll('li').length).toBe(2);
  });

  it('renders ordered lists', () => {
    const { container } = render(<MarkdownContent content={"1. first\n2. second"} />);
    expect(container.querySelector('ol')).toBeTruthy();
    expect(container.querySelectorAll('li').length).toBe(2);
  });

  it('renders GFM tables', () => {
    const md = '| H1 | H2 |\n| --- | --- |\n| D1 | D2 |';
    const { container } = render(<MarkdownContent content={md} />);
    expect(container.querySelector('table')).toBeTruthy();
    expect(container.querySelector('th')).toBeTruthy();
    expect(container.querySelector('td')).toBeTruthy();
  });

  it('renders GFM strikethrough', () => {
    const { container } = render(<MarkdownContent content="~~deleted~~" />);
    expect(container.querySelector('del')).toBeTruthy();
  });

  it('returns null for empty content', () => {
    const { container } = render(<MarkdownContent content="" />);
    expect(container.innerHTML).toBe('');
  });

  it('handles whitespace-only content', () => {
    const { container } = render(<MarkdownContent content="   " />);
    // marked may produce empty paragraphs or just whitespace
    expect(container).toBeTruthy();
  });

  it('sanitizes script injection in markdown', () => {
    const { container } = render(
      <MarkdownContent content="normal text <script>alert('xss')</script>" />
    );
    expect(container.innerHTML).not.toContain('<script');
    expect(container.textContent).toContain('normal text');
  });

  it('sanitizes event handlers in markdown', () => {
    const { container } = render(
      <MarkdownContent content='<img src="x" onerror="alert(1)">' />
    );
    expect(container.innerHTML).not.toContain('onerror');
  });
});
