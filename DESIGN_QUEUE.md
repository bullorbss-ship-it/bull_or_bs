# BullOrBS — Design Queue & Project Tracker
**Last updated: 2026-03-23**

---

## Session Rules
- **Every session**: Start by reading `CLAUDE.md` + `DESIGN_QUEUE.md`
- **Every 45 min**: Remind user to open a new session (context gets stale)
- **Before closing**: Update this file with what was done and what's next

---

## Current Sprint: SEO Fixes + UX Polish + Content Volume

### Up Next (Priority Order)
| # | Task | Why | Effort |
|---|------|-----|--------|
| 1 | **Add 15-20 Indian tickers** | India traffic signal — test the market | 30 min |
| 2 | **Pump 5-10 India-focused takes** | Validate India audience with content | 1 hr |
| 3 | **Scrub git history** | Personal name + emails in history of public repo | 30 min |
| 4 | **Fact-check backlog** | 20 roasts/picks have 0 Opus fact-checks | Ongoing |
| 5 | **Reddit karma building** | Account too new — need 2-3 weeks of comments | Ongoing |
| 6 | **Double down on Reddit** | Best traffic source (25 users). Post NBIS-style content | Ongoing |
| 7 | **Compare pages** (/compare/xeqt-vs-veqt) | High SEO value, head-to-head format | 2 hrs |
| 8 | **More learn guides** | /learn/etf-basics, /learn/index-investing | 1 hr each |
| 9 | **Mobile hamburger menu** | Nav overlaps on small screens | 1 hr |
| 10 | **Beehiiv migration** | Move subscribers off JSON file | 1 hr |
| 11 | **Outbound click tracking** | GA4 custom event for external link clicks — real bounce data | 30 min |

---

## Done (Recent Sessions)

### Session: 2026-03-23 (SEO Fixes + Footnote References + Homepage UX)
- [x] Added canonical URLs to all 19 pages (fixes 8 GSC "duplicate without canonical" errors)
- [x] Added 7 missing pages to sitemap.xml (roasts, picks, takes, methodology, privacy, terms, learn guides)
- [x] Replaced inline external links with footnote reference system [1], [2] + Sources section at bottom
- [x] Retrofitted 11 most recent articles (137 inline links → footnote references)
- [x] Updated all 6 AI prompts for footnote-style citations going forward
- [x] Homepage: article stream now shows 5 cards + "Show more" button (loads 5 more each click)
- [x] Created branded hero-default.svg for articles without Unsplash photos
- [x] Fixed hero card: OG image no longer overlaps with HTML text overlay

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
| Roasts | 13 | 50 by Month 2 | 1-2/week |
| Picks | 7 | 20 by Month 2 | 1/week |
| Takes | 33 | 100 by Month 2 | 3-4/day |
| **Total** | **53** | **170** | |
| Stock pages | 115 + dynamic | 200+ | Add with articles |
| Stock profiles | 91 | 200+ | Add with articles |
| Learn guides | 5 | 10 | 1/week |
| Fact-checked | 0/20 | 20/20 | Backlog |

## Key Metrics to Watch (GA4 — 2 weeks in)
- **174 active users** (~145 real, ~30 bots from Council Bluffs/Boardman)
- **2m 44s avg engagement** — strong for new site
- **Reddit: 25 users** — best organic channel
- **Google organic: 3** — expected, domain sandbox
- **Twitter: 75 sessions but 97% bounce** — needs fixing
- **Article pace**: 3-4 takes/day + 1-2 roasts-picks/week

## Blocked / Waiting
| Item | Blocker | Action Needed |
|------|---------|---------------|
| Reddit posting | Account too new | Keep commenting, wait 2-3 weeks |
| Email distribution | GMAIL_APP_PASSWORD not set in Vercel | Add env var |
| Bracket builder | Feature-flagged (ENABLE_BRACKET) | Enable when ready |
| Twitter bounce rate | OG/landing page mismatch | Test different tweet formats |

## Ideas Backlog (Not Prioritized)
- BullOrBS Chat (AI chatbot, freemium, Month 3+)
- WSB daily recaps (/wsb/[date])
- Premium reports ($20/report)
- Batch API (50% cost reduction)
- Sector landing pages (/sectors/financials)
- Track record page (/track-record)
- Newsletter review pages (/newsletter-review/[name])
- Filter bot traffic in GA4 (Council Bluffs/Boardman IPs)
