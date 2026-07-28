#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/search-console-audit.js /path/to/Table.csv');
  process.exit(1);
}
if (!fs.existsSync(input)) {
  console.error(`Search Console export not found: ${input}`);
  process.exit(1);
}

const lines = fs.readFileSync(input, 'utf8').trim().split(/\r?\n/);
const rows = lines.slice(1).map(line => {
  const [url, lastCrawled, status] = line.split(',');
  return { url, lastCrawled, status };
});
const byType = {};
const paths = new Map();
let wwwUrls = 0;
for (const row of rows) {
  const url = new URL(row.url);
  const type = url.pathname.split('/').filter(Boolean)[0] || 'home';
  byType[type] = (byType[type] || 0) + 1;
  paths.set(url.pathname, (paths.get(url.pathname) || 0) + 1);
  if (url.hostname.startsWith('www.')) wwwUrls++;
}
const result = {
  generatedAt: new Date().toISOString(),
  issue: 'Crawled - currently not indexed',
  total: rows.length,
  byType,
  wwwUrls,
  duplicateCanonicalPaths: [...paths.entries()].filter(([, count]) => count > 1).map(([url]) => url),
  failedUrls: rows.filter(row => row.status === 'Failed').map(row => row.url),
};
console.log(JSON.stringify(result, null, 2));
