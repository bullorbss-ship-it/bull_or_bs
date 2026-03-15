# SEO Playbook — Industry Best Practices

Based on research of MarketBeat ($40M/yr), NerdWallet (18M organic/mo), Seeking Alpha, Investopedia.

## Phase 1: CRITICAL (biggest ranking impact) — DONE
1. ~~Dynamic OG images~~ — DONE: /og route with stock, article, default variants
2. ~~BreadcrumbList schema + visual breadcrumbs~~ — DONE: on every stock/article page
3. ~~Corporation + tickerSymbol schema~~ — DONE: corporationSchema() helper in seo.ts
4. ~~Tournament component links~~ — DONE: every ticker clickable → /stock/[ticker]
5. ~~Article <-> Stock cross-linking~~ — DONE: auto-linkify all registered tickers

## Phase 2: HIGH (content quality) — MOSTLY DONE
6. ~~Enrich stock pages~~ — DONE: key metrics, bull/bear cases, analyst summary, FAQ
7. AIO-format content — headings as questions, 40-60 word lead answers, tables (PARTIAL)
8. ~~Methodology page~~ — DONE: /methodology with scoring system + tournament mechanics
9. ~~Long-tail meta~~ — DONE: H1s target "Should You Buy [TICKER]?" + FAQ schema
10. ~~Expand FAQ schema to 10 questions per stock page~~ — DONE

## Phase 3: MEDIUM (topic clusters) — IN PROGRESS
11. Build cluster hubs: /compare, /newsletter-review, /sectors/[sector] — TODO
12. ~~404 page with stock browsing CTA~~ — DONE
13. ~~NewsArticle schema for news takes~~ — DONE: news-sitemap.xml
14. Sector landing pages (/sectors/financials, /sectors/energy) — TODO
15. Accessibility — ARIA labels, skip-to-main, focus indicators — TODO

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

## Current Score: 8.5/10 — Target: 9.5/10
*(Updated 2026-03-15: Phase 1 complete, Phase 2 mostly complete)*
