# BullOrBS — Design Queue & Project Tracker
**Last updated: 2026-07-28**

---

## Session Rules
- **Every session**: Start by reading `CLAUDE.md` + `DESIGN_QUEUE.md`
- **Every 45 min**: Remind user to open a new session (context gets stale)
- **Before closing**: Update this file with what was done and what's next

---

## Current Sprint: Quality Recovery + Approval-First Editorial Automation

### Up Next (Priority Order)
| # | Task | Why | Effort |
|---|------|-----|--------|
| 1 | **Review the CASH vs CBIL vs PSA test draft** | Confirm research depth, comparison usefulness, voice, and approval report before publication | 20 min |
| 2 | **Test an optional coding-assistant scheduled task** | Confirm a morning run can return to the same project chat | 30 min |
| 3 | **Deploy and verify indexing controls** | Confirm daily briefs/thin stocks emit noindex and sitemap is reduced | 45 min |
| 4 | **Submit sitemap and validate sample URLs in GSC** | Move excluded URLs into intentional noindex/canonical states | 30 min |
| 5 | **Audit the 16 GSC article URLs** | Improve or retain noindex based on evidence quality | Ongoing |
| 6 | **Configure GA4 bot/internal-traffic filters** | 81% of active users were attributed to Singapore and 99% of channel-attributed new users were Direct | 30 min |
| 7 | **Validate GA4 `generate_lead` in DebugView** | Six stored subscribers were absent from the zero-lead export | 20 min |
| 8 | **Build GA4 conversion dashboard** | Join GSC discovery to engagement and subscription behavior | 1 hr |
| 9 | **Reddit distribution for approved comparisons** | Best demonstrated referral source | Ongoing |
| 10 | **Scrub historical unintended identity data** | Creator is now public, but unrelated private data still must be removed | 30 min |

---

## Done (Recent Sessions)

### Session: 2026-07-28 (Quality Recovery + Approval-First Editorial System)
- [x] Synced 163 production commits; current inventory is 239 articles, including 166 legacy automated daily briefs
- [x] Replaced direct daily auto-publication with a repository-operated workflow
- [x] Made assistant-operated mode the default; no external model API keys required
- [x] Added a canonical `EDITORIAL_WORKFLOW.md` contract runnable by any repository-capable coding assistant
- [x] Added neutral `AGENTS.md` discovery plus a thin optional `.agents` skill adapter
- [x] Retained isolated plan/research/writer/verifier API routing as an optional unattended mode
- [x] Deep research uses web search and requires 5 sources including 2 primary sources
- [x] Writer receives only the saved research packet; independent verifier checks all material claims
- [x] Added Git-backed private plans/drafts, morning approval emails, and `/orange` approval UI
- [x] Direct admin publishing blocked; approval quality gate is mandatory
- [x] Legacy automated briefs are noindex and removed from homepage/listings/feed/sitemaps
- [x] Thin stock pages without reviewed coverage are noindex and omitted from sitemap
- [x] Sitemap modification dates now reflect actual content changes
- [x] Added permanent www→apex application redirect and noindex header for `/og`
- [x] Analyzed GSC export: 52 URLs, 33 stock, 16 article, 22 www, 12 duplicate paths
- [x] Added Local Tech Edge creator attribution with explicit non-financial-credential clarification
- [x] Updated public methodology/editorial promises to match the real workflow
- [x] Added GA4 outbound-link tracking plus 50% and 90% article scroll events
- [x] Analyzed the lead export: 412 new users, 407 Direct, 336/415 active users from Singapore, zero reported leads/conversions
- [x] Reconciled six stored subscribers against the zero-lead report and added the standard GA4 `generate_lead` event
- [x] Added `.agents/skills/bullorbs-editorial` with explicit plan and publication approval boundaries
- [x] Added deterministic editorial plan/draft artifact validation
- [x] Generated the August 2026 plan: 21 weekdays, 13 comparisons, 4 recommendation audits, and 4 Canadian guides; pending owner approval
- [x] Approved the August 2026 plan with all 21 assignments remaining private until their draft gates pass
- [x] Ran the first assignment early as an end-to-end test: CASH vs CBIL vs PSA, 11 primary sources, verifier pass, 100/100 quality score, pending draft approval

