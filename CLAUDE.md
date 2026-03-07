# NotSoFoolAI — Project Instructions

## What This Is
AI-driven stock analysis newsletter competing on SEO/AIO with Motley Fool, Seeking Alpha, and other financial publications. Covers TSX and US markets. "Made in Canada, for everyone."

## Core Strategy: SEO is the Moat
- Must rank for EVERY stock search in Canadian market
- Programmatic SEO: 61+ ticker pages auto-generated
- Long-tail targeting: "should I buy [TICKER]", "[TICKER] stock analysis 2026"
- Satire/audit angle targeting multiple newsletters (not just Motley Fool)
- Every claim must have facts, data, and references

## Anonymity — CRITICAL
- Owner identity must NEVER appear in code, commits, comments, or config
- Git user: `NotSoFoolAI <266206598+notsofoolai@users.noreply.github.com>`
- No personal names, emails, or identifiers anywhere in the codebase
- Domain WHOIS is redacted via Cloudflare

## Project Structure
```
content/              # Article JSON files (roasts/, picks/)
data/                 # App data (subscribers.json)
src/
  app/                # Next.js App Router pages & API routes
    stock/            # /stock index + /stock/[ticker] programmatic pages
    article/[slug]/   # Article detail pages
    api/              # generate, subscribe endpoints
  components/
    article/          # ArticleCard, Tournament, DataPoints, RisksAndCatalysts, Verdict
    forms/            # SubscribeForm
    layout/           # Header, Footer
  config/
    site.ts           # Single source of truth — name, URL, social links
    seo.ts            # Default metadata, Schema.org helpers
  lib/
    ai/
      prompts.ts      # System prompts for Claude
      generate.ts     # Claude API calls (Haiku + web search)
      parse.ts        # Response parsing, markdown formatting
    content.ts        # Article CRUD (read/write JSON from content/)
    tickers.ts        # TSX + US ticker data for programmatic pages
    types.ts          # All TypeScript types
```

## Design
- Light/clean theme with dark mode support (prefers-color-scheme)
- Accessible to all ages — not hacker aesthetic
- Fast loading (Core Web Vitals = SEO ranking factor)
- Blue accent (#0066ff light, #3b82f6 dark)

## Conventions
- Always use `siteConfig` from `src/config/site.ts` — never hardcode site name/URL
- Always use SEO helpers from `src/config/seo.ts` — never inline Schema.org JSON
- New components go in the appropriate subdirectory (layout/, article/, forms/)
- AI logic stays in `src/lib/ai/`
- Content (articles) in `content/`, app data in `data/`
- Ticker data in `src/lib/tickers.ts` — add new tickers there

## Satire Targets (not just Motley Fool)
- Motley Fool Canada (fool.ca), Seeking Alpha, Zacks
- Globe and Mail, BNN Bloomberg stock picks
- Any popular newsletter making public recommendations

## Content Types
- **Roast** (`content/roasts/`): Audits a stock recommendation. Grade A-F.
- **Pick** (`content/picks/`): AI elimination tournament. 10-15 candidates.
- **Stock Page** (`/stock/[ticker]`): Programmatic SEO page per ticker with FAQ schema.

## Deployment
- Render free tier, public GitHub repo (github.com/notsofoolai/notsofoolai)
- Env vars in Render: `ANTHROPIC_API_KEY`, `SCAN_SECRET`
- Auto-deploys on push to `main`
- Domain: notsofoolai.com (Cloudflare DNS)

## Legal
- Every page: "not financial advice" + "not affiliated" disclaimer
- Roast = commentary/criticism (fair dealing / fair use)
- Footer legal notice on all pages

## SEO/AIO
- Schema.org: Article, FAQPage, Organization structured data
- 61+ programmatic /stock/[ticker] pages with FAQ schema
- Sitemap includes all stock pages + articles
- RSS feed, robots.txt auto-generated
- Every stock page targets: "should I buy [TICKER]", "[TICKER] stock analysis"
