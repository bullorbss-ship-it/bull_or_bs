# BullOrBS — Project Instructions

## Session Protocol — READ THIS FIRST

### Start of Every Session
1. **Re-read this file** (`CLAUDE.md`) and `DESIGN_QUEUE.md` before doing anything
2. State what you see as the current task from DESIGN_QUEUE.md
3. Ask: "Is this still the priority, or has something changed?"

### Before Writing Any Code
**MANDATORY** — Before touching a single file, tell me:
- Which files you will **modify**
- What functions/components you will **add**
- What you will **NOT touch**
- Wait for my OK before proceeding

### After Completing Any Task
1. Update `DESIGN_QUEUE.md` — mark task done, add any new tasks discovered
2. If anything significant was learned or decided, save to memory

### Remind Me
- After 45 minutes of active work, remind me: "Hey — good time to start a new session. Re-paste CLAUDE.md and DESIGN_QUEUE.md when you do."

## What This Is
AI-driven stock analysis site competing on SEO/AIO with major financial publications. Covers TSX, US, and emerging markets. Anti-newsletter angle — we fact-check stock recommendations so readers don't have to.

## Anonymity — CRITICAL
- Owner identity must NEVER appear in code, commits, comments, config, or docs
- Git user: `BullOrBS <bull.or.bss@gmail.com>` / `bullorbss-ship-it`
- No personal names, emails, or identifiers anywhere in the codebase
- Domain WHOIS is redacted via Cloudflare
- Scan for leaks before every push: names, personal emails, API keys

## Tech Stack
- **Framework**: Next.js 16 App Router + React 19
- **Styling**: Tailwind CSS v4
- **AI**: Claude Haiku 4.5 via @anthropic-ai/sdk, OpenRouter free models as fallback
- **Hosting**: Vercel free tier (auto-deploy from main)
- **DNS**: Cloudflare
- **Analytics**: GA4 (G-E7ZLH22KZ1)
- **Data**: Local JSON files (content/, data/stocks/), GitHub Contents API for writes

## Project Structure
```
content/              # Article JSON (roasts/, picks/, takes/)
data/                 # Stock profiles (stocks/*.json), subscribers, dynamic tickers
docs/                 # Strategy docs, architecture decisions, fact-check log
public/               # Brand assets (logo.svg, icon.svg, profile.svg)
scripts/              # Pre-deploy gates + bulk generators
src/
  app/                # Next.js App Router pages & API routes
    stock/            # /stock index + /stock/[ticker] programmatic pages
    article/[slug]/   # Article detail pages
    api/              # generate, subscribe, health, admin/*, cron/daily-topics
    orange/           # Admin dashboard (password-protected, noindex)
    learn/            # Financial education guides (TFSA, RRSP, FHSA, etc.)
    og/               # Dynamic OG image generation (nodejs runtime ONLY)
  components/
    article/          # ArticleCard, ArticleStream, Tournament, DataPoints, RisksAndCatalysts, Verdict, ScoreGauge
    forms/            # SubscribeForm
    layout/           # Header, Footer, Breadcrumbs
    stock/            # StockGrid, TickerSearch
    bracket/          # BracketBuilder
    ui/               # Collapsible, TickerTape, TradingViewChart, MarketMovers
  config/
    site.ts           # Single source of truth — name, URL, social links
    seo.ts            # Default metadata, Schema.org helpers
  lib/
    ai/
      prompts.ts      # System prompts for all 6 content types
      generate.ts     # Claude API orchestrator (Haiku 4.5 for everything)
      parse.ts        # JSON extraction, markdown→HTML, ticker auto-linking
      providers.ts    # Multi-provider adapter (Anthropic + OpenRouter)
      legal.ts        # Compliance — trademark scrubbing
      ticker-profiles.ts  # Reference sheets from local JSON
      refresh-profile.ts  # Profile freshness updater via Gemini
      research-prompt.ts  # Research templates for manual data gathering
    content.ts        # Article CRUD (read/write JSON)
    tickers.ts        # Static TSX + US ticker data (115 tickers)
    ticker-registry.ts # Dynamic ticker registration
    stock-data.ts     # Read/write data/stocks/*.json profiles
    types.ts          # All TypeScript types
    auth.ts           # HMAC session tokens (stateless)
    rate-limit.ts     # In-memory rate limiter (per API route)
    inline-format.ts  # Markdown → safe HTML
    badges.ts         # Article/ticker badge styling
    costs.ts          # AI cost tracking
    date.ts           # EST timezone utils
```

