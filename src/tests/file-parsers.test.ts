import { describe, it, expect } from 'vitest';
import {
  parseUploadedFile,
  htmlToMarkdown,
  extractPlainText,
} from '../lib/file-parsers';

describe('File Ingestion & Parsing Engine', () => {
  describe('Markdown file parsing', () => {
    it('correctly converts markdown headings, lists, and formatting to HTML', async () => {
      const markdownContent = `
# Engineering Architecture
This is a **bold** statement with *italic* text.

## Action Items
- Item one
- Item two
- Item three
      `.trim();

      const buffer = Buffer.from(markdownContent, 'utf-8');
      const result = await parseUploadedFile('architecture-spec.md', buffer);

      expect(result.format).toBe('markdown');
      expect(result.title).toBe('Architecture spec');
      expect(result.htmlContent).toContain('<h1');
      expect(result.htmlContent).toContain('Engineering Architecture');
      expect(result.htmlContent).toContain('<strong>bold</strong>');
      expect(result.htmlContent).toContain('Item one');
    });
  });

  describe('Plaintext file parsing', () => {
    it('wraps plaintext lines in HTML paragraph tags and escapes HTML symbols', async () => {
      const textContent = `First paragraph.\nSecond line with <script>alert("hack")</script> symbols.`;
      const buffer = Buffer.from(textContent, 'utf-8');
      const result = await parseUploadedFile('meeting_notes.txt', buffer);

      expect(result.format).toBe('text');
      expect(result.title).toBe('Meeting notes');
      expect(result.htmlContent).toContain('<p>First paragraph.</p>');
      expect(result.htmlContent).toContain('&lt;script&gt;');
    });
  });

  describe('HTML to Markdown conversion', () => {
    it('converts rich HTML content into clean Markdown syntax', () => {
      const html = '<h1>Title</h1><p>A paragraph with <strong>bold</strong> text.</p><ul><li>First item</li></ul>';
      const md = htmlToMarkdown(html);

      expect(md).toContain('# Title');
      expect(md).toContain('**bold**');
      expect(md).toMatch(/-\s+First item/);
    });
  });

  describe('Plaintext extraction', () => {
    it('strips all HTML tags while retaining readable text with normalized whitespace', () => {
      const html = '<div><h1>Doc Title</h1><p>Hello <span>world</span>!</p></div>';
      const text = extractPlainText(html);
      expect(text).toBe('Doc Title Hello world !');
    });
  });
});
