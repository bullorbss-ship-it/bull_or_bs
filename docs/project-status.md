# BullOrBS — Project Status & Roadmap
**Last updated: 2026-03-09**

---

## What's Done (Launch + Day 1)

### Core Platform
- [x] Next.js 16 App Router + Tailwind CSS v4
- [x] Render free tier deployment with auto-deploy from main
- [x] Cloudflare DNS (bullorbs.com + www)
- [x] Keep-alive cron (cron-job.org → /api/health every 10 min)
- [x] GA4 analytics + Google Search Console verified
- [x] Sitemap, robots.txt, RSS feed auto-generated

### Content & SEO
- [x] 93+ stock/ETF ticker pages with FAQ schema (61 stocks + 30 ETFs + dynamic)
- [x] 11 articles published (5 roasts + 6 picks)
- [x] Programmatic SEO: every /stock/[ticker] targets "should I buy [TICKER]"
- [x] Schema.org: Article, FAQPage, Organization, BreadcrumbList, Corporation
- [x] Learn section: /learn/ with TFSA, RRSP, FHSA guides
- [x] About, disclaimer, methodology, 404 pages

### AI Generation Pipeline
- [x] Haiku 4.5 primary (~$0.02/article), OpenRouter free fallback
- [x] 4 generation types: roast, pick, data-roast, data-pick
- [x] Text-paste workflow: paste research data → Haiku generates article
- [x] Identity-only reference sheet (prevents AI using stale profile metrics)
- [x] Qualitative output style (no specific numbers unless from pasted data)
- [x] Cost tracking: every run logged to data/costs.json

