import { ArticleContent } from '@/lib/types';
import Anthropic from '@anthropic-ai/sdk';

export function extractText(response: Anthropic.Message): string {
  return response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('');
}

export function parseArticleContent(text: string): ArticleContent {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response as JSON');
  }

  let jsonStr = jsonMatch[0];

  // Fix common AI JSON issues
  // Remove trailing commas before ] or }
  jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
  // Fix unescaped newlines inside strings
  jsonStr = jsonStr.replace(/(?<=":[ ]*"[^"]*)\n(?=[^"]*")/g, '\\n');

  try {
    return JSON.parse(jsonStr);
  } catch {
    // Second pass: more aggressive cleanup
    jsonStr = jsonStr
      .replace(/[\x00-\x1f]/g, (ch) => ch === '\n' || ch === '\t' ? ch : '')
      .replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(jsonStr);
  }
}

export function formatMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>')
    .replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.*)$/, '<p>$1</p>');
}
