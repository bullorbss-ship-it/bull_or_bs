#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PLAN_DIR = path.join(ROOT, 'data', 'editorial', 'plans');
const DRAFT_DIR = path.join(ROOT, 'data', 'editorial', 'drafts');
const validTypes = new Set(['comparison', 'recommendation-audit', 'canadian-guide']);
const validItemStatuses = new Set(['planned', 'researching', 'drafted', 'approved', 'rejected', 'published']);
let failures = 0;

function fail(file, message) {
  failures++;
  console.error(`  FAIL: ${file}: ${message}`);
}

function ok(message) {
  console.log(`  OK: ${message}`);
}

function jsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory)
    .filter(file => file.endsWith('.json'))
    .sort()
    .map(file => ({
      name: file,
      value: JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8')),
    }));
}

function businessDates(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  if (!year || monthNumber < 1 || monthNumber > 12) return [];
  const dates = [];
  const cursor = new Date(Date.UTC(year, monthNumber - 1, 1, 12));
  while (cursor.getUTCMonth() === monthNumber - 1) {
    const day = cursor.getUTCDay();
    if (day >= 1 && day <= 5) dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function validHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function wordCount(value) {
  return String(value || '').split(/\s+/).filter(Boolean).length;
}

function normalizedTitle(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

const plans = new Map();
for (const { name, value: plan } of jsonFiles(PLAN_DIR)) {
  const label = `plans/${name}`;
  if (!/^\d{4}-\d{2}$/.test(plan.month || '')) {
    fail(label, 'month must use YYYY-MM');
    continue;
  }
  if (name !== `${plan.month}.json`) fail(label, 'filename must match plan month');
  if (!['pending_approval', 'approved', 'rejected'].includes(plan.status)) {
    fail(label, 'invalid plan status');
  }
  if (!plan.createdAt || !plan.model) fail(label, 'createdAt and model are required');
  const expectedDates = businessDates(plan.month);
  if (!Array.isArray(plan.items) || plan.items.length !== expectedDates.length) {
    fail(label, `must contain ${expectedDates.length} weekday assignments`);
    continue;
  }

  const ids = new Set();
  const titles = new Set();
  const types = { comparison: 0, 'recommendation-audit': 0, 'canadian-guide': 0 };
  plan.items.forEach((item, index) => {
    if (!item.id || ids.has(item.id)) fail(label, `item ${index + 1} has a missing or duplicate ID`);
    ids.add(item.id);
    if (item.publishDate !== expectedDates[index]) {
      fail(label, `item ${index + 1} must use ${expectedDates[index]}`);
    }
    if (!validTypes.has(item.type)) fail(label, `item ${index + 1} has an invalid type`);
    else types[item.type]++;
    if (!validItemStatuses.has(item.status)) fail(label, `item ${index + 1} has an invalid status`);
    for (const field of ['title', 'primaryKeyword', 'angle', 'whyNow', 'uniqueAsset']) {
      if (typeof item[field] !== 'string' || item[field].trim().length < 8) {
        fail(label, `item ${index + 1} has a weak ${field}`);
      }
    }
    const title = normalizedTitle(item.title);
    if (titles.has(title)) fail(label, `item ${index + 1} duplicates another title`);
    titles.add(title);
    if (!Array.isArray(item.tickers) || item.tickers.length > 4) {
      fail(label, `item ${index + 1} must have zero to four tickers`);
    }
  });

  const minimumComparison = Math.floor(plan.items.length * 0.5);
  const minimumOther = Math.floor(plan.items.length * 0.15);
  if (types.comparison < minimumComparison) fail(label, 'at least half of assignments must be comparisons');
  if (types['recommendation-audit'] < minimumOther) fail(label, 'recommendation audits are underrepresented');
  if (types['canadian-guide'] < minimumOther) fail(label, 'Canadian guides are underrepresented');
  plans.set(plan.month, plan);
  ok(`${label} has ${plan.items.length} valid weekday assignments`);
}

for (const { name, value: draft } of jsonFiles(DRAFT_DIR)) {
  const label = `drafts/${name}`;
  const plan = plans.get(draft.planMonth);
  const item = plan?.items?.find(candidate => candidate.id === draft.planItemId);
  if (!plan || !item) fail(label, 'planMonth/planItemId does not resolve to a plan item');
  if (draft.id !== name.replace(/\.json$/, '')) fail(label, 'filename must match draft ID');
  if (!['pending_approval', 'rejected', 'published'].includes(draft.status)) {
    fail(label, 'invalid draft status');
  }
  if (!draft.createdAt || !draft.writerModel) fail(label, 'createdAt and writerModel are required');

  const research = draft.research || {};
  const sources = Array.isArray(research.sources) ? research.sources : [];
  const sourceIds = new Set(sources.map(source => source.id));
  if (sources.length < 5) fail(label, 'research requires at least five sources');
  if (sources.filter(source => source.sourceType === 'primary').length < 2) {
    fail(label, 'research requires at least two primary sources');
  }
  for (const source of sources) {
    if (!source.id || !source.title || !source.publisher || !validHttpUrl(source.url)) {
      fail(label, 'every source requires an ID, title, publisher, and HTTP(S) URL');
    }
    if (!Array.isArray(source.claims) || source.claims.length === 0) {
      fail(label, `source ${source.id || '?'} has no supported claims`);
    }
  }
  const dimensions = Array.isArray(research.comparisonDimensions)
    ? research.comparisonDimensions
    : [];
  if (dimensions.length < 4) fail(label, 'research requires at least four comparison dimensions');
  for (const dimension of dimensions) {
    if (!dimension.label || !dimension.interpretation || !dimension.values) {
      fail(label, 'comparison dimensions require a label, values, and interpretation');
    }
    if (!Array.isArray(dimension.sourceIds) ||
        dimension.sourceIds.length === 0 ||
        dimension.sourceIds.some(id => !sourceIds.has(id))) {
      fail(label, `comparison dimension "${dimension.label || '?'}" has invalid source IDs`);
    }
  }
  if (!Array.isArray(research.keyFindings) || research.keyFindings.length === 0) {
    fail(label, 'research must include key findings');
  }
  if (!Array.isArray(research.uncertainties) || research.uncertainties.length === 0) {
    fail(label, 'research must include uncertainties');
  }

  const verification = draft.verification || {};
  const publishable = draft.status === 'pending_approval' || draft.status === 'published';
  if (publishable && (verification.passed !== true ||
      !Array.isArray(verification.unsupportedClaims) ||
      verification.unsupportedClaims.length > 0)) {
    fail(label, 'publishable drafts require passing verification with zero unsupported claims');
  }

  const article = draft.article || {};
  const content = article.content || {};
  if (!article.slug || !article.title || !article.description || !article.verdict) {
    fail(label, 'article metadata is incomplete');
  }
  if (item && article.date !== item.publishDate) fail(label, 'article date must match its plan item');
  if (article.description && article.description.length < 120) {
    fail(label, 'article description must contain at least 120 characters');
  }
  const analysisWords = wordCount(content.analysis);
  if (analysisWords < 900 || analysisWords > 1400) {
    fail(label, `analysis must contain 900-1,400 words; found ${analysisWords}`);
  }
  if (!String(content.analysis || '').includes('|')) fail(label, 'analysis requires a comparison table');
  if (!Array.isArray(content.dataPoints) || content.dataPoints.length < 3 ||
      content.dataPoints.some(point => !point.source || !validHttpUrl(point.sourceUrl))) {
    fail(label, 'article requires at least three source-linked data points');
  }
  if (!Array.isArray(content.risks) || content.risks.length < 3) {
    fail(label, 'article requires at least three risks');
  }
  if (!Array.isArray(content.catalysts) || content.catalysts.length < 3) {
    fail(label, 'article requires at least three catalysts');
  }
  const references = Array.isArray(content.references) ? content.references : [];
  const researchUrls = new Set(sources.map(source => source.url));
  if (references.length < 5 ||
      references.some(reference => !reference.source || !researchUrls.has(reference.url))) {
    fail(label, 'article requires five references drawn from its research packet');
  }
  if (publishable && (!draft.quality?.passed || Number(draft.quality?.score) < 80)) {
    fail(label, 'publishable drafts require a passing quality score of at least 80');
  }
  ok(`${label} passed structural evidence checks`);
}

if (failures > 0) {
  console.error(`\n${failures} editorial artifact check(s) failed.`);
  process.exit(1);
}

console.log(`\nEditorial artifacts passed (${plans.size} plan(s), ${jsonFiles(DRAFT_DIR).length} draft(s)).`);
