/** Convert markdown links, bold, italic, and footnote markers to HTML. Safe for client components. */
export function inlineFormat(text: string): string {
  return text
    // Markdown links [text](url) → clickable anchor (legacy articles that still have inline links)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">$1</a>')
    // Footnote markers [1], [2], etc. → superscript reference
    .replace(/\[(\d{1,3})\]/g, '<sup class="text-accent font-mono text-[10px] ml-0.5">[$1]</sup>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}
