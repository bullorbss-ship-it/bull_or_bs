# Weekend Rebuild Plan — March 8-9, 2026

## REBRAND: NotSoFoolAI → BullOrBS
- New domain: bullorbs.com (purchased, Cloudflare)
- Old domain: notsofoolai.com (take down / let expire)

## Goal: Full rebuild + launch Monday March 10 at 7 AM EST

## Status Key: [x] = done, [ ] = todo

---

## SATURDAY — Rebrand, Design, SEO Engine, Branding

### Block 0A: Rebrand Swap — DONE
- [x] Update siteConfig.ts: name → "BullOrBS", url → "https://bullorbs.com"
- [x] Update seo.ts: keywords, twitter handle → @bullorbs
- [x] Update Header.tsx: "BullOr**BS**" branding (green accent on "BS")
- [x] Update Footer.tsx: brand name + description
- [x] Update CLAUDE.md: all references NotSoFoolAI → BullOrBS
- [x] Update homepage copy if needed
- [x] Search entire codebase for "notsofoolai" / "NotSoFool" → replace all
- [x] Update about page, disclaimer page, article page, feed.xml, robots.ts
- [x] Update package.json, package-lock.json, render.yaml
- [x] Update all docs (scaling-strategy, behavioral-design, growth-targets, strategy)
- [x] Rename docs/notsofoolai-strategy.md → docs/bullorbs-strategy.md
- [x] Remove Motley Fool trademark from disclaimer (generic "any publication" now)

### Block 0B: DNS + Infra Swap (Rishi — 15 min)
- [ ] Cloudflare: add bullorbs.com DNS records pointing to Render
- [ ] Render: update custom domain → bullorbs.com
- [ ] GitHub: rename repo (notsofoolai → bullorbs)
- [ ] Create `dev` branch from `main` (all dev work on dev, merge to main to deploy)
- [ ] Render: keep auto-deploy pointed at `main` only
- [ ] Create new git identity for commits (bullorbs)
- [ ] Create @bullorbs on X, Instagram
- [ ] Create bullorbs@proton.me email (for GA4/Search Console)
- [ ] Take down notsofoolai.com (remove Render custom domain + Cloudflare DNS)

### Block 0C: Branding Assets — DONE
- [x] Logo wordmark: public/logo.svg — "Bull Or BS" monospace
- [x] Icon "BoB" monogram: public/icon.svg — 512x512 navy rounded square
- [x] Icon bull shape: public/icon-bull.svg — green bull star on navy
- [x] Social profile: public/profile.svg — stacked "BoB" + maple leaf
- [ ] OG background: dark navy with subtle grid (1200x630) — still needed

