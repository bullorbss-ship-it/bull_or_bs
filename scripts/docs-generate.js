#!/usr/bin/env node

/**
 * Auto-documentation generator — runs before every deploy
 * Usage: npm run docs
 *
 * Generates docs/DEPLOY-STATUS.md with current project state:
 * - Article inventory
 * - Route map
 * - Cost summary
 * - Data coverage
 * - Legal status
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUTPUT = path.join(ROOT, 'docs', 'DEPLOY-STATUS.md');

const lines = [];
function h1(t) { lines.push(`# ${t}`, ''); }
function h2(t) { lines.push(`## ${t}`, ''); }
function h3(t) { lines.push(`### ${t}`, ''); }
function p(t) { lines.push(t, ''); }
function row(...cols) { lines.push(`| ${cols.join(' | ')} |`); }
function hr() { lines.push('---', ''); }

const now = new Date().toISOString();

h1('BullOrBS Deploy Status');
p(`*Auto-generated: ${now}*`);
hr();

// ─── Article Inventory ──────────────────────────────────────────────

h2('Article Inventory');

const contentDir = path.join(ROOT, 'content');
const articles = { roasts: [], picks: [] };

for (const type of ['roasts', 'picks']) {
  const dir = path.join(contentDir, type);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      articles[type].push({
        slug: data.slug,
        title: data.title,
        date: data.date,
        ticker: data.ticker || '-',
      });
    } catch {
      articles[type].push({ slug: file, title: 'PARSE ERROR', date: '-', ticker: '-' });
    }
  }
}

row('Type', 'Count');
row('---', '---');
row('Roasts', articles.roasts.length);
row('Picks', articles.picks.length);
row('**Total**', articles.roasts.length + articles.picks.length);
lines.push('');

if (articles.roasts.length > 0) {
  h3('Roasts');
  row('Date', 'Ticker', 'Title');
  row('---', '---', '---');
  for (const a of articles.roasts.sort((a, b) => b.date.localeCompare(a.date))) {
    row(a.date, a.ticker, a.title.substring(0, 60));
  }
  lines.push('');
}

if (articles.picks.length > 0) {
  h3('Picks');
  row('Date', 'Ticker', 'Title');
  row('---', '---', '---');
  for (const a of articles.picks.sort((a, b) => b.date.localeCompare(a.date))) {
    row(a.date, a.ticker, a.title.substring(0, 60));
  }
  lines.push('');
}

// ─── Route Map ──────────────────────────────────────────────────────

h2('Route Map');

const routes = [];
function scanRoutes(dir, prefix) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
        routes.push(prefix || '/');
      }
      if (entry.name === 'route.ts' || entry.name === 'route.tsx') {
        routes.push(`${prefix || '/'} (API)`);
      }
      continue;
    }
    if (entry.name === 'api') {
      scanRoutes(path.join(dir, entry.name), `${prefix}/api`);
    } else {
      scanRoutes(path.join(dir, entry.name), `${prefix}/${entry.name}`);
    }
  }
}

scanRoutes(path.join(ROOT, 'src', 'app'), '');
routes.sort();

row('Route', 'Type');
row('---', '---');
for (const r of routes) {
  const isApi = r.includes('(API)');
  row(r.replace(' (API)', ''), isApi ? 'API' : 'Page');
}
lines.push('');

// ─── Ticker Coverage ────────────────────────────────────────────────

h2('Ticker Coverage');

const tickersPath = path.join(ROOT, 'src', 'lib', 'tickers.ts');
if (fs.existsSync(tickersPath)) {
  const content = fs.readFileSync(tickersPath, 'utf8');
  const tsxCount = (content.match(/exchange:\s*'TSX'/g) || []).length;
  const usCount = (content.match(/exchange:\s*'(NYSE|NASDAQ)'/g) || []).length;
  row('Market', 'Count');
  row('---', '---');
  row('TSX', tsxCount);
  row('NYSE/NASDAQ', usCount);
  row('**Total**', tsxCount + usCount);
  lines.push('');
}

// ─── Cost Summary ───────────────────────────────────────────────────

h2('Cost Summary');

const costsPath = path.join(ROOT, 'data', 'costs.json');
if (fs.existsSync(costsPath)) {
  try {
    const costs = JSON.parse(fs.readFileSync(costsPath, 'utf8'));
    if (Array.isArray(costs) && costs.length > 0) {
      const totalCost = costs.reduce((sum, c) => sum + (c.costUsd || 0), 0);
      const avgCost = totalCost / costs.length;
      row('Metric', 'Value');
      row('---', '---');
      row('Total runs', costs.length);
      row('Total cost', `$${totalCost.toFixed(4)}`);
      row('Avg cost/run', `$${avgCost.toFixed(4)}`);
      row('Model', costs[costs.length - 1]?.model || 'unknown');
      row('Projected yearly (500 articles)', `$${(avgCost * 500).toFixed(2)}`);
      lines.push('');
    } else {
      p('No cost data recorded yet.');
    }
  } catch {
    p('Cost data file exists but could not be parsed.');
  }
} else {
  p('No cost data file found.');
}

// ─── Pipeline Status ────────────────────────────────────────────────

h2('Pipeline Gates');

row('Gate', 'Command', 'Status');
row('---', '---', '---');
row('TypeScript', '`npm run type-check`', 'Automated');
row('Lint', '`npm run lint`', 'Automated');
row('SAST', '`npm run security`', 'Automated');
row('SEO', '`npm run seo-check`', 'Automated');
row('Legal', '`npm run legal-check`', 'Automated');
row('Docs', '`npm run docs`', 'Automated');
lines.push('');

// ─── Tech Stack ─────────────────────────────────────────────────────

h2('Tech Stack');

try {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const key = ['next', 'react', '@anthropic-ai/sdk', 'tailwindcss', 'typescript'];
  row('Package', 'Version');
  row('---', '---');
  for (const k of key) {
    if (deps[k]) row(k, deps[k]);
  }
  lines.push('');
} catch {
  p('Could not read package.json');
}

// ─── Write Output ───────────────────────────────────────────────────

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, lines.join('\n'));
console.log(`\nDocs generated: docs/DEPLOY-STATUS.md`);
console.log(`  Articles: ${articles.roasts.length + articles.picks.length}`);
console.log(`  Routes: ${routes.length}`);
