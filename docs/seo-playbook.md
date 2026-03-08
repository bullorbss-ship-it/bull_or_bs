# SEO Playbook — Industry Best Practices

Based on research of MarketBeat ($40M/yr), NerdWallet (18M organic/mo), Seeking Alpha, Investopedia.

## Phase 1: CRITICAL (biggest ranking impact)
1. Dynamic OG images — @vercel/og or Next.js ImageResponse, per page
2. BreadcrumbList schema + visual breadcrumbs on every stock/article page
3. Corporation + tickerSymbol schema — "TSX:SHOP" format on every stock mention
4. Tournament component links — make every ticker clickable
5. Article <-> Stock cross-linking

## Phase 2: HIGH (content quality)
6. Enrich stock pages — financial data sections (key metrics table, analyst view)
7. AIO-format content — headings as questions, 40-60 word lead answers, tables
8. Methodology page (/methodology) — how AI works, data sources, grading (E-E-A-T)
9. Long-tail meta — H1: "Should You Buy SHOP? Shopify Stock Analysis"
10. Expand FAQ schema to 5-10 questions per stock page

## Phase 3: MEDIUM (topic clusters)
11. Build cluster hubs: /compare, /newsletter-review, /sectors/[sector]
12. 404 page with stock browsing CTA
13. NewsArticle schema for roasts/picks
14. Sector landing pages (/sectors/financials, /sectors/energy)
15. Accessibility — ARIA labels, skip-to-main, focus indicators

## Key Patterns from Top Sites
- MarketBeat: one data-rich templated page per ticker, soft login wall
- NerdWallet: 3-tier content (TOFU/MOFU/BOFU) + pillar pages per cluster
- All top sites: 3-click depth max, descriptive anchor text, cross-linked spokes
- AIO: 91% of educational finance queries trigger AI Overviews
- AIO-cited articles have 62% more facts than non-cited
- LLMs 28-40% more likely to cite clearly formatted content
- Use "EXCHANGE:SYMBOL" colon format for tickerSymbol schema

## Structured Data Needed
- Corporation + tickerSymbol (every stock mention)
- BreadcrumbList (every page)
- FAQPage (expanded to 5-10 questions)
- NewsArticle (for roasts/picks)
- FinancialProduct / InvestmentFund (for ETF pages)
- Organization (site-wide, already have)

## Long-Tail Templates Per Ticker
- "should I buy [TICKER] stock"
- "[TICKER] stock analysis 2026"
- "[TICKER] stock forecast"
- "is [TICKER] a good investment"
- "[TICKER] vs [COMPETITOR]"
- "[TICKER] dividend history"
- "is [TICKER] overvalued"

## Current Score: 6.7/10 — Target: 9.5/10
