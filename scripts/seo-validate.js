#!/usr/bin/env node

/**
 * SEO Validation Script — runs before every deploy
 * Usage: npm run seo-check
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://bullorbs.com';
let errors = 0;
let warnings = 0;

function error(msg) { console.error(`  ❌ ${msg}`); errors++; }
function warn(msg) { console.warn(`  ⚠️  ${msg}`); warnings++; }
function pass(msg) { console.log(`  ✅ ${msg}`); }

// 1. Check sitemap exists
console.log('\n📋 Sitemap Check');
const sitemapPath = path.join(__dirname, '..', 'src', 'app', 'sitemap.ts');
if (fs.existsSync(sitemapPath)) {
  pass('sitemap.ts exists');
} else {
  error('sitemap.ts not found — Google cannot discover pages');
}

// 2. Check robots.ts exists
console.log('\n🤖 Robots.txt Check');
const robotsPath = path.join(__dirname, '..', 'src', 'app', 'robots.ts');
if (fs.existsSync(robotsPath)) {
  const robotsContent = fs.readFileSync(robotsPath, 'utf8');
  if (robotsContent.includes("allow: '/'")) {
    pass('robots.ts allows crawling');
  } else {
    warn('robots.ts may be blocking crawlers — review allow/disallow rules');
  }
  if (robotsContent.includes(SITE_URL)) {
    pass(`Sitemap URL points to ${SITE_URL}`);
  } else {
    error(`Sitemap URL does not point to ${SITE_URL}`);
  }
} else {
  error('robots.ts not found');
}

// 3. Check all stock pages have tickers
console.log('\n📊 Stock Pages Check');
const tickersPath = path.join(__dirname, '..', 'src', 'lib', 'tickers.ts');
if (fs.existsSync(tickersPath)) {
  const tickersContent = fs.readFileSync(tickersPath, 'utf8');
  const tickerMatches = tickersContent.match(/ticker:\s*'([^']+)'/g) || [];
  const tickerCount = tickerMatches.length;
  if (tickerCount >= 50) {
    pass(`${tickerCount} ticker pages configured`);
  } else {
    warn(`Only ${tickerCount} ticker pages — target 50+ for SEO coverage`);
  }
} else {
  error('tickers.ts not found');
}

// 4. Check siteConfig
console.log('\n⚙️  Site Config Check');
const siteConfigPath = path.join(__dirname, '..', 'src', 'config', 'site.ts');
if (fs.existsSync(siteConfigPath)) {
  const configContent = fs.readFileSync(siteConfigPath, 'utf8');
  if (configContent.includes(SITE_URL)) {
    pass(`Site URL is ${SITE_URL}`);
  } else {
    error(`Site URL does not match ${SITE_URL}`);
  }
  if (configContent.includes('notsofoolai')) {
    error('Old brand name "notsofoolai" found in siteConfig');
  } else {
    pass('No old brand references in siteConfig');
  }
} else {
  error('site.ts not found');
}

// 5. Check SEO metadata
console.log('\n🏷️  SEO Metadata Check');
const seoPath = path.join(__dirname, '..', 'src', 'config', 'seo.ts');
if (fs.existsSync(seoPath)) {
  const seoContent = fs.readFileSync(seoPath, 'utf8');

  const schemas = ['organizationSchema', 'articleSchema', 'faqSchema', 'breadcrumbSchema', 'corporationSchema'];
  for (const schema of schemas) {
    if (seoContent.includes(schema)) {
      pass(`${schema}() helper exists`);
    } else {
      warn(`${schema}() helper missing — reduced structured data coverage`);
    }
  }

  if (seoContent.includes('keywords')) {
    pass('Keywords defined in default metadata');
  } else {
    warn('No keywords in default metadata');
  }

  if (seoContent.includes('notsofoolai')) {
    error('Old brand name found in seo.ts');
  }
} else {
  error('seo.ts not found');
}

// 6. Check OG image route
console.log('\n🖼️  OG Image Check');
const ogPath = path.join(__dirname, '..', 'src', 'app', 'og', 'route.tsx');
if (fs.existsSync(ogPath)) {
  pass('Dynamic OG image route exists');
} else {
  warn('No dynamic OG image route — social sharing will use default image');
}

// 7. Check key pages exist
console.log('\n📄 Key Pages Check');
const requiredPages = {
  'Homepage': 'src/app/page.tsx',
  'About': 'src/app/about/page.tsx',
  'Disclaimer': 'src/app/disclaimer/page.tsx',
  'Stock Index': 'src/app/stock/page.tsx',
  'Stock Detail': 'src/app/stock/[ticker]/page.tsx',
  'Article Detail': 'src/app/article/[slug]/page.tsx',
  'Methodology': 'src/app/methodology/page.tsx',
  '404 Page': 'src/app/not-found.tsx',
};

for (const [name, filePath] of Object.entries(requiredPages)) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    pass(`${name} exists`);
  } else {
    error(`${name} missing (${filePath})`);
  }
}

// 8. Check feed.xml
console.log('\n📡 RSS Feed Check');
const feedPath = path.join(__dirname, '..', 'src', 'app', 'feed.xml', 'route.ts');
if (fs.existsSync(feedPath)) {
  const feedContent = fs.readFileSync(feedPath, 'utf8');
  if (feedContent.includes('notsofoolai')) {
    error('Old brand name found in feed.xml route');
  } else {
    pass('RSS feed route exists with correct branding');
  }
} else {
  warn('No RSS feed route — reduces content discoverability');
}

// 9. Check for old brand references across source
console.log('\n🔍 Brand Consistency Check');
const srcDir = path.join(__dirname, '..', 'src');
let oldBrandFound = false;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.match(/\.(ts|tsx|js|jsx)$/)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.toLowerCase().includes('notsofoolai') || content.toLowerCase().includes('notsofool')) {
        const relPath = path.relative(path.join(__dirname, '..'), fullPath);
        error(`Old brand reference in ${relPath}`);
        oldBrandFound = true;
      }
    }
  }
}

scanDir(srcDir);
if (!oldBrandFound) {
  pass('No old brand references found in src/');
}

// 10. Check content directory
console.log('\n📝 Content Check');
const contentDir = path.join(__dirname, '..', 'content');
if (fs.existsSync(contentDir)) {
  let articleCount = 0;
  for (const type of ['roasts', 'picks']) {
    const typeDir = path.join(contentDir, type);
    if (fs.existsSync(typeDir)) {
      const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.json'));
      articleCount += files.length;
    }
  }
  if (articleCount > 0) {
    pass(`${articleCount} articles published`);
  } else {
    warn('No articles published yet — generate content before launch');
  }
} else {
  warn('content/ directory not found — no articles to index');
}

// Summary
console.log('\n' + '─'.repeat(50));
console.log(`\n📊 SEO Validation Summary`);
console.log(`   Errors:   ${errors}`);
console.log(`   Warnings: ${warnings}`);

if (errors > 0) {
  console.log(`\n🚫 SEO check FAILED — fix ${errors} error(s) before deploy\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`\n⚠️  SEO check PASSED with ${warnings} warning(s)\n`);
  process.exit(0);
} else {
  console.log(`\n✅ SEO check PASSED — all clear for deploy\n`);
  process.exit(0);
}