### Session: 2026-06-10 (Briefing First Run: Fixes + Full-Length Format)
- First live cron run: 3/4 briefs published; geopolitics slot failed; then the Vercel deploy broke
- [x] **Commit race fixed** (`c5b381b`) — 4 slots committed to GitHub in parallel and raced on branch head ("is at X but expected Y"). Commits now serialized via queue in cron route + 409 retry in `github-commit.ts`. Generation stays parallel.
- [x] **Build-killer fixed** — Haiku emitted ticker-less `candidates` in 2 digests → `c.ticker.toLowerCase()` crashed prerender → whole deploy failed. Cron now forces `candidates: []`, Tournament filters malformed entries, 3 live articles scrubbed. Verified: all 3 briefs 200 on prod.
- [x] **Briefs upgraded to 4-5 min reads** (`b26b076`, owner request — old ones too thin). BRIEFING_PROMPT now take-style: 800-1100 words, ## The Big Story / ## What Else Moved / ## Connecting the Dots / ## What to Watch, footnote [N] markers + references mandatory, risks/catalysts from sources only, anti-padding rule. max_tokens 9000. Cost ~$0.03-0.04/brief.

**TOMORROW (2026-06-11): check the 6 AM EDT run** — expect 4/4 slots published (geopolitics back), full-length format, footnotes rendering, no deploy failure. Tune prompt voice/length if needed.

### Session: 2026-06-09 part 2 (Design Polish + Daily Briefing DEPLOYED)
- [x] **Design-system pass (owner approved):** `-strong` WCAG text tokens (9 colors, light+dark) applied to badges/links/labels; body copy `text-muted`→`text-foreground/90`; markdown h2/h3 size bump; TickerSearch uses shared badges.ts; 9px metadata→11px
- [x] **ConsentGate → inline dismissible banner** (was blur-gate); **NewsletterPopup skips first-ever visit** — the two stacked within 60s for new social visitors (97% Twitter bounce suspect)
- [x] **npm override forces postcss ≥8.5.10 inside Next** — `npm audit` now 0 vulns; Next at 16.2.9; lockfile regenerated
- [x] **DEPLOYED daily briefing**: rebased onto remote (5 article commits had landed since April — git auth works again), all 8 pre-deploy gates passed, pushed `46ab0b0`. Cron ENABLED in vercel.json: `0 10 * * *` (6 AM EDT daily)
- [x] GitHub rejected gmail author (email privacy setting) — all unpushed commits rewritten to `BullOrBS <266401801+bullorbss-ship-it@users.noreply.github.com>`; repo git config now uses the noreply address (NOT bull.or.bss@gmail.com — CLAUDE.md says gmail but GitHub blocks it)
- [ ] **Prod dry-run NOT done** (CRON_SECRET only in Vercel, no local .env) — owner is checking the first 6 AM EDT run himself
- Old single-story daily articles stay (owner decision 2026-06-09 — no deletion needed)

