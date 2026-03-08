# BullOrBS — Project Instructions

## What This Is
AI-driven stock analysis site competing on SEO/AIO with major financial publications. Covers TSX and US markets. "Made in Canada, for everyone."

## Core Strategy: SEO is the Moat
- Must rank for EVERY stock search in Canadian market
- Programmatic SEO: 61+ ticker pages auto-generated
- Long-tail targeting: "should I buy [TICKER]", "[TICKER] stock analysis 2026"
- Audit angle targeting multiple newsletters (Motley Fool, Seeking Alpha, Zacks, etc.)
- Every claim must have facts, data, and references

## Anonymity — CRITICAL
- Owner identity must NEVER appear in code, commits, comments, or config
- Git user: `bullorbss-ship-it <noreply@github.com>`
- No personal names, emails, or identifiers anywhere in the codebase
- Domain WHOIS is redacted via Cloudflare

## Project Structure
```
content/              # Article JSON files (roasts/, picks/)
data/                 # App data (subscribers.json)
docs/                 # Strategy docs, plans, scaling docs
public/               # Brand assets (logo.svg, icon.svg, profile.svg)
src/
  app/                # Next.js App Router pages & API routes
    stock/            # /stock index + /stock/[ticker] programmatic pages
    article/[slug]/   # Article detail pages
    api/              # generate, subscribe, health endpoints
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
      generate.ts     # Claude API calls (Sonnet for roasts, Haiku for picks)
      parse.ts        # Response parsing, markdown formatting
    content.ts        # Article CRUD (read/write JSON from content/)
    tickers.ts        # TSX + US ticker data for programmatic pages
    types.ts          # All TypeScript types
  middleware.ts       # Rate limiting + security headers
```

## Design
- Light/clean theme with dark mode support (prefers-color-scheme)
- Accessible to all ages — not hacker aesthetic
- Fast loading (Core Web Vitals = SEO ranking factor)
- Green accent (#10B981), gold (#F59E0B), red (#EF4444), navy (#0F172A)
- Branding: "Bull" (navy) "Or" (gray) "BS" (green) — three-color split

## Conventions
- Always use `siteConfig` from `src/config/site.ts` — never hardcode site name/URL
- Always use SEO helpers from `src/config/seo.ts` — never inline Schema.org JSON
- New components go in the appropriate subdirectory (layout/, article/, forms/)
- AI logic stays in `src/lib/ai/`
- Content (articles) in `content/`, app data in `data/`
- Ticker data in `src/lib/tickers.ts` — add new tickers there

## Audit Targets
- Motley Fool Canada (fool.ca), Seeking Alpha, Zacks
- Globe and Mail, BNN Bloomberg stock picks
- Any popular newsletter making public recommendations
- Roast = commentary/criticism (fair dealing / fair use) — names only in editorial content, never in branding

## Content Types
- **Roast** (`content/roasts/`): Audits a stock recommendation. Grade A-F.
- **Pick** (`content/picks/`): AI elimination tournament. 10-15 candidates.
- **Stock Page** (`/stock/[ticker]`): Programmatic SEO page per ticker with FAQ schema.

## Deployment
- Render free tier, GitHub repo (github.com/bullorbss-ship-it/bull_or_bs)
- Env vars in Render: `ANTHROPIC_API_KEY`, `SCAN_SECRET`, `ADMIN_PASSWORD`
- Branch strategy: `dev` (work) → `main` (auto-deploys to Render)
- Domain: bullorbs.com (Cloudflare DNS)

## Pre-Deploy Pipeline
All three gates must pass before pushing to main:
1. **SAST**: `npm run security` (npm audit + eslint-plugin-security)
2. **SEO Check**: `npm run seo-check` (sitemap, meta, schema, canonicals)
3. **Legal Check**: manual checklist (trademarks, disclaimers, anonymity, compliance)

## Legal
- Every page: "not financial advice" + "not affiliated with any publication" disclaimer
- No competitor trademarks in branding, meta tags, OG images, or code identifiers
- Footer legal notice on all pages
- Canadian compliance: "analysis", "opinion", "educational" — never "buy/sell" directives

## SEO/AIO
- Schema.org: Article, FAQPage, Organization, BreadcrumbList, Corporation structured data
- 61+ programmatic /stock/[ticker] pages with FAQ schema
- Sitemap includes all stock pages + articles
- RSS feed, robots.txt auto-generated
- Every stock page targets: "should I buy [TICKER]", "[TICKER] stock analysis"
- Dynamic OG images for every page type
