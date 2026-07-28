#!/usr/bin/env node

/**
 * Content Audit Script
 * Scans learn pages and article content for stale audit dates.
 * Run: node scripts/content-audit.js
 *
 * Checks:
 * 1. Learn pages — flags any with "Last verified" date older than 6 months
 * 2. Stock profiles — flags any with lastUpdated older than 3 months
 * 3. Article evidence and approval summary
 */

const fs = require('fs');
const path = require('path');

const LEARN_DIR = path.join(__dirname, '..', 'src', 'app', 'learn');
const STOCKS_DIR = path.join(__dirname, '..', 'data', 'stocks');
const CONTENT_DIR = path.join(__dirname, '..', 'content');

const NOW = new Date();
const SIX_MONTHS_AGO = new Date(NOW);
SIX_MONTHS_AGO.setMonth(SIX_MONTHS_AGO.getMonth() - 6);
const THREE_MONTHS_AGO = new Date(NOW);
THREE_MONTHS_AGO.setMonth(THREE_MONTHS_AGO.getMonth() - 3);

let issues = 0;
let warnings = 0;

function heading(text) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${text}`);
  console.log('='.repeat(60));
}

function warn(msg) {
  warnings++;
  console.log(`  ⚠  ${msg}`);
}

function fail(msg) {
  issues++;
  console.log(`  ✗  ${msg}`);
}

function pass(msg) {
  console.log(`  ✓  ${msg}`);
}

// --- 1. Learn Pages Audit ---
heading('Learn Pages — Audit Date Check');

function scanLearnPages(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const pagePath = path.join(dir, entry.name, 'page.tsx');
      if (fs.existsSync(pagePath)) {
        const content = fs.readFileSync(pagePath, 'utf-8');
        const match = content.match(/Last verified:\s*(\w+ \d{4})/);
        if (match) {
          const dateStr = match[1]; // e.g. "March 2026"
          const parsed = new Date(`1 ${dateStr}`);
          if (isNaN(parsed.getTime())) {
            warn(`/learn/${entry.name} — could not parse date: "${dateStr}"`);
          } else if (parsed < SIX_MONTHS_AGO) {
            fail(`/learn/${entry.name} — STALE (last verified ${dateStr}, over 6 months ago)`);
          } else {
            pass(`/learn/${entry.name} — OK (verified ${dateStr})`);
          }
        } else {
          fail(`/learn/${entry.name} — MISSING "Last verified" date`);
        }
      }
    }
  }
}

scanLearnPages(LEARN_DIR);

// --- 2. Stock Profiles Audit ---
heading('Stock Profiles — Freshness Check');

let totalProfiles = 0;
let staleProfiles = 0;
let missingDate = 0;

if (fs.existsSync(STOCKS_DIR)) {
  const files = fs.readdirSync(STOCKS_DIR).filter(f => f.endsWith('.json'));
  totalProfiles = files.length;

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(STOCKS_DIR, file), 'utf-8'));
      if (data.lastUpdated) {
        const updated = new Date(data.lastUpdated);
        if (updated < THREE_MONTHS_AGO) {
          staleProfiles++;
        }
      } else {
        missingDate++;
      }
    } catch {
      warn(`Could not parse ${file}`);
    }
  }

  if (staleProfiles > 0) {
    warn(`${staleProfiles}/${totalProfiles} profiles older than 3 months`);
  } else {
    pass(`All ${totalProfiles} profiles within 3 months`);
  }
  if (missingDate > 0) {
    warn(`${missingDate}/${totalProfiles} profiles missing lastUpdated field`);
  }
} else {
  warn('No data/stocks/ directory found');
}

// --- 3. Article Summary ---
heading('Article Summary');

function countArticles(dir) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).length;
}

const roasts = countArticles(path.join(CONTENT_DIR, 'roasts'));
const picks = countArticles(path.join(CONTENT_DIR, 'picks'));
const takes = countArticles(path.join(CONTENT_DIR, 'takes'));
pass(`Roasts: ${roasts}`);
pass(`Picks: ${picks}`);
pass(`Takes: ${takes}`);
pass(`Total articles: ${roasts + picks + takes}`);

let legacyBriefings = 0;
let approvedEditorial = 0;
let invalidApproved = 0;
let legacyIndexable = 0;
for (const type of ['roasts', 'picks', 'takes']) {
  const dir = path.join(CONTENT_DIR, type);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const article = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    if (article.tags?.includes('daily-briefing') && article.editorialReview?.status !== 'approved') {
      legacyBriefings++;
    }
    if (article.editorialReview?.status === 'approved') {
      approvedEditorial++;
      const references = article.content?.references || [];
      const dataPoints = article.content?.dataPoints || [];
      const refsValid = references.length >= 3 && references.every(r => /^https?:\/\//.test(r.url || ''));
      const dataValid = dataPoints.length >= 3 && dataPoints.every(d => d.source && /^https?:\/\//.test(d.sourceUrl || ''));
      if (!article.factChecked || !refsValid || !dataValid) invalidApproved++;
    } else if (!article.tags?.includes('daily-briefing') && article.factChecked === true) {
      const references = article.content?.references || [];
      const words = (article.content?.analysis || '').split(/\s+/).filter(Boolean).length;
      if (words >= 500 && references.length >= 3 && references.every(r => /^https?:\/\//.test(r.url || ''))) {
        legacyIndexable++;
      }
    }
  }
}
pass(`${legacyBriefings} legacy daily briefings are excluded from indexing until reviewed`);
pass(`${approvedEditorial} approval-first editorial articles published`);
pass(`${legacyIndexable} legacy articles meet the temporary evidence threshold for indexing`);
if (invalidApproved > 0) {
  fail(`${invalidApproved} approved editorial articles fail evidence requirements`);
}

// --- Summary ---
heading('Audit Summary');
if (issues > 0) {
  console.log(`  ${issues} issue(s) found — content needs updating`);
} else {
  console.log('  All content is current');
}
if (warnings > 0) {
  console.log(`  ${warnings} warning(s)`);
}
console.log('');

process.exit(issues > 0 ? 1 : 0);
