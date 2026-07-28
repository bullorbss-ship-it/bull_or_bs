# BullOrBS — Project Status & Roadmap
**Last updated: 2026-07-28**

---

## What's Done (Launch + Week 1)

### Core Platform
- [x] Next.js 16 App Router + Tailwind CSS v4
- [x] Vercel free tier deployment with auto-deploy from main (migrated from Render)
- [x] Cloudflare DNS (bullorbs.com + www)
- [x] GA4 analytics (G-E7ZLH22KZ1) + Google Search Console verified
- [x] Sitemap, robots.txt, RSS feed, news sitemap auto-generated

### Content & SEO
- [x] 115 static tickers + 91 stock profiles (data/stocks/*.json) + dynamic ticker registry
- [x] 239 article files (19 roasts + 7 picks + 213 takes); 166 legacy daily briefs are excluded from indexing pending review
- [x] Stock pages without reviewed editorial coverage emit noindex and are omitted from the sitemap
- [x] Schema.org: Article, FAQPage, Organization, BreadcrumbList, Corporation, Review
- [x] Learn section: 5 guides (TFSA, RRSP, FHSA, Dividend Investing, US Stocks from Canada)
- [x] About, disclaimer, methodology, editorial standards, privacy, terms, 404 pages

### AI Generation Pipeline
- [x] Assistant-neutral repository workflow runs planning, deep research, writing, verification, and approval reports without model API keys
- [x] Any repository-capable coding assistant can follow `EDITORIAL_WORKFLOW.md`; neutral discovery lives in `AGENTS.md`
- [x] Optional unattended API mode retains isolated stage models and keys
- [x] Monthly weekday plan requires operator approval before research begins
- [x] Deep research uses web search and saves a source packet with primary-source requirements
- [x] Writer receives only the saved packet; a separate verifier checks the resulting draft
- [x] Quality gate requires evidence, originality, uncertainty, and source-linked data points
- [x] Morning drafts require explicit approval in `/orange`; direct publishing is disabled

### Data & Profiles
- [x] 91 stock/ETF JSON profiles (data/stocks/*.json)
- [x] Dynamic ticker registry: auto-registers unknown tickers from articles
- [x] Profile auto-update: article dataPoints update ALL candidate profiles
- [x] Profile refresh via Gemini Flash (free web search → diff → update)
- [x] Hand-corrected ETF profiles (MERs, yields, hedging verified)

### Financial Education (/learn)
- [x] Learn index page: /learn/
- [x] TFSA guide: /learn/tfsa — contribution limits, rules, strategies
- [x] RRSP guide: /learn/rrsp — tax deductions, HBP, withdrawal rules
- [x] FHSA guide: /learn/fhsa — new account type, eligibility, strategies
- [x] Dividend Investing guide: /learn/dividend-investing — yields, DRIP, tax credit, red flags
- [x] US Stocks from Canada guide: /learn/us-stocks-from-canada — Norbert's Gambit, W-8BEN, withholding tax

### Admin Dashboard (/orange)
- [x] Password-protected admin panel
- [x] Editorial tab: stage readiness, monthly plan approval, evidence review, draft approval/rejection
- [x] Legacy generate tab retained for drafting, but direct publication is blocked
- [x] Costs tab: per-run detail, monthly breakdown, yearly projection
- [x] Git-backed plan/draft storage and approval-only article commits
- [x] Social distribution: generate Reddit/X/Instagram posts after publish

### Infrastructure
- [x] EST timezone for all dates (src/lib/date.ts)
- [x] Article sorting by createdAt (newest first, git-history-accurate)
- [x] Pre-deploy pipeline: 9 gates, including approval-workflow enforcement
- [x] Rate limiting on all API routes + security headers in next.config.ts
- [x] Timing-safe HMAC auth, brute-force protection (5 attempts/15 min)
- [x] Footnote reference system: inline [1] markers + Sources section at bottom (replaces inline external links)
- [x] Unsplash hero + inline images for articles (AI generates search terms, photographer attribution)
- [x] Homepage: Yahoo Finance-style 3-column grid + show-more article stream (5 at a time)
- [x] Branded hero-default.svg placeholder for articles without Unsplash photos
- [x] Canonical URLs on all pages (fixes GSC duplicate issues)
- [x] Full sitemap coverage (roasts, picks, takes, learn guides, legal pages)
- [x] TradingView widgets: ticker tape (site-wide), stock charts (/stock/[ticker]), mini charts (articles), market movers (homepage)
- [x] Anti-hallucination guardrails: 8 specific rules from observed Haiku errors
- [x] Auto-linkify all registered tickers mentioned in article text
- [x] Delete articles from dashboard (two-step confirmation)
- [x] Dynamic OG images via /og route (stock, article, default variants) — nodejs runtime
- [x] Twitter/X card meta tags (summary_large_image)
- [x] News sitemap for Google News (last 2 days)
- [x] Bracket builder (/bracket) — user-submitted AI tournaments (feature-flagged)
- [x] Ad pixels (Meta, X, Google Ads) infrastructure ready
- [x] GA4 lead tracking uses the standard `generate_lead` event after a confirmed subscription

---

## What's Next (Priority Order)

### Priority 1: Configure and Validate Approval-First Production
**Goal: one source-backed weekday draft, never an automatic publication.**
- [ ] Approve the August 2026 assistant-generated plan
- [ ] Run a morning draft and verify research citations, report quality, and Git persistence
- [ ] Test an optional coding-assistant scheduled task after the manual workflow is accepted
- [ ] Verify the public sitemap/indexing footprint after deployment

### Priority 2: Reddit Distribution (IN PROGRESS)
**Goal: First organic traffic from Reddit.**
- [x] Reddit account created (building karma — account too new for self-promotion)
- [ ] Build karma in r/CanadianInvestor, r/PersonalFinanceCanada (targeting 2-3 weeks)
- [ ] Post first roast as text post with link (anti-Motley-Fool angle)
- [ ] Answer "should I buy X?" questions with real analysis + link
- [ ] Do NOT spam — genuine contributions with occasional links

### Priority 3: SEO Landing Pages (Week 2-3)
**Goal: Capture Motley Fool's ad keywords with better content.**

**New /learn guides (high-SEO-value, evergreen):**
- [x] /learn/dividend-investing — DONE (yields, DRIP, tax credit, red flags)
- [x] /learn/us-stocks-from-canada — DONE (Norbert's Gambit, W-8BEN, withholding)
- [ ] /learn/etf-basics — what ETFs are, MER, how to pick one
- [ ] /learn/how-to-start-investing — beginner guide for 20-somethings
- [ ] /learn/tax-loss-harvesting — Canadian-specific rules
- [ ] /learn/index-investing — XEQT/VEQT/VFV explained simply

**SEO landing pages:**
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
- [x] OG image generation — DONE (dynamic /og route with stock, article, default variants)

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
- [ ] **BullOrBS Chat** — AI chatbot on /chat, 10 free prompts then paywall. OpenRouter free models (Gemini Flash). IP/cookie-based prompt counting. Build when traffic hits 100+ daily visits.
- [ ] WallStreetBets daily recaps (/wsb/[date])
- [ ] Premium reports ($20/report, personalized portfolio)
- [ ] Batch API (50% cost reduction for scheduled generation)
- [ ] Real-time data source (when revenue justifies licensing)
- [ ] Crypto coverage (CoinGecko API)

---

## Architecture Decisions
See [architecture-decisions.md](architecture-decisions.md) for ADR-001 through ADR-019.

Key decisions:
1. One assistant-neutral workflow contract; API mode optionally uses separate stage models and keys
2. Web-search research packets over model memory for material claims
3. Human approval after automated verification; never direct auto-publication
4. EST timezone for all dates (Canadian audience)
5. Dynamic ticker registry (no manual tickers.ts editing)
6. Qualitative analysis style (avoids hallucinated numbers)
7. Footnote references replace inline external links — keeps readers on-site (ADR-015)
8. Anti-hallucination guardrails from observed Haiku errors (ADR-011)
9. Auto-linkify all registered tickers in article text (ADR-012)
10. Canonical URLs on all pages — fixes GSC duplicate issues (ADR-016)
11. TradingView embedded widgets for live market data at zero cost (ADR-017)

## Cost Model
| Item | Cost |
|---|---|
| Assistant-operated planning/research/writing/verification | Included with the chosen coding assistant |
| Optional unattended API execution | Depends on configured stage models and web-search calls |
| Vercel hosting | $0 (free tier) |
| Cloudflare DNS | $0 |
| Domain (bullorbs.com) | ~$10/year |
| **Monthly AI total** | Measure after first approved plan and representative draft run |

## Content Workflow
```
Any capable coding assistant creates weekday assignments from EDITORIAL_WORKFLOW.md
    → Operator approves the plan in /orange
        → A research pass searches the web and saves a source packet
            → A separate writing pass drafts only from that packet
                → A separate verification pass checks all material claims
                    → Quality gate scores evidence, originality, transparency, and usability
                        → Morning email links to private review
                            → Operator approves or rejects
                                → Approved article commits to GitHub and Vercel deploys
```

## Source Citation Pipeline (Footnote System — updated 2026-03-23)
```
Research prompt outputs [Source](URL) in table
    → Pasted data carries URLs into dashboard
        → SOURCE_CITATION_RULES enforces footnote markers [1], [2] in Haiku output
            → Haiku outputs "references" array with {id, source, url}
                → inlineFormat() renders [N] as superscript markers
                    → Article page renders "Sources" section at bottom with clickable links
                    → DataPoints component still renders sourceUrl on data cards
                    → Internal /stock/ links still inline (added by linkifyTickers at render time)
```