### Session: 2026-06-09 (Security Hardening + SEO/AIO + UX Audit Fixes)
**Security (from full-codebase audit):**
- [x] Fixed stored XSS — `inlineFormat()` now HTML-escapes before markdown transforms (`escapeHtml()` in `src/lib/inline-format.ts`); covers analysis, summary, risks/catalysts, tournament, foolClaim render paths
- [x] Fixed JSON-LD injection — new `safeJsonLd()` in `src/config/seo.ts` escapes `</script>` breakout; applied to ALL `application/ld+json` sites (layout, article, stock, editorial)
- [x] Upgraded Next.js 16.1.7 → 16.2.7 (high-severity advisories), nodemailer 8.0.1 → 8.0.10 (SMTP injection), picomatch (ReDoS). Remaining: 2 moderate postcss advisories nested in Next (needs canary — skip)
- [x] SSRF fix — `/og?bg=` now allowlisted to `https://images.unsplash.com` only
- [x] Rate-limit bypass fix — new `getClientIp()` trusts `x-real-ip`/rightmost XFF (was spoofable leftmost) across login/generate/subscribe/health/bracket
- [x] Path traversal fix — slug validated `^[a-z0-9-]+$` in admin commit + delete routes
- [x] Added `Strict-Transport-Security` header; genericized delete route error responses
- [x] Fixed repo-local git identity (was personal name → BullOrBS). Git history scrub still pending (task #3)
- Audit verified clean: auth/HMAC, cookies, secrets, anonymity in tracked files, admin route coverage
**SEO/AIO:**
- [x] Stock page titles no longer double the brand (was `… | BullOrBS | Bull Or BS` on 115+ pages)
- [x] Takes now emit `NewsArticle` schema (was generic Article); schema gets `image`, `publisher.logo`, `author.url`
- [x] BreadcrumbList schema on article pages; WebSite schema in layout
- [x] Visible FAQ section on article pages (schema previously described invisible content — spam-policy risk)
- [x] Stock pages render all 10 FAQs (was 7 rendered / 10 in schema) + deduped near-identical Q2/Q4
- [x] `public/llms.txt` for AI crawlers; news sitemap publication name unified to "Bull Or BS"
- [x] `listingPageMeta()` helper — listing pages (/roasts /picks /takes /daily /learn /stock) get own OG/Twitter/canonical + RSS autodiscovery (Next's shallow metadata merge was dropping it site-wide)
- [x] Unsplash images CDN-sized (`sizedImageUrl()` in `src/lib/images.ts`), `fetchPriority="high"` on heroes, preconnect to unsplash/tradingview
**UX/Accessibility:**
- [x] Mobile drawer clip fixed (grid-rows animation, no magic max-h); Escape closes; aria-controls
- [x] Active nav state via `usePathname()` + `aria-current`
- [x] Subscribe header link → `/#subscribe`; `id="subscribe"` anchors on article + stock pages
- [x] Skip-to-content link; global `:focus-visible` outlines; ScoreGauge aria-label; logo alt="" (was double-announcing); NewsletterPopup Escape + autofocus
**NOT done (needs owner sign-off — design system):** contrast token fixes (gold/accent/muted-light text fail WCAG on white), body copy `text-muted`→`text-foreground/90`, badge style consolidation, ConsentGate+NewsletterPopup double-interstitial (likely Twitter bounce cause), micro-text bump (9px→11px)

### Session: 2026-04-14 (Daily Briefing Feature + Cron Pause)
- [x] Paused Vercel cron `/api/cron/daily-topics` (7 AM EDT topic suggestions email) — emptied `crons` array in vercel.json. Route file left in place; restore entry to re-enable.
- [x] Built **Daily Briefing** — fully automated 4-Take morning digest (plan: `~/.claude/plans/kind-questing-piglet.md`).
  - New files: `src/lib/rss-feeds.ts`, `src/lib/news-fetcher.ts`, `src/lib/github-commit.ts`, `src/app/api/cron/daily-briefing/route.ts`, `src/app/daily/page.tsx`, `src/app/daily/[date]/page.tsx`
  - Modified: `src/components/layout/Header.tsx` (+ Daily nav), `src/app/sitemap.ts` (+ /daily entries), `src/app/api/admin/commit/route.ts` (use shared commit helper)
  - Categories: AI/Tech, Markets/Macro, Canada/TSX, Global. Allowlisted RSS sources only.
  - Dedupe: Jaccard similarity ≥0.6 vs last 7 days of takes.
  - Failure mode: silent skip if <4 qualifying stories. Publishes fewer, never forces filler.
  - Cost: ~$0.08/day ($2.40/mo).
  - **NOT YET ENABLED**: Vercel `crons` array still `[]`. Phase 1 = deploy, run `?dryRun=1` in prod with real API keys. Phase 2 = manual live run. Phase 3 = add cron entry to `vercel.json`.
  - Local smoke test: auth ✓, parallel orchestration ✓, RSS parse + rank ✓, per-slot failure isolation ✓. Haiku call deferred to Vercel (no local API key).

### Session: 2026-03-25 (TradingView Widgets + AMZN Fact-Check Fix)
- [x] Added TradingView ticker tape (scrolling bar above header, site-wide)
- [x] Added TradingView full chart on /stock/[ticker] pages
- [x] Added TradingView mini chart on article pages (non-clickable overlay)
- [x] Added Market Movers widget (top gainers/losers/most active) on homepage
- [x] New components: TickerTape, TradingViewChart, MarketMovers in src/components/ui/
- [x] Fixed AMZN roast fact-check: Q4 2024→Q4 2025, FCF context (both unleveraged + levered), dead source [3] replaced with CNBC URL
- [x] Published: AMZN roast + Walmart take (55 total articles)

### Session: 2026-03-23 (SEO Fixes + Footnote References + Homepage UX + Daily Cron)
- [x] Added canonical URLs to all 19 pages (fixes 8 GSC "duplicate without canonical" errors)
- [x] Added 7 missing pages to sitemap.xml (roasts, picks, takes, methodology, privacy, terms, learn guides)
- [x] Replaced inline external links with footnote reference system [1], [2] + Sources section at bottom
- [x] Retrofitted 11 most recent articles (137 inline links → footnote references)
- [x] Updated all 6 AI prompts for footnote-style citations going forward
- [x] Homepage: article stream now shows 5 cards + "Show more" button (loads 5 more each click)
- [x] Created branded hero-default.svg for articles without Unsplash photos
- [x] Fixed hero card: OG image no longer overlaps with HTML text overlay
- [x] Daily topics cron: Vercel cron at 7am EDT emails 4 topic suggestions (2 picks, 1 roast, 1 take)

### Session: 2026-03-20 (Homepage Redesign + Content)
- [x] Homepage redesign: Yahoo Finance-style 3-column grid on desktop, stream cards on mobile
- [x] Added takes: Microsoft deck shuffling, Canada banks earnings
- [x] Added pick: HURA uranium ETF (then deleted — didn't meet quality bar)

### Session: 2026-03-19 (Unsplash Images + Content)
- [x] Unsplash hero + inline images for articles (AI generates search terms)
- [x] OG images accept ?bg= param for photo backgrounds
- [x] Added takes: Anthropic $380B, war/oil hedging, Gulf war + Fed

### Session: 2026-03-18 (Roasts + Content)
- [x] Meta, Google, Micron roasts
- [x] Added takes: Delta airlines, Microsoft vs OpenAI, nitrogen/geopolitics

### Session: 2026-03-15 (Codebase Map + Doc Update + OG Redesign)
- [x] Full codebase map: every file, imports, exports, callers
- [x] Updated all 9 docs to current state
- [x] Redesigned OG images: bigger grades, white titles, CTAs, separate TakeOG
- [x] Rewrote CLAUDE.md with best practices

---

## Content Scoreboard
| Type | Count | Target | Pace |
|------|-------|--------|------|
| Roasts | 19 | Quality over volume | Approval only |
| Picks | 7 | Quality over volume | Approval only |
| Takes | 213 | Reduce index footprint | Approval only |
| **Total** | **239** | No volume target | |
| Legacy daily briefs | 166 | Review/noindex | Auto-publishing disabled |
| Stock pages | 182 + dynamic | Index only reviewed coverage | Add with articles |
| Stock profiles | 91 | 200+ | Add with articles |
| Learn guides | 5 | 10 | 1/week |
| Fact-checked | 0/20 | 20/20 | Backlog |

## Current Analytics Baseline (2026-06-30 to 2026-07-27)
- **415 active / 412 new users**, but this is not a trustworthy human-audience baseline
- **336 active users from Singapore (81%)** and **407 Direct new users (99% of channel-attributed new users)** indicate automation or unfiltered internal traffic
- **Organic Search: 2 new users**; Organic Social: 2; AI Assistant: 1
- **Qualified leads: 0; converted leads: 0**, while the subscriber store contains 6 addresses — the old event name was not feeding the lead report
- **Top Google impression pages:** `/stock/ivv` 134, screenshot pick 21, `/stock/vwagy` 14; the export contains no organic clicks
- Treat search impressions, engaged-reader events, and confirmed `generate_lead` events as the recovery baseline after deployment

## Blocked / Waiting
| Item | Blocker | Action Needed |
|------|---------|---------------|
| Reddit posting | Account too new | Keep commenting, wait 2-3 weeks |
| Optional email distribution | GMAIL_APP_PASSWORD not set in Vercel | Only needed if API-mode email reports are enabled |
| Bracket builder | Feature-flagged (ENABLE_BRACKET) | Enable when ready |
| Twitter bounce rate | OG/landing page mismatch | Test different tweet formats |
| Daily topics cron | Paused 2026-04-14 | Restore `crons` entry in vercel.json when ready |
| Approval-first workflow | First CASH vs CBIL vs PSA draft awaits owner review | Review `draft-2026-08-03-cash-vs-cbil-vs-psa`; approve and publish, request revisions, or reject |
| Analytics trust | Bot/internal traffic filters are not configured in GA4 | Exclude known internal and data-centre traffic before using active-user totals |

## Ideas Backlog (Not Prioritized)
- BullOrBS Chat (AI chatbot, freemium, Month 3+)
- WSB daily recaps (/wsb/[date])
- Premium reports ($20/report)
- Batch API (50% cost reduction)
- Sector landing pages (/sectors/financials)
- Track record page (/track-record)
- Newsletter review pages (/newsletter-review/[name])
- Validate approved comparisons before building dedicated compare routes