### Block 1: Design System Overhaul — MOSTLY DONE
- [x] Color palette: green (#10B981), gold (#F59E0B), red (#EF4444), navy (#0F172A)
- [x] CSS variables for grade colors (A=gold, B=green, C=amber, D=orange, F=red)
- [x] Monospace for data, clean sans-serif for body
- [x] globals.css full rewrite
- [ ] Grade badges CSS (72-120px, color-coded circles)

### Block 2: SEO Schema Engine (Claude codes)
- [ ] breadcrumbSchema() helper in seo.ts
- [ ] corporationSchema(ticker, company, exchange) helper
- [ ] newsArticleSchema() for roasts/picks
- [ ] Expand faqSchema() to 5-10 questions per stock page
- [ ] BreadcrumbList JSON-LD on stock + article pages
- [ ] Corporation+tickerSymbol on every stock mention
- [ ] Long-tail H1s: "Should You Buy SHOP? Shopify Stock Analysis"

### Block 3: OG Image Generation (Claude codes)
- [ ] Dynamic OG images via Next.js ImageResponse (src/app/og/route.tsx)
- [ ] Stock pages: ticker + company + exchange + sector on branded template
- [ ] Article pages: headline + grade badge + type (Roast/Pick)
- [ ] Default fallback OG image for homepage (uses public/logo.svg)
- [ ] Wire og:image into metadata on every page

### Block 4: Internal Linking Overhaul (Claude codes)
- [ ] Tournament.tsx: every ticker clickable → /stock/[ticker]
- [ ] Article page: breadcrumb nav (Home > Roasts > SHOP Roast)
- [ ] Article page: link to ticker page (/stock/shop)
- [ ] Article page: "Related articles" section
- [ ] Stock page: "See more in [Sector]" link
- [ ] About page: add links to /stock, sample article
- [ ] Disclaimer page: add links to /about, /stock
- [ ] Stock index: sectors clickable (filter or anchor)

### Block 5: New Pages (Claude codes)
- [ ] 404 page (not-found.tsx) — branded, stock browsing CTA
- [ ] Methodology page (/methodology) — how AI works, data sources, grading (E-E-A-T)

### Block 6: Branding Integration (Claude codes)
- [ ] Logo SVG in Header (replace text-only branding with public/logo.svg or inline SVG)
- [ ] Logo SVG in Footer
- [ ] Favicon swap: convert icon.svg → favicon.ico (replace src/app/favicon.ico)
- [ ] Apple touch icon from icon.svg
- [ ] "Made in Canada" maple leaf badge (use star from profile.svg)
- [x] Brand assets in /public/ — done

---

## SUNDAY — Admin, Quality Gates, Content, Deploy

### Block 7: Admin Dashboard (Claude codes — mobile-friendly)
- [ ] /admin page — password-protected (ADMIN_PASSWORD env var)
- [ ] Draft queue: list pending articles with quality scores
- [ ] One-tap APPROVE button (big, green, works on phone)
- [ ] One-tap REJECT button
- [ ] Inline edit: headline + verdict before publish
- [ ] Mobile-responsive: phone-friendly at 7 AM
- [ ] On approve: saves to content/, triggers rebuild

### Block 8: Quality Gate System (Claude codes)
- [ ] validateArticle() in src/lib/quality.ts
  - Valid JSON structure
  - 3+ data points with sources
  - 3+ risks AND 3+ catalysts
  - Analysis > 500 words
  - Grade present (A-F)
  - All candidates have scores
  - No hallucinated tickers (check against tickers.ts)
- [ ] Quality score (0-100) displayed on admin dashboard

### Block 9: Article Page Redesign (Claude codes)
- [ ] Grade badge: HUGE, color-coded, above the fold
- [ ] Hook sequence: Grade → Data table → Tournament → Analysis → Verdict
- [ ] Reading time estimate at top
- [ ] "Next analysis →" link at bottom
- [ ] Social proof placeholder: "X people read this"

### Block 10: GA4 + Search Console (Rishi — 30 min)
- [ ] analytics.google.com → create property → get G-XXXXXXXXXX
- [ ] Add NEXT_PUBLIC_GA_ID to Render env vars
- [ ] search.google.com/search-console → add domain
- [ ] Add TXT record in Cloudflare DNS → verify
- [ ] Submit sitemap: bullorbs.com/sitemap.xml

### Block 11: Generate First Real Articles (Claude codes + API)
- [ ] RY (Royal Bank) roast — most searched Canadian stock
- [ ] SHOP (Shopify) roast — tech sector
- [ ] AI Pick of the week — first tournament

### Block 12: Keep-Alive Setup (Rishi — 5 min)
- [x] /api/health endpoint already added
- [ ] Sign up at cron-job.org or UptimeRobot (free)
- [ ] Create job: ping https://bullorbs.com/api/health every 14 min

### Block 13: Adopt platform-core Patterns (Claude codes)
Reference: ~/Documents/platform-core/ — shared Python agent framework
- [ ] **Timing-safe auth**: use crypto.timingSafeEqual for SCAN_SECRET + admin auth
- [ ] **Dashboard auth**: cookie-based session with httpOnly flag
- [ ] **Resilient JSON parsing**: adopt parse_json_response() logic → src/lib/ai/parse.ts
- [ ] **Config centralization**: single config file with all env vars + defaults
- [ ] **Rich health endpoint**: expand /api/health with last_run, pending_reviews, total_published

### Block 14: SAST Pipeline Setup (Claude codes)
- [ ] Add `npm audit` to pre-deploy checks
- [ ] Add ESLint security plugin (eslint-plugin-security)
- [ ] Add npm script: `"security": "npm audit --audit-level=moderate && npx eslint --config .eslintrc.security.js src/"`
- [ ] Create pre-push check script: type-check + lint + security scan
- [ ] Document in CLAUDE.md: SAST must pass before every deploy

### Block 15: SEO Validation Check (Claude codes — runs before every deploy)
- [ ] **Sitemap integrity**: all stock pages + articles present in sitemap.xml
- [ ] **Meta tags check**: every page has unique title, description, og:image
- [ ] **Schema.org validation**: JSON-LD present on every page (Organization, Article, FAQPage, BreadcrumbList)
- [ ] **Canonical URLs**: every page has correct canonical pointing to bullorbs.com
- [ ] **Robots.txt check**: no accidental disallow rules blocking crawlers
- [ ] **H1 uniqueness**: every page has exactly one H1, all H1s unique across site
- [ ] **Internal link audit**: no broken internal links, no orphan pages
- [ ] **Image alt tags**: all images have descriptive alt text
- [ ] **OG image validation**: og:image URL resolves for every page type
- [ ] **Keyword coverage**: each stock page targets "[TICKER] stock analysis" + "should I buy [TICKER]"
- [ ] **Mobile-friendly check**: all pages pass viewport/responsive test
- [ ] **Page speed baseline**: no page > 3s load time (Lighthouse CI or manual)
- [ ] Create npm script: `"seo-check": "node scripts/seo-validate.js"` — automated checks
- [ ] Add to pre-deploy pipeline: SAST + SEO check must both pass

### Block 16: Legal Health Check (Claude + Rishi — before every deploy)
- [ ] **No competitor trademarks in branding**: site name, logo, headers, meta tags, OG images
- [ ] **No competitor names in code identifiers**: file names, CSS classes, config keys, git identity
- [ ] **Disclaimer on every page**: "not financial advice" + "not affiliated with any publication"
- [ ] **Fair dealing compliance**: roasts reference publications by name ONLY in editorial content (criticism/review), never in branding or SEO meta tags
- [ ] **No scraped/copied content**: all article text is AI-generated original analysis
- [ ] **WHOIS redacted**: domain privacy enabled on Cloudflare
- [ ] **No personal identity exposed**: no real name, email, or address in code, commits, or config
- [ ] **Data attribution**: if using IBKR/Yahoo data, cite source + comply with redistribution terms
- [ ] **Canadian compliance**: no "buy/sell" directives — always "analysis", "opinion", "educational"
- [ ] **Copyright**: no copied images, logos, charts from other sites

### Block 17: Push + Deploy (Rishi + Claude — 15 min)
- [ ] Legal health check passes
- [ ] SAST scan passes (zero high/critical)
- [ ] SEO validation passes
- [ ] Full code review
- [ ] Push to main → Render auto-deploys
- [ ] Verify all pages render
- [ ] Test admin dashboard on phone
- [ ] Test OG images with Twitter card validator
- [ ] Submit sitemap to Search Console
- [ ] Verify robots.txt accessible
- [ ] Spot-check 3 stock pages in Google Rich Results Test

---

## MONDAY 7:00 AM — First Live Run
- [ ] Open admin dashboard on phone
- [ ] Review articles
- [ ] Approve → goes live
- [ ] Post on X (@bullorbs)
- [ ] Post on Reddit r/CanadianInvestor

---

## POST-LAUNCH — Next Sprint Features

### Brokerage Data Integration (HIGH PRIORITY — Sprint 2)
**Goal:** Use IBKR account to power analysis with real market data

**What it unlocks:**
- Real-time prices, P/E, EPS, dividend yield, 52-week range on every stock page
- Analyst consensus ratings + price targets
- Historical price data for performance tracking
- Competitive edge: broker-grade data vs stale/free data

**Brokerage: IBKR (Interactive Brokers)**
1. **Client Portal API** (start here) — REST, OAuth, market data snapshots, fundamentals
2. **TWS API** (later if needed) — streaming, historical data, scanner

**Fallback:** Yahoo Finance (free, unofficial) or Alpha Vantage (free: 25 req/day)

**Tasks:**
- [ ] Review IBKR market data TOS — can we display data publicly? (likely yes for 15-min delayed)
- [ ] Set up IBKR Client Portal Gateway
- [ ] Build `src/lib/market-data.ts` — unified interface for any data source
- [ ] Cache market data (refresh every 15 min during market hours)
- [ ] Enrich stock pages: live data table (price, change, P/E, yield, analyst target)
- [ ] Feed market data into Claude prompts for better analysis
- [ ] Add "Last updated: X min ago" timestamp on stock pages (freshness signal for SEO)

### Suggestion Tracking System
- [ ] data/track-record/ directory for AI pick history
- [ ] On publish: save {date, ticker, grade, price_at_pick} to JSON
- [ ] Weekly cron: snapshot current prices for all tracked picks
- [ ] /track-record page: public accuracy leaderboard
- [ ] Feed accuracy data back into AI prompts

### User Behavior Analytics (HIGH PRIORITY — Sprint 2)
**Goal:** Understand what users actually do so every next feature is data-driven

**GA4 Custom Events (add to site via gtag):**
- [ ] `stock_page_view` — which tickers get the most traffic
- [ ] `article_read` — which articles get opened + read time
- [ ] `scroll_depth` — 25%, 50%, 75%, 100% on articles (do people finish reading?)
- [ ] `subscribe_start` — clicked into email input
- [ ] `subscribe_complete` — successfully subscribed
- [ ] `cta_click` — which CTAs convert (Browse Stocks, Subscribe, Read Roast, etc.)
- [ ] `ticker_click` — which tickers users click from homepage/articles
- [ ] `related_article_click` — do people follow internal links
- [ ] `external_link_click` — outbound clicks (where are they going?)

**GA4 Dashboards to Build:**
- [ ] Top 10 stock pages by traffic — tells you which tickers to write about first
- [ ] Article completion rate — are roasts or picks more engaging?
- [ ] Subscribe funnel: page view → scroll to form → start → complete (find the drop-off)
- [ ] Traffic sources: organic search vs Reddit vs X vs direct
- [ ] Device split: mobile vs desktop (affects design priorities)
- [ ] Geographic split: Canada vs US vs other (affects content strategy)

**Decisions This Data Drives:**
- Which tickers to generate articles for next (top traffic pages)
- Whether to invest more in roasts or picks (engagement data)
- Where to post for distribution (traffic source data)
- Mobile-first vs desktop-first design (device data)
- Canada-first vs US-first content (geo data)
- What CTAs to optimize (conversion funnel data)

### TMZ of WallStreetBets (Sprint 3 — New Content Type)
**Goal:** Daily TMZ-style commentary on r/wallstreetbets — entertainment + SEO magnet

**Concept:**
- Every morning: scan yesterday's top WSB posts (gain/loss porn, YOLO plays, meltdowns)
- AI writes a snarky recap with actual Reddit screenshots embedded
- Tone: TMZ meets financial commentary — dramatic, funny, but with real analysis underneath
- "This guy bet $50K on NVDA weeklies. Here's why that was genius/insane."

**Why this works:**
- WSB content is inherently viral — people love the drama
- Screenshots = unique content Google can't find elsewhere
- Daily cadence = massive SEO surface area (365 pages/year)
- Drives social sharing (Reddit, X) — WSB crowd loves seeing themselves featured
- Low effort per article once pipeline is built — mostly automated

**Data Pipeline:**
- [ ] Reddit API integration (free tier: 100 req/min with OAuth2)
- [ ] Daily cron: pull top 20 posts from r/wallstreetbets (sort by hot/top)
- [ ] Filter for: gain/loss screenshots, YOLO posts, DD with high engagement
- [ ] Screenshot capture: use Reddit embed or save post images
- [ ] AI generates commentary for each featured post (Claude)
- [ ] Compile into daily article: "WSB Daily Recap — [Date]"

**Content Structure:**
- [ ] New content type: `content/wsb/` directory
- [ ] Article format: 5-8 featured posts per recap
- [ ] Each post: screenshot + original context + AI roast/analysis
- [ ] "Degen Score" rating (1-10) for each play
- [ ] End with: "Best play of the day" + "Worst play of the day"

**Legal Considerations:**
- Reddit posts are public — embedding/screenshotting is standard practice
- Must credit original poster (username visible in screenshot)
- Commentary = transformative use (criticism/review)
- Never mock individuals by real name — only Reddit usernames
- Add disclaimer: "We are not affiliated with r/wallstreetbets"

**SEO Targets:**
- "wallstreetbets today", "wsb recap", "wsb best plays"
- "wallstreetbets gain porn", "wsb YOLO [ticker]"
- Daily pages = long-tail goldmine over time

**Page:** `/wsb/[date-slug]` (e.g., /wsb/2026-03-10-recap)

### Scaling Strategy
See [docs/scaling-strategy.md](scaling-strategy.md) for full 4-tier plan.
- Tier 1: $0.83/mo (now) — Render free + Cloudflare
- Tier 2: $7/mo — Render paid + Cloudflare caching
- Tier 3: $15/mo — Cloudflare Pages + D1 + Workers
- Tier 4: $25/mo — Full Cloudflare stack

---

## Pre-Deploy Pipeline Summary

Every push to main must pass all three gates:

```
1. SAST         → npm run security (npm audit + eslint-plugin-security)
2. SEO Check    → npm run seo-check (sitemap, meta, schema, canonicals, links)
3. Legal Check  → manual checklist (trademarks, disclaimers, anonymity, compliance)
```

All three green → push to main → Render auto-deploys.

---

## Rishi's Total Time This Weekend
| Task | Time |
|---|---|
| DNS + infra swap (Cloudflare, Render, GitHub) | 15 min |
| Create accounts (bullorbs@proton.me, @bullorbs X/Instagram) | 30 min |
| GA4 + Search Console setup | 30 min |
| Review final site + test phone admin | 15 min |
| Keep-alive setup (cron-job.org/UptimeRobot) | 5 min |
| Push to GitHub (provide token) | 5 min |
| **Total** | **~1.75 hours** |

Everything else is Claude coding.
