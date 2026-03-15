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

### Block 0B: DNS + Infra Swap (Admin — 15 min) — DONE
- [x] Cloudflare: bullorbs.com DNS → Vercel (A record 216.198.79.1, www CNAME)
- [x] Vercel: connected via notsofoolai GitHub account, auto-deploy from main
- [x] GitHub: repo at github.com/bullorbss-ship-it/bull_or_bs
- [x] Git identity: BullOrBS <bull.or.bss@gmail.com>
- [x] Create @bull_or_bs on X, Instagram, TikTok, YouTube
- [x] Email: bull.or.bss@gmail.com
- [x] notsofoolai.com taken down

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

### Block 2: SEO Schema Engine — DONE
- [x] breadcrumbSchema() helper in seo.ts
- [x] corporationSchema(ticker, company, exchange) helper
- [x] newsArticleSchema() for news takes
- [x] Expand faqSchema() to 10 questions per stock page
- [x] BreadcrumbList JSON-LD on stock + article pages
- [x] Corporation+tickerSymbol on every stock mention
- [x] Long-tail H1s: "Should You Buy SHOP? Shopify Stock Analysis"

### Block 3: OG Image Generation — DONE
- [x] Dynamic OG images via /og route (src/app/og/route.tsx, nodejs runtime)
- [x] Stock pages: ticker + company + exchange on branded template
- [x] Article pages: headline + grade badge + type (Roast/Pick/Take)
- [x] Default fallback OG image for homepage
- [x] Wire og:image into metadata on every page

### Block 4: Internal Linking Overhaul — DONE
- [x] Tournament.tsx: every ticker clickable → /stock/[ticker]
- [x] Article page: breadcrumb nav (Home > Roasts > SHOP Roast)
- [x] Article page: link to ticker page (/stock/shop)
- [x] Auto-linkify ALL registered tickers in article text
- [x] Stock page: sector peers linked
- [x] About page: links to /stock, /methodology, /disclaimer
- [x] Disclaimer page: links to /about, /stock, /methodology
- [x] Stock index: searchable + sector-filtered grid

### Block 5: New Pages — DONE
- [x] 404 page (not-found.tsx) — branded, stock browsing CTA
- [x] Methodology page (/methodology) — scoring system, tournament mechanics
- [x] Editorial standards page (/editorial)
- [x] Privacy policy (/privacy), Terms of service (/terms)

### Block 6: Branding Integration — DONE
- [x] Logo SVG in Header + Footer
- [x] Favicon: icon.svg in src/app/
- [x] Brand assets in /public/
- [x] Three-color branding: "Bull" (navy) "Or" (gray) "BS" (green)

---

## SUNDAY — Admin, Quality Gates, Content, Deploy

### Block 7: Admin Dashboard — DONE
- [x] /orange page — password-protected (ADMIN_PASSWORD env var)
- [x] Generate tab: roast, pick, data-roast, data-pick, take forms
- [x] Articles tab: list all with "Publish & Save to Repo" + delete (two-step)
- [x] Costs tab: per-run detail, monthly breakdown, yearly projection
- [x] Subscribers tab: fetch from GitHub Contents API
- [x] Social distribution: generate Reddit/X/Instagram copy
- [x] Preview before publish workflow
- [x] Fact-check gate: blocks new roasts/picks if 5+ unchecked

### Block 8: Quality Gate System — DONE
- [x] validateArticle() in src/lib/quality.ts
- [x] Validates: JSON structure, data points, risks/catalysts, analysis length, grades, tickers

### Block 9: Article Page Redesign — DONE
- [x] Grade badge: color-coded ScoreGauge component (1-10 and A-F)
- [x] Hook sequence: Grade → Data table → Tournament → Analysis → Verdict
- [x] Reading time estimate at top
- [x] "Next analysis →" link at bottom
- [x] ConsentGate: AI disclosure overlay
- [x] ScrollTracker: scroll depth analytics

### Block 10: GA4 + Search Console — DONE
- [x] GA4: G-E7ZLH22KZ1 (NEXT_PUBLIC_GA_ID)
- [x] Search Console: verified, sitemap submitted
- [x] Cloudflare DNS records configured

