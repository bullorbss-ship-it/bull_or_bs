#!/usr/bin/env node
/**
 * Retrofit inline markdown links → footnote references [N] + references array.
 *
 * Usage: node scripts/retrofit-references.js [--dry-run] [--count N]
 *   --dry-run   Show what would change without writing files
 *   --count N   Process last N articles (default: 15)
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const dryRun = process.argv.includes('--dry-run');
const countFlag = process.argv.indexOf('--count');
const maxCount = countFlag >= 0 ? parseInt(process.argv[countFlag + 1], 10) : 15;

// Collect all article JSON files across content subdirs
function getAllArticleFiles() {
  const files = [];
  for (const subdir of ['takes', 'roasts', 'picks']) {
    const dir = path.join(CONTENT_DIR, subdir);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.json')) continue;
      files.push(path.join(dir, file));
    }
  }
  // Sort by modification time (newest first)
  files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return files;
}

// Extract markdown links and build references
function extractAndReplace(text, refs) {
  if (!text || typeof text !== 'string') return text;

  // Match [text](https://url) patterns
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;

  let result = text;
  const matches = [...text.matchAll(linkRegex)];

  if (matches.length === 0) return text;

  // Process matches in reverse order to preserve indices
  // First, collect all replacements
  const replacements = [];
  for (const match of matches) {
    const fullMatch = match[0];
    const linkText = match[1];
    const url = match[2];

    // Find or create reference for this URL
    let ref = refs.find(r => r.url === url);
    if (!ref) {
      const id = refs.length + 1;
      // Build a short source label from the URL domain + link text
      const domain = extractDomain(url);
      const source = `${domain} — ${truncate(linkText, 60)}`;
      ref = { id, source, url };
      refs.push(ref);
    }

    replacements.push({ fullMatch, linkText, refId: ref.id });
  }

  // Apply replacements (simple string replace, handles duplicates)
  for (const { fullMatch, linkText, refId } of replacements) {
    result = result.replace(fullMatch, `${linkText} [${refId}]`);
  }

  return result;
}

// Strip markdown links to plain text (for description/verdict — no footnotes)
function stripLinks(text) {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, '$1');
}

function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    // Capitalize first letter of each part
    const parts = hostname.split('.');
    return parts.slice(0, -1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('.') || hostname;
  } catch {
    return 'Source';
  }
}

function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

function hasInlineLinks(text) {
  if (!text || typeof text !== 'string') return false;
  return /\[[^\]]+\]\(https?:\/\/[^)]+\)/.test(text);
}

function processArticle(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const article = JSON.parse(raw);
  const content = article.content;
  if (!content) return false;

  // Check if article has any inline links to convert
  const fieldsToCheck = [
    content.analysis,
    content.summary,
    content.finalVerdict,
    ...(content.risks || []),
    ...(content.catalysts || []).map(c => typeof c === 'string' ? c : c.claimed),
    article.description,
    article.verdict,
  ];

  const hasLinks = fieldsToCheck.some(f => hasInlineLinks(f));
  if (!hasLinks) {
    return false; // Already clean or no links
  }

  // Already has references — skip
  if (content.references && content.references.length > 0) {
    return false;
  }

  const refs = [];

  // Convert content fields to footnote style
  content.analysis = extractAndReplace(content.analysis, refs);
  content.summary = extractAndReplace(content.summary, refs);
  content.finalVerdict = extractAndReplace(content.finalVerdict, refs);

  if (content.risks) {
    content.risks = content.risks.map(r => extractAndReplace(r, refs));
  }
  if (content.catalysts) {
    content.catalysts = content.catalysts.map(c => {
      if (typeof c === 'string') return extractAndReplace(c, refs);
      return { ...c, claimed: extractAndReplace(c.claimed, refs) };
    });
  }

  // Strip links from meta fields (no footnotes in meta descriptions)
  article.description = stripLinks(article.description);
  article.verdict = stripLinks(article.verdict);

  // Add references array
  content.references = refs;

  return { article, refCount: refs.length };
}

// Main
const files = getAllArticleFiles().slice(0, maxCount);
let processed = 0;
let totalRefs = 0;

console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Processing last ${maxCount} articles...\n`);

for (const filePath of files) {
  const fileName = path.basename(filePath);
  const result = processArticle(filePath);

  if (!result) {
    console.log(`  SKIP  ${fileName} (no inline links or already converted)`);
    continue;
  }

  const { article, refCount } = result;
  console.log(`  CONVERT  ${fileName} → ${refCount} references`);
  totalRefs += refCount;
  processed++;

  if (!dryRun) {
    fs.writeFileSync(filePath, JSON.stringify(article, null, 2) + '\n');
  }
}

console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Done: ${processed} articles converted, ${totalRefs} total references extracted.\n`);