### Data & Profiles
- [x] 93+ stock/ETF JSON profiles (data/stocks/*.json)
- [x] Dynamic ticker registry: auto-registers unknown tickers from articles
- [x] Profile auto-update: article dataPoints update ALL candidate profiles
- [x] Profile refresh via Gemini Flash (free web search → diff → update)
- [x] Hand-corrected ETF profiles (MERs, yields, hedging verified)

### Financial Education (/learn)
- [x] Learn index page: /learn/
- [x] TFSA guide: /learn/tfsa — contribution limits, rules, strategies
- [x] RRSP guide: /learn/rrsp — tax deductions, HBP, withdrawal rules
- [x] FHSA guide: /learn/fhsa — new account type, eligibility, strategies
- [ ] More guides planned (see Priority 3 below)

### Admin Dashboard (/orange)
- [x] Password-protected admin panel
- [x] Generate tab: roast + pick forms with text-paste input
- [x] Articles tab: list all with "Publish & Save to Repo" CTA
- [x] Costs tab: per-run detail, monthly breakdown, yearly projection
- [x] Auto-commit to GitHub via /api/admin/commit
- [x] Social distribution: generate Reddit/X/Instagram posts after publish

### Infrastructure
- [x] EST timezone for all dates (src/lib/date.ts)
- [x] Article sorting by createdAt (newest first, git-history-accurate)
- [x] Pre-deploy pipeline: 7 gates (type-check, lint, SAST, SEO, legal, docs, docs-check)
- [x] Rate limiting + security headers
- [x] Timing-safe auth, brute-force protection

---

## What's Next (Priority Order)

### Priority 1: Content Volume (NOW — Week of March 10)
**Goal: 20+ articles by end of week. Content is the moat.**
- [ ] Generate 2-3 articles/day using text-paste workflow
- [ ] Focus on high-search-volume tickers: AAPL, MSFT, NVDA, AMZN, GOOGL, TSLA
- [ ] Canadian focus: RY, TD, ENB, CNR, BCE, SU, BNS
- [ ] Topic picks: "best dividend stock", "best tech stock", "best Canadian bank"
- [ ] Every article → auto-registers tickers + updates profiles

### Priority 2: Reddit Distribution (THIS WEEK)
**Goal: First organic traffic from Reddit.**
- [ ] Create Reddit throwaway account (maintain anonymity)
- [ ] Build karma in r/CanadianInvestor, r/PersonalFinanceCanada
- [ ] Post first roast as text post with link (anti-Motley-Fool angle)
- [ ] Answer "should I buy X?" questions with real analysis + link
- [ ] Do NOT spam — genuine contributions with occasional links

### Priority 3: Financial Education + SEO Landing Pages (Week 2)
**Goal: Become the go-to Canadian financial literacy resource for young investors.**

**New /learn guides (high-SEO-value, evergreen):**
- [ ] /learn/dividend-investing — how dividends work, DRIP, yield vs growth
- [ ] /learn/etf-basics — what ETFs are, MER, how to pick one
- [ ] /learn/how-to-start-investing — beginner guide for 20-somethings
- [ ] /learn/tax-loss-harvesting — Canadian-specific rules
- [ ] /learn/us-stocks-from-canada — withholding tax, RRSP trick, currency
- [ ] /learn/index-investing — XEQT/VEQT/VFV explained simply

**SEO landing pages (target Motley Fool's ad keywords):**
- [ ] /best-stocks-under-50 — curated from picks data
- [ ] /tsx-sleeper-stocks-2026 — Canadian focus
- [ ] /best-dividend-stocks-canada — filtered from ETF/stock analysis
- [ ] /where-to-invest-1000-canada — beginner guide
- [ ] /xeqt-vs-veqt — head-to-head comparison (compare page prototype)
- [ ] Internal linking: every article + learn page links to relevant hub pages

### Priority 4: Compare Pages (Week 2-3)
**Goal: /compare/[ticker-vs-ticker] pages for SEO.**
- [ ] Route: /compare/[slug] (e.g., /compare/xeqt-vs-veqt)
- [ ] Auto-generate from pick articles that compare stocks
- [ ] FAQ schema: "Is XEQT better than VEQT?"
- [ ] Internal links from stock pages

### Priority 5: Design Polish (Week 2-3)
- [ ] Mobile header: hamburger menu (nav overlaps on small screens)
- [ ] Grade badge visual upgrade (larger, CSS pulse animation)
- [ ] Empty stock pages: "Analysis coming soon" + subscribe CTA
- [ ] Dark mode verification across all pages
- [ ] OG image generation (Next.js ImageResponse)

### Priority 6: Email Newsletter (Month 2)
- [ ] Beehiiv integration (migrate from JSON subscriber storage)
- [ ] Weekly email: top pick + best roast of the week
- [ ] Subscribe form already exists on site

### Priority 7: Track Record Page (Month 2)
- [ ] /track-record — show historical pick performance
- [ ] data/track-record/ directory for pick history
- [ ] On publish: save {date, ticker, grade, price_at_pick}
- [ ] Weekly snapshot of current prices for all tracked picks

### Priority 8: Social Media API Posting (Month 2-3)
- [x] Phase 1: Social copy generation via Haiku + dashboard copy buttons (DONE)
- [x] Phase 1: Email distribution (optional, needs GMAIL_APP_PASSWORD env var)
- [ ] Phase 2: X API auto-posting (free tier: 1,500 tweets/month)
- [ ] Phase 2: Reddit API auto-posting (needs 30-day aged account)
- [ ] Instagram: manual posting via generated captions (API too complex)

### Future (Month 3+)
- [ ] WallStreetBets daily recaps (/wsb/[date])
- [ ] Premium reports ($20/report, personalized portfolio)
- [ ] Batch API (50% cost reduction for scheduled generation)
- [ ] Real-time data source (when revenue justifies licensing)
- [ ] Crypto coverage (CoinGecko API)

---

## Architecture Decisions
See [architecture-decisions.md](architecture-decisions.md) for ADR-001 through ADR-006.

Key decisions:
1. Haiku over Sonnet (55x cheaper, good enough with structured input)
2. Local JSON over live APIs (FMP ToS prohibits commercial use)
3. Text-paste over image upload (simpler, cheaper, fewer tokens)
4. EST timezone for all dates (Canadian audience)
5. Dynamic ticker registry (no manual tickers.ts editing)
6. Qualitative analysis style (avoids hallucinated numbers)

## Cost Model
| Item | Cost |
|---|---|
| Article generation (Haiku) | ~$0.02/article |
| Render hosting | $0 (free tier) |
| Cloudflare DNS | $0 |
| Domain (bullorbs.com) | ~$10/year |
| **Monthly (20 articles)** | **~$0.40 + $0.83 domain** |
| **Yearly (500 articles)** | **~$10 + $10 domain** |

## Content Workflow
```
Claude/Gemini Deep Research (free)
    → Verified comparison table
        → Paste into /orange dashboard
            → Haiku generates article ($0.02)
                → Gemini fact-check (free)
                    → Publish & Save to Repo
                        → Render auto-deploys
                            → Distribute (generates social posts ~$0.005)
                                → Copy-paste to Reddit/X/Instagram
                                → (or auto-email if GMAIL configured)
```