### Block 11: First Articles — DONE
- [x] 10 roasts (RY, SHOP×2, TSLA, OTEX, SU.TO, CSU.TO, ORCL, ADOBE, CVX)
- [x] 7 picks (energy, EV, dividend, defense AI, XEQT ETF comparison, etc.)
- [x] 17 news takes

### Block 12: Keep-Alive — N/A (migrated to Vercel, no cold starts)

### Block 13: Platform-Core Patterns — DONE
- [x] Timing-safe auth: crypto.timingSafeEqual in src/lib/auth.ts
- [x] HMAC session cookies (stateless, httpOnly, secure, sameSite=strict)
- [x] Resilient JSON parsing in src/lib/ai/parse.ts
- [x] Rich health endpoint with article stats

### Block 14: SAST Pipeline — DONE
- [x] npm audit + eslint-plugin-security (6 rules)
- [x] `npm run security` script
- [x] 8-gate pre-deploy pipeline: `npm run pre-deploy`

### Block 15: SEO Validation — DONE
- [x] `npm run seo-check` (scripts/seo-validate.js)
- [x] Checks: sitemap, robots, schema helpers, brand consistency, ticker count, key pages, RSS

### Block 16: Legal Health Check — DONE
- [x] `npm run legal-check` (scripts/legal-check.js)
- [x] Checks: competitor trademarks, disclaimers, anonymity, CASL, Canadian compliance, score floor

### Block 17: Deployed on Vercel — DONE
- [x] All gates pass
- [x] Auto-deploy from main via Vercel
- [x] OG images verified
- [x] Sitemap submitted
- [x] robots.txt blocks /orange and /api/

---

## MONDAY 7:00 AM — First Live Run
- [ ] Open admin dashboard on phone
- [ ] Review articles
- [ ] Approve → goes live
- [ ] Post on X (@bullorbs)
- [ ] Post on Reddit r/CanadianInvestor

---

## POST-LAUNCH — Next Sprint Features

### Brokerage Data + Cost Optimization (HIGH PRIORITY — Sprint 2)
**Goal:** Use IBKR data to power analysis AND cut API costs by ~90%

**Current cost problem (learned from launch):**
- Web search = $0.67/session + inflates input tokens to ~125K per call
- Sonnet 4.5 with web search = ~$1.10 per article
- Haiku produces unreliable JSON with web search (30% failure rate)
- Failed attempts still cost money → $4.41 spent for 4 articles on launch day

**What IBKR data unlocks:**
- Drop web search entirely → feed structured market data into prompts
- Input tokens drop from ~125K to ~5-10K per call (25x reduction)
- Haiku becomes viable again (clean structured input = reliable JSON)
- Real-time prices, P/E, EPS, dividend yield, 52-week range on stock pages
- Analyst consensus ratings + price targets
- Competitive edge: broker-grade data vs stale/free data

**Cost projections with IBKR + Batch API:**

| Config | Cost/article | 3 articles/week | Monthly |
|---|---|---|---|
| Current (Sonnet + web search, real-time) | ~$1.10 | ~$3.30/wk | ~$14/mo |
| Sonnet + IBKR data, real-time | ~$0.10 | ~$0.30/wk | ~$1.30/mo |
| Sonnet + IBKR data, batch (50% off) | ~$0.05 | ~$0.15/wk | ~$0.65/mo |
| Haiku + IBKR data, batch (picks only) | ~$0.01 | ~$0.03/wk | ~$0.13/mo |
| **Optimal mix: Sonnet roasts + Haiku picks, batch, IBKR** | — | — | **~$0.50/mo** |

**Brokerage: IBKR (Interactive Brokers)**
1. **Client Portal API** (start here) — REST, OAuth, market data snapshots, fundamentals
2. **TWS API** (later if needed) — streaming, historical data, scanner

**Fallback:** Yahoo Finance (free, unofficial) or Alpha Vantage (free: 25 req/day)

**Phase 1 — IBKR Data Layer:**
- [ ] Review IBKR market data TOS — can we display data publicly? (likely yes for 15-min delayed)
- [ ] Set up IBKR Client Portal Gateway
- [ ] Build `src/lib/market-data.ts` — unified interface for any data source
- [ ] Define MarketSnapshot type: { price, change, pe, eps, yield, 52wHigh, 52wLow, analystTarget, volume }
- [ ] Cache market data (refresh every 15 min during market hours)
- [ ] Enrich stock pages: live data table (price, change, P/E, yield, analyst target)
- [ ] Add "Last updated: X min ago" timestamp on stock pages (freshness signal for SEO)

