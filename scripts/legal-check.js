#!/usr/bin/env node

/**
 * Legal Compliance Check — runs before every deploy
 * Usage: npm run legal-check
 *
 * Checks:
 * 1. No competitor trademarks in branding/UI (protected zones)
 * 2. Disclaimers present on all required pages
 * 3. Anonymity — no personal info in codebase
 * 4. All articles pass legal audit (no competitor names in protected fields)
 * 5. No "buy" / "sell" directives (Canadian compliance)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let errors = 0;
let warnings = 0;

function error(msg) { console.error(`  FAIL: ${msg}`); errors++; }
function warn(msg) { console.warn(`  WARN: ${msg}`); warnings++; }
function pass(msg) { console.log(`  OK: ${msg}`); }

// Competitor names that must NOT appear in protected zones
const COMPETITOR_NAMES = [
  'Motley Fool', 'The Motley Fool', 'Fool.ca',
  'Seeking Alpha', 'Zacks',
  'Globe and Mail', 'The Globe and Mail',
  'BNN Bloomberg', "Barron's", 'MarketWatch',
  'Jim Cramer', 'Mad Money', 'CNBC Stock Picks',
];

const COMPETITOR_REGEX = new RegExp(
  COMPETITOR_NAMES.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'gi'
);

// ─── 1. Protected UI zones: no competitor names ─────────────────────

console.log('\n--- Trademark Check (Protected Zones) ---');

const PROTECTED_FILES = [
  'src/config/site.ts',
  'src/config/seo.ts',
  'src/app/layout.tsx',
  'src/components/layout/Header.tsx',
  'src/components/layout/Footer.tsx',
  'src/app/page.tsx',
  'src/app/not-found.tsx',
  'src/app/about/page.tsx',
  'src/app/disclaimer/page.tsx',
  'src/app/methodology/page.tsx',
];

for (const relPath of PROTECTED_FILES) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) continue;

  const content = fs.readFileSync(fullPath, 'utf8');
  const matches = content.match(COMPETITOR_REGEX);
  if (matches) {
    // Filter out matches inside comments or the legal audit module itself
    const uniqueMatches = [...new Set(matches.map(m => m.toLowerCase()))];
    error(`${relPath}: competitor name(s) in protected zone: ${uniqueMatches.join(', ')}`);
  } else {
    pass(`${relPath}: clean`);
  }
}

// ─── 2. Article JSON audit ──────────────────────────────────────────

console.log('\n--- Article Legal Audit ---');

const contentDir = path.join(ROOT, 'content');
let articleCount = 0;
let articleViolations = 0;

function checkArticle(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const relPath = path.relative(ROOT, filePath);
  articleCount++;

  // Protected fields in articles
  const protectedFields = ['headline', 'summary', 'finalVerdict', 'foolClaim'];
  const violations = [];

  for (const field of protectedFields) {
    const val = data.content?.[field];
    if (typeof val !== 'string') continue;

    COMPETITOR_REGEX.lastIndex = 0;
    if (COMPETITOR_REGEX.test(val)) {
      violations.push(`${field}`);
      COMPETITOR_REGEX.lastIndex = 0;
    }
  }

  // Also check top-level title/description
  for (const field of ['title', 'description']) {
    if (typeof data[field] !== 'string') continue;
    COMPETITOR_REGEX.lastIndex = 0;
    if (COMPETITOR_REGEX.test(data[field])) {
      violations.push(`top-level ${field}`);
      COMPETITOR_REGEX.lastIndex = 0;
    }
  }

  if (violations.length > 0) {
    error(`${relPath}: competitor names in ${violations.join(', ')}`);
    articleViolations++;
  } else {
    pass(`${relPath}: clean`);
  }
}

for (const type of ['roasts', 'picks']) {
  const dir = path.join(contentDir, type);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    checkArticle(path.join(dir, file));
  }
}

if (articleCount === 0) {
  warn('No articles found to audit');
} else {
  pass(`${articleCount} articles scanned, ${articleViolations} with violations`);
}

// ─── 3. Disclaimer checks ──────────────────────────────────────────

console.log('\n--- Disclaimer Presence ---');

const DISCLAIMER_PAGES = [
  { path: 'src/app/disclaimer/page.tsx', desc: 'Disclaimer page' },
  { path: 'src/components/article/Verdict.tsx', desc: 'Article verdict disclaimer' },
  { path: 'src/components/layout/Footer.tsx', desc: 'Footer disclaimer' },
];

for (const { path: relPath, desc } of DISCLAIMER_PAGES) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    error(`${desc}: file missing (${relPath})`);
    continue;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const hasDisclaimer = content.toLowerCase().includes('not financial advice') ||
    content.toLowerCase().includes('not affiliated') ||
    content.toLowerCase().includes('disclaimer') ||
    content.toLowerCase().includes('educational');

  if (hasDisclaimer) {
    pass(`${desc}: disclaimer present`);
  } else {
    error(`${desc}: no disclaimer language found`);
  }
}

// ─── 4. Anonymity check ─────────────────────────────────────────────

console.log('\n--- Anonymity Check ---');

// Patterns that should NEVER appear in source code
const ANON_PATTERNS = [
  // Add personal identifiers here if needed (emails, real names, etc.)
  // Keeping this generic — checks for common leaks
];

// Check git config isn't leaking identity
const gitConfigPath = path.join(ROOT, '.git', 'config');
if (fs.existsSync(gitConfigPath)) {
  const gitConfig = fs.readFileSync(gitConfigPath, 'utf8');
  if (gitConfig.includes('bullorbss-ship-it') || gitConfig.includes('bull.or.bss@gmail.com')) {
    pass('Git config: correct anonymous identity');
  } else {
    warn('Git config: review user identity — may expose personal info');
  }
}

// Scan for hardcoded emails that aren't the project email
function scanForLeaks(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanForLeaks(fullPath);
    } else if (entry.name.match(/\.(ts|tsx|js|jsx|json)$/) && !entry.name.includes('package-lock')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      // Check for email patterns that aren't the project email
      const emails = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      const nonProjectEmails = emails.filter(e =>
        e !== 'bull.or.bss@gmail.com' &&
        e !== 'noreply@anthropic.com' &&
        e !== 'noreply@github.com' &&
        !e.includes('example.com')
      );
      if (nonProjectEmails.length > 0) {
        const relPath = path.relative(ROOT, fullPath);
        warn(`${relPath}: found non-project email(s): ${nonProjectEmails.join(', ')}`);
      }
    }
  }
}

scanForLeaks(path.join(ROOT, 'src'));
scanForLeaks(path.join(ROOT, 'content'));
pass('Anonymity scan complete');

// ─── 5. Canadian compliance: no direct buy/sell directives ──────────

console.log('\n--- Canadian Compliance ---');

const DIRECTIVE_PATTERNS = [
  /\byou should buy\b/gi,
  /\byou must buy\b/gi,
  /\bbuy this stock\b/gi,
  /\bsell immediately\b/gi,
  /\bguaranteed returns\b/gi,
  /\bcan't lose\b/gi,
  /\brisk.free\b/gi,
];

let directiveViolations = 0;

for (const type of ['roasts', 'picks']) {
  const dir = path.join(contentDir, type);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const allText = JSON.stringify(data);

    for (const pattern of DIRECTIVE_PATTERNS) {
      pattern.lastIndex = 0;
      const matches = allText.match(pattern);
      if (matches) {
        error(`${type}/${file}: directive language found: "${matches[0]}"`);
        directiveViolations++;
      }
    }
  }
}

if (directiveViolations === 0) {
  pass('No direct buy/sell directives found in articles');
}

// ─── Summary ────────────────────────────────────────────────────────

console.log('\n' + '-'.repeat(50));
console.log('\nLegal Compliance Summary');
console.log(`   Errors:   ${errors}`);
console.log(`   Warnings: ${warnings}`);

if (errors > 0) {
  console.log(`\nLegal check FAILED -- fix ${errors} error(s) before deploy\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`\nLegal check PASSED with ${warnings} warning(s)\n`);
  process.exit(0);
} else {
  console.log(`\nLegal check PASSED -- all clear\n`);
  process.exit(0);
}