## Design
- Light/clean theme with dark mode support (prefers-color-scheme)
- Accessible to all ages — not hacker aesthetic
- Green accent (#10B981), gold (#F59E0B), red (#EF4444), navy (#0F172A)
- Branding: "Bull" (navy) "Or" (gray) "BS" (green) — three-color split
- Target Lighthouse 90+ on all categories

## Conventions
- Always use `siteConfig` from `src/config/site.ts` — never hardcode site name/URL
- Always use SEO helpers from `src/config/seo.ts` — never inline Schema.org JSON
- New components go in the appropriate subdirectory (layout/, article/, forms/, stock/, ui/)
- AI logic stays in `src/lib/ai/`
- Content (articles) in `content/`, app data in `data/`
- Ticker data in `src/lib/tickers.ts` — add new tickers there
- All dates use `todayEST()` / `nowEST()` from `src/lib/date.ts`
- OG route MUST use `runtime = 'nodejs'` — edge runtime blocks static generation

## Content Types
- **Roast** (`content/roasts/`): Audits a stock recommendation. Score 1-10.
- **Pick** (`content/picks/`): AI elimination tournament. 10-15 candidates.
- **Take** (`content/takes/`): News summary in plain English. Source + link required. No speculation.
- **Stock Page** (`/stock/[ticker]`): Programmatic SEO page per ticker with FAQ schema.

## Deployment
- **Vercel free tier**, auto-deploy from `main` branch
- GitHub repo: `github.com/bullorbss-ship-it/bull_or_bs`
- Env vars in Vercel: `ANTHROPIC_API_KEY`, `SCAN_SECRET`, `ADMIN_PASSWORD`, `GITHUB_TOKEN`
- Domain: bullorbs.com (Cloudflare DNS → Vercel)

## Pre-Deploy Pipeline (8 gates)
All gates must pass before pushing to main: `npm run pre-deploy`
1. **Type Check**: `npm run type-check`
2. **Lint**: `npm run lint`
3. **SAST**: `npm run security` (npm audit + eslint-plugin-security)
4. **SEO Check**: `npm run seo-check` (sitemap, meta, schema, brand consistency)
5. **Legal Check**: `npm run legal-check` (trademarks, disclaimers, anonymity, CASL, score floor)
6. **Content Audit**: `npm run content-audit` (learn page + profile freshness)
7. **Docs**: `npm run docs` (auto-generate DEPLOY-STATUS.md)
8. **Docs Check**: `npm run docs-check` (code/docs sync)

## Security

### Rules
- Never commit `.env` files or any file containing secrets
- Store all API keys, passwords, and tokens in environment variables
- Never log passwords, tokens, or personally identifiable information
- Use generic error messages for users — log details server-side only
- All admin routes require HMAC session auth (`src/lib/auth.ts`)
- Rate limiting on all public API routes (`src/lib/rate-limit.ts`)
- Timing-safe comparison for all auth checks (`crypto.timingSafeEqual`)
- Brute-force protection: 5 login attempts per 15 min per IP

### Security Headers (in next.config.ts)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — camera, mic, geolocation blocked

### Pre-Push Security Checklist
- [ ] All secrets in environment variables (none in code)
- [ ] `.env` in `.gitignore`
- [ ] No personal names, emails, or identifiers in code/docs
- [ ] No `ghp_*`, `sk-*`, or API key strings in source
- [ ] `npm audit` passes (no critical vulns)
- [ ] Admin routes behind auth
- [ ] Cookies use `httpOnly`, `secure`, `SameSite=strict`
- [ ] Error messages don't leak internals
- [ ] Rate limiting on all public endpoints

## Legal
- Every page: "not financial advice" + "not affiliated with any publication" disclaimer
- No competitor trademarks in branding, meta tags, OG images, or code identifiers
- Footer legal notice on all pages
- Canadian compliance: "analysis", "opinion", "educational" — never "buy/sell" directives
- Roast = commentary/criticism (fair dealing / fair use) — competitor names only in editorial content

## SEO Best Practices
Every public page MUST include:
- Unique `<title>` tag (under 60 characters)
- Unique `<meta name="description">` (150-160 characters)
- `<link rel="canonical">` pointing to the canonical URL
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`)
- Twitter Card tags (`twitter:card: summary_large_image`)
- Semantic HTML (`<header>`, `<main>`, `<nav>`, `<footer>`)
- One `<h1>` per page — unique and descriptive
- `alt` text on all images
- JSON-LD structured data (Schema.org) via helpers in `seo.ts`

### Schema.org Types in Use
- Article, FAQPage, Organization, BreadcrumbList, Corporation, Review, NewsArticle

### Programmatic SEO
- 115+ /stock/[ticker] pages with FAQ schema (10 Q&A per page)
- Every stock page targets: "should I buy [TICKER]", "[TICKER] stock analysis 2026"
- Sitemap, news sitemap, RSS feed, robots.txt auto-generated
- Dynamic OG images for every page type via `/og` route

## AIO (AI Search Optimization)
Optimize content for AI search engines (ChatGPT, Perplexity, Google AI Overviews):
- Use Q&A format and FAQ sections — AI extracts answers from these
- Add FAQPage schema markup (JSON-LD) for AI citation
- Write concise first-paragraph summaries that directly answer the main question
- Use clear H2/H3 heading hierarchy — AI uses structure to understand topics
- Include specific data, credentials, and sources — AI prefers authoritative content
- Keep content fresh and recently updated
- Allow AI crawlers in `robots.txt` (GPTBot, ClaudeBot, PerplexityBot)

## Performance
Target Lighthouse 90+ on all categories:
- LCP (Largest Contentful Paint) MUST be under 2.5s
- No middleware.ts — edge runtime blocks static generation in Next.js 16
- OG route must be `nodejs` runtime, never `edge`
- Lazy-load images below the fold
- Defer non-critical JavaScript
- Only link article-relevant tickers (avoid catastrophic regex backtracking)
- No JS animation libraries — CSS-only animations

## Skills (Slash Commands)

Custom workflows available via `/command`:

| Skill | Purpose |
|-------|---------|
| `/deploy` | Run pre-deploy pipeline, commit, and push to Vercel |
| `/pre-deploy` | Run all 8 quality gates and report results |
| `/security-scan` | Scan for leaked secrets, API keys, anonymity violations |
| `/code-review` | Review code for quality, bugs, performance, SEO |
| `/new-take` | Quick-add a news take article from a topic |
| `/new-ticker` | Add new stock/ETF tickers to the platform |
| `/doc-updater` | Sync all documentation with current code state |

Skill definitions live in `.claude/skills/[name]/SKILL.md`.

## Hooks (Automated Quality Checks)

Hooks run automatically — no manual invocation needed:

| Trigger | Action |
|---------|--------|
| Before git commit | Scan staged files for secrets (`sk-*`, `ghp_*`, hardcoded keys) — blocks commit |
| After any file edit | Scan for personal identity leaks (owner name/email) — blocks save |

Hook config lives in `.claude/settings.json`. If a hook blocks an action, **fix the issue** — never disable the hook.

## Subagents (Specialist Reviewers)

Use these for focused review tasks that benefit from isolated context:

| Agent | When to Use |
|-------|-------------|
| **Explore agent** | Deep codebase research, find all callers of a function, trace data flow |
| **Security scan** | Before any push — run `/security-scan` |
| **Code review** | After significant changes — run `/code-review` |

## Git Workflow

### Commits
- Concise messages focused on the "why"
- One logical change per commit
- Never commit `.env` or files containing secrets
- Always ask before pushing

### Boundaries

**Always ask before:**
- Deploying / pushing to remote
- Deleting files, data, or branches
- Adding new dependencies
- Changing the design system (colors, fonts, layout)

**Never do:**
- Commit `.env` files or secrets
- Expose detailed error messages to end users
- Skip pre-deploy gates
- Use `edge` runtime on any route
- Hardcode site name/URL (use `siteConfig`)
- Add personal identifiers to code/docs
- Disable hooks or bypass quality checks

**Always do:**
- Read existing code before modifying it
- Explain changes before making them if >3 files affected
- Match existing code style and conventions
- Run `npx tsc --noEmit` after changes
- Test OG images with Twitter card validator after OG changes
- Update `DESIGN_QUEUE.md` after completing tasks
- Run `/security-scan` before pushing to catch leaks