**Phase 2 — Drop Web Search, Feed IBKR Data to Prompts:**
- [ ] Modify generateRoast() — remove web_search tool, inject MarketSnapshot as structured data
- [ ] Modify generatePick() — remove web_search tool, inject top movers from IBKR scanner
- [ ] Switch picks back to Haiku (clean structured input = reliable JSON)
- [ ] Add retry logic with exponential backoff (max 2 retries)
- [ ] Test JSON reliability with Haiku on structured data (target: <5% failure rate)

**Phase 3 — Batch API Pipeline:**
- [ ] Build `src/lib/ai/batch.ts` — queue batch requests to Anthropic
- [ ] Sunday 10 PM cron: fetch IBKR data → queue 3 batch requests (2 roasts + 1 pick)
- [ ] Monday 6 AM cron: poll batch results → parse → validate → save to content/
- [ ] Notify via email when articles are ready for review
- [ ] Keep real-time /api/generate endpoint for on-demand hot takes
- [ ] Wednesday 10 PM cron: optional mid-week bonus article (batch)

**Phase 4 — Haiku JSON Reliability:**
- [ ] Simplify JSON schema in prompts (fewer nested objects = fewer parse errors)
- [ ] Add JSON mode hint: "Output ONLY a JSON object. No markdown, no explanation."
- [ ] Test with 10 sample calls — measure parse success rate
- [ ] If still unreliable: use Sonnet for generation, Haiku only for summarization tasks

### Design & UX Overhaul (HIGH PRIORITY — Sprint 2)
**Goal:** Rich, polished experience that runs smooth on a $200 Android with 3G

**Design Principles:**
- CSS-only animations (opacity + transform only — GPU composited, 60fps everywhere)
- No JS animation libraries (no Framer Motion, GSAP, Swiper)
- Lazy load all images
- Target: LCP < 2.5s, FID < 100ms, CLS < 0.1 on mobile

**Fixes from launch review:**
- [ ] **Mobile header**: hamburger menu — nav links overlap brand name on small screens
- [ ] **Empty stock pages**: add "Analysis coming soon" state with subscribe CTA instead of blank page
- [ ] **Stock grid**: show visual indicator for tickers that have published articles vs empty

**Homepage Improvements:**
- [ ] **Roast carousel**: rotating widget showing latest 3-5 roasts (CSS scroll-snap, no JS library)
  - Auto-advances every 5s, pause on touch/hover
  - Shows: grade badge, headline, ticker, one-line verdict
  - Swipeable on mobile (native scroll-snap)
- [ ] **Hero section**: animated grade badge reveal (CSS keyframe, fade+scale on load)
- [ ] **Stock ticker marquee**: scrolling bar of ticker symbols (CSS animation, pure cosmetic)
- [ ] **Section fade-ins**: elements fade up on scroll (IntersectionObserver + CSS class toggle, ~10 lines JS)

**Article Page:**
- [ ] **Grade badge pulse**: subtle CSS pulse animation on the grade circle
- [ ] **Data points table**: alternating row colors, hover highlight
- [ ] **Tournament bracket**: visual elimination tree (CSS grid, not canvas)
- [ ] **Progress bar**: reading progress indicator at top of page (scroll-driven, CSS only)

**Stock Pages:**
- [ ] **Empty state redesign**: "No AI analysis yet for [TICKER]" + FAQ still shows + subscribe CTA
- [ ] **With analysis**: link to article, show grade badge, key data points
- [ ] **Mini chart placeholder**: ready for IBKR data (Phase 1)

**Performance Budget:**
- Total JS: < 100KB gzipped (Next.js + minimal custom)
- No animation library dependencies
- All animations: CSS `transition`, `animation`, `scroll-snap` only
- Test on: Chrome Android (low-end), Safari iOS, Firefox desktop
- Lighthouse mobile score target: 90+

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

## Admin's Total Time This Weekend
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
