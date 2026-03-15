# BullOrBS — Design Queue & Project Tracker
**Last updated: 2026-03-15**

---

## Session Rules
- **Every session**: Start by reading `CLAUDE.md` + `DESIGN_QUEUE.md`
- **Every 45 min**: Remind user to open a new session (context gets stale)
- **Before closing**: Update this file with what was done and what's next

---

## Current Sprint: Content Volume + India Expansion + OG Optimization

### In Progress
| Task | Status | Notes |
|------|--------|-------|
| OG image redesign | Done locally, not pushed | Bigger grades, white titles, CTAs, TakeOG variant |
| Docs update (all 9 docs) | Done locally, not pushed | Current counts, Vercel, completed items marked |
| CLAUDE.md rewrite | Done locally, not pushed | Best practices from Prop Manage Flow added |
| India traffic signal | Investigating | Indian articles getting more hits — testing expansion |
| GitHub token expired | Blocked | Need fresh PAT to push |

### Up Next (Priority Order)
| # | Task | Why | Effort |
|---|------|-----|--------|
| 1 | **Push all local changes** | 14 files waiting, OG + docs + CLAUDE.md | 5 min (need token) |
| 2 | **Add 15-20 Indian tickers** | India traffic signal — test the market | 30 min |
| 3 | **Pump 5-10 India-focused takes** | Validate India audience with content | 1 hr |
| 4 | **Scrub git history** | Personal name + emails in history of public repo | 30 min |
| 5 | **Fact-check backlog** | 17 roasts/picks have 0 Opus fact-checks | Ongoing |
| 6 | **Reddit karma building** | Account too new — need 2-3 weeks of comments | Ongoing |
| 7 | **Compare pages** (/compare/xeqt-vs-veqt) | High SEO value, head-to-head format | 2 hrs |
| 8 | **More learn guides** | /learn/etf-basics, /learn/index-investing | 1 hr each |
| 9 | **Mobile hamburger menu** | Nav overlaps on small screens | 1 hr |
| 10 | **Beehiiv migration** | Move subscribers off JSON file | 1 hr |

---

## Done (Recent Sessions)

### Session: 2026-03-15 (Codebase Map + Doc Update + OG Redesign)
- [x] Full codebase map: every file, imports, exports, callers
- [x] Updated all 9 docs to current state (34 articles, 115 tickers, Vercel)
- [x] Fixed docs-generate.js to count takes
- [x] Added ADR-013 (Vercel migration) + ADR-014 (news takes)
- [x] Redesigned OG images: bigger grades, white titles, CTAs, separate TakeOG
- [x] Passed newsSource to OG route for takes
- [x] Rewrote CLAUDE.md with best practices (workflow, security, AIO, boundaries)
- [x] Scrubbed subscribers.json (personal emails) + "Rishi" from docs
- [x] Emailed codebase report to reshevyas@gmail.com (draft)
- [ ] Push blocked — GitHub token expired

### Session: 2026-03-14
- [x] Added takes: stock market lows, big tech AI spending, India IT selloff
- [x] Fixed OG images: cache headers + cache-bust + take badge

### Session: 2026-03-13
- [x] XEQT ETF comparison article (12 ETFs)
- [x] Inline source hyperlinks standard (ADR-010)
- [x] Anti-hallucination guardrails (ADR-011)
- [x] Auto-linkify all registered tickers (ADR-012)
- [x] 16 new ETFs added to tickers.ts
- [x] Adobe + CVX roasts
- [x] Canadian Natural Resources take

---

## Content Scoreboard
| Type | Count | Target | Pace |
|------|-------|--------|------|
| Roasts | 10 | 50 by Month 2 | 1-2/week |
| Picks | 7 | 20 by Month 2 | 1/week |
| Takes | 17 | 100 by Month 2 | 3-4/day |
| **Total** | **34** | **170** | |
| Stock pages | 115 | 200+ | Add with articles |
| Learn guides | 5 | 10 | 1/week |
| Fact-checked | 0/17 | 17/17 | Backlog |

## Key Metrics to Watch
- **GA4 geo split**: Canada vs India vs US (drives content strategy)
- **X click-through on OG images**: new design vs old
- **Google Search Console**: impressions, clicks, avg position
- **Article pace**: 3-4 takes/day + 1-2 roasts-picks/week

## Blocked / Waiting
| Item | Blocker | Action Needed |
|------|---------|---------------|
| Push to GitHub | Token expired | Generate new PAT |
| Reddit posting | Account too new | Keep commenting, wait 2-3 weeks |
| Email distribution | GMAIL_APP_PASSWORD not set in Vercel | Add env var |
| Bracket builder | Feature-flagged (ENABLE_BRACKET) | Enable when ready |

## Ideas Backlog (Not Prioritized)
- BullOrBS Chat (AI chatbot, freemium, Month 3+)
- WSB daily recaps (/wsb/[date])
- Premium reports ($20/report)
- Batch API (50% cost reduction)
- Sector landing pages (/sectors/financials)
- Track record page (/track-record)
- Newsletter review pages (/newsletter-review/[name])
