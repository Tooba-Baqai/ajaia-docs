import mammoth from 'mammoth';
import { marked } from 'marked';
import TurndownService from 'turndown';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

export interface ParsedFileResult {
  title: string;
  htmlContent: string;
  plainText: string;
  format: 'docx' | 'markdown' | 'text' | 'html' | 'unknown';
}

/**
 * Parses an uploaded file (Buffer or string) into clean HTML and plain text for the editor.
 */
export async function parseUploadedFile(
  filename: string,
  buffer: Buffer
): Promise<ParsedFileResult> {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  const baseTitle = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const capitalizedTitle =
    baseTitle.charAt(0).toUpperCase() + baseTitle.slice(1);

  if (extension === 'docx') {
    const result = await mammoth.convertToHtml({ buffer });
    const htmlContent = result.value || '<p></p>';
    const textResult = await mammoth.extractRawText({ buffer });
    return {
      title: capitalizedTitle,
      htmlContent: htmlContent.length > 0 ? htmlContent : '<p></p>',
      plainText: textResult.value || '',
      format: 'docx',
    };
  }

  const fileString = buffer.toString('utf-8');

  if (extension === 'md' || extension === 'markdown') {
    const html = await marked.parse(fileString);
    return {
      title: capitalizedTitle,
      htmlContent: html || '<p></p>',
      plainText: fileString,
      format: 'markdown',
    };
  }

  if (extension === 'html' || extension === 'htm') {
    return {
      title: capitalizedTitle,
      htmlContent: fileString || '<p></p>',
      plainText: fileString.replace(/<[^>]*>?/gm, ''),
      format: 'html',
    };
  }

  // Fallback to plain text (.txt or other readable text files)
  const lines = fileString.split('\n');
  const htmlParagraphs = lines
    .map((line) => (line.trim() ? `<p>${escapeHtml(line)}</p>` : '<p></p>'))
    .join('');

  return {
    title: capitalizedTitle,
    htmlContent: htmlParagraphs || '<p></p>',
    plainText: fileString,
    format: 'text',
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Converts rich text HTML content to Markdown string
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';
  return turndownService.turndown(html);
}

/**
 * Extracts plain text from HTML
 */
export function extractPlainText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
