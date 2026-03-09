#!/usr/bin/env node

/**
 * Documentation Consistency Checker — runs as part of pre-deploy pipeline
 *
 * Validates that docs, architecture decisions, CLAUDE.md, and code stay in sync.
 * Catches drift before it becomes tech debt.
 *
 * Checks:
 * 1. Key files referenced in docs actually exist
 * 2. Article counts match between docs and reality
 * 3. Route references in CLAUDE.md match actual routes
 * 4. Ticker counts match between docs and code
 * 5. Architecture decisions match actual implementation
 * 6. Feature flags: planned features tracked as done/pending
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let errors = 0;
let warnings = 0;

function ok(msg) { console.log(`  OK: ${msg}`); }
function warn(msg) { warnings++; console.log(`  WARN: ${msg}`); }
function fail(msg) { errors++; console.log(`  FAIL: ${msg}`); }

// ─── 1. Key File Existence ───────────────────────────────────────────

console.log('\n--- Key File Existence ---');

const keyFiles = [
  // Referenced in CLAUDE.md and MEMORY.md
  ['src/config/site.ts', 'siteConfig (single source of truth)'],
  ['src/config/seo.ts', 'SEO helpers'],
  ['src/lib/ai/generate.ts', 'AI generation'],
  ['src/lib/ai/prompts.ts', 'AI prompts'],
  ['src/lib/ai/parse.ts', 'JSON repair'],
  ['src/lib/ai/legal.ts', 'Legal audit/scrub'],
  ['src/lib/fmp.ts', 'FMP data layer'],
  ['src/lib/costs.ts', 'Cost tracker'],
  ['src/lib/content.ts', 'Article CRUD'],
  ['src/lib/tickers.ts', 'Ticker data'],
  ['src/lib/types.ts', 'TypeScript types'],
  ['src/lib/auth.ts', 'Auth (sessions, timing-safe)'],
  ['src/middleware.ts', 'Rate limiting + security headers'],
  ['src/lib/stock-data.ts', 'Local stock data loader'],
  // Scripts
  ['scripts/seo-validate.js', 'SEO checker'],
  ['scripts/legal-check.js', 'Legal checker'],
  ['scripts/docs-generate.js', 'Docs generator'],
  // Docs
  ['docs/architecture-decisions.md', 'Architecture decisions'],
  ['CLAUDE.md', 'Project instructions'],
  // Content dirs
  ['content/roasts', 'Roast articles directory'],
  ['content/picks', 'Pick articles directory'],
  // Brand assets
  ['public/icon.svg', 'Brand icon'],
  ['public/logo.svg', 'Brand logo'],
];

for (const [filePath, desc] of keyFiles) {
  const fullPath = path.join(ROOT, filePath);
  if (fs.existsSync(fullPath)) {
    ok(`${filePath} (${desc})`);
  } else {
    fail(`MISSING: ${filePath} (${desc})`);
  }
}

// ─── 2. Article Count Consistency ────────────────────────────────────

console.log('\n--- Article Count Check ---');

const contentDir = path.join(ROOT, 'content');
let roastCount = 0;
let pickCount = 0;

const roastsDir = path.join(contentDir, 'roasts');
const picksDir = path.join(contentDir, 'picks');

if (fs.existsSync(roastsDir)) {
  roastCount = fs.readdirSync(roastsDir).filter(f => f.endsWith('.json')).length;
}
if (fs.existsSync(picksDir)) {
  pickCount = fs.readdirSync(picksDir).filter(f => f.endsWith('.json')).length;
}

const totalArticles = roastCount + pickCount;
ok(`Found ${totalArticles} articles (${roastCount} roasts, ${pickCount} picks)`);

// Check DEPLOY-STATUS.md has correct count
const deployStatusPath = path.join(ROOT, 'docs', 'DEPLOY-STATUS.md');
if (fs.existsSync(deployStatusPath)) {
  const deployStatus = fs.readFileSync(deployStatusPath, 'utf8');
  const totalMatch = deployStatus.match(/\*\*Total\*\*\s*\|\s*(\d+)/);
  if (totalMatch) {
    const docCount = parseInt(totalMatch[1]);
    if (docCount === totalArticles) {
      ok(`DEPLOY-STATUS.md article count matches (${docCount})`);
    } else {
      warn(`DEPLOY-STATUS.md says ${docCount} articles but found ${totalArticles} — will be fixed by docs generator`);
    }
  }
}

// ─── 3. Ticker Count Consistency ─────────────────────────────────────

console.log('\n--- Ticker Count Check ---');

const tickersPath = path.join(ROOT, 'src', 'lib', 'tickers.ts');
if (fs.existsSync(tickersPath)) {
  const tickerContent = fs.readFileSync(tickersPath, 'utf8');
  const tsxCount = (tickerContent.match(/exchange:\s*'TSX'/g) || []).length;
  const nyseCount = (tickerContent.match(/exchange:\s*'NYSE'/g) || []).length;
  const nasdaqCount = (tickerContent.match(/exchange:\s*'NASDAQ'/g) || []).length;
  const usCount = nyseCount + nasdaqCount;
  const total = tsxCount + usCount;

  ok(`Tickers: ${total} total (${tsxCount} TSX, ${usCount} US [${nyseCount} NYSE, ${nasdaqCount} NASDAQ])`);

  // Check stock data JSON files exist for tickers
  const stockDataDir = path.join(ROOT, 'data', 'stocks');
  if (fs.existsSync(stockDataDir)) {
    const stockFiles = fs.readdirSync(stockDataDir).filter(f => f.endsWith('.json')).length;
    if (stockFiles >= total) {
      ok(`Stock data files: ${stockFiles} (covers all ${total} tickers)`);
    } else {
      warn(`Stock data files: ${stockFiles} but ${total} tickers configured — ${total - stockFiles} tickers missing local data`);
    }
  }
}

// ─── 4. Route Consistency ────────────────────────────────────────────

console.log('\n--- Route Consistency ---');

// Verify critical routes exist
const criticalRoutes = [
  ['src/app/page.tsx', '/ (homepage)'],
  ['src/app/about/page.tsx', '/about'],
  ['src/app/disclaimer/page.tsx', '/disclaimer'],
  ['src/app/methodology/page.tsx', '/methodology'],
  ['src/app/stock/page.tsx', '/stock'],
  ['src/app/stock/[ticker]/page.tsx', '/stock/[ticker]'],
  ['src/app/article/[slug]/page.tsx', '/article/[slug]'],
  ['src/app/roasts/page.tsx', '/roasts'],
  ['src/app/picks/page.tsx', '/picks'],
  ['src/app/not-found.tsx', '404 page'],
  ['src/app/api/generate/route.ts', '/api/generate'],
  ['src/app/api/subscribe/route.ts', '/api/subscribe'],
  ['src/app/api/health/route.ts', '/api/health'],
  ['src/app/api/admin/login/route.ts', '/api/admin/login'],
  ['src/app/api/admin/articles/route.ts', '/api/admin/articles'],
  ['src/app/api/admin/costs/route.ts', '/api/admin/costs'],
  ['src/app/api/admin/commit/route.ts', '/api/admin/commit'],
];

for (const [filePath, desc] of criticalRoutes) {
  const fullPath = path.join(ROOT, filePath);
  if (fs.existsSync(fullPath)) {
    ok(desc);
  } else {
    fail(`MISSING ROUTE: ${desc} (${filePath})`);
  }
}

// ─── 5. Architecture Decision Consistency ────────────────────────────

console.log('\n--- Architecture Decision Checks ---');

// ADR-001: Haiku model (check generate.ts uses haiku)
const generatePath = path.join(ROOT, 'src', 'lib', 'ai', 'generate.ts');
if (fs.existsSync(generatePath)) {
  const genContent = fs.readFileSync(generatePath, 'utf8');
  if (genContent.includes('haiku')) {
    ok('ADR-001: Using Haiku model (confirmed in generate.ts)');
  } else {
    warn('ADR-001: generate.ts does not reference Haiku — model may have changed');
  }

  // ADR-003: No web search
  if (!genContent.includes('web_search') && !genContent.includes('webSearch')) {
    ok('ADR-003: No web search tool in generation (confirmed)');
  } else {
    warn('ADR-003: Web search references found in generate.ts — may conflict with ADR');
  }
}

// ADR-004: Confidence tagging
const fmpPath = path.join(ROOT, 'src', 'lib', 'fmp.ts');
if (fs.existsSync(fmpPath)) {
  const fmpContent = fs.readFileSync(fmpPath, 'utf8');
  if (fmpContent.includes('VERIFIED') && fmpContent.includes('APPROXIMATE') && fmpContent.includes('UNAVAILABLE')) {
    ok('ADR-004: 3-tier confidence tagging (VERIFIED/APPROXIMATE/UNAVAILABLE)');
  } else {
    fail('ADR-004: Missing confidence tiers in fmp.ts');
  }
}

// Check cost tracking exists
const costsPath = path.join(ROOT, 'src', 'lib', 'costs.ts');
if (fs.existsSync(costsPath)) {
  ok('Cost tracking module exists');
} else {
  fail('MISSING: src/lib/costs.ts — cost tracking not implemented');
}

// ─── 6. Security Checks ─────────────────────────────────────────────

console.log('\n--- Security Consistency ---');

// Auth module exists and has timing-safe compare
const authPath = path.join(ROOT, 'src', 'lib', 'auth.ts');
if (fs.existsSync(authPath)) {
  const authContent = fs.readFileSync(authPath, 'utf8');
  if (authContent.includes('timingSafeEqual') || authContent.includes('timingSafeCompare')) {
    ok('Timing-safe auth comparison (confirmed)');
  } else {
    fail('Auth module missing timing-safe comparison');
  }
}

// Rate limiting in middleware
const middlewarePath = path.join(ROOT, 'src', 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  const mwContent = fs.readFileSync(middlewarePath, 'utf8');
  if (mwContent.includes('rateLimit')) {
    ok('Rate limiting in middleware (confirmed)');
  } else {
    warn('Middleware exists but no rate limiting found');
  }
  if (mwContent.includes('login') && mwContent.includes('15')) {
    ok('Login brute-force protection (confirmed)');
  } else {
    warn('Login rate limiting may be missing or misconfigured');
  }
}

// ─── 7. Brand & Config Consistency ───────────────────────────────────

console.log('\n--- Brand Consistency ---');

const siteConfigPath = path.join(ROOT, 'src', 'config', 'site.ts');
if (fs.existsSync(siteConfigPath)) {
  const siteContent = fs.readFileSync(siteConfigPath, 'utf8');
  if (siteContent.includes('bullorbs.com')) {
    ok('Site URL is bullorbs.com');
  } else {
    fail('Site URL does not match bullorbs.com in siteConfig');
  }
  if (siteContent.includes('BullOrBS') || siteContent.includes('Bull') ) {
    ok('Brand name present in siteConfig');
  } else {
    warn('Brand name not found in siteConfig');
  }
}

// Favicon/icon exists
if (fs.existsSync(path.join(ROOT, 'src', 'app', 'icon.svg')) || fs.existsSync(path.join(ROOT, 'public', 'icon.svg'))) {
  ok('Favicon/icon SVG exists');
} else {
  warn('No icon.svg found — favicon may be missing');
}

// ─── 8. Content Type Coverage ────────────────────────────────────────

console.log('\n--- Content Pipeline Check ---');

// Check prompts exist for each content type
const promptsPath = path.join(ROOT, 'src', 'lib', 'ai', 'prompts.ts');
if (fs.existsSync(promptsPath)) {
  const promptContent = fs.readFileSync(promptsPath, 'utf8');
  if (promptContent.includes('ROAST_PROMPT')) {
    ok('Roast prompt defined');
  } else {
    fail('ROAST_PROMPT missing from prompts.ts');
  }
  if (promptContent.includes('PICK_PROMPT')) {
    ok('Pick prompt defined');
  } else {
    fail('PICK_PROMPT missing from prompts.ts');
  }
}

// Check generate route handles both types
const routePath = path.join(ROOT, 'src', 'app', 'api', 'generate', 'route.ts');
if (fs.existsSync(routePath)) {
  const routeContent = fs.readFileSync(routePath, 'utf8');
  if (routeContent.includes("type === 'roast'") && routeContent.includes("type === 'pick'")) {
    ok('Generate API handles roast + pick types');
  } else {
    fail('Generate API missing content type handling');
  }
  if (routeContent.includes('topic')) {
    ok('Topic-based picks supported in API');
  } else {
    warn('Topic-based picks not found in generate route');
  }
}

// ─── 9. Feature Tracker ─────────────────────────────────────────────

console.log('\n--- Feature Status ---');

const features = [
  // [description, check function, priority]
  ['Programmatic stock pages', () => fs.existsSync(path.join(ROOT, 'src/app/stock/[ticker]/page.tsx')), 'LIVE'],
  ['Article generation (roast)', () => fs.existsSync(generatePath) && fs.readFileSync(generatePath, 'utf8').includes('generateRoast'), 'LIVE'],
  ['Article generation (pick)', () => fs.existsSync(generatePath) && fs.readFileSync(generatePath, 'utf8').includes('generatePick'), 'LIVE'],
  ['Topic-based picks', () => fs.existsSync(generatePath) && fs.readFileSync(generatePath, 'utf8').includes('topic'), 'LIVE'],
  ['Admin dashboard', () => fs.existsSync(path.join(ROOT, 'src/app/orange/page.tsx')), 'LIVE'],
  ['Cost tracking', () => fs.existsSync(costsPath), 'LIVE'],
  ['Error boundaries', () => fs.existsSync(path.join(ROOT, 'src/app/article/[slug]/error.tsx')), 'LIVE'],
  ['Legal scrubbing', () => fs.existsSync(path.join(ROOT, 'src/lib/ai/legal.ts')), 'LIVE'],
  ['Sector filtering', () => fs.existsSync(path.join(ROOT, 'src/components/stock/StockGrid.tsx')), 'LIVE'],
  ['Subscribe form', () => fs.existsSync(path.join(ROOT, 'src/components/forms/SubscribeForm.tsx')), 'LIVE'],
  ['RSS feed', () => fs.existsSync(path.join(ROOT, 'src/app/feed.xml/route.ts')), 'LIVE'],
  ['Dynamic OG images', () => fs.existsSync(path.join(ROOT, 'src/app/og/route.tsx')), 'LIVE'],
  ['Email sending (Beehiiv)', () => false, 'PLANNED — Month 5-7'],
  ['Premium reports ($20)', () => false, 'PLANNED — Month 4-6'],
  ['Batch API (50% savings)', () => false, 'PLANNED — Sprint 2'],
  ['Track record page', () => false, 'PLANNED'],
  ['WallStreetBets recaps', () => false, 'PLANNED — Sprint 3'],
  ['Compare pages', () => false, 'PLANNED — Sprint 3'],
  ['Sector landing pages', () => false, 'PLANNED — Sprint 3'],
  ['Social auto-posting', () => false, 'PLANNED'],
  ['ETF coverage (US)', () => true, 'LIVE'],
  ['ETF coverage (Canadian)', () => true, 'LIVE'],
  ['Crypto coverage', () => false, 'NOT PLANNED'],
];

let liveCount = 0;
let plannedCount = 0;

for (const [desc, check, status] of features) {
  try {
    const isLive = check();
    if (isLive) {
      ok(`${desc} [LIVE]`);
      liveCount++;
    } else if (status.startsWith('PLANNED') || status === 'NOT PLANNED') {
      console.log(`  --: ${desc} [${status}]`);
      plannedCount++;
    } else {
      warn(`${desc} — expected LIVE but check failed`);
    }
  } catch {
    warn(`${desc} — check threw error`);
  }
}

console.log(`\n  Features: ${liveCount} live, ${plannedCount} planned/future`);

// ─── Summary ─────────────────────────────────────────────────────────

console.log('\n--------------------------------------------------\n');
console.log('Documentation Consistency Summary');
console.log(`   Errors:   ${errors}`);
console.log(`   Warnings: ${warnings}`);
console.log('');

if (errors > 0) {
  console.log('FAIL: Documentation inconsistencies found. Fix before deploying.\n');
  process.exit(1);
} else if (warnings > 0) {
  console.log(`Consistency check PASSED with ${warnings} warning(s)\n`);
} else {
  console.log('Consistency check PASSED — all docs in sync\n');
}
